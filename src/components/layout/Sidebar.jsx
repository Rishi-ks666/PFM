import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, ArrowRightLeft, Wallet, PieChart, LineChart, Settings, LogOut, X, Command, PanelLeftClose, PanelLeft
} from 'lucide-react';
import { useFinance } from '../../context/FinanceContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: ArrowRightLeft },
  { name: 'Accounts', href: '/accounts', icon: Wallet },
  { name: 'Budgets', href: '/budgets', icon: PieChart },
  { name: 'Analytics', href: '/analytics', icon: LineChart },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useFinance();

  const displayName = user?.name || 'User';
  const displayEmail = user?.email || '';
  const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={`fixed inset-0 bg-[#0A0A0F]/80 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Drawer */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 bg-[#0F0F1A]/95 backdrop-blur-xl border-r border-white/[0.06] flex flex-col transform transition-all duration-300 ease-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isCollapsed ? 'w-[260px] lg:w-[80px]' : 'w-[260px]'}`}
      >
        {/* Logo Section */}
        <div className={`h-16 flex-shrink-0 flex items-center border-b border-white/[0.06] ${isCollapsed ? 'px-5 lg:px-0 lg:justify-center justify-between' : 'px-5 justify-between'}`}>
          <Link to="/" className={`flex items-center space-x-2.5 group focus:outline-none ${isCollapsed ? 'lg:hidden' : ''}`}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
              <Command className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-50">FinDash</span>
          </Link>

          {/* Mini Logo for collapsed state */}
          <Link to="/" className={`hidden items-center justify-center group focus:outline-none ${isCollapsed ? 'lg:flex' : 'hidden'}`}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all duration-300">
              <Command className="w-4 h-4 text-white" />
            </div>
          </Link>
          
          <button 
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-500 hover:text-slate-200 hover:bg-white/[0.06] rounded-lg transition-all duration-200"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Navigation */}
        <div className={`flex-1 overflow-y-auto py-6 space-y-1 custom-scrollbar ${isCollapsed ? 'px-3 lg:px-2' : 'px-3'}`}>
          <div className={`mb-3 text-[10px] font-semibold text-slate-600 uppercase tracking-[0.15em] ${isCollapsed ? 'px-3 lg:px-0 lg:text-center' : 'px-3'}`}>
            <span className={isCollapsed ? 'lg:hidden' : ''}>Navigation</span>
            <span className={`hidden ${isCollapsed ? 'lg:inline' : ''}`}>Nav</span>
          </div>
          {navigation.map((item, index) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => onClose && onClose()}
                title={isCollapsed ? item.name : undefined}
                className={`
                  flex items-center rounded-xl transition-all duration-200 group relative
                  animate-fade-in-up stagger-${index + 1}
                  ${isActive 
                    ? 'bg-indigo-500/[0.08] text-indigo-400' 
                    : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-300'
                  }
                  ${isCollapsed ? 'px-3 py-2.5 lg:justify-center lg:px-0 lg:py-3' : 'px-3 py-2.5'}
                  focus:outline-none
                `}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-gradient-to-b from-indigo-400 to-violet-500 shadow-[0_0_12px_2px_rgba(99,102,241,0.4)]" />
                )}
                <Icon className={`w-[18px] h-[18px] transition-all duration-200 ${
                  isActive ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-400'
                } ${isCollapsed ? 'mr-3 lg:mr-0' : 'mr-3'}`} />
                <span className={`font-medium text-[13px] ${isCollapsed ? 'lg:hidden' : ''}`}>{item.name}</span>
                {isActive && (
                  <span className={`w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_6px_1px_rgba(99,102,241,0.5)] ${isCollapsed ? 'ml-auto lg:hidden' : 'ml-auto'}`} />
                )}
              </Link>
            );
          })}
        </div>
        
        {/* User Footer & Toggle */}
        <div className="p-3 border-t border-white/[0.06] flex flex-col space-y-2">
          {/* User avatar card */}
          <div className={`flex items-center rounded-xl bg-white/[0.02] border border-white/[0.04] transition-all ${isCollapsed ? 'px-3 py-3 lg:p-2 lg:justify-center' : 'px-3 py-3'}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-indigo-500/20 relative flex-shrink-0">
              {initials}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0F0F1A]" />
            </div>
            <div className={`ml-3 min-w-0 ${isCollapsed ? 'lg:hidden' : ''}`}>
              <p className="text-sm font-medium text-slate-200 truncate">{displayName}</p>
              <p className="text-[11px] text-slate-600 truncate">{displayEmail}</p>
            </div>
          </div>

          <div className={`flex ${isCollapsed ? 'flex-row lg:flex-col lg:space-y-2 space-x-2 lg:space-x-0' : 'space-x-2'}`}>
            <button
              onClick={handleLogout}
              title={isCollapsed ? "Sign out" : undefined}
              className={`flex-1 flex items-center rounded-xl text-slate-600 hover:bg-rose-500/[0.06] hover:text-rose-400 transition-all duration-200 group ${isCollapsed ? 'px-3 py-2 lg:justify-center lg:py-3' : 'px-3 py-2'}`}
            >
              <LogOut className={`w-4 h-4 group-hover:text-rose-400 transition-colors ${isCollapsed ? 'mr-3 lg:mr-0' : 'mr-3'}`} />
              <span className={`font-medium text-[13px] ${isCollapsed ? 'lg:hidden' : ''}`}>Sign out</span>
            </button>
            
            <button 
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`hidden lg:flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-all duration-200 ${isCollapsed ? 'p-3' : 'px-3 py-2 flex-shrink-0'}`}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
