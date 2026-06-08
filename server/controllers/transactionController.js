import Transaction from '../models/Transaction.js';
import Account from '../models/Account.js';

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

/**
 * GET /api/transactions
 * List transactions with filtering, search, and pagination.
 *
 * Query params:
 *   category   – exact match on category field
 *   type       – "income" (amount > 0) or "expense" (amount < 0)
 *   startDate  – ISO date string for range lower bound
 *   endDate    – ISO date string for range upper bound
 *   search     – regex match against merchant field
 *   page       – page number (default 1)
 *   limit      – results per page (default 50, max 200)
 */
export const getTransactions = async (req, res, next) => {
  try {
    const {
      category,
      type,
      startDate,
      endDate,
      search,
      page: rawPage,
      limit: rawLimit,
    } = req.query;

    // Base filter: only this user's transactions
    const filter = { user: req.user._id };

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Type filter (income = positive amounts, expense = negative amounts)
    if (type === 'income') {
      filter.amount = { $gt: 0 };
    } else if (type === 'expense') {
      filter.amount = { $lt: 0 };
    }

    // Date range filter (date is stored as 'YYYY-MM-DD' string)
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate; // already YYYY-MM-DD string from query
      if (endDate) filter.date.$lte = endDate;
    }

    // Search by merchant (case-insensitive)
    if (search) {
      filter.merchant = { $regex: search, $options: 'i' };
    }

    // Pagination defaults & guards
    const page = Math.max(1, parseInt(rawPage, 10) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(rawLimit, 10) || 50));
    const skip = (page - 1) * limit;

    const [transactions, totalCount] = await Promise.all([
      Transaction.find(filter)
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return res.json({ transactions, page, totalPages, totalCount });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/transactions/:id
 * Get a single transaction by ID (scoped to user).
 */
export const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    return res.json(transaction);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/transactions
 * Create a transaction and update the linked account balance (if any).
 */
export const createTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.create({
      ...req.body,
      user: req.user._id,
    });

    // If an account is linked, adjust its balance
    if (transaction.account) {
      const account = await Account.findById(transaction.account);
      if (account) {
        account.balance += transaction.amount;
        account.isPositive = account.balance >= 0;
        await account.save();
      }
    }

    return res.status(201).json(transaction);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/transactions/:id
 * Update a transaction. Reverse the old amount from the old account, then
 * apply the new amount to the (possibly different) new account.
 */
export const updateTransaction = async (req, res, next) => {
  try {
    const existingTx = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!existingTx) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // ---- Reverse old amount from old account ----
    if (existingTx.account) {
      const oldAccount = await Account.findById(existingTx.account);
      if (oldAccount) {
        oldAccount.balance -= existingTx.amount;
        oldAccount.isPositive = oldAccount.balance >= 0;
        await oldAccount.save();
      }
    }

    // ---- Apply updates ----
    Object.assign(existingTx, req.body);
    await existingTx.save();

    // ---- Add new amount to new account ----
    if (existingTx.account) {
      const newAccount = await Account.findById(existingTx.account);
      if (newAccount) {
        newAccount.balance += existingTx.amount;
        newAccount.isPositive = newAccount.balance >= 0;
        await newAccount.save();
      }
    }

    return res.json(existingTx);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/transactions/:id
 * Delete a transaction and reverse the amount from the linked account.
 */
export const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    // Reverse the amount from the linked account
    if (transaction.account) {
      const account = await Account.findById(transaction.account);
      if (account) {
        account.balance -= transaction.amount;
        account.isPositive = account.balance >= 0;
        await account.save();
      }
    }

    await transaction.deleteOne();

    return res.json({ message: 'Transaction deleted' });
  } catch (err) {
    next(err);
  }
};
