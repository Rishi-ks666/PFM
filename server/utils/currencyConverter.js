/**
 * Currency Converter Utilities
 * Converts financial documents to a target currency using pre-fetched rates.
 * Does NOT modify stored values — only returns converted representations.
 */

import { convertAmount } from '../services/exchangeRateService.js';

/**
 * Convert an account document's balance to the target currency.
 *
 * @param {Object} account       - Mongoose account document (toObject'd)
 * @param {string} toCurrency    - Target ISO 4217 code
 * @param {Object} rates         - Rates from exchangeRateService.getRates()
 * @returns {Object} Account with `convertedBalance` and `displayCurrency` added
 */
export function convertAccount(account, toCurrency, rates) {
  const fromCurrency = account.currency || 'USD';
  const convertedBalance = convertAmount(account.balance, fromCurrency, toCurrency, rates);
  return {
    ...account,
    convertedBalance,
    displayCurrency: toCurrency,
  };
}

/**
 * Convert a transaction document's amount to the target currency.
 *
 * @param {Object} tx         - Mongoose transaction document (toObject'd)
 * @param {string} toCurrency
 * @param {Object} rates
 * @returns {Object} Transaction with `convertedAmount` and `displayCurrency` added
 */
export function convertTransaction(tx, toCurrency, rates) {
  const fromCurrency = tx.currency || 'USD';
  const convertedAmount = convertAmount(tx.amount, fromCurrency, toCurrency, rates);
  return {
    ...tx,
    convertedAmount,
    displayCurrency: toCurrency,
  };
}

/**
 * Convert a budget document's limit (and optional pre-computed spent)
 * to the target currency.
 *
 * @param {Object} budget      - Budget object (may have `spent` from computeSpentForBudget)
 * @param {string} toCurrency
 * @param {Object} rates
 * @returns {Object} Budget with `convertedLimit`, `convertedSpent`, `displayCurrency` added
 */
export function convertBudget(budget, toCurrency, rates) {
  const fromCurrency = budget.currency || 'USD';
  const convertedLimit = convertAmount(budget.limit, fromCurrency, toCurrency, rates);
  const convertedSpent = typeof budget.spent === 'number'
    ? convertAmount(budget.spent, fromCurrency, toCurrency, rates)
    : undefined;

  return {
    ...budget,
    convertedLimit,
    ...(convertedSpent !== undefined ? { convertedSpent } : {}),
    displayCurrency: toCurrency,
  };
}
