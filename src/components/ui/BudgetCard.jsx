import React, { useEffect, useState } from 'react';
import { ShoppingBag, Coffee, Car, Home, Wallet, AlertCircle, Gamepad2, HeartPulse, ShoppingCart, Zap } from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

const categoryIcons = {
  Food: Coffee, Travel: Car, Shopping: ShoppingBag, Bills: Zap,
  Housing: Home, Entertainment: Gamepad2, Health: HeartPulse,
  Groceries: ShoppingCart, Transport: Car, default: Wallet,
};

const categoryColors = {
  Food: '#10B981', Travel: '#F59E0B', Shopping: '#8B5CF6', Bills: '#6366F1',
  Housing: '#6366F1', Entertainment: '#F43F5E', Health: '#10B981',
  Groceries: '#10B981', Transport: '#F59E0B', default: '#64748B',
};

// SVG Ring Chart
function BudgetRing({ percentage, color, size = 56, strokeWidth = 5 }) {
  const [animatedPct, setAnimatedPct] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedPct / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPct(Math.min(percentage, 100)), 200);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />
        {/* Progress ring */}
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-[1500ms] ease-out"
          style={{ filter: `drop-shadow(0 0 4px ${color}60)` }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-bold text-slate-300">{Math.round(percentage)}%</span>
      </div>
    </div>
  );
}

export default function BudgetCard({ budget, delay = 0 }) {
  const { category, spent, limit, currency, displayCurrency } = budget;
  const { formatCurrency } = useFinance();
  const percentage = (spent / limit) * 100;
  const isExceeded = percentage >= 100;
  const isWarning = percentage >= 85 && percentage < 100;
  
  const Icon = categoryIcons[category] || categoryIcons.default;
  const color = categoryColors[category] || categoryColors.default;
  const remaining = limit - spent;

  let ringColor = color;
  if (isExceeded) ringColor = '#F43F5E';
  else if (isWarning) ringColor = '#F59E0B';

  return (
    <div 
      className={`glass-card rounded-2xl p-5 transition-all duration-300 group cursor-pointer animate-fade-in-up relative overflow-hidden ${
        isExceeded 
          ? 'border-rose-500/20 hover:border-rose-500/30 animate-pulse-glow' 
          : 'glass-card-hover'
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Exceeded warning glow */}
      {isExceeded && (
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/[0.04] to-transparent pointer-events-none rounded-2xl" />
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl transition-all duration-300 ${
              isExceeded ? 'bg-rose-500/10 text-rose-400' : 'bg-white/[0.04] text-slate-500 group-hover:bg-indigo-500/[0.08] group-hover:text-indigo-400'
            }`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-200">{category}</h3>
              <p className="text-[11px] text-slate-600 mt-0.5 font-mono">
                {formatCurrency(spent)} / {formatCurrency(limit)}
              </p>
              {currency && displayCurrency && currency !== displayCurrency && (
                <p className="text-[9px] text-slate-500 font-mono mt-0.5">
                  Original: {budget.originalLimit.toLocaleString()} {currency}
                </p>
              )}
            </div>
          </div>
          <BudgetRing percentage={percentage} color={ringColor} />
        </div>

        <div className="w-full bg-white/[0.04] rounded-full h-1.5 mb-3 overflow-hidden">
          <div 
            className="h-1.5 rounded-full transition-all duration-[1500ms] ease-out"
            style={{ 
              width: `${Math.min(percentage, 100)}%`,
              backgroundColor: ringColor,
              boxShadow: `0 0 8px ${ringColor}40`,
            }}
          />
        </div>
        
        <div className="flex justify-between items-center text-[11px] font-medium">
          <span className="text-slate-600">{isExceeded ? 'Exceeded by' : 'Remaining'}</span>
          <div className="flex items-center gap-1">
            {isExceeded && <AlertCircle className="w-3 h-3 text-rose-400" />}
            <span className={isExceeded ? 'text-rose-400 font-semibold' : 'text-slate-400'}>
              {formatCurrency(Math.abs(remaining))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
