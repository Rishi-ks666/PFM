/**
 * Exchange Rate Service
 * Fetches live rates from open.er-api.com (free, no API key required).
 * Caches rates in memory for 1 hour. Falls back to hardcoded rates if
 * the API is unavailable and cache is empty.
 */

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const API_URL = 'https://open.er-api.com/v6/latest/USD';

const SUPPORTED_CURRENCIES = ['USD', 'INR', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'SGD'];

// Hardcoded fallback rates (USD base, approximate values)
const FALLBACK_RATES = {
  USD: 1,
  INR: 83.50,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  CAD: 1.36,
  AUD: 1.53,
  SGD: 1.34,
};

let cache = {
  rates: null,      // { USD: 1, INR: 83.5, ... }
  fetchedAt: null,  // timestamp in ms
};

/**
 * Check if the cached rates are still fresh.
 */
function isCacheValid() {
  return cache.rates !== null && (Date.now() - cache.fetchedAt) < CACHE_TTL_MS;
}

/**
 * Fetch live exchange rates from the external API.
 * @returns {Object} rates keyed by currency code
 */
async function fetchLiveRates() {
  const response = await fetch(API_URL, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) throw new Error(`Exchange rate API returned ${response.status}`);
  const data = await response.json();
  if (data.result !== 'success') throw new Error('Exchange rate API response was not successful');
  return data.rates;
}

/**
 * Get current exchange rates (from cache or live API).
 * Falls back to hardcoded rates on failure.
 *
 * @returns {{ rates: Object, source: 'live'|'cache'|'fallback' }}
 */
export async function getRates() {
  if (isCacheValid()) {
    return { rates: cache.rates, source: 'cache' };
  }

  try {
    const rates = await fetchLiveRates();
    cache = { rates, fetchedAt: Date.now() };
    console.log('✅ Exchange rates refreshed from live API');
    return { rates, source: 'live' };
  } catch (err) {
    console.warn(`⚠️  Exchange rate API failed: ${err.message}`);

    // Return stale cache if available, otherwise use fallback
    if (cache.rates) {
      console.warn('   Using stale cached rates.');
      return { rates: cache.rates, source: 'cache' };
    }

    console.warn('   Using hardcoded fallback rates.');
    return { rates: FALLBACK_RATES, source: 'fallback' };
  }
}

/**
 * Convert an amount from one currency to another using the provided rates.
 *
 * @param {number} amount
 * @param {string} fromCurrency - ISO 4217 code, e.g. 'INR'
 * @param {string} toCurrency   - ISO 4217 code, e.g. 'USD'
 * @param {Object} rates        - Rates object with USD as base
 * @returns {number} Converted amount rounded to 2 decimal places
 */
export function convertAmount(amount, fromCurrency, toCurrency, rates) {
  if (!fromCurrency || !toCurrency) return amount;
  if (fromCurrency === toCurrency) return Math.round(amount * 100) / 100;

  const from = fromCurrency.toUpperCase();
  const to = toCurrency.toUpperCase();

  // Both rates relative to USD base
  const fromRate = rates[from];
  const toRate = rates[to];

  if (!fromRate || !toRate) {
    console.warn(`Missing rate for ${from} or ${to} — returning original amount`);
    return Math.round(amount * 100) / 100;
  }

  // Convert: amount → USD → target
  const inUSD = amount / fromRate;
  const converted = inUSD * toRate;
  return Math.round(converted * 100) / 100;
}

export { SUPPORTED_CURRENCIES, FALLBACK_RATES };
