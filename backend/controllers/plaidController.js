import asyncHandler from 'express-async-handler';
import { plaidClient } from '../config/plaid.js';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { categorizeTransactions } from '../utils/categorizeTransactions.js';

// @desc    Create Plaid Link Token
// @route   POST /api/plaid/create-link-token
// @access  Private
export const createLinkToken = asyncHandler(async (req, res) => {
  const request = {
    user: { client_user_id: req.user._id.toString() },
    client_name: 'PFM Dashboard',
    products: process.env.PLAID_PRODUCTS.split(','),
    country_codes: process.env.PLAID_COUNTRY_CODES.split(','),
    language: 'en',
  };

  try {
    const response = await plaidClient.linkTokenCreate(request);
    res.status(200).json({
      success: true,
      data: { link_token: response.data.link_token },
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.response?.data?.error_message || 'Error creating link token');
  }
});

// @desc    Exchange Public Token for Access Token
// @route   POST /api/plaid/exchange-token
// @access  Private
export const exchangePublicToken = asyncHandler(async (req, res) => {
  const { public_token } = req.body;

  if (!public_token) {
    res.status(400);
    throw new Error('Public token is required');
  }

  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    // Save token to user profile
    const user = await User.findById(req.user._id);
    user.plaidAccessToken = accessToken;
    user.plaidItemId = itemId;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Token exchanged successfully',
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.response?.data?.error_message || 'Error exchanging token');
  }
});

// @desc    Sync Plaid Accounts and Transactions
// @route   GET /api/plaid/sync
// @access  Private
export const syncPlaidData = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user.plaidAccessToken) {
    res.status(400);
    throw new Error('User has not connected a bank account');
  }

  try {
    // 1. Fetch Accounts
    const authResponse = await plaidClient.authGet({
      access_token: user.plaidAccessToken,
    });

    const plaidAccounts = authResponse.data.accounts;

    // Save/Update Accounts in DB
    const accountIds = [];
    for (const acc of plaidAccounts) {
      const accountData = {
        userId: user._id,
        accountId: acc.account_id,
        accountName: acc.name,
        accountType: acc.type,
        accountSubtype: acc.subtype,
        balance: acc.balances.current || 0,
        currency: acc.balances.iso_currency_code || 'USD',
      };

      await Account.findOneAndUpdate(
        { accountId: acc.account_id, userId: user._id },
        accountData,
        { upsert: true, new: true }
      );
      accountIds.push(acc.account_id);
    }

    // 2. Fetch Transactions (Last 30 days)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const endDate = new Date();

    const transactionsResponse = await plaidClient.transactionsGet({
      access_token: user.plaidAccessToken,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
    });

    const plaidTransactions = transactionsResponse.data.transactions;

    // Save/Update Transactions in DB
    for (const txn of plaidTransactions) {
      // Amount is positive for expenses in Plaid
      const type = txn.amount > 0 ? 'expense' : 'income';
      const absAmount = Math.abs(txn.amount);

      const txnData = {
        userId: user._id,
        accountId: txn.account_id, // Map to our Account model via accountId
        transactionId: txn.transaction_id,
        merchant: txn.merchant_name || txn.name || 'Unknown Merchant',
        category: categorizeTransactions(txn.category),
        amount: absAmount,
        date: new Date(txn.date),
        type,
        status: txn.pending ? 'pending' : 'completed',
      };

      await Transaction.findOneAndUpdate(
        { transactionId: txn.transaction_id },
        txnData,
        { upsert: true, new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Data synced successfully',
      data: {
        accountsSynced: plaidAccounts.length,
        transactionsSynced: plaidTransactions.length,
      },
    });
  } catch (error) {
    res.status(400);
    throw new Error(error.response?.data?.error_message || 'Error syncing Plaid data');
  }
});
