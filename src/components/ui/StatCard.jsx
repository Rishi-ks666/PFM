import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

// Mini sparkline SVG
function Sparkline({ data, color, isPositive }) {
  const width = 80;
  const height = 32;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const gradientId = `sparkline-${Math.random().toString(36).substr(2, 9)}`;
  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={isPositive ? '#10B981' : '#F43F5E'} stopOpacity="0.3" />
          <stop offset="100%" stopColor={isPositive ? '#10B981' : '#F43F5E'} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${gradientId})`} />
      <polyline
        points={points}
        fill="none"
        stroke={isPositive ? '#10B981' : '#F43F5E'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="drop-shadow-sm"
        style={{ filter: `drop-shadow(0 0 4px ${isPositive ? 'rgba(16,185,129,0.4)' : 'rgba(244,63,94,0.4)'})` }}
      />
    </svg>
  );
}

// Animated number counter
function AnimatedNumber({ value, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    // Extract leading non-numeric chars (currency symbol etc.) and trailing non-numeric (% etc.)
    const match = value.match(/^([^0-9-]*)([-]?[\d,.]+)(.*)$/);
    if (!match) { setDisplay(value); return; }

    const extractedPrefix = match[1];
    const numStr = match[2].replace(/,/g, '');
    const extractedSuffix = match[3];
    const numVal = parseFloat(numStr);
    if (isNaN(numVal)) { setDisplay(value); return; }

    const hasDecimals = numStr.includes('.');
    const decimalPlaces = hasDecimals ? (numStr.split('.')[1] || '').length : 0;

    let start = 0;
    const duration = 1200;
    const startTime = performance.now();
    
    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (numVal - start) * eased;
      
      const formatted = current.toLocaleString('en-US', {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
      });
      setDisplay(`${extractedPrefix}${formatted}${extractedSuffix}`);
      
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [value]);

  return <span>{prefix}{display}{suffix}</span>;
}

// Random sparkline data generator
const generateSparkline = () => Array.from({ length: 12 }, () => Math.random() * 100);

export default function StatCard({ title, amount, trend, isPositive, icon: Icon, delay = 0 }) {
  const sparkData = useRef(generateSparkline()).current;

  return (
    <div 
      className="glass-card glass-card-hover rounded-2xl p-5 cursor-pointer transition-all duration-300 group relative overflow-hidden animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-white/[0.04] group-hover:bg-indigo-500/[0.08] transition-all duration-300">
              <Icon className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors duration-300" />
            </div>
            <h3 className="text-[13px] font-medium text-slate-500 group-hover:text-slate-400 transition-colors">{title}</h3>
          </div>
          <Sparkline data={sparkData} isPositive={isPositive} />
        </div>

        <div className="flex items-end justify-between">
          <p className="text-2xl sm:text-[28px] font-extrabold text-slate-50 tracking-tight font-[Inter] animate-count-up">
            <AnimatedNumber value={amount} />
          </p>
          <div className={`flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
            isPositive 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
            {trend}
          </div>
        </div>
      </div>
    </div>
  );
}
