import express from 'express';
import {
  createLinkToken,
  exchangePublicToken,
  syncPlaidData,
} from '../controllers/plaidController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/create-link-token', createLinkToken);
router.post('/exchange-token', exchangePublicToken);
router.get('/sync', syncPlaidData);

export default router;
