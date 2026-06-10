import { Router } from 'express';
import {
  createLinkToken,
  exchangePublicToken,
  syncTransactions,
  getLinkedInstitutions,
  unlinkInstitution,
} from '../controllers/plaidController.js';
import protect from '../middleware/auth.js';

const router = Router();

// All Plaid routes require authentication
router.use(protect);

router.post('/create-link-token', createLinkToken);
router.post('/exchange-token', exchangePublicToken);
router.post('/sync-transactions', syncTransactions);
router.get('/institutions', getLinkedInstitutions);
router.delete('/institution/:itemId', unlinkInstitution);

export default router;
