import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import RoleOnboardingModal from './RoleOnboardingModal';

export const GoogleSignInButton = ({ role = null, onSuccess }) => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const buttonRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [onboardingIdentity, setOnboardingIdentity] = useState(null);

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

  useEffect(() => {
    const scriptId = 'google-jssdk';
    const initGsi = () => {
      if (!window.google?.accounts?.id || !clientId) return;
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
        }
      } catch (gErr) {
        console.warn('Google Identity Services (GSI) notice:', gErr.message || gErr);
      }
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => initGsi();
      document.body.appendChild(script);
    } else if (window.google?.accounts?.id) {
      initGsi();
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
