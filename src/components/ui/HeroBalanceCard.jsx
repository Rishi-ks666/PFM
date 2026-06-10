import { useMemo } from 'react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Eye } from 'lucide-react';
import useFinanceStats from '../../hooks/useFinanceStats';
import { useFinance } from '../../context/FinanceContext';



const HeroTooltip = ({ active, payload, label, formatter }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-xl px-3 py-2 shadow-xl border border-white/[0.1]">
        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-bold text-slate-50">{formatter ? formatter(payload[0].value) : payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

export default function HeroBalanceCard() {
  const { totalNetWorth, netWorthHistory } = useFinanceStats();
  const { formatCurrency } = useFinance();

  // Compute percentage change: current net worth vs. prior month in real history
  const percentChange = useMemo(() => {
    if (netWorthHistory && netWorthHistory.length >= 2) {
      const prev = netWorthHistory[netWorthHistory.length - 2].value;
      const curr = totalNetWorth;
      if (prev > 0) return ((curr - prev) / prev * 100).toFixed(1);
    }
    return '0.0';
  }, [totalNetWorth, netWorthHistory]);

  const isPositive = parseFloat(percentChange) >= 0;

  // Split formatted amount into whole and decimal parts
  const formattedAmount = formatCurrency(totalNetWorth);
  const dotIndex = formattedAmount.lastIndexOf('.');
  const wholePart = dotIndex >= 0 ? formattedAmount.slice(0, dotIndex) : formattedAmount;
  const decimalPart = dotIndex >= 0 ? formattedAmount.slice(dotIndex) : '';

  return (
    <div className="relative rounded-2xl overflow-hidden glass-card noise-overlay animate-fade-in-up">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.08] via-transparent to-violet-500/[0.05] pointer-events-none" />
      
      <div className="relative z-10 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
          {/* Left: Balance info */}
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.15em]">Total Net Worth</p>
              <button className="p-1 rounded-md hover:bg-white/[0.06] text-slate-600 hover:text-slate-400 transition-all">
                <Eye className="w-3 h-3" />
              </button>
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-50 mb-3">
              {wholePart}<span className="text-slate-400">{decimalPart}</span>
            </h2>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border animate-fade-in stagger-3 ${
                isPositive
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-glow'
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-1" />}
                {isPositive ? '+' : ''}{percentChange}%
              </span>
              <span className="text-xs text-slate-600">vs. last month</span>
            </div>
          </div>
          
          {/* Right: Mini chart */}
          <div className="w-full sm:w-[320px] h-[120px] sm:h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={netWorthHistory} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="heroGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="50%" stopColor="#8B5CF6" stopOpacity={0.1} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="heroStroke" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#A78BFA" />
                  </linearGradient>
                </defs>
                <Tooltip content={<HeroTooltip formatter={formatCurrency} />} cursor={false} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="url(#heroStroke)"
                  strokeWidth={2.5}
                  fill="url(#heroGradient)"
                  animationDuration={2000}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
