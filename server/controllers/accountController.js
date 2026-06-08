import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

/**
 * GET /api/accounts
 * Retrieve all accounts belonging to the authenticated user.
 */
export const getAccounts = async (req, res, next) => {
  try {
    const accounts = await Account.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    return res.json(accounts);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/accounts/history?timeframe=1M|6M|1Y
 * Compute a monthly balance history for the user over the requested window.
 */
export const getBalanceHistory = async (req, res, next) => {
  try {
    const { timeframe = '6M' } = req.query;

    // Determine the start date based on the timeframe
    const now = new Date();
    const startDate = new Date(now);

    switch (timeframe) {
      case '1M':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case '1Y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case '6M':
      default:
        startDate.setMonth(startDate.getMonth() - 6);
        break;
    }

    // Aggregate transactions grouped by month
    const pipeline = [
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: now },
        },
      },
      {
        $sort: { date: 1 },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ];

    const monthlyTotals = await Transaction.aggregate(pipeline);

    // If no transactions exist, return reasonable mock data
    if (monthlyTotals.length === 0) {
      const months = [];
      const cursor = new Date(startDate);
      cursor.setDate(1);

      while (cursor <= now) {
        const label = cursor.toLocaleString('default', {
          month: 'short',
          year: 'numeric',
        });
        months.push({ month: label, balance: 0 });
        cursor.setMonth(cursor.getMonth() + 1);
      }

      return res.json(months);
    }

    // Compute running balance
    let runningBalance = 0;
    const history = monthlyTotals.map((entry) => {
      runningBalance += entry.total;

      const monthLabel = new Date(entry._id.year, entry._id.month - 1)
        .toLocaleString('default', { month: 'short', year: 'numeric' });

      return { month: monthLabel, balance: runningBalance };
    });

    return res.json(history);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/accounts
 * Create a new account for the authenticated user.
 */
export const createAccount = async (req, res, next) => {
  try {
    const account = await Account.create({
      ...req.body,
      user: req.user._id,
    });

    return res.status(201).json(account);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/accounts/:id
 * Update an existing account (only if owned by the authenticated user).
 */
export const updateAccount = async (req, res, next) => {
  try {
    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true },
    );

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    return res.json(account);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/accounts/:id
 * Delete an account and all its associated transactions.
 */
export const deleteAccount = async (req, res, next) => {
  try {
    const account = await Account.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!account) {
      return res.status(404).json({ message: 'Account not found' });
    }

    // Cascade-delete related transactions
    await Transaction.deleteMany({ account: account._id });

    return res.json({ message: 'Account deleted' });
  } catch (err) {
    next(err);
  }
};
