import React, { useState, useEffect, useRef } from 'react';
import { X, Pencil, DollarSign, Calendar, Tag, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  { value: 'Income', emoji: '💰', label: 'Income' },
  { value: 'Electronics', emoji: '🍎', label: 'Electronics' },
  { value: 'Food & Drink', emoji: '☕', label: 'Food & Drink' },
  { value: 'Transport', emoji: '🚗', label: 'Transport' },
  { value: 'Groceries', emoji: '🥦', label: 'Groceries' },
  { value: 'Entertainment', emoji: '🎬', label: 'Entertainment' },
  { value: 'Shopping', emoji: '📦', label: 'Shopping' },
  { value: 'Health', emoji: '💪', label: 'Health' },
  { value: 'Bills', emoji: '📄', label: 'Bills' },
  { value: 'Travel', emoji: '✈️', label: 'Travel' },
  { value: 'Education', emoji: '📚', label: 'Education' },
  { value: 'Other', emoji: '💳', label: 'Other' },
];

const STATUSES = ['Completed', 'Pending'];

export default function EditTransactionModal({ isOpen, onClose, onSubmit, transaction }) {
  const overlayRef = useRef(null);
  const firstInputRef = useRef(null);

  const [form, setForm] = useState({
    date: '',
    merchant: '',
    category: 'Food & Drink',
    amount: '',
    type: 'expense',
    status: 'Completed',
    currency: 'USD',
  });

  const [errors, setErrors] = useState({});
  const [closing, setClosing] = useState(false);

  // Pre-fill form when transaction changes
  useEffect(() => {
    if (isOpen && transaction) {
      setClosing(false);
      setErrors({});
      const isExpense = transaction.amount < 0;
      setForm({
        date: transaction.date || new Date().toISOString().split('T')[0],
        merchant: transaction.merchant || '',
        category: transaction.category || 'Food & Drink',
        amount: String(Math.abs(transaction.amount)),
        type: isExpense ? 'expense' : 'income',
        status: transaction.status || 'Completed',
        currency: transaction.currency || 'USD',
      });
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen, transaction]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose();
      setClosing(false);
    }, 250);
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) handleClose();
  };

  const validate = () => {
    const errs = {};
    if (!form.merchant.trim()) errs.merchant = 'Merchant is required';
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) errs.amount = 'Enter a valid amount';
    if (!form.date) errs.date = 'Date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const catEntry = CATEGORIES.find((c) => c.value === form.category);
    const numAmount = Number(form.amount);

    onSubmit(transaction.id, {
      date: form.date,
      merchant: form.merchant.trim(),
      category: form.category,
      amount: form.type === 'expense' ? -Math.abs(numAmount) : Math.abs(numAmount),
      currency: form.currency,
      status: form.status,
      emoji: catEntry?.emoji || '💳',
    });

    handleClose();
  };

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  if (!isOpen && !closing) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 ${closing ? 'modal-overlay-exit' : 'modal-overlay-enter'}`}
      style={{ background: 'rgba(5, 5, 15, 0.75)', backdropFilter: 'blur(8px)' }}
    >
      <div className={`w-full max-w-lg ${closing ? 'modal-content-exit' : 'modal-content-enter'}`}>
        <form
          onSubmit={handleSubmit}
          className="glass-card rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                <Pencil className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Edit Transaction</h3>
                <p className="text-[10px] text-slate-600">Modify transaction details</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-xl hover:bg-white/[0.06] text-slate-500 hover:text-slate-300 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {/* Type toggle */}
            <div className="flex rounded-xl bg-white/[0.03] border border-white/[0.06] p-1">
              <button
                type="button"
                onClick={() => updateField('type', 'expense')}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                  form.type === 'expense'
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25 shadow-sm'
                    : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => { updateField('type', 'income'); updateField('category', 'Income'); }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                  form.type === 'income'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 shadow-sm'
                    : 'text-slate-500 hover:text-slate-400'
                }`}
              >
                Income
              </button>
            </div>

            {/* Merchant */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                <FileText className="w-3 h-3 inline mr-1 -mt-0.5" />Merchant / Description
              </label>
              <input
                ref={firstInputRef}
                type="text"
                value={form.merchant}
                onChange={(e) => updateField('merchant', e.target.value)}
                placeholder="e.g. Starbucks, Salary Deposit"
                className={`w-full bg-white/[0.03] border rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 transition-all ${
                  errors.merchant
                    ? 'border-rose-500/40 focus:border-rose-500/50 focus:ring-rose-500/20'
                    : 'border-white/[0.06] focus:border-indigo-500/30 focus:ring-indigo-500/20'
                }`}
              />
              {errors.merchant && (
                <p className="mt-1 text-[10px] text-rose-400 flex items-center space-x-1">
                  <AlertCircle className="w-3 h-3" /><span>{errors.merchant}</span>
                </p>
              )}
            </div>

            {/* Date + Amount + Currency row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  <Calendar className="w-3 h-3 inline mr-1 -mt-0.5" />Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => updateField('date', e.target.value)}
                  className={`w-full bg-white/[0.03] border rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 transition-all ${
                    errors.date
                      ? 'border-rose-500/40 focus:border-rose-500/50 focus:ring-rose-500/20'
                      : 'border-white/[0.06] focus:border-indigo-500/30 focus:ring-indigo-500/20'
                  }`}
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  <DollarSign className="w-3 h-3 inline mr-1 -mt-0.5" />Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={(e) => updateField('amount', e.target.value)}
                  placeholder="0.00"
                  className={`w-full bg-white/[0.03] border rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 transition-all font-mono ${
                    errors.amount
                      ? 'border-rose-500/40 focus:border-rose-500/50 focus:ring-rose-500/20'
                      : 'border-white/[0.06] focus:border-indigo-500/30 focus:ring-indigo-500/20'
                  }`}
                />
                {errors.amount && (
                  <p className="mt-1 text-[10px] text-rose-400 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3" /><span>{errors.amount}</span>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Currency
                </label>
                <select
                  value={form.currency}
                  onChange={(e) => updateField('currency', e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/30 focus:ring-1 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
                >
                  {['USD', 'INR', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'SGD'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category + Status row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  <Tag className="w-3 h-3 inline mr-1 -mt-0.5" />Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/30 focus:ring-1 focus:ring-indigo-500/20 transition-all appearance-none"
                  style={{ colorScheme: 'dark' }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.emoji} {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  <CheckCircle2 className="w-3 h-3 inline mr-1 -mt-0.5" />Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => updateField('status', e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/30 focus:ring-1 focus:ring-indigo-500/20 transition-all appearance-none"
                  style={{ colorScheme: 'dark' }}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-2 p-5 border-t border-white/[0.06] bg-white/[0.01]">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-300 hover:bg-white/[0.04] border border-white/[0.06] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all active:scale-[0.98]"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
