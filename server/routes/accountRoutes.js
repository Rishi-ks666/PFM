import { Router } from 'express';
import {
  getAccounts,
  getBalanceHistory,
  createAccount,
  updateAccount,
  deleteAccount,
} from '../controllers/accountController.js';
import protect from '../middleware/auth.js';

const router = Router();

// All account routes require authentication
router.use(protect);

router.get('/', getAccounts);
router.get('/history', getBalanceHistory);
router.post('/', createAccount);
router.put('/:id', updateAccount);
router.delete('/:id', deleteAccount);

export default router;
