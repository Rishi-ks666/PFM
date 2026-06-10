import { Router } from 'express';
import {
  register,
  registerValidation,
  login,
  loginValidation,
  getProfile,
  updateProfile,
  logout,
} from '../controllers/authController.js';
import protect from '../middleware/auth.js';

const router = Router();

router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/profile', protect, getProfile);
router.patch('/profile', protect, updateProfile);
router.post('/logout', protect, logout);

export default router;
