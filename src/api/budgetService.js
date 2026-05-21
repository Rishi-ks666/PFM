import api from './axios';

export const budgetService = {
  /**
   * Get all budgets for the user
   */
  getBudgets: async () => {
    return await api.get('/budgets');
  },

  /**
   * Get budget overview (total limit vs total spent)
   */
  getBudgetOverview: async () => {
    return await api.get('/budgets/overview');
  },

  /**
   * Create a new budget category
   * @param {Object} data - { category, limit }
   */
  createBudget: async (data) => {
    return await api.post('/budgets', data);
  },

  /**
   * Update an existing budget limit
   */
  updateBudget: async (id, data) => {
    return await api.put(`/budgets/${id}`, data);
  },

  /**
   * Delete a budget category
   */
  deleteBudget: async (id) => {
    return await api.delete(`/budgets/${id}`);
  }
};
