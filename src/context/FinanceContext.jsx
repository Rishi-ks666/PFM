import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { Building, Wallet, CreditCard, TrendingUp } from 'lucide-react';

// ─── Icon registry (can't serialize components to localStorage) ───
const ICON_MAP = {
  Building,
  Wallet,
  CreditCard,
  TrendingUp,
};

// ─── Seed data ───
const SEED_TRANSACTIONS = [
  { id: 'TRX-001', date: '2023-10-24', merchant: 'Apple Store', category: 'Electronics', amount: -1299.00, status: 'Completed', emoji: '🍎' },
  { id: 'TRX-002', date: '2023-10-23', merchant: 'Salary Deposit', category: 'Income', amount: 4500.00, status: 'Completed', emoji: '💰' },
  { id: 'TRX-003', date: '2023-10-23', merchant: 'Starbucks', category: 'Food & Drink', amount: -5.50, status: 'Completed', emoji: '☕' },
  { id: 'TRX-004', date: '2023-10-22', merchant: 'Uber Rides', category: 'Transport', amount: -24.00, status: 'Completed', emoji: '🚗' },
  { id: 'TRX-005', date: '2023-10-21', merchant: 'Whole Foods', category: 'Groceries', amount: -145.20, status: 'Completed', emoji: '🥦' },
  { id: 'TRX-006', date: '2023-10-20', merchant: 'Netflix', category: 'Entertainment', amount: -15.99, status: 'Completed', emoji: '🎬' },
  { id: 'TRX-007', date: '2023-10-19', merchant: 'Amazon', category: 'Shopping', amount: -89.99, status: 'Pending', emoji: '📦' },
  { id: 'TRX-008', date: '2023-10-18', merchant: 'Gym Membership', category: 'Health', amount: -50.00, status: 'Completed', emoji: '💪' },
  { id: 'TRX-009', date: '2023-10-18', merchant: 'Client Payment', category: 'Income', amount: 1200.00, status: 'Completed', emoji: '💼' },
  { id: 'TRX-010', date: '2023-10-15', merchant: 'Shell Gas Station', category: 'Transport', amount: -45.00, status: 'Completed', emoji: '⛽' },
  { id: 'TRX-011', date: '2023-10-14', merchant: 'Target', category: 'Shopping', amount: -112.45, status: 'Failed', emoji: '🎯' },
  { id: 'TRX-012', date: '2023-10-12', merchant: 'Dividend Payout', category: 'Income', amount: 85.50, status: 'Completed', emoji: '📈' },
];

const SEED_ACCOUNTS = [
  {
    id: 1, name: 'Main Checking', institution: 'Chase Bank', type: 'checking',
    balance: 12430.50, change: 2.4, isPositive: true, last4: '4829',
    iconKey: 'Building', color: '#6366F1',
  },
  {
    id: 2, name: 'Savings Account', institution: 'Marcus by GS', type: 'savings',
    balance: 28750.00, change: 5.1, isPositive: true, last4: '7391',
    iconKey: 'Wallet', color: '#10B981',
  },
  {
    id: 3, name: 'Credit Card', institution: 'Amex', type: 'credit',
    balance: -2850.25, change: 12.3, isPositive: false, last4: '3104',
    iconKey: 'CreditCard', color: '#F43F5E',
  },
  {
    id: 4, name: 'Investment Portfolio', institution: 'Fidelity', type: 'investment',
    balance: 35300.00, change: 8.7, isPositive: true, last4: '9256',
    iconKey: 'TrendingUp', color: '#8B5CF6',
  },
];

const SEED_BUDGETS = [
  { id: 1, category: 'Housing', limit: 1500, emoji: '🏠' },
  { id: 2, category: 'Food & Drink', limit: 800, emoji: '☕' },
  { id: 3, category: 'Transport', limit: 300, emoji: '🚗' },
  { id: 4, category: 'Entertainment', limit: 250, emoji: '🎬' },
  { id: 5, category: 'Shopping', limit: 500, emoji: '📦' },
  { id: 6, category: 'Health', limit: 200, emoji: '💪' },
];

// ─── Helpers ───
function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore corrupt data
  }
  return fallback;
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded – silently fail
  }
}

let txCounter = 100; // start well above seed IDs

// ─── Context ───
const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  const [transactions, setTransactions] = useState(() =>
    loadFromStorage('pfm_transactions', SEED_TRANSACTIONS)
  );
  const [accounts, setAccounts] = useState(() =>
    loadFromStorage('pfm_accounts', SEED_ACCOUNTS)
  );
  const [budgets, setBudgets] = useState(() =>
    loadFromStorage('pfm_budgets', SEED_BUDGETS)
  );
  const [currency, setCurrencyState] = useState(() =>
    loadFromStorage('pfm_currency', 'USD')
  );

  // Persist on change
  useEffect(() => { saveToStorage('pfm_transactions', transactions); }, [transactions]);
  useEffect(() => { saveToStorage('pfm_accounts', accounts); }, [accounts]);
  useEffect(() => { saveToStorage('pfm_budgets', budgets); }, [budgets]);
  useEffect(() => { saveToStorage('pfm_currency', currency); }, [currency]);

  // ─── Currency ───
  const setCurrency = useCallback((code) => {
    setCurrencyState(code);
  }, []);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }, [currency]);

  // ─── Transactions ───
  const addTransaction = useCallback((tx) => {
    txCounter += 1;
    const newTx = {
      ...tx,
      id: `TRX-${String(txCounter).padStart(3, '0')}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
  }, []);

  const deleteTransaction = useCallback((id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateTransaction = useCallback((id, updates) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  // ─── Accounts ───
  const addAccount = useCallback((account) => {
    setAccounts((prev) => {
      const maxId = prev.reduce((m, a) => Math.max(m, a.id), 0);
      return [...prev, { ...account, id: maxId + 1 }];
    });
  }, []);

  const deleteAccount = useCallback((id) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const updateAccount = useCallback((id, updates) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  }, []);

  // ─── Budgets ───
  const addBudget = useCallback((budget) => {
    setBudgets((prev) => {
      const maxId = prev.reduce((m, b) => Math.max(m, b.id), 0);
      return [...prev, { ...budget, id: maxId + 1 }];
    });
  }, []);

  const updateBudget = useCallback((id, updates) => {
    setBudgets((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  }, []);

  const deleteBudget = useCallback((id) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
  }, []);

  // Resolve iconKey → component for consumers
  const resolvedAccounts = useMemo(() =>
    accounts.map((a) => ({
      ...a,
      icon: ICON_MAP[a.iconKey] || Building,
    })),
    [accounts]
  );

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        accounts: resolvedAccounts,
        addTransaction,
        deleteTransaction,
        updateTransaction,
        addAccount,
        deleteAccount,
        updateAccount,
        budgets,
        addBudget,
        updateBudget,
        deleteBudget,
        currency,
        setCurrency,
        formatCurrency,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error('useFinance must be used within <FinanceProvider>');
  return ctx;
}
