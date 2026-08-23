import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, User, Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowRight, Building2, TrendingUp } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, user } = useAuth();

  const [role, setRole] = useState('founder');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated && user) {
      const target = user.role === 'admin' ? '/admin/dashboard' : user.role === 'founder' ? '/founder/dashboard' : '/investor/dashboard';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name || !email || !password || !confirmPassword) {
      setErrorMessage('Please fill in all required registration fields.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters in length.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your entries.');
      return;
    }

    setIsSubmitting(true);
    const result = await register(name, email, password, role);
    setIsSubmitting(false);

    if (result.success && result.user) {
      const target = result.user.role === 'admin' ? '/admin/dashboard' : result.user.role === 'founder' ? '/founder/dashboard' : '/investor/dashboard';
      navigate(target, { replace: true });
    } else {
      setErrorMessage(result.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 relative bg-slate-950 py-12">
      {/* Glow background */}
      <div className="absolute inset-0 max-w-lg mx-auto h-96 bg-brand-500/10 blur-3xl pointer-events-none rounded-full" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-400 text-white shadow-xl shadow-brand-500/20 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">Create Ventriva Account</h2>
          <p className="text-xs text-slate-400">Join the private network for Founders and VC Investors.</p>
        </div>

        {/* Account Role Selector */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setRole('founder')}
            className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
              role === 'founder'
                ? 'bg-slate-900 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className={`p-2 rounded-xl ${role === 'founder' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100">Founder</p>
              <p className="text-[10px] text-slate-400">Startup & Raise</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setRole('investor')}
            className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
              role === 'investor'
                ? 'bg-slate-900 border-brand-500/50 shadow-md shadow-brand-500/10'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className={`p-2 rounded-xl ${role === 'investor' ? 'bg-brand-500/20 text-brand-400' : 'bg-slate-800 text-slate-400'}`}>
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-100">Investor</p>
              <p className="text-[10px] text-slate-400">VC & Deal Flow</p>
            </div>
          </button>
        </div>

        {/* Registration Card */}
        <Card className="glass-card space-y-5">
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase text-slate-400">Account Details</span>
              <Badge variant={role === 'founder' ? 'emerald' : 'brand'}>
                {role} account
              </Badge>
            </div>

            <Input
              label="Full Name"
              type="text"
              placeholder="Alex Rivera"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={User}
              required
            />

            <Input
              label="Work Email Address"
              type="email"
              placeholder={role === 'founder' ? 'founder@startup.io' : 'partner@vc-firm.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              required
            />

            <div className="relative">
              <Input
                label="Password (min 8 characters)"
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

            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={Lock}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              className="w-full justify-center"
            >
              {isSubmitting ? 'Creating Account...' : `Register ${role.charAt(0).toUpperCase() + role.slice(1)} Account`}
            </Button>
          </form>

          <div className="pt-3 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              Already registered?{' '}
              <Link to="/login" className="text-brand-400 font-semibold hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;
