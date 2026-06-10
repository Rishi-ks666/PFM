import React, { useMemo } from 'react';
import ExpensePieChart from '../components/ui/ExpensePieChart';
import ExpenseBarChart from '../components/ui/ExpenseBarChart';
import { Download, CalendarDays } from 'lucide-react';
import useFinanceStats from '../hooks/useFinanceStats';
import { useFinance } from '../context/FinanceContext';

// Spending Heatmap — GitHub contribution grid style
const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function SpendingHeatmap() {
  const { dailySpendingGrid } = useFinanceStats();
  const { formatCurrency } = useFinance();

  const { grid, maxSpend } = dailySpendingGrid;

  const getColor = (spend) => {
    if (maxSpend === 0 || spend === 0) return 'bg-white/[0.02]';
    const intensity = spend / maxSpend;
    if (intensity < 0.2)  return 'bg-indigo-500/20';
    if (intensity < 0.4)  return 'bg-indigo-500/40';
    if (intensity < 0.65) return 'bg-indigo-500/60';
    return 'bg-indigo-500/90';
  };

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Spending Heatmap</h3>
          <p className="text-xs text-slate-600 mt-1">Daily spending intensity over the last 6 months</p>
        </div>
        <div className="flex items-center space-x-1.5 text-[10px] text-slate-600">
          <span>Less</span>
          {['bg-white/[0.02]', 'bg-indigo-500/20', 'bg-indigo-500/40', 'bg-indigo-500/60', 'bg-indigo-500/90'].map((c, i) => (
            <div key={i} className={`w-3 h-3 rounded-[3px] ${c}`} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="flex gap-1.5">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-1 pt-0.5">
          {DAYS_OF_WEEK.map((day, i) => (
            <div key={day} className="h-3 text-[9px] text-slate-700 font-mono flex items-center">
              {i % 2 === 0 ? day : ''}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-1 overflow-x-auto custom-scrollbar pb-1">
          {grid.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map(({ date, spend }, di) => (
                <div
                  key={`${wi}-${di}`}
                  className={`w-3 h-3 rounded-[3px] ${getColor(spend)} transition-all duration-300 hover:ring-1 hover:ring-indigo-400/30 cursor-pointer`}
                  title={spend > 0 ? `${date}: ${formatCurrency(spend)} spent` : date}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {maxSpend === 0 && (
        <p className="text-center text-xs text-slate-600 mt-4">
          No spending data yet — add transactions to see your heatmap.
        </p>
      )}
    </div>
  );
}

export default function Analytics() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
        <div>
          <h2 className="text-xl font-bold text-slate-50 tracking-tight">Analytics</h2>
          <p className="text-xs text-slate-600 mt-1">Deep dive into your financial spending patterns.</p>
        </div>
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 bg-white/[0.04] border border-white/[0.06] text-slate-400 font-medium rounded-xl px-3 py-2 hover:bg-white/[0.06] hover:text-slate-300 transition-all text-xs">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Last 6 Months</span>
          </button>
          <button className="flex items-center space-x-2 bg-white/[0.04] border border-white/[0.06] text-slate-400 font-medium rounded-xl px-3 py-2 hover:bg-white/[0.06] hover:text-slate-300 transition-all text-xs">
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        <ExpenseBarChart />
        <ExpensePieChart />
      </div>

      <SpendingHeatmap />
    </div>
  );
}
