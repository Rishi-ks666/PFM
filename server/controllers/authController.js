import User from '../models/User.js';
import { body, validationResult } from 'express-validator';

// ---------------------------------------------------------------------------
// Validation chains
// ---------------------------------------------------------------------------

/**
 * Validation rules for the registration endpoint.
 */
export const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

/**
 * Validation rules for the login endpoint.
 */
export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

/**
 * POST /api/auth/register
 * Create a new user account and return a JWT.
 */
export const register = async (req, res, next) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    // Prevent duplicate registrations
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Create user (password hashing handled by pre-save hook in model)
    const user = await User.create({ name, email, password });

    // Generate JWT
    const token = user.generateAuthToken();

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/login
 * Authenticate a user and return a JWT.
 */
export const login = async (req, res, next) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Explicitly select password (select: false in schema)
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = user.generateAuthToken();

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/profile
 * Return the authenticated user's profile.
 * req.user is populated by the protect middleware (password already excluded).
 */
export const getProfile = async (req, res, next) => {
  try {
    return res.json(req.user);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/logout
 * Stateless logout acknowledgment (JWT invalidation handled client-side).
 */
export const logout = async (req, res, next) => {
  try {
    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};
