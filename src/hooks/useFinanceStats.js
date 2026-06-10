import { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function useFinanceStats() {
  const { transactions, accounts } = useFinance();

  return useMemo(() => {
    const totalNetWorth = accounts.reduce((sum, a) => sum + (a.convertedBalance || a.balance), 0);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Helper: is a transaction in a given year+month?
    const inMonth = (t, year, month) => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === month;
    };

    // Previous month
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentTxs = transactions.filter(t => inMonth(t, currentYear, currentMonth));
    const prevTxs = transactions.filter(t => inMonth(t, prevYear, prevMonth));

    const calcIncome = (txs) => txs.filter(t => (t.convertedAmount || t.amount) > 0).reduce((s, t) => s + (t.convertedAmount || t.amount), 0);
    const calcExpenses = (txs) => Math.abs(txs.filter(t => (t.convertedAmount || t.amount) < 0).reduce((s, t) => s + (t.convertedAmount || t.amount), 0));

    const monthlyIncome = calcIncome(currentTxs);
    const monthlyExpenses = calcExpenses(currentTxs);
    const prevIncome = calcIncome(prevTxs);
    const prevExpenses = calcExpenses(prevTxs);

    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome * 100) : 0;
    const prevSavingsRate = prevIncome > 0 ? ((prevIncome - prevExpenses) / prevIncome * 100) : 0;

    const investments = accounts.filter(a => a.type === 'investment').reduce((sum, a) => sum + (a.convertedBalance || a.balance), 0);

    // Trend percentages vs. prior month (null if no prior data)
    const pctChange = (curr, prev) => {
      if (prev === 0) return null;
      return ((curr - prev) / prev * 100).toFixed(1);
    };

    const incomeTrend = pctChange(monthlyIncome, prevIncome);
    const expensesTrend = pctChange(monthlyExpenses, prevExpenses);
    const savingsTrend = pctChange(savingsRate, prevSavingsRate);

    // ── Spending by category (expenses only, positive numbers) ──
    const spendingByCategory = {};
    transactions.filter(t => (t.convertedAmount || t.amount) < 0).forEach(t => {
      spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + Math.abs(t.convertedAmount || t.amount);
    });

    // ── Sparkline data: last 12 months of income / expenses / savings / investments ──
    const last12Months = Array.from({ length: 12 }, (_, i) => {
      const d = new Date(currentYear, currentMonth - 11 + i, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });

    // ── Monthly spending for bar chart (group by month/year) ──
    const monthlySpending = last12Months.map(({ year, month }) => {
      const monthTxs = transactions.filter(t => inMonth(t, year, month) && (t.convertedAmount || t.amount) < 0);
      const spending = Math.abs(monthTxs.reduce((s, t) => s + (t.convertedAmount || t.amount), 0));
      return {
        month: MONTH_NAMES[month],
        year,
        spending: Math.round(spending * 100) / 100
      };
    });


    const makeSparkline = (fn) =>
      last12Months.map(({ year, month }) => fn(transactions.filter(t => inMonth(t, year, month))));

    const incomeSparkline = makeSparkline(calcIncome);
    const expensesSparkline = makeSparkline(calcExpenses);
    const savingsSparkline = makeSparkline(txs => {
      const inc = calcIncome(txs);
      const exp = calcExpenses(txs);
      return inc > 0 ? ((inc - exp) / inc * 100) : 0;
    });
    // For investments we use a flat line at the current value (no historical balance data available)
    const investmentsSparkline = last12Months.map(() => investments);

    // ── Net-worth history: cumulative running balance per month for AreaChart ──
    // Strategy: start from current net worth and subtract each month's net flow going backwards
    const netWorthHistory = (() => {
      const months = last12Months.slice(); // oldest → newest
      // Group net flow by year-month key
      const flowByMonth = {};
      transactions.forEach(t => {
        const d = new Date(t.date);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        flowByMonth[key] = (flowByMonth[key] || 0) + (t.convertedAmount || t.amount);
      });

      const result = [];
      let running = totalNetWorth;
      // Walk backwards from newest to oldest to reconstruct history
      for (let i = months.length - 1; i >= 0; i--) {
        const { year, month } = months[i];
        const key = `${year}-${month}`;
        result.unshift({ month: MONTH_NAMES[month], value: Math.max(0, running) });
        running -= (flowByMonth[key] || 0);
      }
      return result;
    })();

    // ── Daily spending map for heatmap (last 26 weeks = ~6 months) ──
    // Returns a 26×7 grid [week][dayOfWeek] = spend amount
    const dailySpendingGrid = (() => {
      // Map date string → total spending that day
      const dailyMap = {};
      transactions.filter(t => (t.convertedAmount || t.amount) < 0).forEach(t => {
        const d = new Date(t.date);
        const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
        dailyMap[key] = (dailyMap[key] || 0) + Math.abs(t.convertedAmount || t.amount);
      });

      const WEEKS = 26;
      // Find the most recent Monday
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0=Sun…6=Sat
      const daysToLastMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const endDate = new Date(today);
      endDate.setDate(today.getDate() - daysToLastMonday + 6); // end on Sunday of current week

      const grid = [];
      let maxSpend = 0;
      for (let w = WEEKS - 1; w >= 0; w--) {
        const week = [];
        for (let d = 0; d < 7; d++) {
          const date = new Date(endDate);
          date.setDate(endDate.getDate() - (w * 7) - (6 - d));
          const key = date.toISOString().slice(0, 10);
          const spend = dailyMap[key] || 0;
          if (spend > maxSpend) maxSpend = spend;
          week.push({ date: key, spend });
        }
        grid.push(week);
      }

      return { grid, maxSpend };
    })();

    return {
      totalNetWorth,
      monthlyIncome,
      monthlyExpenses,
      savingsRate,
      investments,
      spendingByCategory,
      monthlySpending,
      // Trends
      incomeTrend,
      expensesTrend,
      savingsTrend,
      // Sparklines
      incomeSparkline,
      expensesSparkline,
      savingsSparkline,
      investmentsSparkline,
      // Net worth history for area chart
      netWorthHistory,
      // Heatmap
      dailySpendingGrid,
    };
  }, [transactions, accounts]);
}
