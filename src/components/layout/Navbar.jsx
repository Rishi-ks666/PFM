import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, Bell, User, Settings, LogOut, Command, Sun, Moon, PieChart, Wallet, ShieldAlert } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar({ onMenuClick, onCommandPalette }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const { theme, toggleTheme } = useTheme();

  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Budget Alert', message: 'You have exceeded 90% of your Food budget.', time: '10m ago', read: false, type: 'budget' },
    { id: 2, title: 'Large Transaction', message: 'Apple Store: $1,299.00 was charged to your card.', time: '1h ago', read: false, type: 'transaction' },
    { id: 3, title: 'Security Alert', message: 'New login from Mac OS (Chrome)', time: '2h ago', read: true, type: 'security' },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNotifIcon = (type) => {
    switch (type) {
      case 'budget': return <PieChart className="w-4 h-4" />;
      case 'transaction': return <Wallet className="w-4 h-4" />;
      case 'security': return <ShieldAlert className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-[#0F0F1A]/80 backdrop-blur-xl border-b border-white/[0.06] z-50 sticky top-0">
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 -ml-2 mr-3 text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] rounded-xl transition-all duration-200"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Search / Command Palette Trigger */}
        <button 
          onClick={onCommandPalette}
          className="hidden sm:flex items-center space-x-3 bg-white/[0.03] border border-white/[0.06] rounded-xl pl-3 pr-2 py-1.5 text-slate-500 hover:border-indigo-500/30 hover:text-slate-400 transition-all duration-200 group w-64 lg:w-80"
        >
          <Search className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
          <span className="text-[13px] flex-1 text-left">Search anything...</span>
          <kbd className="hidden md:inline-flex items-center space-x-0.5 px-1.5 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-[10px] font-mono text-slate-500">
            <Command className="w-2.5 h-2.5" /><span>K</span>
          </kbd>
        </button>
      </div>

      <div className="flex items-center space-x-1 sm:space-x-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl hover:bg-white/[0.06] text-slate-400 hover:text-slate-200 transition-all"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Mobile search */}
        <button
          onClick={onCommandPalette}
          className="sm:hidden p-2 text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] rounded-xl transition-all duration-200"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={`p-2 rounded-xl transition-all duration-200 relative ${isNotificationsOpen ? 'bg-white/[0.06] text-slate-300' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.06]'}`}
          >
            <Bell className="w-[18px] h-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_6px_1px_rgba(244,63,94,0.5)]" />
            )}
          </button>

          <div 
            className={`absolute right-0 mt-2 w-80 z-[100] bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden transform origin-top-right transition-all duration-200 ease-out flex flex-col max-h-[400px] ${
              isNotificationsOpen 
                ? 'opacity-100 scale-100 translate-y-0' 
                : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
            }`}
          >
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur-xl z-10">
              <p className="text-sm font-semibold text-slate-100">
                Notifications {unreadCount > 0 && <span className="ml-1 bg-indigo-500/20 text-indigo-400 py-0.5 px-2 rounded-full text-[10px]">{unreadCount}</span>}
              </p>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors">Mark all read</button>
              )}
            </div>
            
            <div className="overflow-y-auto custom-scrollbar flex-1">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">No notifications</div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    onClick={() => markAsRead(notif.id)}
                    className={`px-4 py-3 border-b border-white/[0.02] hover:bg-white/[0.03] transition-colors cursor-pointer flex gap-3 ${!notif.read ? 'bg-indigo-500/[0.02]' : 'opacity-70'}`}
                  >
                    <div className="mt-0.5 relative">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center ${!notif.read ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/[0.05] text-slate-400'}`}>
                         {getNotifIcon(notif.type)}
                       </div>
                       {!notif.read && <span className="absolute top-0 right-0 w-2 h-2 bg-indigo-500 rounded-full border-2 border-slate-900" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-medium truncate ${!notif.read ? 'text-slate-200' : 'text-slate-400'}`}>{notif.title}</p>
                      <p className="text-[12px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">{notif.message}</p>
                      <p className="text-[10px] text-slate-600 mt-1">{notif.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Profile */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center focus:outline-none rounded-full transition-all duration-200 ring-2 ring-transparent hover:ring-indigo-500/30"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300">
              <span className="text-[11px] font-bold text-white">JS</span>
            </div>
          </button>

          <div 
            className={`absolute right-0 mt-2 w-56 z-[100] bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden transform origin-top-right transition-all duration-200 ease-out ${
              isProfileOpen 
                ? 'opacity-100 scale-100 translate-y-0' 
                : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
            }`}
          >
            <div className="px-4 py-3 border-b border-white/[0.06]">
              <p className="text-sm font-medium text-slate-100">Jane Smith</p>
              <p className="text-xs text-slate-500 truncate">jane.smith@example.com</p>
            </div>
            <div className="py-1">
              <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2 text-sm text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 transition-all duration-200">
                <User className="w-4 h-4 mr-3 text-slate-500" />
                Profile
              </Link>
              <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2 text-sm text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 transition-all duration-200">
                <Settings className="w-4 h-4 mr-3 text-slate-500" />
                Settings
              </Link>
            </div>
            <div className="py-1 border-t border-white/[0.06]">
              <Link 
                to="/login" 
                onClick={() => localStorage.removeItem('fintech_auth')} 
                className="flex items-center px-4 py-2 text-sm text-rose-400/80 hover:bg-rose-500/[0.06] hover:text-rose-400 transition-all duration-200"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign out
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

