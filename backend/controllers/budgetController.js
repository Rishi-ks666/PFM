import asyncHandler from 'express-async-handler';
import Budget from '../models/Budget.js';

// @desc    Get user budgets
// @route   GET /api/budgets
// @access  Private
export const getBudgets = asyncHandler(async (req, res) => {
  const budgets = await Budget.find({ userId: req.user._id });

  res.status(200).json({
    success: true,
    data: budgets,
  });
});

// @desc    Set or update a budget
// @route   POST /api/budgets
// @access  Private
export const setBudget = asyncHandler(async (req, res) => {
  const { category, monthlyLimit } = req.body;

  if (!category || !monthlyLimit) {
    res.status(400);
    throw new Error('Please provide category and limit');
  }

  // Use findOneAndUpdate with upsert to create or update
  const budget = await Budget.findOneAndUpdate(
    { userId: req.user._id, category },
    { monthlyLimit },
    { new: true, upsert: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: budget,
  });
});

// @desc    Update budget by ID
// @route   PUT /api/budgets/:id
// @access  Private
export const updateBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOne({ _id: req.params.id, userId: req.user._id });

  if (!budget) {
    res.status(404);
    throw new Error('Budget not found');
  }

  const updatedBudget = await Budget.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: updatedBudget,
  });
});

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
export const deleteBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOne({ _id: req.params.id, userId: req.user._id });

  if (!budget) {
    res.status(404);
    throw new Error('Budget not found');
  }

  await budget.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});
