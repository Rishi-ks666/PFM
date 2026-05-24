export const categorizeTransactions = (plaidCategory) => {
  // Plaid returns an array of categories like ['Food and Drink', 'Restaurants']
  if (!plaidCategory || plaidCategory.length === 0) {
    return 'Other';
  }

  const primary = plaidCategory[0].toLowerCase();
  
  if (primary.includes('food') || primary.includes('restaurant')) return 'Food';
  if (primary.includes('travel') || primary.includes('airline')) return 'Travel';
  if (primary.includes('shop') || primary.includes('store')) return 'Shopping';
  if (primary.includes('transfer') || primary.includes('payment')) return 'Transfers';
  if (primary.includes('bill') || primary.includes('utility')) return 'Bills';

  return 'Other';
};
