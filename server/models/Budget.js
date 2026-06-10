import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  category: { type: String, required: [true, 'Category is required'], trim: true },
  limit: { type: Number, required: [true, 'Budget limit is required'], min: [0, 'Limit must be positive'] },
  emoji: { type: String, default: '📊' },
  currency: { type: String, default: 'USD' },
  period: { type: String, enum: ['monthly', 'weekly', 'yearly'], default: 'monthly' }
}, { timestamps: true });

budgetSchema.index({ user: 1, category: 1 }, { unique: true });

export default mongoose.model('Budget', budgetSchema);
