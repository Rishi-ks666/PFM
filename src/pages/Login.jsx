import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useFinance();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Login failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-slate-50 tracking-tight">Welcome back</h3>
        <p className="text-sm text-slate-500 mt-2">Sign in to access your financial dashboard.</p>
      </div>

      {error && (
        <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
          <p className="text-sm text-rose-400">{error}</p>
        </div>
      )}

      <form className="space-y-5" onSubmit={handleLogin}>
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-4 w-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-100 pl-10 pr-3 py-2.5 text-sm placeholder-slate-600 focus:border-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
              placeholder="you@example.com"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            Password
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-4 w-4 text-slate-600 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-xl bg-white/[0.03] border border-white/[0.06] text-slate-100 pl-10 pr-3 py-2.5 text-sm placeholder-slate-600 focus:border-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-white/10 bg-white/[0.03] text-indigo-500 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-500 cursor-pointer select-none">
              Remember me
            </label>
          </div>
          <a href="#" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            Forgot password?
          </a>
        </div>

        <button
          id="login-submit"
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 mt-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-[#0A0A0F] transition-all duration-300 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 group active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center text-xs text-slate-600 border-t border-white/[0.06] pt-6">
        Don't have an account?{' '}
        <Link to="/register" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
          Sign up
        </Link>
      </div>
    </div>
  );
}
