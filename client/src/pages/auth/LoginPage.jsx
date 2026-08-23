import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [googleNotice, setGoogleNotice] = useState(false);

  const getRoleDashboard = (role) => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'founder') return '/founder/dashboard';
    if (role === 'investor') return '/investor/dashboard';
    return '/login';
  };

  const resolveTargetRoute = (userRole, fromPath) => {
    if (fromPath && typeof fromPath === 'string' && fromPath.startsWith(`/${userRole}`)) {
      return fromPath;
    }
    return getRoleDashboard(userRole);
  };

  // Redirect if already authenticated based on actual DB account role
  const fromPath = location.state?.from?.pathname;
  React.useEffect(() => {
    if (isAuthenticated && user) {
      const target = resolveTargetRoute(user.role, fromPath);
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage('');
    setGoogleNotice(false);

    if (!email || !password) {
      setErrorMessage('Please provide both work email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(email.trim(), password);
      if (result.success && result.user) {
        const target = resolveTargetRoute(result.user.role, fromPath);
        navigate(target, { replace: true });
      } else {
        setErrorMessage(result.message || 'Invalid email or password.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleClick = () => {
    setGoogleNotice(true);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 relative bg-slate-950 py-12">
      {/* Glow background */}
      <div className="absolute inset-0 max-w-md mx-auto h-96 bg-brand-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-400 text-white shadow-xl shadow-brand-500/20 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">Access Ventriva Platform</h2>
          <p className="text-xs text-slate-400">Sign in to your authenticated Ventriva workspace.</p>
        </div>

        {/* Login Form Card */}
        <Card className="glass-card space-y-5">
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {googleNotice && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>Google Single Sign-On is currently undergoing security integration. Please sign in using your account credentials below.</span>
            </div>
          )}

          {/* UI-Only Google OAuth Button Placeholder */}
          <button
            type="button"
            onClick={handleGoogleClick}
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-850 border border-slate-700/80 rounded-xl text-xs font-semibold text-slate-200 transition-all flex items-center justify-center gap-2.5 shadow-sm group cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.1-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
              />
            </svg>
            <span>Continue with Google</span>
            <span className="text-[10px] font-mono text-amber-400/90 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 ml-auto">Coming Soon</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[10px] font-mono text-slate-500 uppercase">Or sign in with email</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Work Email Address"
              type="email"
              placeholder="name@organization.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-200 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              className="w-full justify-center"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          {/* Registration Redirect Link */}
          <div className="pt-3 border-t border-slate-800/80 text-center space-y-1.5">
            <p className="text-xs text-slate-400">Don't have a Ventriva account yet?</p>
            <Link to="/register" className="inline-flex items-center gap-1.5 text-xs text-brand-400 font-semibold hover:underline">
              Create Founder or Investor Account <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;

