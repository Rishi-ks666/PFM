import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import useFinanceStats from '../../hooks/useFinanceStats';
import { useFinance } from '../../context/FinanceContext';

const FALLBACK_DATA = [
  { month: 'May', spending: 3100 },
  { month: 'Jun', spending: 3450 },
  { month: 'Jul', spending: 2800 },
  { month: 'Aug', spending: 4100 },
  { month: 'Sep', spending: 3200 },
  { month: 'Oct', spending: 3850 },
];

const MONTH_ORDER = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function CustomTooltip({ active, payload, label, formatter }) {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-xl px-3 py-2 shadow-xl border border-white/[0.1]">
        <span className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.5)]" />
          <span className="text-slate-50 font-bold text-sm">
            {formatter ? formatter(payload[0].value) : payload[0].value.toLocaleString()}
          </span>
        </div>
      </div>
    );
  }
  return null;
}

export default function ExpenseBarChart() {
  const { monthlySpending } = useFinanceStats();
  const { formatCurrency } = useFinance();

  const monthlyData = useMemo(() => {
    const entries = Object.entries(monthlySpending);
    if (entries.length === 0) return FALLBACK_DATA;

    // Sort by month order and format for the chart
    return entries
      .map(([month, spending]) => ({ month, spending: Math.round(spending * 100) / 100 }))
      .sort((a, b) => MONTH_ORDER.indexOf(a.month) - MONTH_ORDER.indexOf(b.month));
  }, [monthlySpending]);

  const maxSpending = Math.max(...monthlyData.map(d => d.spending));

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-3">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Spending Trends</h3>
          <p className="text-xs text-slate-600 mt-1">Your expenses over the last 6 months</p>
        </div>
        <select className="bg-white/[0.04] border border-white/[0.08] text-slate-400 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500/30 transition-colors appearance-none cursor-pointer">
          <option>Last 6 Months</option>
          <option>This Year</option>
        </select>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366F1" stopOpacity={1} />
                <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0.6} />
              </linearGradient>
              <linearGradient id="barGradientActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#818CF8" stopOpacity={1} />
                <stop offset="100%" stopColor="#A78BFA" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="month" stroke="#334155" fontSize={11} tickLine={false} axisLine={false} dy={8} />
            <YAxis stroke="#334155" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v)} />
            <Tooltip content={<CustomTooltip formatter={formatCurrency} />} cursor={{ fill: 'rgba(99,102,241,0.04)' }} />
            <Bar dataKey="spending" radius={[8, 8, 4, 4]} animationDuration={1500} animationEasing="ease-out">
              {monthlyData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.spending === maxSpending ? 'url(#barGradientActive)' : 'url(#barGradient)'} 
                  fillOpacity={entry.spending === maxSpending ? 1 : 0.5}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
