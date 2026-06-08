import {
  Configuration,
  PlaidApi,
  PlaidEnvironments,
  Products,
  CountryCode,
} from 'plaid';
import User from '../models/User.js';
import Account from '../models/Account.js';
import Transaction from '../models/Transaction.js';
import { encrypt, decrypt } from '../utils/encryption.js';
import { mapPlaidCategory } from '../utils/categoryMapper.js';

// ---------------------------------------------------------------------------
// Plaid client setup
// ---------------------------------------------------------------------------

const configuration = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(configuration);

// ---------------------------------------------------------------------------
// Helper – map Plaid account type/subtype to our internal account type
// ---------------------------------------------------------------------------

/**
 * @param {string} plaidType    – e.g. "depository", "credit", "investment", "loan"
 * @param {string} plaidSubtype – e.g. "checking", "savings", "credit card"
 * @returns {string} Internal account type
 */
function mapAccountType(plaidType, plaidSubtype) {
  switch (plaidType) {
    case 'depository':
      return plaidSubtype === 'savings' ? 'savings' : 'checking';
    case 'credit':
      return 'credit';
    case 'investment':
      return 'investment';
    case 'loan':
      return 'loan';
    default:
      return 'other';
  }
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

/**
 * POST /api/plaid/create-link-token
 * Generate a Plaid Link token for the frontend.
 */
export const createLinkToken = async (req, res, next) => {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: { client_user_id: req.user._id.toString() },
      client_name: 'FinDash',
      products: [Products.Transactions],
      country_codes: [CountryCode.Us],
      language: 'en',
    });

    return res.json({ link_token: response.data.link_token });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/plaid/exchange-token
 * Exchange a Plaid public_token for an access_token, persist it encrypted,
 * and import the linked accounts.
 */
