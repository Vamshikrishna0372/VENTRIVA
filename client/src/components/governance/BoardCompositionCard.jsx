import React from 'react';
import { Card } from '../common/Card';
import { ShieldCheck, Users } from 'lucide-react';

export const BoardCompositionCard = ({ composition, className = '' }) => {
  if (!composition) return null;

  const {
    totalSeats = 0,
    founderSeats = 0,
    investorSeats = 0,
    independentSeats = 0,
    observerSeats = 0,
  } = composition;

  return (
    <Card className={`p-5 space-y-4 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h4 className="text-sm font-bold text-slate-100">Board Director Composition</h4>
        </div>
        <span className="text-xs font-mono text-slate-400">Total Directors: {totalSeats}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60 text-center">
          <span className="text-slate-500 block text-[10px]">Founder Seats</span>
          <span className="text-lg font-bold text-emerald-400">{founderSeats}</span>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60 text-center">
          <span className="text-slate-500 block text-[10px]">Investor Seats</span>
          <span className="text-lg font-bold text-purple-300">{investorSeats}</span>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60 text-center">
          <span className="text-slate-500 block text-[10px]">Independent Seats</span>
          <span className="text-lg font-bold text-amber-400">{independentSeats}</span>
        </div>

        <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60 text-center">
          <span className="text-slate-500 block text-[10px]">Observers</span>
          <span className="text-lg font-bold text-slate-300">{observerSeats}</span>
        </div>
      </div>
    </Card>
  );
};

export default BoardCompositionCard;
