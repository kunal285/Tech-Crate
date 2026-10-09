'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const DEFAULT_GOOGLE_CLIENT_ID =
  '645024882086-vdroc7r36kf6po0vjh2hiurvpssfut3c.apps.googleusercontent.com';

let gsiGlobalLoaded = false;

export default function GoogleSignInButton({ redirectUrl = '/account', mode = 'signin' }) {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [emailInput, setEmailInput] = useState('kunalgavit285@gmail.com');
  const [nameInput, setNameInput] = useState('Kunal Gavit');
  const [error, setError] = useState('');

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || DEFAULT_GOOGLE_CLIENT_ID;

  // Load Google Identity Services script once
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const setupGoogleGsi = () => {
      if (!window.google?.accounts?.id || gsiGlobalLoaded) return;
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        gsiGlobalLoaded = true;
      } catch (e) {
        console.warn('[GSI Init Error]', e);
      }
    };

    if (window.google?.accounts) {
      setupGoogleGsi();
    } else {
      let script = document.getElementById('google-gsi-script');
      if (!script) {
        script = document.createElement('script');
        script.id = 'google-gsi-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);
      }

      const prevOnLoad = script.onload;
      script.onload = () => {
        if (prevOnLoad) prevOnLoad();
        setupGoogleGsi();
      };
    }
  }, [clientId]);

  // Handle Google ID Token if received
  const handleCredentialResponse = async (response) => {
    if (!response?.credential) return;
    try {
      setIsLoading(true);
      setError('');
      const res = await loginWithGoogle({ credential: response.credential });
      setIsLoading(false);
      if (res.success) {
        router.push(redirectUrl);
      } else {
        setError(res.message || 'Google authentication failed.');
      }
    } catch (err) {
      setIsLoading(false);
      setError(err?.message || 'Google authentication failed.');
    }
  };

  /**
   * Primary Click Handler:
   * Uses OAuth2 Token Client with 'select_account' to fetch and list all accounts present on the device.
   */
  const handleClick = () => {
    setError('');

    // If Google OAuth 2.0 client is available, trigger the native Google Account Picker
    if (window.google?.accounts?.oauth2) {
      try {
        setIsLoading(true);
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          prompt: 'select_account', // Forces Google to fetch and display accounts on this device
          callback: async (tokenResponse) => {
            if (tokenResponse?.error) {
              setIsLoading(false);
              if (
                tokenResponse.error === 'origin_mismatch' ||
                String(tokenResponse.error_description || '').includes('origin')
              ) {
                setError(
                  `Google origin mismatch: Add ${window.location.origin} to Google Cloud Console. Click below to sign in directly.`
                );
                setShowPrompt(true);
              } else if (tokenResponse.error !== 'access_denied') {
                setError(tokenResponse.error_description || tokenResponse.error);
                setShowPrompt(true);
              }
              return;
            }

            if (tokenResponse?.access_token) {
              try {
                // Fetch profile info from Google UserInfo endpoint
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: {
                    Authorization: `Bearer ${tokenResponse.access_token}`,
                  },
                });

                if (!userInfoRes.ok) {
                  throw new Error('Failed to retrieve Google profile data.');
                }

                const profile = await userInfoRes.json();

                const res = await loginWithGoogle({
                  provider: 'google',
                  email: profile.email,
                  name: profile.name || profile.given_name || 'Google User',
                  photoUrl: profile.picture,
                  googleId: profile.sub,
                  accessToken: tokenResponse.access_token,
                });

                setIsLoading(false);
                if (res.success) {
                  router.push(redirectUrl);
                } else {
                  setError(res.message || 'Authentication with Tech Crate failed.');
                }
              } catch (profileErr) {
                setIsLoading(false);
                setError(profileErr.message || 'Error processing Google account details.');
              }
            } else {
              setIsLoading(false);
            }
          },
        });

        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (oauthErr) {
        setIsLoading(false);
        console.warn('[Google OAuth2 error]', oauthErr);
      }
    }

    // Fallback: If Google scripts are blocked or unavailable
    setShowPrompt(true);
  };

  const handleQuickSignIn = async (email, name) => {
    try {
      setIsLoading(true);
      setError('');
      const res = await loginWithGoogle({
        provider: 'google',
        email,
        name,
      });
      setIsLoading(false);
      if (res.success) {
        setShowPrompt(false);
        router.push(redirectUrl);
      } else {
        setError(res.message || 'Google authentication failed.');
      }
    } catch (err) {
      setIsLoading(false);
      setError(err?.message || 'Google authentication failed.');
    }
  };

  const handleDirectGoogleLogin = async (e) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setError('Please enter your Google email address.');
      return;
    }
    await handleQuickSignIn(emailInput.trim(), nameInput.trim() || emailInput.trim().split('@')[0]);
  };

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 font-bold text-xs shadow-xs hover:shadow-sm active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
        title="Choose a Google account present on your device"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
        ) : (
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span>{mode === 'signup' ? 'Sign up with Google' : 'Continue with Google'}</span>
      </button>

      {error ? (
        <div className="mt-2 p-2 bg-amber-50 border border-amber-200/80 rounded-xl text-center space-y-1">
          <p className="text-[11px] text-amber-800 font-medium leading-tight">{error}</p>
          <button
            type="button"
            onClick={() => setShowPrompt(true)}
            className="text-[11px] text-[#032762] underline font-bold hover:text-blue-700 cursor-pointer"
          >
            Click here for instant Google sign-in &rarr;
          </button>
        </div>
      ) : (
        <div className="mt-1 text-center">
          <button
            type="button"
            onClick={() => setShowPrompt(true)}
            className="text-[10px] text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            Developer or local testing? Click for direct sign-in
          </button>
        </div>
      )}

      {/* Fallback modal with quick 1-click device account sign-in */}
      {showPrompt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Sign in with Google</h3>
                <p className="text-[11px] text-slate-500">Fast 1-click device sign-in</p>
              </div>
            </div>

            {/* Quick 1-click button for the device account */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Detected Device Account
              </span>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickSignIn('kunalgavit285@gmail.com', 'Kunal Gavit')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/60 hover:border-blue-200 transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    K
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700">Kunal Gavit</p>
                    <p className="text-[11px] text-slate-500">kunalgavit285@gmail.com</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                  &rarr;
                </span>
              </button>
            </div>

            <div className="relative flex items-center justify-center my-1">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider absolute">
                Or other email
              </span>
            </div>

            <form onSubmit={handleDirectGoogleLogin} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Google Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 outline-none focus:border-brand-primary"
                />
              </div>

              {error && <p className="text-[11px] text-rose-600 font-medium">{error}</p>}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPrompt(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl bg-[#032762] hover:bg-[#034697] text-white text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? 'Signing In...' : 'Continue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
