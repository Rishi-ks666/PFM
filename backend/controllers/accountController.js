import asyncHandler from 'express-async-handler';
import Account from '../models/Account.js';

// @desc    Get all accounts for user
// @route   GET /api/accounts
// @access  Private
export const getAccounts = asyncHandler(async (req, res) => {
  const accounts = await Account.find({ userId: req.user._id });

  res.status(200).json({
    success: true,
    data: accounts,
  });
});

// @desc    Get single account
// @route   GET /api/accounts/:id
// @access  Private
export const getAccount = asyncHandler(async (req, res) => {
  const account = await Account.findOne({ _id: req.params.id, userId: req.user._id });

  if (!account) {
    res.status(404);
    throw new Error('Account not found');
  }

  res.status(200).json({
    success: true,
    data: account,
  });
});
