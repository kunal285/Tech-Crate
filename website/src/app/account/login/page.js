'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Mail,
  Lock,
  Phone,
  ArrowRight,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  User,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import GoogleSignInButton from '@/components/GoogleSignInButton';
import { BRAND } from '@/theme/tokens';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/account';

  const { loginWithPassword, sendOtp, verifyOtp } = useAuth();

  const [authMode, setAuthMode] = useState('password'); // 'password' | 'otp'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Password submission
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('Please enter your mobile number/email and password.');
      return;
    }

    setIsLoading(true);
    const res = await loginWithPassword(username.trim(), password);
    setIsLoading(false);

    if (res.success) {
      router.push(redirectUrl);
    } else {
      setError(res.message || 'Invalid mobile number/email or password.');
    }
  };

  // OTP flow: Step 1 Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setIsLoading(true);
    const res = await sendOtp(phone.trim());
    setIsLoading(false);

    if (res.success) {
      setOtpSent(true);
    } else {
      setError(res.message || 'Failed to send OTP to mobile number.');
    }
  };

  // OTP flow: Step 2 Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp || otp.length < 4) {
      setError('Please enter the 4 or 6-digit OTP code.');
      return;
    }

    setIsLoading(true);
    const res = await verifyOtp(phone.trim(), otp.trim());
    setIsLoading(false);

    if (res.success) {
      router.push(redirectUrl);
    } else {
      setError(res.message || 'Incorrect OTP code.');
    }
  };

  return (
    <div className="max-w-md w-full mx-auto py-10 px-4">
      {/* Brand Logo & Header */}
      <div className="text-center mb-6">
        <Link href="/" className="inline-flex items-center justify-center w-12 h-12 mb-2">
          <Image src="/logo.png" alt="Tech Crate" width={48} height={48} priority className="object-contain" />
        </Link>
        <h1
          className="text-2xl font-black tracking-tight"
          style={{ color: BRAND.navy }}
        >
          Welcome Back
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Sign in to access your hardware orders and saved components.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
        {/* Google Authentication */}
        <div className="space-y-3">
          <GoogleSignInButton redirectUrl={redirectUrl} mode="signin" />
          <div className="relative flex items-center justify-center my-1">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider absolute">
              Or with credentials
            </span>
          </div>
        </div>

        {/* Auth Mode Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setAuthMode('password');
              setError('');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              authMode === 'password'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Password Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('otp');
              setError('');
            }}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
              authMode === 'otp'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            SMS OTP Sign In
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Mode 1: Password Form */}
        {authMode === 'password' ? (
          <form onSubmit={handlePasswordLogin} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Mobile Number or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. 9876543210 or maker@gmail.com"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-brand-primary"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Password
                </label>
                <Link
                  href="/account/forgot-password"
                  className="text-[11px] font-semibold text-brand-primary hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-9 pr-9 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-brand-primary"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 disabled:opacity-50 mt-2"
              style={{ backgroundColor: BRAND.navy }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Mode 2: SMS OTP Form */
          <div className="space-y-3.5">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 9876543210"
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-brand-primary"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 disabled:opacity-50"
                  style={{ backgroundColor: BRAND.navy }}
                >
                  {isLoading ? 'Sending OTP...' : 'Send SMS OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                <div className="p-2.5 rounded-xl bg-sky-50 text-sky-800 text-xs flex items-center justify-between">
                  <span>OTP sent to +91 {phone}</span>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-[11px] font-bold underline"
                  >
                    Change
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                    Enter OTP Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.trim())}
                    placeholder="Enter 6-digit OTP"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-center font-mono font-bold tracking-widest text-slate-900 outline-none focus:border-brand-primary"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-sm transition-all active:scale-95 disabled:opacity-50"
                  style={{ backgroundColor: BRAND.navy }}
                >
                  {isLoading ? 'Verifying...' : 'Verify & Continue'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Footer Link */}
        <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
          Don&apos;t have an account?{' '}
          <Link
            href={`/account/register?redirect=${encodeURIComponent(redirectUrl)}`}
            className="font-bold text-brand-primary hover:underline"
          >
            Create Maker Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND.primary }} />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
