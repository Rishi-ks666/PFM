import asyncHandler from 'express-async-handler';
import Transaction from '../models/Transaction.js';

// @desc    Get transactions
// @route   GET /api/transactions
// @access  Private
export const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ userId: req.user._id }).sort({ date: -1 });

  res.status(200).json({
    success: true,
    data: transactions,
  });
});

// @desc    Add manual transaction
// @route   POST /api/transactions
// @access  Private
export const addTransaction = asyncHandler(async (req, res) => {
  const { merchant, category, amount, date, type, accountId } = req.body;

  if (!merchant || !category || !amount || !date || !type) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  const transaction = await Transaction.create({
    userId: req.user._id,
    merchant,
    category,
    amount,
    date,
    type,
    accountId: accountId || null,
  });

  res.status(201).json({
    success: true,
    data: transaction,
  });
});

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
export const updateTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });

  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }

  const updatedTransaction = await Transaction.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: updatedTransaction,
  });
});

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
export const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });

  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }

  await transaction.deleteOne();

  res.status(200).json({
    success: true,
    data: {},
  });
});
