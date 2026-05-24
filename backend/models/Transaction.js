import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    accountId: {
      type: String,
      ref: 'Account',
      default: null, // Null for manually added transactions without a specific account
    },
    transactionId: {
      type: String, // Plaid transaction ID
      unique: true,
      sparse: true,
    },
    merchant: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'completed',
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
