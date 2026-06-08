import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const iconMap = {
  success: { Icon: CheckCircle2, color: '#10B981', border: 'border-l-emerald-500' },
  error: { Icon: XCircle, color: '#F43F5E', border: 'border-l-rose-500' },
  info: { Icon: Info, color: '#6366F1', border: 'border-l-indigo-500' },
};

function ToastItem({ toast, onRemove }) {
  const [progress, setProgress] = useState(100);
  const [exiting, setExiting] = useState(false);
  const { Icon, color, border } = iconMap[toast.type] || iconMap.info;

  useEffect(() => {
    const startTime = toast.createdAt;
    const duration = toast.duration;
    let raf;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining > 0) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [toast.createdAt, toast.duration]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 200);
  };

  return (
    <div
      className={`glass-card rounded-xl overflow-hidden border border-white/[0.08] border-l-[3px] ${border} shadow-2xl ${
        exiting ? 'animate-slide-out-right' : 'animate-slide-in-right'
      }`}
      style={{ minWidth: 300, maxWidth: 400 }}
    >
      <div className="flex items-center space-x-3 p-3.5">
        <Icon className="w-4.5 h-4.5 flex-shrink-0" style={{ color }} />
        <p className="text-sm text-slate-200 font-medium flex-1 leading-snug">{toast.message}</p>
        <button
          onClick={handleClose}
          className="p-1 rounded-lg hover:bg-white/[0.06] text-slate-600 hover:text-slate-300 transition-all flex-shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      {/* Progress bar */}
      <div className="h-[2px] w-full bg-white/[0.04]">
        <div
          className="h-full transition-none rounded-full"
          style={{
            width: `${progress}%`,
            backgroundColor: color,
            opacity: 0.6,
          }}
        />
      </div>
    </div>
  );
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
}
