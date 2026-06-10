import api from './axios';

export const accountService = {
  /**
   * Get all connected financial accounts
   */
  getAccounts: async () => {
    return await api.get('/accounts');
  },

  /**
   * Get aggregated balance history for charts
   * @param {String} timeframe - e.g., '1M', '6M', '1Y'
   */
  getBalanceHistory: async (timeframe = '6M') => {
    return await api.get('/accounts/history', { params: { timeframe } });
  },

  /**
   * Link a new bank account or add a manual account
   * @param {Object} data - Account details
   */
  linkAccount: async (data) => {
    return await api.post('/accounts', data);
  },

  /**
   * Update an existing account
   * @param {String} id - Account ID
   * @param {Object} data - Updated fields
   */
  updateAccount: async (id, data) => {
    return await api.put(`/accounts/${id}`, data);
  },

  /**
   * Unlink/delete an account
   */
  deleteAccount: async (id) => {
    return await api.delete(`/accounts/${id}`);
  }
};

