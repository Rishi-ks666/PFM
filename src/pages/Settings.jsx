import React, { useState, useEffect, useCallback } from 'react';
import { User, Bell, Shield, Palette, Save, Camera, Moon, Sun, Globe, Lock, Trash2, AlertTriangle, DollarSign, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useFinance } from '../context/FinanceContext';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'preferences', label: 'Preferences', icon: Palette },
];

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

function Toggle({ enabled, onChange }) {
  return (
    <button onClick={() => onChange(!enabled)} className={`relative w-10 h-5 rounded-full transition-all duration-300 ${enabled ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.3)]' : 'bg-white/[0.06]'}`}>
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(false);
  const [marketNotif, setMarketNotif] = useState(true);
  const [budgetNotif, setBudgetNotif] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  const { theme, toggleTheme } = useTheme();

  // Currency — try to use FinanceContext, fall back gracefully
  let currency = 'USD';
  let setCurrency = () => {};
  try {
    const finance = useFinance();
    if (finance.currency) currency = finance.currency;
    if (finance.setCurrency) setCurrency = finance.setCurrency;
  } catch {
    // FinanceContext may not have currency yet
  }

  // Profile — localStorage
  const [profileName, setProfileName] = useState(() => {
    try { return localStorage.getItem('pfm_profile_name') || 'Jane Smith'; } catch { return 'Jane Smith'; }
  });
  const [profileEmail, setProfileEmail] = useState(() => {
    try { return localStorage.getItem('pfm_profile_email') || 'jane.smith@example.com'; } catch { return 'jane.smith@example.com'; }
  });

  const saveProfile = useCallback(() => {
    try {
      localStorage.setItem('pfm_profile_name', profileName);
      localStorage.setItem('pfm_profile_email', profileEmail);
    } catch { /* ignore */ }
  }, [profileName, profileEmail]);

  const getInitials = (name) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return (parts[0]?.[0] || 'U').toUpperCase();
  };

  const currencyObj = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];

  return (
    <div className="space-y-6 max-w-[900px] mx-auto">
      <div className="animate-fade-in-up">
        <h2 className="text-xl font-bold text-slate-50 tracking-tight">Settings</h2>
        <p className="text-xs text-slate-600 mt-1">Manage your account preferences and security.</p>
      </div>

      {/* Tab Bar */}
      <div className="flex space-x-1 glass-card rounded-2xl p-1.5 animate-fade-in-up stagger-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 flex-1 justify-center ${
                isActive 
                  ? 'bg-indigo-500/[0.1] text-indigo-400 border border-indigo-500/20' 
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="glass-card rounded-2xl animate-fade-in-up stagger-2">
        {activeTab === 'profile' && (
          <div className="p-6 space-y-6">
            {/* Avatar */}
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-indigo-500/20">
                  {getInitials(profileName)}
                </div>
                <button className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-[#0F0F1A] border border-white/[0.08] text-slate-400 hover:text-indigo-400 transition-colors">
                  <Camera className="w-3 h-3" />
                </button>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">{profileName}</p>
                <p className="text-xs text-slate-600">{profileEmail}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Display Name</label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="block w-full rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-100 px-3 py-2.5 text-sm focus:border-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                <input
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="block w-full rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-100 px-3 py-2.5 text-sm focus:border-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            <button
              onClick={saveProfile}
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl px-4 py-2.5 hover:from-indigo-400 hover:to-violet-500 shadow-lg shadow-indigo-500/20 transition-all text-xs active:scale-[0.98]"
            >
              <Save className="w-3.5 h-3.5" /><span>Save Changes</span>
            </button>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="p-6 space-y-5">
            {[
              { label: 'Email Notifications', desc: 'Receive daily summaries via email', value: emailNotif, setter: setEmailNotif },
              { label: 'Push Notifications', desc: 'Browser push for real-time alerts', value: pushNotif, setter: setPushNotif },
              { label: 'Market Alerts', desc: 'Investment price movement notifications', value: marketNotif, setter: setMarketNotif },
              { label: 'Budget Warnings', desc: 'Alert when nearing spending limits', value: budgetNotif, setter: setBudgetNotif },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-200">{item.label}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{item.desc}</p>
                </div>
                <Toggle enabled={item.value} onChange={item.setter} />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-200 mb-4">Change Password</h3>
              <div className="space-y-3 max-w-md">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Current Password</label>
                  <input type="password" className="block w-full rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-100 px-3 py-2.5 text-sm focus:border-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">New Password</label>
                  <input type="password" className="block w-full rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-100 px-3 py-2.5 text-sm focus:border-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" placeholder="••••••••" />
                </div>
                <button className="flex items-center space-x-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-semibold rounded-xl px-4 py-2 shadow-lg shadow-indigo-500/20 transition-all text-xs active:scale-[0.98]">
                  <Lock className="w-3.5 h-3.5" /><span>Update Password</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-200">Two-Factor Authentication</p>
                  <p className="text-xs text-slate-600 mt-0.5">Add an extra layer of security</p>
                </div>
                <Toggle enabled={twoFactor} onChange={setTwoFactor} />
              </div>
            </div>

            <div className="pt-4 border-t border-white/[0.06]">
              <h3 className="text-sm font-semibold text-rose-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Danger Zone
              </h3>
              <button className="flex items-center space-x-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold rounded-xl px-4 py-2 hover:bg-rose-500/20 transition-all text-xs">
                <Trash2 className="w-3.5 h-3.5" /><span>Delete Account</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="p-6 space-y-6">
            {/* Appearance — Theme Toggle */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
                Appearance
              </h3>
              <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? (
                    <Moon className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-slate-200">Theme</p>
                    <p className="text-xs text-slate-600 mt-0.5">Toggle dark/light appearance</p>
                  </div>
                </div>
                {/* Segmented Control */}
                <div className="flex p-0.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                  <button
                    onClick={() => theme !== 'dark' && toggleTheme()}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                      theme === 'dark'
                        ? 'bg-indigo-500/[0.15] text-indigo-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Moon className="w-3 h-3" />
                    Dark
                  </button>
                  <button
                    onClick={() => theme !== 'light' && toggleTheme()}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                      theme === 'light'
                        ? 'bg-indigo-500/[0.15] text-indigo-400 shadow-sm'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Sun className="w-3 h-3" />
                    Light
                  </button>
                </div>
              </div>
            </div>

            {/* Currency */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Currency
              </h3>
              <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/[0.1] flex items-center justify-center text-sm font-bold text-emerald-400">
                    {currencyObj.symbol}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{currencyObj.name}</p>
                    <p className="text-xs text-slate-600 mt-0.5">Preview: {currencyObj.symbol}1,234.56</p>
                  </div>
                </div>
                <div className="relative">
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="bg-white/[0.03] border border-white/[0.06] text-slate-300 text-xs rounded-xl px-3 py-1.5 pr-7 focus:outline-none focus:border-indigo-500/30 transition-colors appearance-none cursor-pointer"
                  >
                    {CURRENCIES.map(c => (
                      <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Language (existing) */}
            <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-indigo-400" />
                <div>
                  <p className="text-sm font-medium text-slate-200">Language</p>
                  <p className="text-xs text-slate-600 mt-0.5">Interface display language</p>
                </div>
              </div>
              <select className="bg-white/[0.03] border border-white/[0.06] text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500/30 transition-colors appearance-none cursor-pointer">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
