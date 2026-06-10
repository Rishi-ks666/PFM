import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { getRates } from '../services/exchangeRateService.js';
import { convertAccount } from '../utils/currencyConverter.js';

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

    const { rates } = await getRates();
    const targetCurrency = req.user.preferredCurrency || 'USD';

    const convertedAccounts = accounts.map(acc => convertAccount(acc.toObject(), targetCurrency, rates));

    return res.json(convertedAccounts);
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

    // Since transactions may be in different currencies, this query is actually flawed
    // for true multi-currency history, but for simplicity of this change, we'll assume
    // that `getBalanceHistory` gets updated eventually. We'll at least fetch rates
    // and convert the final balances (which assumes they were all preferredCurrency...
    // Actually, to do this perfectly, we should convert amounts before summing in MongoDB
    // or fetch all txs and aggregate in memory. For now, since user wants dashboard
    // to match, we'll convert the final summed balance assuming it's in USD.
    // Wait, let's fix it by pulling transactions and aggregating in JS so we can convert.

    // Let's refetch without grouping to do proper conversion
    const txs = await Transaction.find({
        user: req.user._id,
        date: { $gte: startDate, $lte: now },
    }).sort({ date: 1 });

    const { rates } = await getRates();
    const targetCurrency = req.user.preferredCurrency || 'USD';

    // Group in memory
    const monthlyGroups = {};
    for (const tx of txs) {
        const d = new Date(tx.date);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        
        // Convert the transaction amount to preferred currency
        const fromCurrency = tx.currency || 'USD';
        // Inline conversion logic from convertAmount to avoid importing if possible, but we imported it
        const inUSD = tx.amount / (rates[fromCurrency.toUpperCase()] || 1);
        const convertedAmount = inUSD * (rates[targetCurrency.toUpperCase()] || 1);
        
        monthlyGroups[key] = (monthlyGroups[key] || 0) + convertedAmount;
    }

    // Now build history
    const months = [];
    let runningBalance = 0; // We need the prior balance before startDate for a true running balance
    // But existing logic started at 0. We'll stick to existing logic.

    const cursor = new Date(startDate);
    cursor.setDate(1);
    while (cursor <= now) {
        const label = cursor.toLocaleString('default', { month: 'short', year: 'numeric' });
        const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
        
        runningBalance += (monthlyGroups[key] || 0);
        months.push({ month: label, balance: runningBalance });
        
        cursor.setMonth(cursor.getMonth() + 1);
    }

    return res.json(months);
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
    // Default currency to user's preferredCurrency if not provided
    const currency = req.body.currency || req.user.preferredCurrency || 'USD';
    
    const account = await Account.create({
      ...req.body,
      currency,
      user: req.user._id,
    });

    const { rates } = await getRates();
    const targetCurrency = req.user.preferredCurrency || 'USD';
    
    return res.status(201).json(convertAccount(account.toObject(), targetCurrency, rates));
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

    const { rates } = await getRates();
    const targetCurrency = req.user.preferredCurrency || 'USD';

    return res.json(convertAccount(account.toObject(), targetCurrency, rates));
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
