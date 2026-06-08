import api from './axios';

export const transactionService = {
  /**
   * Fetch a paginated list of transactions
   * @param {Object} params - Query parameters like page, limit, filter, sort
   */
  getTransactions: async (params = {}) => {
    return await api.get('/transactions', { params });
  },

  /**
   * Get a specific transaction by ID
   */
  getTransactionById: async (id) => {
    return await api.get(`/transactions/${id}`);
  },

  /**
   * Create a new transaction
   * @param {Object} data - Transaction payload
   */
  createTransaction: async (data) => {
    return await api.post('/transactions', data);
  },

  /**
   * Update an existing transaction
   */
  updateTransaction: async (id, data) => {
    return await api.put(`/transactions/${id}`, data);
  },

  /**
   * Delete a transaction
   */
  deleteTransaction: async (id) => {
    return await api.delete(`/transactions/${id}`);
  }
};
