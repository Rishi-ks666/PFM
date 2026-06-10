import { useMemo } from 'react';
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
  const { monthlyIncome, monthlyExpenses, savingsRate, investments, incomeTrend, expensesTrend, savingsTrend,
    incomeSparkline, expensesSparkline, savingsSparkline, investmentsSparkline } = useFinanceStats();
  const { budgets, transactions, formatCurrency } = useFinance();

  // Format a trend value for display, e.g. "+3.2%" or "N/A"
  const formatTrend = (val) => {
    if (val === null || val === undefined) return 'N/A';
    const n = parseFloat(val);
    return `${n >= 0 ? '+' : ''}${val}%`;
  };

  // Compute spent per budget category from actual transactions
  const dashboardBudgets = useMemo(() => {
    return budgets.slice(0, 4).map((b) => {
      const spent = transactions
        .filter((t) => (t.convertedAmount || t.amount) < 0 && t.category === b.category)
        .reduce((sum, t) => sum + Math.abs(t.convertedAmount || t.amount), 0);
      return { ...b, limit: b.convertedLimit || b.limit, originalLimit: b.limit, spent };
    });
  }, [budgets, transactions]);

  const incomeTrendStr = formatTrend(incomeTrend);
  const expensesTrendStr = formatTrend(expensesTrend);
  const savingsTrendStr = formatTrend(savingsTrend);

  return (
    <div className="space-y-6 lg:space-y-8 max-w-[1600px] mx-auto">
      {/* Hero Balance Card */}
      <HeroBalanceCard />

      {/* Stat Pills Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Monthly Income" amount={formatCurrency(monthlyIncome)} trend={incomeTrendStr} isPositive={incomeTrend === null || parseFloat(incomeTrend) >= 0} icon={TrendingUp} delay={100} sparklineData={incomeSparkline} />
        <StatCard title="Monthly Expenses" amount={formatCurrency(monthlyExpenses)} trend={expensesTrendStr} isPositive={expensesTrend === null || parseFloat(expensesTrend) <= 0} icon={CreditCard} delay={150} sparklineData={expensesSparkline} />
        <StatCard title="Savings Rate" amount={`${savingsRate.toFixed(1)}%`} trend={savingsTrendStr} isPositive={savingsTrend === null || parseFloat(savingsTrend) >= 0} icon={PiggyBank} delay={200} sparklineData={savingsSparkline} />
        <StatCard title="Investments" amount={formatCurrency(investments)} trend="N/A" isPositive={true} icon={Wallet} delay={250} sparklineData={investmentsSparkline} />
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
              budget={budget}
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
