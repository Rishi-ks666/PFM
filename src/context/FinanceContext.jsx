import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { Building, Wallet, CreditCard, TrendingUp } from 'lucide-react';
import { authService } from '../api/authService';
import { accountService } from '../api/accountService';
import { transactionService } from '../api/transactionService';
import { budgetService } from '../api/budgetService';

// Icon registry
const ICON_MAP = {
  Building,
  Wallet,
  CreditCard,
  TrendingUp,
};

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  // Auth state
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Data state
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [currency, setCurrencyState] = useState('USD');

  // Check for existing auth on mount - read token ONCE from localStorage just for session persistence
  // But all data comes from the API, NOT localStorage
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('fintech_token');
      if (savedToken) {
        setToken(savedToken);
        try {
          const profile = await authService.getProfile();
          setUser(profile);
          setCurrencyState(profile.preferredCurrency || 'USD');
          await fetchAllData();
        } catch (err) {
          console.error('Session expired:', err);
          localStorage.removeItem('fintech_token');
          localStorage.removeItem('fintech_auth');
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  // Fetch all data from API
  const fetchAllData = useCallback(async () => {
    try {
      const [accountsRes, transactionsRes, budgetsRes] = await Promise.all([
        accountService.getAccounts(),
        transactionService.getTransactions(),
        budgetService.getBudgets()
      ]);
      setAccounts(Array.isArray(accountsRes) ? accountsRes : accountsRes.accounts || []);
      const txData = transactionsRes.transactions || transactionsRes;
      setTransactions(Array.isArray(txData) ? txData : []);
      setBudgets(Array.isArray(budgetsRes) ? budgetsRes : budgetsRes.budgets || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }, []);

  // ─── Auth ───
  const login = useCallback(async (email, password) => {
    const data = await authService.login({ email, password });
    setUser(data);
    setToken(data.token);
    localStorage.setItem('fintech_token', data.token);
    localStorage.setItem('fintech_auth', 'true');
    await fetchAllData();
    return data;
  }, [fetchAllData]);

  const register = useCallback(async (name, email, password) => {
    const data = await authService.register({ name, email, password });
    setUser(data);
    setToken(data.token);
    localStorage.setItem('fintech_token', data.token);
    localStorage.setItem('fintech_auth', 'true');
    await fetchAllData();
    return data;
  }, [fetchAllData]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (e) {
      // Server logout optional
    }
    setUser(null);
    setToken(null);
    setTransactions([]);
    setAccounts([]);
    setBudgets([]);
    localStorage.removeItem('fintech_token');
    localStorage.removeItem('fintech_auth');
  }, []);

  // ─── Currency ───
  const setPreferredCurrency = useCallback(async (code) => {
    // Optimistic UI update
    setCurrencyState(code);
    
    // Persist to backend if authenticated
    if (token) {
      try {
        await authService.updateProfile({ preferredCurrency: code });
        // Refetch all data so backend can convert with the new currency
        await fetchAllData();
      } catch (err) {
        console.error('Failed to update preferred currency:', err);
      }
    }
  }, [token, fetchAllData]);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }, [currency]);

  // ─── Transactions (API-backed) ───
  const addTransaction = useCallback(async (tx) => {
    const created = await transactionService.createTransaction(tx);
    setTransactions(prev => [created, ...prev]);
    // Refresh accounts to get updated balances and budgets for spent amounts
    try {
      const [accountsRes, budgetsRes] = await Promise.all([
        accountService.getAccounts(),
        budgetService.getBudgets()
      ]);
      setAccounts(Array.isArray(accountsRes) ? accountsRes : accountsRes.accounts || []);
      setBudgets(Array.isArray(budgetsRes) ? budgetsRes : budgetsRes.budgets || []);
    } catch(e) { /* ignore */ }
    return created;
  }, []);

  const deleteTransaction = useCallback(async (id) => {
    await transactionService.deleteTransaction(id);
    setTransactions(prev => prev.filter(t => (t._id || t.id) !== id));
    // Refresh accounts and budgets
    try {
      const [accountsRes, budgetsRes] = await Promise.all([
        accountService.getAccounts(),
        budgetService.getBudgets()
      ]);
      setAccounts(Array.isArray(accountsRes) ? accountsRes : accountsRes.accounts || []);
      setBudgets(Array.isArray(budgetsRes) ? budgetsRes : budgetsRes.budgets || []);
    } catch(e) { /* ignore */ }
  }, []);

  const updateTransaction = useCallback(async (id, updates) => {
    const updated = await transactionService.updateTransaction(id, updates);
    setTransactions(prev => prev.map(t => (t._id || t.id) === id ? updated : t));
    // Refresh accounts and budgets
    try {
      const [accountsRes, budgetsRes] = await Promise.all([
        accountService.getAccounts(),
        budgetService.getBudgets()
      ]);
      setAccounts(Array.isArray(accountsRes) ? accountsRes : accountsRes.accounts || []);
      setBudgets(Array.isArray(budgetsRes) ? budgetsRes : budgetsRes.budgets || []);
    } catch(e) { /* ignore */ }
    return updated;
  }, []);

  // ─── Accounts (API-backed) ───
  const addAccount = useCallback(async (account) => {
    const created = await accountService.linkAccount(account);
    setAccounts(prev => [...prev, created]);
    return created;
  }, []);

  const deleteAccount = useCallback(async (id) => {
    await accountService.deleteAccount(id);
    setAccounts(prev => prev.filter(a => (a._id || a.id) !== id));
  }, []);

  const updateAccount = useCallback(async (id, updates) => {
    const updated = await accountService.updateAccount(id, updates);
    setAccounts(prev => prev.map(a => (a._id || a.id) === id ? updated : a));
    return updated;
  }, []);

  // ─── Budgets (API-backed) ───
  const addBudget = useCallback(async (budget) => {
    const created = await budgetService.createBudget(budget);
    setBudgets(prev => [...prev, created]);
    return created;
  }, []);

  const updateBudget = useCallback(async (id, updates) => {
    const updated = await budgetService.updateBudget(id, updates);
    setBudgets(prev => prev.map(b => (b._id || b.id) === id ? updated : b));
    return updated;
  }, []);

  const deleteBudget = useCallback(async (id) => {
    await budgetService.deleteBudget(id);
    setBudgets(prev => prev.filter(b => (b._id || b.id) !== id));
  }, []);

  // Resolve iconKey → component for consumers
  const resolvedAccounts = useMemo(() =>
    accounts.map(a => ({
      ...a,
      id: a._id || a.id,  // normalize ID field
      icon: ICON_MAP[a.iconKey] || Building,
    })),
    [accounts]
  );

  // Normalize transaction IDs
  const normalizedTransactions = useMemo(() =>
    transactions.map(t => ({
      ...t,
      id: t._id || t.id,
    })),
    [transactions]
  );

  // Normalize budget IDs
  const normalizedBudgets = useMemo(() =>
    budgets.map(b => ({
      ...b,
      id: b._id || b.id,
    })),
    [budgets]
  );

  const isAuthenticated = !!user && !!token;

  return (
    <FinanceContext.Provider
      value={{
        // Auth
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        // Data
        transactions: normalizedTransactions,
        accounts: resolvedAccounts,
        budgets: normalizedBudgets,
        // Transaction CRUD
        addTransaction,
        deleteTransaction,
        updateTransaction,
        // Account CRUD
        addAccount,
        deleteAccount,
        updateAccount,
        // Budget CRUD
        addBudget,
        updateBudget,
        deleteBudget,
        // Currency
        currency,
        setPreferredCurrency,
        formatCurrency,
        // Refresh
        fetchAllData,
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
