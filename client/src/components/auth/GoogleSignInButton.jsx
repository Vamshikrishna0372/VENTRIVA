import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, Loader2 } from 'lucide-react';
import RoleOnboardingModal from './RoleOnboardingModal';

export const GoogleSignInButton = ({ role = null, onSuccess }) => {
  const { loginWithGoogle } = useAuth();
  const buttonRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [onboardingIdentity, setOnboardingIdentity] = useState(null);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '558182928975-0c2rval5u11njnlsot2lucnsmob10774.apps.googleusercontent.com';

  const handleCredentialResponse = async (response) => {
    console.log('[GSI-CALLBACK] Google Identity Services callback invoked', {
      hasResponse: Boolean(response),
      hasCredential: Boolean(response?.credential),
    });

    if (!response || !response.credential) {
      console.error('[GSI-ERROR] Google callback returned without credential');
      setErrorMsg('Google did not return valid credentials. Please try again.');
      return;
    }

    console.log('[GSI-CREDENTIAL-RECEIVED] Credential payload received, commencing authentication handshake');
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await loginWithGoogle(response.credential, role);
      if (res.success) {
        if (res.requiresOnboarding && res.googleIdentity) {
          console.log('[GSI-AUTH-SUCCESS] User requires workspace onboarding role selection');
          setOnboardingIdentity(res.googleIdentity);
        } else if (res.user) {
          console.log('[GSI-AUTH-SUCCESS] Google authentication successful for user:', res.user.email);
          if (onSuccess) {
            onSuccess(res.user);
          }
          // Parent container (LoginPage / RegisterPage) listens to AuthContext user/isAuthenticated and handles single clean navigation
        }
      } else {
        console.error('[GSI-ERROR] Google login failed:', res.message);
        setErrorMsg(res.message || 'Google Sign-In failed.');
      }
    } catch (err) {
      console.error('[GSI-ERROR] Exception during Google Sign-In:', err.message || err);
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
      console.log('[GSI-AUTH-REQUEST] Submitting role onboarding selection:', selectedRole);
      const res = await loginWithGoogle(onboardingIdentity.credential, selectedRole);
      if (res.success && res.user) {
        console.log('[GSI-AUTH-SUCCESS] Role onboarding completed successfully');
        setOnboardingIdentity(null);
        if (onSuccess) {
          onSuccess(res.user);
        }
      } else {
        console.error('[GSI-ERROR] Role onboarding failed:', res.message);
        setErrorMsg(res.message || 'Role onboarding failed.');
      }
    } catch (err) {
      console.error('[GSI-ERROR] Exception during role onboarding:', err.message || err);
      setErrorMsg(err.message || 'An error occurred during role onboarding.');
    } finally {
      setIsLoading(false);
    }
  };

  const callbackRef = useRef(handleCredentialResponse);
  useEffect(() => {
    callbackRef.current = handleCredentialResponse;
  });

  const buttonRenderedRef = useRef(false);

  // Official Google Identity Services (GSI) Button Initialization
  useEffect(() => {
    const scriptId = 'google-jssdk';
    const initGsi = () => {
      if (!window.google?.accounts?.id || !clientId) return;

      try {
        if (window.__gsi_initialized_id !== clientId) {
          console.log('[GSI-INIT] Initializing Google Identity Services with client ID:', clientId.slice(0, 20) + '...');
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (res) => {
              if (typeof window.__gsi_active_callback === 'function') {
                window.__gsi_active_callback(res);
              }
            },
            auto_select: false,
            ux_mode: 'popup',
          });
          window.__gsi_initialized_id = clientId;
        }

        window.__gsi_active_callback = (res) => callbackRef.current(res);

        if (buttonRef.current && !buttonRenderedRef.current) {
          buttonRef.current.innerHTML = '';
          const parentWidth = buttonRef.current.parentElement?.clientWidth || window.innerWidth;
          const responsiveWidth = Math.min(Math.max(parentWidth - 32, 220), 380);

          console.log('[GSI-BUTTON] Rendering Google Identity Services button with width:', responsiveWidth);
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'outline',
            size: 'large',
            width: String(responsiveWidth),
            text: 'continue_with',
            shape: 'rectangular',
          });
          buttonRenderedRef.current = true;
        }
      } catch (gErr) {
        console.warn('[GSI-ERROR] Google Identity Services (GSI) initialization warning:', gErr.message || gErr);
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

      {isLoading && (
        <div className="w-full py-2.5 px-4 bg-slate-900 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 animate-fadeIn">
          <Loader2 className="w-4 h-4 text-brand-400 animate-spin" />
          <span>Authenticating with Google...</span>
        </div>
      )}

      {/* Button container stays permanently mounted to preserve GSI iframe lifecycle */}
      <div
        ref={buttonRef}
        className={`w-full min-h-[40px] flex justify-center transition-all ${
          isLoading ? 'hidden' : 'block'
        }`}
      />

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
