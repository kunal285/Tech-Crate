'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldAlert,
  Eye,
  EyeOff,
  KeyRound,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import ThemeToggle from '@/components/ThemeToggle';

function LoginForm() {
  const [email, setEmail] = useState('admin@techcrate.com');
  const [password, setPassword] = useState('password123');
  const [totpCode, setTotpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false);

  const { login, loading, error, require2FA, clearError } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('expired') === '1') {
      setSessionExpiredNotice(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const success = await login(email, password, { totpCode });
    if (success) {
      const loggedUser = useAuthStore.getState().user;
      const role = (loggedUser?.role || '').toLowerCase();
      let defaultDestination = '/dashboard';
      if (role === 'order_staff') defaultDestination = '/orders';
      else if (role === 'finance') defaultDestination = '/payments';
      else if (role === 'support') defaultDestination = '/replacements';
      else if (role === 'store_manager') defaultDestination = '/products';

      const redirect = searchParams.get('redirect') || defaultDestination;
      router.push(redirect);
      router.refresh();
    }
  };

  return (
    <div className="max-w-md w-full bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden transition-colors">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <div className="relative w-16 h-16 rounded-2xl bg-white border border-slate-200 dark:border-slate-700 flex items-center justify-center p-2 shadow-sm mb-4">
          <Image
            src="/logo.png"
            alt="Tech Crate"
            width={56}
            height={56}
            className="object-contain"
            priority
          />
        </div>

        <h1 className="text-2xl font-extrabold text-[#032762] dark:text-blue-400 tracking-tight">
          Tech Crate Control Panel
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Privileged authentication for e-commerce operations
        </p>
      </div>

      {sessionExpiredNotice && (
        <div className="mb-6 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center gap-2.5 text-amber-700 dark:text-amber-400 text-xs">
          <Clock className="w-4 h-4 shrink-0" />
          <span>Your admin session has expired. Please sign in to continue.</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex items-center gap-2.5 text-rose-700 dark:text-rose-400 text-xs">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="admin-email" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Admin Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
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
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus-ring"
              placeholder="admin@techcrate.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="admin-password" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
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
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus-ring"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {require2FA && (
          <div>
            <label htmlFor="totp-code" className="block text-xs font-bold text-brand-primary uppercase tracking-wider mb-1.5">
              Two-Factor Authenticator Code (TOTP)
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-primary" />
              <input
                id="totp-code"
                type="text"
                required
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-brand-primary/50 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-slate-100 font-mono tracking-widest text-center focus-ring"
                placeholder="000000"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-primary hover:bg-brand-primaryDark text-white font-bold py-3 rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-2"
        >
          {loading ? (
            <span className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Authenticating Credentials...
            </span>
          ) : (
            <span className="flex items-center gap-2 text-xs sm:text-sm">
              <span>Access Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] flex flex-col justify-center items-center p-4 relative transition-colors">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Suspense fallback={<div className="text-slate-400 text-sm">Loading admin console...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
