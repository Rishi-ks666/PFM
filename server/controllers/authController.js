import User from '../models/User.js';
import { body, validationResult } from 'express-validator';

// ---------------------------------------------------------------------------
// Validation chains
// ---------------------------------------------------------------------------

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

/**
 * POST /api/auth/register
 */
export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already registered' });

    const user = await User.create({ name, email, password });
    const token = user.generateAuthToken();

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      preferredCurrency: user.preferredCurrency,
      token,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = user.generateAuthToken();

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      preferredCurrency: user.preferredCurrency,
      token,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/profile
 */
export const getProfile = async (req, res, next) => {
  try {
    return res.json(req.user);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/auth/profile
 * Update name, email, and/or preferredCurrency for the authenticated user.
 */
export const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'email', 'preferredCurrency'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided for update' });
    }

    // Validate preferredCurrency if provided
    const SUPPORTED = ['USD', 'INR', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'SGD'];
    if (updates.preferredCurrency && !SUPPORTED.includes(updates.preferredCurrency)) {
      return res.status(400).json({ message: `Unsupported currency: ${updates.preferredCurrency}` });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      preferredCurrency: user.preferredCurrency,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/logout
 */
export const logout = async (req, res, next) => {
  try {
    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};
