import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-12 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-100 tracking-tight">VENTRIVA</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Private Founder & Startup Discovery Platform built for modern venture teams and founders.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#features" className="hover:text-slate-100 transition-colors">Startup Engine</a></li>
              <li><a href="#features" className="hover:text-slate-100 transition-colors">Deal Pipeline</a></li>
              <li><a href="#features" className="hover:text-slate-100 transition-colors">Evaluation Scorecard</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Portals</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="/investor/discover" className="hover:text-slate-100 transition-colors">Investor Workspace</a></li>
              <li><a href="/founder/dashboard" className="hover:text-slate-100 transition-colors">Founder Hub</a></li>
              <li><a href="/admin/dashboard" className="hover:text-slate-100 transition-colors">Admin Moderation</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">Security</h4>
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>Private & Encrypted</span>
              </div>
              <p className="text-[11px] text-slate-400">Strict privacy controls for sensitive financial & deck data.</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Ventriva. All rights reserved. Phase 1 Architecture.</p>
          <div className="flex gap-4">
            <span className="hover:text-slate-200 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-200 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-200 cursor-pointer">Security Overview</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
