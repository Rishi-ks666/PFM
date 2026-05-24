import express from 'express';
import {
  getBudgets,
  setBudget,
  updateBudget,
  deleteBudget,
} from '../controllers/budgetController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/').get(getBudgets).post(setBudget);
router.route('/:id').put(updateBudget).delete(deleteBudget);

export default router;
