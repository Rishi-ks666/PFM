/**
 * Global error-handling middleware.
 * Normalises Mongoose and application errors into consistent JSON responses.
 */
const errorHandler = (err, req, res, next) => {
  // Default to 500 if no status code is set
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // ── Mongoose Validation Error ────────────────────────────────────────
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const fieldMessages = Object.values(err.errors).map((e) => e.message);
    message = fieldMessages.join(', ');

    return res.status(statusCode).json({
      message,
      errors: fieldMessages,
    });
  }

  // ── Mongoose Duplicate Key Error ─────────────────────────────────────
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue).join(', ');
    message = `Duplicate field value: ${field}`;

    return res.status(statusCode).json({ message });
  }

  // ── Mongoose Cast Error (invalid ObjectId, etc.) ─────────────────────
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';

    return res.status(statusCode).json({ message });
  }

  // ── MongoDB Not Reachable ─────────────────────────────────────────────
  if (err.name === 'MongoServerSelectionError' || err.name === 'MongoNetworkError') {
    return res.status(503).json({
      message: 'Database unavailable. Please ensure MongoDB is running.',
      hint: 'See SETUP.md — use MongoDB Atlas for a free cloud database.',
    });
  }

  // ── Default Error Response ───────────────────────────────────────────
  const response = { message };

  // Include stack trace only in development
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

export default errorHandler;
