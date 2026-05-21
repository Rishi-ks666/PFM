import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, ArrowRightLeft, Wallet, PieChart, LineChart, Settings, FileText, Plus, TrendingUp, DollarSign, Building } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

const NAV_ACTIONS = [
  { id: 'dashboard', label: 'Go to Dashboard', href: '/', icon: LayoutDashboard, group: 'Navigation' },
  { id: 'transactions', label: 'Go to Transactions', href: '/transactions', icon: ArrowRightLeft, group: 'Navigation' },
  { id: 'accounts', label: 'Go to Accounts', href: '/accounts', icon: Wallet, group: 'Navigation' },
  { id: 'budgets', label: 'Go to Budgets', href: '/budgets', icon: PieChart, group: 'Navigation' },
  { id: 'analytics', label: 'Go to Analytics', href: '/analytics', icon: LineChart, group: 'Navigation' },
  { id: 'settings', label: 'Go to Settings', href: '/settings', icon: Settings, group: 'Navigation' },
  { id: 'add-tx', label: 'Add Transaction', href: '/transactions', icon: Plus, group: 'Actions' },
  { id: 'report', label: 'Generate Report', href: '/analytics', icon: FileText, group: 'Actions' },
  { id: 'invest', label: 'View Investments', href: '/accounts', icon: TrendingUp, group: 'Actions' },
];

export default function CommandPalette({ isOpen, onClose, onSelect }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Get finance data for search
  let transactions = [];
  let accounts = [];
  let formatCurrency = (v) => `$${Math.abs(v).toFixed(2)}`;
  try {
    const finance = useFinance();
    transactions = finance.transactions || [];
    accounts = finance.accounts || [];
    if (finance.formatCurrency) formatCurrency = finance.formatCurrency;
  } catch {
    // FinanceContext might not be available
  }

  // Global Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
        // Opening is handled by MainLayout
      }
    };
    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen, onClose]);

  const filtered = useMemo(() => {
    const results = [];
    const q = query.toLowerCase().trim();

    // Always show nav actions (filtered if query present)
    const matchedNav = q
      ? NAV_ACTIONS.filter(a => a.label.toLowerCase().includes(q))
      : NAV_ACTIONS;
    results.push(...matchedNav);

    // Search transactions by merchant name
    if (q && transactions.length > 0) {
      const matchedTx = transactions
        .filter(tx => tx.merchant && tx.merchant.toLowerCase().includes(q))
        .slice(0, 5)
        .map(tx => ({
          id: `tx-${tx.id}`,
          label: `${tx.emoji || '💳'} ${tx.merchant}`,
          href: '/transactions',
          icon: DollarSign,
          group: 'Transactions',
          sublabel: `${tx.amount < 0 ? '-' : '+'}${formatCurrency(Math.abs(tx.amount))}`,
        }));
      results.push(...matchedTx);
    }

    // Search accounts by name
    if (q && accounts.length > 0) {
      const matchedAccounts = accounts
        .filter(acc => acc.name && acc.name.toLowerCase().includes(q))
        .slice(0, 3)
        .map(acc => ({
          id: `acc-${acc.id}`,
          label: acc.name,
          href: '/accounts',
          icon: Building,
          group: 'Accounts',
          sublabel: acc.institution || '',
        }));
      results.push(...matchedAccounts);
    }

    return results;
  }, [query, transactions, accounts]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSelect = useCallback((action) => {
    onClose();
    if (action.href) {
      navigate(action.href);
    }
    if (onSelect) {
      onSelect(action);
    }
  }, [onClose, navigate, onSelect]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected(s => (s + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected(s => (s - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter' && filtered[selected]) {
      handleSelect(filtered[selected]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Group actions
  const groups = filtered.reduce((acc, action) => {
    if (!acc[action.group]) acc[action.group] = [];
    acc[action.group].push(action);
    return acc;
  }, {});

  let flatIndex = 0;

  return (
    <div className="fixed inset-0 z-[60] cmd-backdrop animate-fade-in" onClick={onClose}>
      <div 
        className="max-w-xl w-full mx-auto mt-[15vh] animate-fade-in-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="glass-card rounded-2xl overflow-hidden shadow-2xl shadow-indigo-500/[0.08] border border-white/[0.08]">
          {/* Search Input */}
          <div className="flex items-center px-4 border-b border-white/[0.06]">
            <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSelected(0); }}
              onKeyDown={handleKeyDown}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 px-3 py-4 focus:outline-none"
            />
            <kbd className="px-1.5 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-[10px] font-mono text-slate-500">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[340px] overflow-y-auto py-2 custom-scrollbar">
            {Object.entries(groups).map(([group, actions]) => (
              <div key={group}>
                <div className="px-4 py-1.5 text-[10px] font-semibold text-slate-600 uppercase tracking-[0.15em]">
                  {group}
                </div>
                {actions.map((action) => {
                  const Icon = action.icon;
                  const currentIndex = flatIndex++;
                  const isSelected = currentIndex === selected;

                  return (
                    <button
                      key={action.id}
                      onClick={() => handleSelect(action)}
                      onMouseEnter={() => setSelected(currentIndex)}
                      className={`w-full flex items-center px-4 py-2.5 text-left transition-all duration-150 ${
                        isSelected 
                          ? 'bg-indigo-500/[0.08] text-indigo-300' 
                          : 'text-slate-400 hover:bg-white/[0.03]'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg mr-3 transition-colors ${
                        isSelected ? 'bg-indigo-500/[0.15] text-indigo-400' : 'bg-white/[0.04] text-slate-500'
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium">{action.label}</span>
                        {action.sublabel && (
                          <span className="ml-2 text-xs text-slate-600">{action.sublabel}</span>
                        )}
                      </div>
                      {isSelected && (
                        <kbd className="ml-auto px-1.5 py-0.5 rounded-md bg-white/[0.06] text-[10px] font-mono text-slate-500">
                          ↵
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="py-8 text-center">
                <Search className="w-6 h-6 text-slate-700 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No results found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
