import api from './axios';

export const authService = {
  /**
   * Login a user
   * @param {Object} credentials - { email, password }
   */
  login: async (credentials) => {
    return await api.post('/auth/login', credentials);
  },

  /**
   * Register a new user
   * @param {Object} userData - { name, email, password }
   */
  register: async (userData) => {
    return await api.post('/auth/register', userData);
  },

  /**
   * Get the current authenticated user's profile
   */
  getProfile: async () => {
    return await api.get('/auth/profile');
  },

  /**
   * Logout the user (client-side clearance usually handled in UI, but can ping server)
   */
  logout: async () => {
    return await api.post('/auth/logout');
  }
};
