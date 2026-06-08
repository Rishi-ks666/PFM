import mongoose from 'mongoose';

const accountSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: [true, 'Account name is required'], trim: true },
  type: { type: String, required: true, enum: { values: ['checking', 'savings', 'credit', 'cash', 'investment'], message: '{VALUE} is not a valid account type' } },
  balance: { type: Number, default: 0 },
  institution: { type: String, default: '' },
  last4: { type: String, default: '' },
  iconKey: { type: String, default: 'Building' },
  color: { type: String, default: '#6366F1' },
  change: { type: Number, default: 0 },
  isPositive: { type: Boolean, default: true },
  // Plaid fields
  plaidAccountId: { type: String, default: null },
  plaidItemId: { type: String, default: null },
  isPlaidLinked: { type: Boolean, default: false },
  lastSynced: { type: Date, default: null }
}, { timestamps: true });

accountSchema.index({ user: 1, plaidAccountId: 1 }, { unique: true, sparse: true });

export default mongoose.model('Account', accountSchema);
