import Budget from '../models/Budget.js';
import Transaction from '../models/Transaction.js';
import { getRates } from '../services/exchangeRateService.js';
import { convertBudget } from '../utils/currencyConverter.js';

// ---------------------------------------------------------------------------
// Helper – compute the spent amount for a single budget
// ---------------------------------------------------------------------------

/**
 * Calculates how much has been spent toward a budget in the current period.
 *
 * "Spent" = sum of |amount| for transactions where amount < 0 (expenses),
 * the category matches the budget category, and the transaction date falls
 * within the budget's period window (monthly / weekly / yearly).
 *
 * @param {Object} budget  Mongoose budget document
 * @param {import('mongoose').Types.ObjectId} userId
 * @returns {Promise<number>} Total spent (positive number) in the BUDGET'S currency
 */
async function computeSpentForBudget(budget, userId) {
  const now = new Date();
  let startDate;

  switch (budget.period) {
    case 'weekly': {
      startDate = new Date(now);
      const day = startDate.getDay(); // 0=Sun … 6=Sat
      startDate.setDate(startDate.getDate() - day); // Go to Sunday
      startDate.setHours(0, 0, 0, 0);
      break;
    }
    case 'yearly': {
      startDate = new Date(now.getFullYear(), 0, 1); // Jan 1
      break;
    }
    case 'monthly':
    default: {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1); // 1st of month
      break;
    }
  }

  // Transaction.date is stored as 'YYYY-MM-DD' string, so compare as strings
  const startStr = startDate.toISOString().slice(0, 10);
  const endStr = now.toISOString().slice(0, 10);

  // We must fetch transactions and convert them to the BUDGET'S currency
  // because the budget limit is in the budget's currency.
  const transactions = await Transaction.find({
    user: userId,
    category: { $regex: new RegExp(`^${budget.category}$`, 'i') },
    date: { $gte: startStr, $lte: endStr },
    amount: { $lt: 0 },
  });

  if (transactions.length === 0) return 0;

  const { rates } = await getRates();
  const budgetCurrency = budget.currency || 'USD';

  let totalSpentInBudgetCurrency = 0;
  for (const tx of transactions) {
    const txCurrency = tx.currency || 'USD';
    const inUSD = Math.abs(tx.amount) / (rates[txCurrency.toUpperCase()] || 1);
    const inBudgetCurrency = inUSD * (rates[budgetCurrency.toUpperCase()] || 1);
    totalSpentInBudgetCurrency += inBudgetCurrency;
  }

  return totalSpentInBudgetCurrency;
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

/**
 * GET /api/budgets
 * List all budgets for the user with a computed `spent` field.
 */
export const getBudgets = async (req, res, next) => {
  try {
    const budgets = await Budget.find({ user: req.user._id });

    // Attach the computed spent amount to each budget
    const enriched = await Promise.all(
      budgets.map(async (budget) => {
        const spent = await computeSpentForBudget(budget, req.user._id);
        const budgetObj = budget.toObject();
        budgetObj.spent = spent;
        return budgetObj;
      }),
    );

    const { rates } = await getRates();
    const targetCurrency = req.user.preferredCurrency || 'USD';

    const convertedBudgets = enriched.map(b => convertBudget(b, targetCurrency, rates));

    return res.json(convertedBudgets);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/budgets/overview
 * High-level summary of all budgets.
 */
export const getBudgetOverview = async (req, res, next) => {
  try {
    const budgets = await Budget.find({ user: req.user._id });

    let totalLimit = 0;
    let totalSpent = 0;

    const { rates } = await getRates();
    const targetCurrency = req.user.preferredCurrency || 'USD';

    await Promise.all(
      budgets.map(async (budget) => {
        const spentInBudgetCurrency = await computeSpentForBudget(budget, req.user._id);
        const budgetObj = budget.toObject();
        budgetObj.spent = spentInBudgetCurrency;

        const converted = convertBudget(budgetObj, targetCurrency, rates);
        
        totalLimit += converted.convertedLimit;
        totalSpent += converted.convertedSpent;
      }),
    );

    return res.json({
      totalLimit,
      totalSpent,
      budgetCount: budgets.length,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/budgets
 * Create a new budget. Prevents duplicate categories per user.
 */
export const createBudget = async (req, res, next) => {
  try {
    const { category } = req.body;
    const currency = req.body.currency || req.user.preferredCurrency || 'USD';

    const existing = await Budget.findOne({
      user: req.user._id,
      category,
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: 'A budget for this category already exists' });
    }

    const budget = await Budget.create({
      ...req.body,
      currency,
      user: req.user._id,
    });

    const { rates } = await getRates();
    const targetCurrency = req.user.preferredCurrency || 'USD';

    return res.status(201).json(convertBudget(budget.toObject(), targetCurrency, rates));
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/budgets/:id
 * Update an existing budget (scoped to user).
 */
export const updateBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true },
    );

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    const { rates } = await getRates();
    const targetCurrency = req.user.preferredCurrency || 'USD';

    return res.json(convertBudget(budget.toObject(), targetCurrency, rates));
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/budgets/:id
 * Delete a budget (scoped to user).
 */
export const deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    return res.json({ message: 'Budget deleted' });
  } catch (err) {
    next(err);
  }
};
