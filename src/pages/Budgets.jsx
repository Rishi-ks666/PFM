import React, { useState, useMemo } from 'react';
import BudgetCard from '../components/ui/BudgetCard';
import { Plus, TrendingDown, TrendingUp, Target, X } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export default function Budgets() {
  const { budgets, addBudget, deleteBudget, transactions, formatCurrency } = useFinance();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [newEmoji, setNewEmoji] = useState('💰');
  const [newCurrency, setNewCurrency] = useState('USD');

  // Compute actual spent for each budget from transactions
  const budgetsWithSpent = useMemo(() => {
    return budgets.map((b) => {
      const spent = transactions
        .filter((t) => (t.convertedAmount || t.amount) < 0 && t.category === b.category)
        .reduce((sum, t) => sum + Math.abs(t.convertedAmount || t.amount), 0);
      return { ...b, limit: b.convertedLimit || b.limit, originalLimit: b.limit, spent };
    });
  }, [budgets, transactions]);

  const totalSpent = budgetsWithSpent.reduce((acc, curr) => acc + curr.spent, 0);
  const totalLimit = budgetsWithSpent.reduce((acc, curr) => acc + curr.limit, 0);
  const totalPercentage = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;
  const exceededCount = budgetsWithSpent.filter(b => b.spent >= b.limit).length;

  const handleAddBudget = (e) => {
    e.preventDefault();
    if (!newCategory.trim() || !newLimit) return;
    addBudget({
      category: newCategory.trim(),
      limit: parseFloat(newLimit),
      emoji: newEmoji || '💰',
      currency: newCurrency,
    });
    setNewCategory('');
    setNewLimit('');
    setNewEmoji('💰');
    setNewCurrency('USD');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <h2 className="text-xl font-bold text-slate-50 tracking-tight">Budgets</h2>
          <p className="text-xs text-slate-600 mt-1">Track and manage your monthly spending limits.</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl px-4 py-2 hover:from-indigo-400 hover:to-violet-500 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all text-xs active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Budget</span>
        </button>
      </div>

      {/* Add Budget Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAddForm(false)} />
          <div className="relative glass-card rounded-2xl p-6 w-full max-w-md animate-fade-in-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-slate-50">New Budget</h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] text-slate-500 hover:text-slate-300 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddBudget} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Category</label>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="e.g. Groceries"
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500/40 transition-colors placeholder:text-slate-700"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Monthly Limit</label>
                <input
                  type="number"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  placeholder="500"
                  min="1"
                  step="any"
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500/40 transition-colors placeholder:text-slate-700"
                  required
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Currency</label>
                <select
                  value={newCurrency}
                  onChange={(e) => setNewCurrency(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500/40 transition-colors appearance-none cursor-pointer"
                >
                  {['USD', 'INR', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'SGD'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 block">Emoji</label>
                <input
                  type="text"
                  value={newEmoji}
                  onChange={(e) => setNewEmoji(e.target.value)}
                  placeholder="💰"
                  maxLength={4}
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-slate-200 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-indigo-500/40 transition-colors placeholder:text-slate-700"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl px-4 py-2.5 hover:from-indigo-400 hover:to-violet-500 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all text-sm active:scale-[0.98]"
              >
                Add Budget
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in-up stagger-1">
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Total Budget</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/[0.08]"><Target className="w-3.5 h-3.5 text-indigo-400" /></div>
          </div>
          <p className="text-2xl font-bold text-slate-50">{formatCurrency(totalLimit)}</p>
          <div className="w-full bg-white/[0.04] rounded-full h-1.5 mt-3 overflow-hidden">
            <div className="h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-[1500ms]" style={{ width: `${Math.min(totalPercentage, 100)}%` }} />
          </div>
          <p className="text-[11px] text-slate-600 mt-2">{totalPercentage.toFixed(1)}% utilized</p>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Total Spent</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/[0.08]"><TrendingUp className="w-3.5 h-3.5 text-emerald-400" /></div>
          </div>
          <p className="text-2xl font-bold text-slate-50">{formatCurrency(totalSpent)}</p>
          <p className="text-[11px] text-slate-600 mt-2">{formatCurrency(totalLimit - totalSpent)} remaining</p>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Over Budget</span>
            <div className="p-1.5 rounded-lg bg-rose-500/[0.08]"><TrendingDown className="w-3.5 h-3.5 text-rose-400" /></div>
          </div>
          <p className="text-2xl font-bold text-slate-50">{exceededCount}</p>
          <p className="text-[11px] text-slate-600 mt-2">{exceededCount > 0 ? `${exceededCount} categories exceeded` : 'All budgets on track'}</p>
        </div>
      </div>

      {/* Grid of Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {budgetsWithSpent.map((budget, i) => (
          <div key={budget.id} className="relative group/budget">
            <BudgetCard 
              budget={budget}
              delay={i * 50}
            />
            <button
              onClick={() => deleteBudget(budget.id)}
              className="absolute top-3 right-3 z-20 p-1.5 rounded-lg bg-rose-500/10 text-rose-400 opacity-0 group-hover/budget:opacity-100 hover:bg-rose-500/20 transition-all duration-200"
              title="Delete budget"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
