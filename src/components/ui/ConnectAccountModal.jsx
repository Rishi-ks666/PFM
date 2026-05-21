import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowLeft, Plus, Building, CreditCard, Wallet, TrendingUp, ChevronRight, AlertCircle, LinkIcon } from 'lucide-react';

const INSTITUTIONS = [
  { name: 'Chase Bank', color: '#1A73E8', initials: 'CH' },
  { name: 'Bank of America', color: '#DC2626', initials: 'BA' },
  { name: 'Wells Fargo', color: '#D97706', initials: 'WF' },
  { name: 'Citibank', color: '#2563EB', initials: 'CI' },
  { name: 'Capital One', color: '#059669', initials: 'CO' },
  { name: 'Fidelity', color: '#16A34A', initials: 'FI' },
  { name: 'Marcus by GS', color: '#1D4ED8', initials: 'GS' },
  { name: 'Amex', color: '#6366F1', initials: 'AX' },
];

const ACCOUNT_TYPES = [
  { value: 'checking', label: 'Checking', iconKey: 'Building', color: '#6366F1' },
  { value: 'savings', label: 'Savings', iconKey: 'Wallet', color: '#10B981' },
  { value: 'credit', label: 'Credit Card', iconKey: 'CreditCard', color: '#F43F5E' },
  { value: 'investment', label: 'Investment', iconKey: 'TrendingUp', color: '#8B5CF6' },
];

export default function ConnectAccountModal({ isOpen, onClose, onSubmit }) {
  const overlayRef = useRef(null);

  const [step, setStep] = useState(1);
  const [closing, setClosing] = useState(false);
  const [stepDir, setStepDir] = useState('forward');

  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [customInstitution, setCustomInstitution] = useState('');

  const [form, setForm] = useState({
    name: '',
    type: 'checking',
    last4: '',
    balance: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setClosing(false);
      setStep(1);
      setStepDir('forward');
      setSelectedInstitution(null);
      setCustomInstitution('');
      setForm({ name: '', type: 'checking', last4: '', balance: '' });
      setErrors({});
    }
  }, [isOpen]);

  // Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => { onClose(); setClosing(false); }, 250);
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) handleClose();
  };

  const pickInstitution = (inst) => {
    setSelectedInstitution(inst);
    setStepDir('forward');
    setStep(2);
  };

  const pickCustom = () => {
    if (!customInstitution.trim()) return;
    setSelectedInstitution({ name: customInstitution.trim(), color: '#6366F1', initials: customInstitution.trim().slice(0, 2).toUpperCase() });
    setStepDir('forward');
    setStep(2);
  };

  const goBack = () => {
    setStepDir('back');
    setStep(1);
    setErrors({});
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Account name is required';
    if (!form.last4.trim() || form.last4.length !== 4 || isNaN(Number(form.last4))) errs.last4 = 'Enter last 4 digits';
    if (!form.balance || isNaN(Number(form.balance))) errs.balance = 'Enter a valid balance';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const typeInfo = ACCOUNT_TYPES.find((t) => t.value === form.type);
    const bal = Number(form.balance);

    onSubmit({
      name: form.name.trim(),
      institution: selectedInstitution.name,
      type: form.type,
      balance: form.type === 'credit' ? -Math.abs(bal) : Math.abs(bal),
      change: 0.0,
      isPositive: true,
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
        <div className="glass-card rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
            <div className="flex items-center space-x-3">
              {step === 2 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-500 hover:text-slate-300 transition-all mr-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <LinkIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">
                  {step === 1 ? 'Connect Account' : 'Account Details'}
                </h3>
                <p className="text-[10px] text-slate-600">
                  {step === 1 ? 'Select your financial institution' : `Setting up ${selectedInstitution?.name}`}
                </p>
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

          {/* Step indicator */}
          <div className="px-5 pt-4">
            <div className="flex items-center space-x-2">
              <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${step >= 1 ? 'bg-gradient-to-r from-indigo-500 to-violet-500' : 'bg-white/[0.06]'}`} />
              <div className={`h-1 flex-1 rounded-full transition-all duration-300 ${step >= 2 ? 'bg-gradient-to-r from-violet-500 to-indigo-500' : 'bg-white/[0.06]'}`} />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[9px] text-slate-600 font-semibold uppercase tracking-wider">Institution</span>
              <span className="text-[9px] text-slate-600 font-semibold uppercase tracking-wider">Details</span>
            </div>
          </div>

          {/* Content */}
          <div className="relative overflow-hidden" style={{ minHeight: step === 1 ? 360 : 340 }}>
            {/* Step 1: Institution picker */}
            <div
              className={`p-5 transition-all duration-300 ease-out ${
                step === 1
                  ? 'opacity-100 translate-x-0'
                  : stepDir === 'forward'
                    ? 'opacity-0 -translate-x-full absolute inset-0'
                    : 'opacity-0 translate-x-full absolute inset-0'
              }`}
            >
              <div className="grid grid-cols-2 gap-2.5">
                {INSTITUTIONS.map((inst) => (
                  <button
                    key={inst.name}
                    type="button"
                    onClick={() => pickInstitution(inst)}
                    className="flex items-center space-x-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-indigo-500/30 hover:bg-white/[0.04] transition-all group text-left"
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0 shadow-md"
                      style={{ backgroundColor: inst.color }}
                    >
                      {inst.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-300 group-hover:text-indigo-300 transition-colors truncate">
                        {inst.name}
                      </p>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-indigo-400 transition-colors flex-shrink-0" />
                  </button>
                ))}
              </div>

              {/* Custom institution */}
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-2">Or enter manually</p>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={customInstitution}
                    onChange={(e) => setCustomInstitution(e.target.value)}
                    placeholder="Institution name..."
                    className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-indigo-500/30 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); pickCustom(); } }}
                  />
                  <button
                    type="button"
                    onClick={pickCustom}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 transition-all active:scale-[0.98] disabled:opacity-40"
                    disabled={!customInstitution.trim()}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2: Account details form */}
            <div
              className={`p-5 transition-all duration-300 ease-out ${
                step === 2
                  ? 'opacity-100 translate-x-0'
                  : stepDir === 'forward'
                    ? 'opacity-0 translate-x-full absolute inset-0'
                    : 'opacity-0 -translate-x-full absolute inset-0'
              }`}
            >
              <form onSubmit={handleSubmit} className="space-y-4" id="account-form">
                {/* Account name */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Account Name</label>
                  <input
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

                {/* Last 4 + Balance row */}
                <div className="grid grid-cols-2 gap-3">
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
                    <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Starting Balance</label>
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
                </div>
              </form>
            </div>
          </div>

          {/* Footer for step 2 */}
          {step === 2 && (
            <div className="flex items-center justify-end space-x-2 p-5 border-t border-white/[0.06] bg-white/[0.01]">
              <button
                type="button"
                onClick={goBack}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-300 hover:bg-white/[0.04] border border-white/[0.06] transition-all"
              >
                Back
              </button>
              <button
                type="submit"
                form="account-form"
                className="flex items-center space-x-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all active:scale-[0.98]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Connect Account</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
