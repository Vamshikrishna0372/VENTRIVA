import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Building2, TrendingUp, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const RoleOnboardingModal = ({ googleIdentity, onSelectRole, isLoading }) => {
  const [selectedRole, setSelectedRole] = useState(null);

  // Always reset scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleConfirm = () => {
    if (selectedRole && onSelectRole) {
      onSelectRole(selectedRole);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[99999] overflow-y-auto bg-slate-950/90 backdrop-blur-lg flex items-start justify-center p-4 sm:p-6 lg:p-8 animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl space-y-8 relative text-slate-900 dark:text-slate-100 my-6 sm:my-10">
        {/* Glow Accent Background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header & Identity Banner */}
        <div className="space-y-4 text-center max-w-2xl mx-auto relative z-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-emerald-400 text-white shadow-xl shadow-brand-500/20 mb-1">
            <Sparkles className="w-7 h-7" />
          </div>

          <div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
              Choose Your Ventriva Workspace
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Select how you will use Ventriva. Your workspace determines your tools, dashboards, and role permissions.
            </p>
          </div>

          {/* Google Identity Header Card */}
          {googleIdentity && (
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 text-xs shadow-sm">
              {googleIdentity.picture ? (
                <img src={googleIdentity.picture} alt="Google Profile" className="w-7 h-7 rounded-full border border-brand-400 shrink-0" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center text-xs shrink-0">
                  {googleIdentity.name?.charAt(0) || 'G'}
                </div>
              )}
              <div className="text-left">
                <span className="font-bold text-slate-900 dark:text-slate-100 block leading-none">{googleIdentity.name}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{googleIdentity.email}</span>
              </div>
              <Badge variant="brand" size="xs" className="ml-2 shrink-0">Authenticated via Google</Badge>
            </div>
          )}
        </div>

        {/* Role Cards Grid — Side-by-side on Laptop/Desktop (lg:grid-cols-2), Stacked on Mobile (grid-cols-1) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
          {/* Founder Workspace Card */}
          <div
            onClick={() => setSelectedRole('founder')}
            className={`p-6 sm:p-8 rounded-3xl border text-left cursor-pointer transition-all flex flex-col justify-between space-y-6 ${
              selectedRole === 'founder'
                ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/50 shadow-xl shadow-emerald-500/10'
                : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className={`p-3.5 rounded-2xl ${selectedRole === 'founder' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                  <Building2 className="w-7 h-7" />
                </div>
                <Badge variant={selectedRole === 'founder' ? 'emerald' : 'slate'} size="sm">
                  BUILD & RAISE
                </Badge>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Founder Workspace</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Build your startup profile, raise capital, connect with investors, manage fundraising, deal execution, corporate governance, cap table, and your virtual data room.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Key Capabilities Included:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2 py-1"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> <span>Startup Profile</span></div>
                  <div className="flex items-center gap-2 py-1"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> <span>Capital Raise</span></div>
                  <div className="flex items-center gap-2 py-1"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> <span>Investor Relations</span></div>
                  <div className="flex items-center gap-2 py-1"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> <span>Deal Rooms</span></div>
                  <div className="flex items-center gap-2 py-1"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> <span>Transaction Closings</span></div>
                  <div className="flex items-center gap-2 py-1"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> <span>Corporate Governance</span></div>
                  <div className="flex items-center gap-2 py-1"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> <span>Cap Table</span></div>
                  <div className="flex items-center gap-2 py-1"><CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" /> <span>Virtual Data Room</span></div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <span className={`inline-block px-3 py-1.5 rounded-xl text-xs font-bold ${selectedRole === 'founder' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                {selectedRole === 'founder' ? '✓ Selected Workspace' : 'Click to select Founder'}
              </span>
            </div>
          </div>

          {/* Investor Workspace Card */}
          <div
            onClick={() => setSelectedRole('investor')}
            className={`p-6 sm:p-8 rounded-3xl border text-left cursor-pointer transition-all flex flex-col justify-between space-y-6 ${
              selectedRole === 'investor'
                ? 'bg-brand-500/5 dark:bg-brand-500/10 border-brand-500 ring-2 ring-brand-500/50 shadow-xl shadow-brand-500/10'
                : 'bg-slate-50 dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className={`p-3.5 rounded-2xl ${selectedRole === 'investor' ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                  <TrendingUp className="w-7 h-7" />
                </div>
                <Badge variant={selectedRole === 'investor' ? 'brand' : 'slate'} size="sm">
                  DISCOVER & INVEST
                </Badge>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Investor Workspace</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Discover startups, manage your investment thesis, evaluate opportunities, express interest, manage deal flow, and track your portfolio investments.
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Key Capabilities Included:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-center gap-2 py-1"><CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" /> <span>Discovery Engine</span></div>
                  <div className="flex items-center gap-2 py-1"><CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" /> <span>Investment Thesis</span></div>
                  <div className="flex items-center gap-2 py-1"><CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" /> <span>Expressed Interests</span></div>
                  <div className="flex items-center gap-2 py-1"><CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" /> <span>Deal Pipeline</span></div>
                  <div className="flex items-center gap-2 py-1"><CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" /> <span>Deal Rooms</span></div>
                  <div className="flex items-center gap-2 py-1"><CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" /> <span>Portfolio Hub</span></div>
                  <div className="flex items-center gap-2 py-1"><CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" /> <span>Intelligence Suite</span></div>
                  <div className="flex items-center gap-2 py-1"><CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0" /> <span>Founder Messaging</span></div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <span className={`inline-block px-3 py-1.5 rounded-xl text-xs font-bold ${selectedRole === 'investor' ? 'bg-brand-500/20 text-brand-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                {selectedRole === 'investor' ? '✓ Selected Workspace' : 'Click to select Investor'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Workspace selection is permanently associated with your account.</span>
          </div>

          <Button
            onClick={handleConfirm}
            variant="primary"
            size="lg"
            disabled={!selectedRole || isLoading}
            isLoading={isLoading}
            className="w-full sm:w-auto px-8 shadow-lg shadow-brand-500/25 justify-center"
            icon={ArrowRight}
          >
            {isLoading
              ? 'Setting up Workspace...'
              : selectedRole
              ? `Continue as ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`
              : 'Select a Workspace to Continue'}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default RoleOnboardingModal;
