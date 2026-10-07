import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Zap, Lock, Mail, ArrowRight, ShieldAlert, Eye, EyeOff, KeyRound, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('admin@TechCrate.com');
  const [password, setPassword] = useState('password123');
  const [totpCode, setTotpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false);

  const { login, loading, error, require2FA, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('expired') === '1') {
      setSessionExpiredNotice(true);
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const success = await login(email, password, { totpCode });
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-cyan-950/30 relative overflow-hidden">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-cyan-500/30">
          <Zap className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Tech Crate Admin</h1>
        <p className="text-sm text-slate-400 mt-1">Privileged control center for hardware e-commerce platform</p>
      </div>

      {sessionExpiredNotice && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-amber-400 text-sm">
          <Clock className="w-5 h-5 flex-shrink-0" />
          <span>Your previous admin session has expired. Please sign in to continue.</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-rose-400 text-sm">
          <ShieldAlert className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="admin-email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Admin Email or Username
          </label>
          <div className="relative">
            <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              id="admin-email"
              type="text"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) clearError();
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              placeholder="admin@TechCrate.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="admin-password" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Password
          </label>
          <div className="relative">
            <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              id="admin-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) clearError();
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-11 py-3 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {require2FA && (
          <div>
            <label htmlFor="totp-code" className="block text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
              Two-Factor Authenticator Code (TOTP)
            </label>
            <div className="relative">
              <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-500" />
              <input
                id="totp-code"
                type="text"
                required
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                className="w-full bg-slate-950 border border-cyan-500/50 rounded-xl pl-11 pr-4 py-3 text-sm text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono tracking-widest text-center"
                placeholder="000000"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
              Authenticating Credentials...
            </span>
          ) : (
            <>
              Access Admin Console
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
