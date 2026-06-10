import React, { useState, useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from 'recharts';
import useFinanceStats from '../../hooks/useFinanceStats';
import { useFinance } from '../../context/FinanceContext';

const CATEGORY_COLORS = {
  Electronics: '#6366F1',
  Income: '#10B981',
  'Food & Drink': '#F59E0B',
  Transport: '#8B5CF6',
  Groceries: '#10B981',
  Entertainment: '#F43F5E',
  Shopping: '#A855F7',
  Health: '#14B8A6',
  Housing: '#6366F1',
  Bills: '#3B82F6',
  Travel: '#F59E0B',
};

const FALLBACK_COLORS = ['#6366F1', '#10B981', '#8B5CF6', '#F59E0B', '#F43F5E', '#14B8A6', '#3B82F6', '#A855F7'];

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6} startAngle={startAngle} endAngle={endAngle} fill={fill} />
      <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle} innerRadius={outerRadius + 10} outerRadius={outerRadius + 13} fill={fill} opacity={0.2} />
    </g>
  );
};

export default function ExpensePieChart() {
  const [activeIndex, setActiveIndex] = useState(0);
  const { spendingByCategory } = useFinanceStats();
  const { formatCurrency } = useFinance();

  const { expenseData, totalExpenses } = useMemo(() => {
    const entries = Object.entries(spendingByCategory);
    if (entries.length === 0) {
      const fallback = [
        { name: 'No Data', value: 1, color: '#334155' },
      ];
      return { expenseData: fallback, totalExpenses: 0 };
    }

    // Sort by value descending
    const sorted = entries
      .map(([name, value], i) => ({
        name,
        value,
        color: CATEGORY_COLORS[name] || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
      }))
      .sort((a, b) => b.value - a.value);

    const total = sorted.reduce((acc, item) => acc + item.value, 0);
    return { expenseData: sorted, totalExpenses: total };
  }, [spendingByCategory]);

  const safeActiveIndex = Math.min(activeIndex, expenseData.length - 1);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = totalExpenses > 0 ? ((data.value / totalExpenses) * 100).toFixed(1) : '0.0';
      return (
        <div className="glass-card rounded-xl px-3 py-2 shadow-xl border border-white/[0.1]">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color, boxShadow: `0 0 6px ${data.color}60` }} />
            <span className="text-slate-200 text-sm font-medium">{data.name}</span>
          </div>
          <p className="text-slate-50 font-bold text-base">{formatCurrency(data.value)}</p>
          <p className="text-slate-500 text-xs">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card rounded-2xl p-6 animate-fade-in-up stagger-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-slate-200">Expense Breakdown</h3>
          <p className="text-xs text-slate-600 mt-1">Where your money went this month</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-600 uppercase tracking-wider font-semibold">Total</p>
          <p className="text-xl font-bold text-slate-50">{formatCurrency(totalExpenses)}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-10 min-h-[280px]">
        <div className="w-full max-w-[260px] h-[260px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={safeActiveIndex}
                activeShape={renderActiveShape}
                data={expenseData}
                cx="50%"
                cy="50%"
                innerRadius={72}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                stroke="none"
                animationDuration={1500}
                animationEasing="ease-out"
              >
                {expenseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} className="cursor-pointer outline-none" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold">
              {expenseData[safeActiveIndex]?.name || ''}
            </span>
            <span className="text-2xl font-extrabold text-slate-50 mt-0.5">
              {totalExpenses > 0 ? `${((expenseData[safeActiveIndex]?.value / totalExpenses) * 100).toFixed(0)}%` : '0%'}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full lg:w-auto flex flex-col gap-2">
          {expenseData.map((item, index) => {
            const isActive = safeActiveIndex === index;
            const pct = totalExpenses > 0 ? ((item.value / totalExpenses) * 100).toFixed(1) : '0.0';
            return (
              <div 
                key={item.name}
                className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all duration-200 lg:min-w-[220px] ${
                  isActive ? 'bg-white/[0.04] border border-white/[0.08]' : 'border border-transparent hover:bg-white/[0.02]'
                }`}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color, boxShadow: isActive ? `0 0 8px ${item.color}60` : 'none' }} />
                  <span className={`text-sm font-medium transition-colors ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>{item.name}</span>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold transition-colors ${isActive ? 'text-slate-50' : 'text-slate-400'}`}>{formatCurrency(item.value)}</span>
                  <span className="text-[10px] text-slate-600 ml-1.5">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
