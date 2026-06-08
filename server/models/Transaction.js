import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', default: null },
  merchant: { type: String, required: [true, 'Merchant/description is required'], trim: true },
  category: { type: String, required: [true, 'Category is required'], trim: true },
  amount: { type: Number, required: [true, 'Amount is required'] },  // negative = expense, positive = income
  date: { type: String, required: [true, 'Date is required'] },      // 'YYYY-MM-DD' format
  status: { type: String, enum: ['Completed', 'Pending', 'Failed', 'Cancelled'], default: 'Completed' },
  emoji: { type: String, default: '💳' },
  // Plaid fields
  plaidTransactionId: { type: String, default: null },
  isPlaidImported: { type: Boolean, default: false }
}, { timestamps: true });

transactionSchema.index({ user: 1, date: -1 });
transactionSchema.index({ plaidTransactionId: 1 }, { unique: true, sparse: true });

export default mongoose.model('Transaction', transactionSchema);
