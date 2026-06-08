import mongoose from 'mongoose';

/**
 * Middleware that rejects API requests immediately if MongoDB is not connected.
 * Prevents 10-second hangs when the database is unavailable.
 * Skip for health check so it always responds.
 */
const requireDB = (req, res, next) => {
  // Always allow health check
  if (req.path === '/api/health' || req.path === '/health') return next();

  const state = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (state !== 1) {
    return res.status(503).json({
      message: 'Database unavailable. Please ensure MongoDB is running.',
      hint: 'See SETUP.md for local or Atlas (cloud) setup instructions.',
      mongoState: ['disconnected', 'connected', 'connecting', 'disconnecting'][state] || 'unknown',
    });
  }
  next();
};

export default requireDB;
