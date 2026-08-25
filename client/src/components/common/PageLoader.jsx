import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

export const PageLoader = ({ message = 'Loading Ventriva Workspace...' }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center space-y-4 px-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white shadow-xl shadow-brand-500/20 animate-pulse">
        <Sparkles className="w-6 h-6" />
      </div>
      <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
        <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />
        <span>{message}</span>
      </div>
    </div>
  );
};

export default PageLoader;
