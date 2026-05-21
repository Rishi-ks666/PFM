import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Shield } from 'lucide-react';

export default function Register() {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = useMemo(() => getPasswordStrength(password), [password]);
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['', 'bg-rose-500', 'bg-amber-500', 'bg-indigo-500', 'bg-emerald-500'];
  const strengthTextColors = ['', 'text-rose-400', 'text-amber-400', 'text-indigo-400', 'text-emerald-400'];

  const handleRegister = (e) => {
    e.preventDefault();
    localStorage.setItem('fintech_auth', 'true');
    navigate('/', { replace: true });
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-slate-50 tracking-tight">Create your account</h3>
        <p className="text-sm text-slate-500 mt-2">Start managing your finances today.</p>
      </div>
      
      <form className="space-y-4" onSubmit={handleRegister}>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Full Name</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-4 w-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input type="text" className="block w-full rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-100 pl-10 pr-3 py-2.5 text-sm placeholder-slate-600 focus:border-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" placeholder="Jane Smith" required />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input type="email" className="block w-full rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-100 pl-10 pr-3 py-2.5 text-sm placeholder-slate-600 focus:border-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" placeholder="you@example.com" required />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-100 pl-10 pr-3 py-2.5 text-sm placeholder-slate-600 focus:border-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" placeholder="••••••••" required />
          </div>
          {password && (
            <div className="mt-2 animate-fade-in">
              <div className="flex gap-1 mb-1">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`h-1 rounded-full flex-1 transition-all duration-300 ${i <= strength ? strengthColors[strength] : 'bg-white/[0.04]'}`} />
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className={`w-3 h-3 ${strengthTextColors[strength] || 'text-slate-600'}`} />
                <span className={`text-[10px] font-semibold ${strengthTextColors[strength] || 'text-slate-600'}`}>{strengthLabels[strength]}</span>
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Confirm Password</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input type="password" className="block w-full rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-100 pl-10 pr-3 py-2.5 text-sm placeholder-slate-600 focus:border-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" placeholder="••••••••" required />
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 mt-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-[#0A0A0F] transition-all duration-300 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 group active:scale-[0.98]"
        >
          <span>Create Account</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </form>

      <div className="mt-8 text-center text-xs text-slate-600 border-t border-white/[0.06] pt-6">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">Sign in</Link>
      </div>
    </div>
  );
}
