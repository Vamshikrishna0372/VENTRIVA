import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const getRoleDashboard = (role) => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'founder') return '/founder/dashboard';
    if (role === 'investor') return '/investor/dashboard';
    return null; // Never default an unknown/missing role to founder
  };

  const resolveTargetRoute = (userRole, fromPath) => {
    const dashboard = getRoleDashboard(userRole);
    if (!dashboard) return null;
    if (fromPath && typeof fromPath === 'string' && fromPath.startsWith(`/${userRole}`)) {
      return fromPath;
    }
    return dashboard;
  };

  // Redirect authenticated user strictly according to trusted database role
  const fromPath = location.state?.from?.pathname;
  useEffect(() => {
    if (isAuthenticated && user) {
      const target = resolveTargetRoute(user.role, fromPath);
      if (target) {
        navigate(target, { replace: true });
      } else {
        setErrorMessage('Account role is missing or unauthorized. Please contact support.');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMessage('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage('Please enter both your registered work email address and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(trimmedEmail, password);
      if (result.success && result.user) {
        // Authenticate & route strictly according to MongoDB user role
        const target = resolveTargetRoute(result.user.role, fromPath);
        if (target) {
          navigate(target, { replace: true });
        } else {
          setErrorMessage('Account role is unauthorized or missing in database record.');
        }
      } else {
        setErrorMessage(result.message || 'Incorrect email or password. Please try again.');
      }
    } catch (err) {
      setErrorMessage('Unable to connect to authentication server. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 relative bg-slate-950">
      {/* Dynamic ambient glow */}
      <div className="absolute inset-0 max-w-lg mx-auto h-96 bg-brand-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="w-full max-w-md space-y-6 relative z-10 my-auto">
        {/* Branding Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-400 text-white shadow-xl shadow-brand-500/20 mb-1">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Sign In to Ventriva</h1>
          <p className="text-xs text-slate-400">Enter your credentials to access your workspace.</p>
        </div>

        {/* Login Form Card */}
        <Card className="glass-card space-y-5 p-6 sm:p-8">
          {/* User-friendly Error Banner */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold text-rose-200">Authentication Failed</p>
                <p className="text-[11px] leading-relaxed text-rose-300/90">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Official Google Identity Services Sign-In Button */}
          <GoogleSignInButton role={null} />

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Or email & password</span>
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
              autoComplete="email"
              required
            />

            <div className="relative space-y-1">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-200 transition-colors p-1"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              className="w-full justify-center shadow-lg shadow-brand-500/20"
            >
              {isSubmitting ? 'Verifying Credentials...' : 'Sign In'}
            </Button>
          </form>

          {/* Registration Redirect */}
          <div className="pt-3 border-t border-slate-800/80 text-center space-y-1">
            <p className="text-xs text-slate-400">Need a Ventriva account?</p>
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 text-xs text-brand-400 font-semibold hover:text-brand-300 hover:underline transition-colors"
            >
              Register Founder or Investor Account <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