export const exchangePublicToken = async (req, res, next) => {
  try {
    const { public_token, metadata } = req.body;

    if (!public_token) {
      return res.status(400).json({ message: 'public_token is required' });
    }

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const { access_token, item_id } = exchangeResponse.data;

    // Encrypt the access token before storing
    const encrypted = encrypt(access_token);

    // Persist to user's plaidItems array
    const user = await User.findById(req.user._id);
    user.plaidItems.push({
      itemId: item_id,
      accessToken: encrypted.encrypted,
      institution: metadata?.institution?.name || 'Unknown',
      institutionId: metadata?.institution?.institution_id || '',
      iv: encrypted.iv,
      authTag: encrypted.authTag,
    });
    await user.save();

    // Fetch accounts from Plaid
    const accountsResponse = await plaidClient.accountsGet({ access_token });
    const plaidAccounts = accountsResponse.data.accounts;

    // Create Account documents
    const createdAccounts = await Promise.all(
      plaidAccounts.map((acct) =>
        Account.create({
          user: req.user._id,
          name: acct.name || acct.official_name || 'Linked Account',
          type: mapAccountType(acct.type, acct.subtype),
          balance: acct.balances?.current ?? 0,
          isPositive: (acct.balances?.current ?? 0) >= 0,
          last4: acct.mask || '',
          institution: metadata?.institution?.name || 'Unknown',
          plaidAccountId: acct.account_id,
          plaidItemId: item_id,
          isPlaidLinked: true,
          lastSynced: new Date(),
        }),
      ),
    );

    return res.json({
      message: 'Bank linked successfully',
      accounts: createdAccounts,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/plaid/sync-transactions
 * Sync recent transactions (last 30 days) for every linked Plaid item.
 */
export const syncTransactions = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.plaidItems || user.plaidItems.length === 0) {
      return res.json({ message: 'No linked institutions', count: 0 });
    }

    let newTransactionsCount = 0;

    for (const item of user.plaidItems) {
      // Decrypt the stored access token
      const accessToken = decrypt(
        item.accessToken,
        item.iv,
        item.authTag,
      );

      // Fetch transactions for the last 30 days
      const now = new Date();
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 30);

      const startStr = startDate.toISOString().slice(0, 10);
      const endStr = now.toISOString().slice(0, 10);

      const txResponse = await plaidClient.transactionsGet({
        access_token: accessToken,
        start_date: startStr,
        end_date: endStr,
        options: { count: 500, offset: 0 },
      });

      const plaidTransactions = txResponse.data.transactions;

      for (const ptx of plaidTransactions) {
        // De-duplicate by plaidTransactionId
        const exists = await Transaction.findOne({
          plaidTransactionId: ptx.transaction_id,
        });

        if (exists) continue;

        // Map category using personal_finance_category (new) or legacy category array
        const plaidCategoryPrimary =
          ptx.personal_finance_category?.primary ||
          (Array.isArray(ptx.category) ? ptx.category[0]?.toUpperCase().replace(/ /g, '_') : null);
        const mapped = mapPlaidCategory(plaidCategoryPrimary);

        // Find the matching local account
        const localAccount = await Account.findOne({
          plaidAccountId: ptx.account_id,
          user: req.user._id,
        });

        await Transaction.create({
          user: req.user._id,
          merchant: ptx.merchant_name || ptx.name || 'Unknown',
          amount: -ptx.amount, // Plaid uses positive = debit; we flip for our sign convention
          category: mapped.category,
          emoji: mapped.emoji,
          date: ptx.date, // Already in YYYY-MM-DD format from Plaid
          status: ptx.pending ? 'Pending' : 'Completed',
          account: localAccount?._id || null,
          plaidTransactionId: ptx.transaction_id,
          isPlaidImported: true,
        });

        newTransactionsCount++;
      }

      // Update account balances from the Plaid response
      const plaidAccounts = txResponse.data.accounts;
      for (const pAcct of plaidAccounts) {
        await Account.findOneAndUpdate(
          { plaidAccountId: pAcct.account_id, user: req.user._id },
          {
            balance: pAcct.balances?.current ?? 0,
            isPositive: (pAcct.balances?.current ?? 0) >= 0,
            lastSynced: new Date(),
          },
        );
      }
    }

    return res.json({
      message: 'Transactions synced',
      count: newTransactionsCount,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/plaid/institutions
 * List all linked banking institutions for the authenticated user.
 */
export const getLinkedInstitutions = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.plaidItems || user.plaidItems.length === 0) {
      return res.json([]);
    }

    const institutions = await Promise.all(
      user.plaidItems.map(async (item) => {
        const accountCount = await Account.countDocuments({
          plaidItemId: item.itemId,
          user: req.user._id,
        });

        return {
          itemId: item.itemId,
          institution: item.institution,
          institutionId: item.institutionId,
          accountCount,
        };
      }),
    );

    return res.json(institutions);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/plaid/institution/:itemId
 * Unlink an institution: remove Plaid item, delete linked accounts & transactions.
 */
export const unlinkInstitution = async (req, res, next) => {
  try {
    const { itemId } = req.params;

    const user = await User.findById(req.user._id);

    const itemIndex = user.plaidItems.findIndex((i) => i.itemId === itemId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Institution not found' });
    }

    // Remove the Plaid item from user
    user.plaidItems.splice(itemIndex, 1);
    await user.save();

    // Find all linked accounts for this item
    const linkedAccounts = await Account.find({
      plaidItemId: itemId,
      user: req.user._id,
    });

    const linkedAccountIds = linkedAccounts.map((a) => a._id);

    // Delete transactions belonging to those accounts
    if (linkedAccountIds.length > 0) {
      await Transaction.deleteMany({
        account: { $in: linkedAccountIds },
        user: req.user._id,
      });
    }

    // Delete the accounts themselves
    await Account.deleteMany({
      plaidItemId: itemId,
      user: req.user._id,
    });

    return res.json({ message: 'Institution unlinked' });
  } catch (err) {
    next(err);
  }
};
