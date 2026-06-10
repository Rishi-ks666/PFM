import { Router } from 'express';
import {
  getBudgets,
  getBudgetOverview,
  createBudget,
  updateBudget,
  deleteBudget,
} from '../controllers/budgetController.js';
import protect from '../middleware/auth.js';

const router = Router();

// All budget routes require authentication
router.use(protect);

router.get('/', getBudgets);
router.get('/overview', getBudgetOverview);
router.post('/', createBudget);
router.put('/:id', updateBudget);
router.delete('/:id', deleteBudget);

export default router;
