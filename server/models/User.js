import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const plaidItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  accessToken: { type: String, required: true },  // AES-256-GCM encrypted
  institution: { type: String, default: '' },
  institutionId: { type: String, default: '' },
  iv: { type: String, required: true },
  authTag: { type: String, required: true }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'] },
  password: { type: String, required: [true, 'Password is required'], minlength: [6, 'Password must be at least 6 characters'], select: false },
  currency: { type: String, default: 'USD' },
  plaidItems: [plaidItemSchema]
}, { timestamps: true });

// Pre-save: hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Match password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT
userSchema.methods.generateAuthToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

export default mongoose.model('User', userSchema);
