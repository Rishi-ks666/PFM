import api from './axios';

export const plaidService = {
  createLinkToken: async () => {
    return await api.post('/plaid/create-link-token');
  },
  exchangePublicToken: async (publicToken, metadata) => {
    return await api.post('/plaid/exchange-token', { public_token: publicToken, metadata });
  },
  syncTransactions: async () => {
    return await api.post('/plaid/sync-transactions');
  },
  getLinkedInstitutions: async () => {
    return await api.get('/plaid/institutions');
  },
  unlinkInstitution: async (itemId) => {
    return await api.delete(`/plaid/institution/${itemId}`);
  }
};
