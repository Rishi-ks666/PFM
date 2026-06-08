import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, TrendingUp, CreditCard, PiggyBank, ArrowRight } from 'lucide-react';

import HeroBalanceCard from '../components/ui/HeroBalanceCard';
import StatCard from '../components/ui/StatCard';
import ExpenseBarChart from '../components/ui/ExpenseBarChart';
import ExpensePieChart from '../components/ui/ExpensePieChart';
import TransactionTable from '../components/ui/TransactionTable';
import BudgetCard from '../components/ui/BudgetCard';
import useFinanceStats from '../hooks/useFinanceStats';
import { useFinance } from '../context/FinanceContext';

export default function Dashboard() {
  const { monthlyIncome, monthlyExpenses, savingsRate, investments } = useFinanceStats();
  const { budgets, transactions, formatCurrency } = useFinance();

  // Compute spent per budget category from actual transactions
  const dashboardBudgets = useMemo(() => {
    return budgets.slice(0, 4).map((b) => {
      const spent = transactions
        .filter((t) => t.amount < 0 && t.category === b.category)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      return { ...b, spent };
    });
  }, [budgets, transactions]);

  return (
    <div className="space-y-6 lg:space-y-8 max-w-[1600px] mx-auto">
      {/* Hero Balance Card */}
      <HeroBalanceCard />

      {/* Stat Pills Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Monthly Income" amount={formatCurrency(monthlyIncome)} trend="+2.4%" isPositive={true} icon={TrendingUp} delay={100} />
        <StatCard title="Monthly Expenses" amount={formatCurrency(monthlyExpenses)} trend="-4.1%" isPositive={true} icon={CreditCard} delay={150} />
        <StatCard title="Savings Rate" amount={`${savingsRate.toFixed(1)}%`} trend="+3.2%" isPositive={savingsRate > 0} icon={PiggyBank} delay={200} />
        <StatCard title="Investments" amount={formatCurrency(investments)} trend="+8.7%" isPositive={true} icon={Wallet} delay={250} />
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        <ExpenseBarChart />
        <ExpensePieChart />
      </div>

      {/* Budgets Section */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Active Budgets</h3>
            <p className="text-xs text-slate-600 mt-0.5">Track your spending limits</p>
          </div>
          <Link to="/budgets" className="flex items-center space-x-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors group">
            <span>View all</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {dashboardBudgets.map((budget, i) => (
            <BudgetCard 
              key={budget.id}
              category={budget.category}
              spent={budget.spent}
              limit={budget.limit}
              delay={i * 50}
            />
          ))}
        </div>
      </div>

      {/* Transactions Section */}
      <div>
        <div className="flex items-center justify-between mb-4 px-1">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Recent Transactions</h3>
            <p className="text-xs text-slate-600 mt-0.5">Your latest financial activity</p>
          </div>
          <Link to="/transactions" className="flex items-center space-x-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors group">
            <span>View all</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        <TransactionTable />
      </div>
    </div>
  );
}
