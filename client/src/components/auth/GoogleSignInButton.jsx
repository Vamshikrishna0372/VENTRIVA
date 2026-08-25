import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import RoleOnboardingModal from './RoleOnboardingModal';

export const GoogleSignInButton = ({ role = null, onSuccess }) => {
  const { loginWithGoogle, fetchCurrentUser } = useAuth();
  const navigate = useNavigate();
  const buttonRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [onboardingIdentity, setOnboardingIdentity] = useState(null);
  const [showFallbackButton, setShowFallbackButton] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '558182928975-0c2rval5u11njnlsot2lucnsmob10774.apps.googleusercontent.com';

  const handleCredentialResponse = async (response) => {
    if (!response.credential) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await loginWithGoogle(response.credential, role);
      if (res.success) {
        if (res.requiresOnboarding && res.googleIdentity) {
          setOnboardingIdentity(res.googleIdentity);
        } else if (res.user) {
          if (onSuccess) {
            onSuccess(res.user);
          } else {
            const target = res.user.role === 'admin' ? '/admin/dashboard' : res.user.role === 'founder' ? '/founder/dashboard' : '/investor/dashboard';
            navigate(target, { replace: true });
          }
        }
      } else {
        setErrorMsg(res.message || 'Google Sign-In failed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during Google Sign-In.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleSelected = async (selectedRole) => {
    if (!onboardingIdentity?.credential) return;
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await loginWithGoogle(onboardingIdentity.credential, selectedRole);
      if (res.success && res.user) {
        setOnboardingIdentity(null);
        if (onSuccess) {
          onSuccess(res.user);
        } else {
          const target = res.user.role === 'admin' ? '/admin/dashboard' : res.user.role === 'founder' ? '/founder/dashboard' : '/investor/dashboard';
          navigate(target, { replace: true });
        }
      } else {
        setErrorMsg(res.message || 'Role onboarding failed.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during role onboarding.');
    } finally {
      setIsLoading(false);
    }
  };

  const callbackRef = useRef(handleCredentialResponse);
  useEffect(() => {
    callbackRef.current = handleCredentialResponse;
  });

  // Handle URL hash / search token callback from redirect OAuth flow if present
  useEffect(() => {
    const handleUrlCallback = async () => {
      const hash = window.location.hash || '';
      const search = window.location.search || '';

      if (!hash && !search) return;

      const searchParams = new URLSearchParams(search);
      const queryError = searchParams.get('error');
      if (queryError) {
        window.history.replaceState(null, '', window.location.pathname);
        setErrorMsg(`Google sign-in could not be completed (${queryError}). Please try again.`);
        return;
      }

      const directToken = searchParams.get('token');
      const targetUrl = searchParams.get('target');
      if (directToken) {
        window.history.replaceState(null, '', window.location.pathname);
        setIsLoading(true);
        try {
          localStorage.setItem('ventriva_token', directToken);
          const userRes = await fetchCurrentUser();
          setIsLoading(false);
          if (targetUrl) {
            navigate(targetUrl, { replace: true });
          }
        } catch (err) {
          setErrorMsg('Session initialization failed. Please try signing in again.');
          setIsLoading(false);
        }
        return;
      }

      let idToken = null;
      if (hash.includes('id_token=')) {
        const params = new URLSearchParams(hash.replace(/^#/, ''));
        idToken = params.get('id_token');
      } else if (search.includes('id_token=')) {
        idToken = searchParams.get('id_token');
      }

      if (idToken) {
        // Clean URL hash immediately to avoid double execution on component re-renders
        window.history.replaceState(null, '', window.location.pathname);
        try {
          await handleCredentialResponse({ credential: idToken });
        } catch (err) {
          setErrorMsg(err?.message || 'Google Sign-In could not be completed. Please try again.');
          setIsLoading(false);
        }
      }
    };

    handleUrlCallback();
  }, []);

  const triggerOAuthPopup = () => {
    setErrorMsg('');
    const redirectUri = window.location.origin + '/login';
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=id_token&scope=openid%20email%20profile&prompt=select_account&nonce=${Math.random().toString(36)}`;

    // On mobile devices, perform full-screen navigation to ensure reliable callback without popup blocking or tab hanging
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
    if (isMobile) {
      window.location.href = oauthUrl;
      return;
    }

    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      oauthUrl,
      'GoogleAuthPopup',
      `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,status=yes`
    );

    if (!popup) {
      window.location.href = oauthUrl;
      return;
    }

    const checkPopupHash = setInterval(() => {
      try {
        if (!popup || popup.closed) {
          clearInterval(checkPopupHash);
          return;
        }
        if (popup.location.href.includes(window.location.origin)) {
          const hash = popup.location.hash;
          const params = new URLSearchParams(hash.replace(/^#/, ''));
          const idToken = params.get('id_token');
          popup.close();
          clearInterval(checkPopupHash);
          if (idToken) {
            handleCredentialResponse({ credential: idToken });
          } else {
            setErrorMsg('Google authentication token missing from response.');
          }
        }
      } catch (e) {
        // Cross-origin restriction while popup is on accounts.google.com domain
      }
    }, 500);
  };

  useEffect(() => {
    const scriptId = 'google-jssdk';
    const initGsi = () => {
      if (!window.google?.accounts?.id || !clientId) {
        setShowFallbackButton(true);
        return;
      }
      try {
        if (window.__gsi_initialized_id !== clientId) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (res) => {
              if (typeof window.__gsi_active_callback === 'function') {
                window.__gsi_active_callback(res);
              }
            },
            auto_select: false,
          });
          window.__gsi_initialized_id = clientId;
        }

        window.__gsi_active_callback = (res) => callbackRef.current(res);

        if (buttonRef.current) {
          buttonRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'outline',
            size: 'large',
            width: '380',
            text: 'continue_with',
            shape: 'rectangular',
          });

          setTimeout(() => {
            if (buttonRef.current && buttonRef.current.children.length === 0) {
              setShowFallbackButton(true);
            }
          }, 1200);
        }
      } catch (gErr) {
        console.warn('Google Identity Services (GSI) notice:', gErr.message || gErr);
        setShowFallbackButton(true);
      }
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initGsi();
      script.onerror = () => setShowFallbackButton(true);
      document.body.appendChild(script);
    } else if (window.google?.accounts?.id) {
      initGsi();
    } else {
      setShowFallbackButton(true);
    }
  }, [clientId]);

  return (
    <div className="w-full space-y-2">
      {errorMsg && (
        <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {isLoading ? (
        <div className="w-full py-2.5 px-4 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />
          <span>Authenticating with Google...</span>
        </div>
      ) : showFallbackButton ? (
        <button
          type="button"
          onClick={triggerOAuthPopup}
          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
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
          <span>Continue with Google</span>
        </button>
      ) : (
        <div ref={buttonRef} className="w-full min-h-[40px] flex justify-center" />
      )}

      {/* Role Onboarding Modal for New Google Users */}
      {onboardingIdentity && (
        <RoleOnboardingModal
          googleIdentity={onboardingIdentity}
          onSelectRole={handleRoleSelected}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default GoogleSignInButton;


