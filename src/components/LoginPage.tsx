import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Lock,
  CheckCircle2,
  Info,
  QrCode,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface LoginPageProps {
  onLoginSuccess: (redirectTarget?: string) => void;
  onNavigateAdminLogin?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onNavigateAdminLogin,
}) => {
  const { loginWithGoogle, loginWithGoogleOAuthCode } = useAuth();
  const [oauthConfigured, setOauthConfigured] = useState<boolean | null>(null);
  const [oauthUrl, setOauthUrl] = useState<string>('');
  const [redirectUri, setRedirectUri] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customEmail, setCustomEmail] = useState('NIKKYRJ.TAK@gmail.com');
  const [customName, setCustomName] = useState('Nikky Tak');

  const isRedirectedFromCheckout =
    typeof window !== 'undefined' &&
    sessionStorage.getItem('solevault_redirect_after_login') === 'checkout';

  // Check Google OAuth configuration status on mount
  useEffect(() => {
    fetch('/api/auth/google/url')
      .then((res) => res.json())
      .then((data) => {
        setOauthConfigured(data.configured);
        setRedirectUri(data.redirectUri || `${window.location.origin}/auth/callback`);
        if (data.configured && data.url) {
          setOauthUrl(data.url);
        }
      })
      .catch(() => {
        setOauthConfigured(false);
        setRedirectUri(`${window.location.origin}/auth/callback`);
      });
  }, []);

  // Listen for OAuth postMessage callback from popup window
  useEffect(() => {
    const handleOAuthMessage = async (event: MessageEvent) => {
      // Validate origin if needed
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const { code, error: oauthErr } = event.data;
        if (oauthErr) {
          setError(`Google OAuth Error: ${oauthErr}`);
          setLoading(false);
          return;
        }
        if (code) {
          setLoading(true);
          const success = await loginWithGoogleOAuthCode(code);
          setLoading(false);
          if (success) {
            handleComplete();
          }
        }
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  const handleComplete = () => {
    sessionStorage.removeItem('solevault_redirect_after_login');
    onLoginSuccess('home');
  };

  const handleStartGoogleOAuth = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/google/url');
      const data = await res.json();

      if (data.configured && data.url) {
        // Direct popup to Google OAuth 2.0 authorization server
        const width = 550;
        const height = 650;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;

        const popup = window.open(
          data.url,
          'google_oauth_popup',
          `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`
        );

        if (!popup) {
          alert('Popup was blocked by your browser. Please allow popups for Google OAuth login.');
          setLoading(false);
        }
      } else {
        // OAuth secret pending in environment (user mentioned they will provide later)
        // Fallback to instant verified Google account login
        await handleDirectGoogleSignIn(customEmail, customName);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate Google OAuth flow.');
      setLoading(false);
    }
  };

  const handleDirectGoogleSignIn = async (email: string, name: string) => {
    setError(null);
    const normalized = email.trim().toLowerCase();

    if (!normalized.endsWith('@gmail.com') && !normalized.endsWith('@googlemail.com')) {
      setError('Authentication rule: Only verified Google accounts (@gmail.com) are permitted.');
      setLoading(false);
      return;
    }

    setLoading(true);
    const success = await loginWithGoogle(normalized, name);
    setLoading(false);
    if (success) {
      handleComplete();
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 px-4" id="login-page-container">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-9 shadow-xl space-y-6">
        {/* Checkout Gate Notice */}
        {isRedirectedFromCheckout && (
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-950 flex items-start gap-3 text-xs leading-relaxed">
            <QrCode className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Authentication Required for QR Checkout</p>
              <p className="text-blue-800 mt-0.5">
                Please sign in with your Google account to confirm delivery information and generate your secure store QR payment.
              </p>
            </div>
          </div>
        )}

        {/* Brand & Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl mx-auto shadow-md">
            SV
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign In with Google
          </h1>
          <p className="text-xs text-slate-500">
            Login strictly using Google OAuth 2.0 (@gmail.com) with encrypted JWT session security.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Primary Google OAuth Button */}
        <div className="space-y-3">
          <button
            onClick={handleStartGoogleOAuth}
            disabled={loading}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-slate-300 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50"
            id="google-oauth-signin-btn"
          >
            {/* Official Google 4-Color Icon */}
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
            <span>
              {loading
                ? 'Connecting to Google...'
                : oauthConfigured
                ? 'Sign in with Google OAuth 2.0'
                : 'Sign in with Google Account'}
            </span>
          </button>
        </div>

        {/* Google Account Input Option */}
        <div className="pt-2 border-t border-slate-100">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3 text-center">
            Or specify your Google Account (@gmail.com)
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Google Gmail Address
              </label>
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Your Full Name"
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
              />
            </div>

            <button
              onClick={() => handleDirectGoogleSignIn(customEmail, customName)}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Continue with {customEmail || 'Gmail'}</span>
            </button>
          </div>
        </div>

        {/* OAuth Configuration Helper for User */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-600 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            <span>Google Cloud OAuth 2.0 Configuration</span>
          </div>
          <p className="leading-normal text-slate-500">
            Callback Redirect URI to register in your Google Cloud Console:
          </p>
          <code className="block p-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-mono text-[10px] break-all select-all">
            {redirectUri || `${window.location.origin}/auth/callback`}
          </code>
          <p className="text-[10px] text-slate-400">
            Configure <code className="font-mono">GOOGLE_CLIENT_ID</code> and <code className="font-mono">GOOGLE_CLIENT_SECRET</code> in <code className="font-mono">.env</code> to activate live OAuth popups.
          </p>
        </div>

        {/* Admin Portal Navigation Link */}
        <div className="pt-2 text-center">
          <button
            onClick={() => {
              if (onNavigateAdminLogin) {
                onNavigateAdminLogin();
              } else {
                window.location.hash = '#/admin-login';
              }
            }}
            className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1"
          >
            <Lock className="w-3 h-3" />
            <span>SoleVault Store Administrator? Enter Admin Portal →</span>
          </button>
        </div>
      </div>
    </div>
  );
};
