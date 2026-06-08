import { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';

export default function useFinanceStats() {
  const { transactions, accounts } = useFinance();

  return useMemo(() => {
    const totalNetWorth = accounts.reduce((sum, a) => sum + a.balance, 0);
    const monthlyIncome = transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
    const monthlyExpenses = Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome * 100) : 0;
    const investments = accounts.filter(a => a.type === 'investment').reduce((sum, a) => sum + a.balance, 0);

    // Spending by category (only expenses, as positive numbers)
    const spendingByCategory = {};
    transactions.filter(t => t.amount < 0).forEach(t => {
      spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + Math.abs(t.amount);
    });

    // Monthly spending for bar chart (group by month from transaction dates)
    const monthlySpending = {};
    transactions.filter(t => t.amount < 0).forEach(t => {
      const d = new Date(t.date);
      const key = d.toLocaleString('en-US', { month: 'short' });
      monthlySpending[key] = (monthlySpending[key] || 0) + Math.abs(t.amount);
    });

    return { totalNetWorth, monthlyIncome, monthlyExpenses, savingsRate, investments, spendingByCategory, monthlySpending };
  }, [transactions, accounts]);
}
