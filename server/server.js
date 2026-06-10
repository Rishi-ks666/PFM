import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';

import connectDB from './config/db.js';
import errorHandler from './middleware/errorHandler.js';
import requireDB from './middleware/requireDB.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import plaidRoutes from './routes/plaidRoutes.js';

// ── Connect to MongoDB ─────────────────────────────────────────────────
connectDB();

// ── Initialise Express ─────────────────────────────────────────────────
const app = express();

// ── Global Middleware ───────────────────────────────────────────────────
app.use(helmet());
// Allow the frontend dev server origin (configurable) and localhost dev ports
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests like curl/postman with no origin
      if (!origin) return callback(null, true);

      // Allow explicit FRONTEND_URL or any localhost origin during development
      if (origin === FRONTEND_URL || origin.startsWith('http://localhost')) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

// ── Guard: reject API requests when DB is not ready ───────────────────
app.use('/api', requireDB);

// ── API Routes ──────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/plaid', plaidRoutes);

// ── Health Check ────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// ── Error Handler (must be LAST middleware) ─────────────────────────────
app.use(errorHandler);

// ── Start Server ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`FinDash server running on port ${PORT}`);
});

// ── Graceful Shutdown ───────────────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });

  // Force exit if graceful shutdown takes too long
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
