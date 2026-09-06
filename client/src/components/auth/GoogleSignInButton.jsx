import React, { useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

export const GoogleSignInButton = ({ role = null, label = null }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleSignIn = () => {
    try {
      console.log('[GOOGLE-AUTH-START] User initiated Google redirect authentication flow', {
        role: role || 'unspecified (login flow)',
        timestamp: new Date().toISOString(),
      });

      setIsLoading(true);
      setErrorMsg('');

      let rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5000').trim().replace(/\/+$/, '');
      if (!rawApiUrl.endsWith('/api')) {
        rawApiUrl = `${rawApiUrl}/api`;
      }

      // Fire a non-blocking background ping to wake up backend immediately (e.g. Render spin-up)
      fetch(`${rawApiUrl}/health`, { method: 'GET', mode: 'cors' }).catch(() => {});

      const params = new URLSearchParams();
      if (role) {
        params.set('role', role);
      }

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const startUrl = `${rawApiUrl}/auth/google/start${queryString}`;

      console.log('[GOOGLE-AUTH-REDIRECT] Redirecting browser to Google OAuth initiation endpoint:', startUrl);

      // Deterministic full-page redirect to Google OAuth flow (100% immune to mobile popup/opener issues)
      window.location.href = startUrl;
    } catch (err) {
      console.error('[GOOGLE-AUTH-ERROR] Failed to initiate Google redirect:', err.message || err);
      setErrorMsg('Failed to connect to Google authentication. Please try again.');
      setIsLoading(false);
    }
  };

  const buttonText = label || (role ? `Continue with Google as ${role.charAt(0).toUpperCase() + role.slice(1)}` : 'Continue with Google');

  return (
    <div className="w-full space-y-2">
      {errorMsg && (
        <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <button
        type="button"
        id="google-signin-button"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className="w-full py-2.5 px-4 bg-slate-900/90 hover:bg-slate-800 active:bg-slate-850 border border-slate-700/80 hover:border-slate-600 rounded-xl text-xs font-semibold text-slate-200 transition-all duration-150 flex items-center justify-center gap-2.5 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand-500/40 disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 text-brand-400 animate-spin shrink-0" />
            <span>Connecting to Google...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span className="text-slate-200 group-hover:text-white transition-colors">{buttonText}</span>
          </>
        )}
      </button>
    </div>
  );
};

export default GoogleSignInButton;
