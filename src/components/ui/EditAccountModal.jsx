import React, { useState, useEffect, useRef } from 'react';
import { X, Pencil, Building, CreditCard, Wallet, TrendingUp, AlertCircle } from 'lucide-react';

const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Checking', iconKey: 'Building', color: '#6366F1' },
  { value: 'savings', label: 'Savings', iconKey: 'Wallet', color: '#10B981' },
  { value: 'credit', label: 'Credit Card', iconKey: 'CreditCard', color: '#F43F5E' },
  { value: 'investment', label: 'Investment', iconKey: 'TrendingUp', color: '#8B5CF6' },
];

export default function EditAccountModal({ isOpen, onClose, onSubmit, account }) {
  const overlayRef = useRef(null);
  const firstInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    type: 'checking',
    last4: '',
    balance: '',
    institution: '',
    currency: 'USD',
  });

  const [errors, setErrors] = useState({});
  const [closing, setClosing] = useState(false);

  // Pre-fill form when account changes
  useEffect(() => {
    if (isOpen && account) {
      setClosing(false);
      setErrors({});
      setForm({
        name: account.name || '',
        type: account.type || 'checking',
        last4: account.last4 || '',
        balance: String(Math.abs(account.balance)),
        institution: account.institution || '',
        currency: account.currency || 'USD',
      });
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen, account]);

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
    if (!form.name.trim()) errs.name = 'Account name is required';
    if (!form.last4.trim() || form.last4.length !== 4 || isNaN(Number(form.last4))) errs.last4 = 'Enter last 4 digits';
    if (!form.balance || isNaN(Number(form.balance))) errs.balance = 'Enter a valid balance';
    if (!form.institution.trim()) errs.institution = 'Institution is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const typeInfo = ACCOUNT_TYPES.find((t) => t.value === form.type);
    const bal = Number(form.balance);

    onSubmit(account.id, {
      name: form.name.trim(),
      institution: form.institution.trim(),
      type: form.type,
      balance: form.type === 'credit' ? -Math.abs(bal) : Math.abs(bal),
      currency: form.currency,
      last4: form.last4,
      iconKey: typeInfo?.iconKey || 'Building',
      color: typeInfo?.color || '#6366F1',
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
                <h3 className="text-sm font-bold text-slate-100">Edit Account</h3>
                <p className="text-[10px] text-slate-600">Modify account details</p>
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
            {/* Account name */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Account Name</label>
              <input
                ref={firstInputRef}
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g. Main Checking"
                className={`w-full bg-white/[0.03] border rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 transition-all ${
                  errors.name ? 'border-rose-500/40 focus:ring-rose-500/20' : 'border-white/[0.06] focus:border-indigo-500/30 focus:ring-indigo-500/20'
                }`}
              />
              {errors.name && <p className="mt-1 text-[10px] text-rose-400 flex items-center space-x-1"><AlertCircle className="w-3 h-3" /><span>{errors.name}</span></p>}
            </div>

            {/* Institution */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Institution</label>
              <input
                type="text"
                value={form.institution}
                onChange={(e) => updateField('institution', e.target.value)}
                placeholder="e.g. Chase Bank"
                className={`w-full bg-white/[0.03] border rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 transition-all ${
                  errors.institution ? 'border-rose-500/40 focus:ring-rose-500/20' : 'border-white/[0.06] focus:border-indigo-500/30 focus:ring-indigo-500/20'
                }`}
              />
              {errors.institution && <p className="mt-1 text-[10px] text-rose-400 flex items-center space-x-1"><AlertCircle className="w-3 h-3" /><span>{errors.institution}</span></p>}
            </div>

            {/* Account type */}
            <div>
              <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Account Type</label>
              <div className="grid grid-cols-2 gap-2">
                {ACCOUNT_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => updateField('type', t.value)}
                    className={`flex items-center space-x-2 p-3 rounded-xl border transition-all text-left ${
                      form.type === t.value
                        ? 'border-indigo-500/40 bg-indigo-500/[0.08] shadow-sm'
                        : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${t.color}15` }}>
                      {t.iconKey === 'Building' && <Building className="w-3.5 h-3.5" style={{ color: t.color }} />}
                      {t.iconKey === 'Wallet' && <Wallet className="w-3.5 h-3.5" style={{ color: t.color }} />}
                      {t.iconKey === 'CreditCard' && <CreditCard className="w-3.5 h-3.5" style={{ color: t.color }} />}
                      {t.iconKey === 'TrendingUp' && <TrendingUp className="w-3.5 h-3.5" style={{ color: t.color }} />}
                    </div>
                    <span className={`text-xs font-semibold ${form.type === t.value ? 'text-indigo-300' : 'text-slate-400'}`}>
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Last 4 + Balance + Currency row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Last 4 Digits</label>
                <input
                  type="text"
                  maxLength={4}
                  value={form.last4}
                  onChange={(e) => updateField('last4', e.target.value.replace(/\D/g, ''))}
                  placeholder="0000"
                  className={`w-full bg-white/[0.03] border rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 transition-all font-mono tracking-widest ${
                    errors.last4 ? 'border-rose-500/40 focus:ring-rose-500/20' : 'border-white/[0.06] focus:border-indigo-500/30 focus:ring-indigo-500/20'
                  }`}
                />
                {errors.last4 && <p className="mt-1 text-[10px] text-rose-400 flex items-center space-x-1"><AlertCircle className="w-3 h-3" /><span>{errors.last4}</span></p>}
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Balance</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.balance}
                  onChange={(e) => updateField('balance', e.target.value)}
                  placeholder="0.00"
                  className={`w-full bg-white/[0.03] border rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:ring-1 transition-all font-mono ${
                    errors.balance ? 'border-rose-500/40 focus:ring-rose-500/20' : 'border-white/[0.06] focus:border-indigo-500/30 focus:ring-indigo-500/20'
                  }`}
                />
                {errors.balance && <p className="mt-1 text-[10px] text-rose-400 flex items-center space-x-1"><AlertCircle className="w-3 h-3" /><span>{errors.balance}</span></p>}
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Currency</label>
                <select
                  value={form.currency}
                  onChange={(e) => updateField('currency', e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:border-indigo-500/30 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
                >
                  {['USD', 'INR', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'SGD'].map(c => (
                    <option key={c} value={c}>{c}</option>
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
