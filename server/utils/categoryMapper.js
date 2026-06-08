/**
 * Maps Plaid personal_finance_category primary values to FinDash categories.
 */

const PLAID_CATEGORY_MAP = {
  FOOD_AND_DRINK:      { category: 'Food & Drink',    emoji: '☕', type: 'expense' },
  TRANSPORTATION:      { category: 'Transport',       emoji: '🚗', type: 'expense' },
  RENT_AND_UTILITIES:  { category: 'Housing',         emoji: '🏠', type: 'expense' },
  ENTERTAINMENT:       { category: 'Entertainment',   emoji: '🎬', type: 'expense' },
  GENERAL_MERCHANDISE: { category: 'Shopping',        emoji: '📦', type: 'expense' },
  MEDICAL:             { category: 'Health',           emoji: '💪', type: 'expense' },
  TRAVEL:              { category: 'Travel',           emoji: '✈️', type: 'expense' },
  PERSONAL_CARE:       { category: 'Personal',        emoji: '💅', type: 'expense' },
  INCOME:              { category: 'Income',           emoji: '💰', type: 'income'  },
  TRANSFER_IN:         { category: 'Income',           emoji: '💰', type: 'income'  },
};

const DEFAULT_CATEGORY = { category: 'Other', emoji: '💳', type: 'expense' };

/**
 * Map a Plaid personal_finance_category primary value to a FinDash category.
 *
 * @param {string} plaidCategory — e.g. "FOOD_AND_DRINK"
 * @returns {{ category: string, emoji: string, type: 'income' | 'expense' }}
 */
export const mapPlaidCategory = (plaidCategory) => {
  return PLAID_CATEGORY_MAP[plaidCategory] || DEFAULT_CATEGORY;
};

// Build a reverse lookup: FinDash category name → emoji
const EMOJI_MAP = {};
for (const entry of Object.values(PLAID_CATEGORY_MAP)) {
  EMOJI_MAP[entry.category] = entry.emoji;
}
EMOJI_MAP[DEFAULT_CATEGORY.category] = DEFAULT_CATEGORY.emoji;

/**
 * Get the emoji for a given FinDash category name.
 *
 * @param {string} category — e.g. "Food & Drink"
 * @returns {string} emoji or the default 💳
 */
export const getCategoryEmoji = (category) => {
  return EMOJI_MAP[category] || DEFAULT_CATEGORY.emoji;
};
