import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Search,
  Shield,
  TrendingUp,
  Building2,
  GitPullRequest,
  CheckCircle2,
  ArrowRight,
  BarChart3
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // State B: Authenticated users visiting "/" are redirected to their workspace
  useEffect(() => {
    if (isAuthenticated && user) {
      const target = user.role === 'admin' ? '/admin/dashboard' : user.role === 'founder' ? '/founder/dashboard' : '/investor/dashboard';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="relative overflow-hidden bg-slate-950 text-slate-100 min-h-screen">
      {/* Background Glow Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-brand-600/15 via-brand-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-96 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-96 right-10 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-brand-300 mb-6 backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-brand-400" />
          <span>Private Founder & Startup Discovery Platform</span>
          <Badge variant="brand" size="xs">Platform Active</Badge>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-100 max-w-4xl mx-auto leading-[1.1]">
          Discover. Evaluate. <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-indigo-300 to-emerald-400">Connect.</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
          Ventriva is an exclusive SaaS discovery engine for VC investment teams, angels, and high-growth founders to manage deal flow and capital raising.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link to="/login">
            <Button size="lg" icon={Search} className="shadow-lg shadow-brand-500/25">
              Sign In to Workspace
            </Button>
          </Link>
          <Link to="/register">
            <Button variant="outline" size="lg" icon={Building2}>
              Create Founder / Investor Account
            </Button>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <Card className="glass-card border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4 text-brand-400">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Precision Startup Search</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Filter high-potential startups by sub-sector, fundraising stage, traction, revenue, and geography with zero noise.
            </p>
          </Card>

          <Card className="glass-card border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Evaluation Scorecards</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Synthesize deal memos, record partner notes, and evaluate founding team strength using structured investment metrics.
            </p>
          </Card>

          <Card className="glass-card border-slate-800/80">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 text-amber-400">
              <GitPullRequest className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Kanban Deal Pipeline</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Track startups seamlessly through screening, diligence, partner meetings, term sheets, and portfolio closing.
            </p>
          </Card>
        </div>
      </section>

      {/* Role Portals Preview Section */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge variant="brand" className="mb-3">Architectural Portals</Badge>
            <h2 className="text-3xl font-bold text-slate-100">Tailored Workspaces for Every Role</h2>
            <p className="text-sm text-slate-400 mt-2">Unified React platform with role-based routing and specialized views.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Investor Portal */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4 hover:border-brand-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <Badge variant="brand">Investor</Badge>
                <TrendingUp className="w-5 h-5 text-brand-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-100">VC & Angel Workspace</h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-400" /> Multi-attribute filtering</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-400" /> Shortlisting & private notes</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-brand-400" /> Visual pipeline management</li>
              </ul>
              <Link to="/login" className="block pt-2">
                <Button variant="secondary" size="sm" className="w-full justify-between" icon={ArrowRight}>
                  Investor Sign In
                </Button>
              </Link>
            </div>

            {/* Founder Portal */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4 hover:border-emerald-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <Badge variant="emerald">Founder</Badge>
                <Building2 className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-100">Founder Growth Hub</h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Structured startup profile</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Pitch deck & traction metrics</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Investor connection tracking</li>
              </ul>
              <Link to="/login" className="block pt-2">
                <Button variant="secondary" size="sm" className="w-full justify-between" icon={ArrowRight}>
                  Founder Sign In
                </Button>
              </Link>
            </div>

            {/* Admin Portal */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4 hover:border-rose-500/40 transition-colors">
              <div className="flex items-center justify-between">
                <Badge variant="rose">Admin</Badge>
                <Shield className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-100">Platform Governance</h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rose-400" /> User & founder verification</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rose-400" /> Startup moderation queues</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-rose-400" /> Ecosystem statistics</li>
              </ul>
              <Link to="/login" className="block pt-2">
                <Button variant="secondary" size="sm" className="w-full justify-between" icon={ArrowRight}>
                  Admin Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
