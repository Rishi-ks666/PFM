import express from 'express';
import { getAccounts, getAccount } from '../controllers/accountController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All account routes are protected

router.route('/').get(getAccounts);
router.route('/:id').get(getAccount);

export default router;
