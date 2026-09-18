import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, KeyRound, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onNavigateHome: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onNavigateHome,
}) => {
  const { loginWithAdminCredentials } = useAuth();
  const [email, setEmail] = useState('admin@solevault.com');
  const [password, setPassword] = useState('Admin@SoleVault2026!');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await loginWithAdminCredentials(password, email);
    setIsSubmitting(false);

    if (result.success) {
      onLoginSuccess();
    } else {
      setError(result.error || 'Authentication failed. Please verify credentials.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16" id="admin-login-container">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header Banner */}
        <div className="bg-slate-950 p-8 text-center text-white relative">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-lg mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-white">
            SoleVault Admin Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authorized Personnel & Inventory Management
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-xs">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Access Denied</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@solevault.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Admin Security Passcode
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none font-medium"
                />
              </div>
            </div>

            {/* Quick Fill Info Box */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                <span>Configured Environment Credentials</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Email: <code className="text-slate-800 font-mono font-semibold">admin@solevault.com</code>
              </p>
              <p className="text-[11px] text-slate-500">
                Passcode: <code className="text-slate-800 font-mono font-semibold">Admin@SoleVault2026!</code>
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-900 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Authenticating Administrator...</span>
              ) : (
                <>
                  <span>Sign In as Administrator</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <button
              onClick={onNavigateHome}
              className="text-xs text-slate-500 hover:text-slate-900 font-semibold transition-colors"
            >
              ← Return to SoleVault Storefront
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
