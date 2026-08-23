import React from 'react';
import { Card } from '../common/Card';
import { RoundStatusBadge } from './RoundStatusBadge';
import { formatCurrency } from '../../utils/fundraisingConstants';
import { Target, DollarSign, TrendingUp, Users, CheckCircle2, Clock } from 'lucide-react';

export const FundraisingProgressCard = ({ analytics, round, className = '' }) => {
  if (!analytics) return null;

  const {
    targetAmount = 0,
    committedAmount = 0,
    fundedAmount = 0,
    remainingAmount = 0,
    commitmentPercentage = 0,
    fundingPercentage = 0,
    investorCount = 0,
    isOversubscribed = false,
  } = analytics;

  return (
    <Card className={`p-5 sm:p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-lg font-bold text-slate-100">{round?.roundName || 'Fundraising Round'}</h3>
            <RoundStatusBadge status={round?.status} />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {round?.roundType} Round • Target Valuation: {formatCurrency(round?.preMoneyValuation || 0)} Pre-Money
          </p>
        </div>
        {isOversubscribed && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Oversubscribed Round</span>
          </div>
        )}
      </div>

      {/* Progress Bar Visualizer */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-medium">
          <span className="text-slate-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-brand-400" /> Capital Committed
          </span>
          <span className="text-slate-200 font-mono font-bold">
            {commitmentPercentage}% ({formatCurrency(committedAmount)} / {formatCurrency(targetAmount)})
          </span>
        </div>
        <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5 relative flex">
          {/* Funded portion */}
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, fundingPercentage)}%` }}
            title={`Funded: ${fundingPercentage}%`}
          />
          {/* Committed portion (excluding funded) */}
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-indigo-500 rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, Math.max(0, commitmentPercentage - fundingPercentage))}%`,
            }}
            title={`Committed: ${commitmentPercentage - fundingPercentage}%`}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Funded: {formatCurrency(fundedAmount)}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brand-400 inline-block" /> Soft & Firm Committed: {formatCurrency(committedAmount)}
          </span>
          <span>Remaining: {formatCurrency(remainingAmount)}</span>
        </div>
      </div>

      {/* Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60 space-y-1">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono uppercase tracking-wider">
            <Target className="w-3.5 h-3.5 text-brand-400" /> Target Goal
          </span>
          <p className="text-base font-bold text-slate-100 font-mono">{formatCurrency(targetAmount)}</p>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60 space-y-1">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono uppercase tracking-wider">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Total Committed
          </span>
          <p className="text-base font-bold text-emerald-400 font-mono">{formatCurrency(committedAmount)}</p>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60 space-y-1">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-amber-400" /> Capital Needed
          </span>
          <p className="text-base font-bold text-slate-200 font-mono">{formatCurrency(remainingAmount)}</p>
        </div>

        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60 space-y-1">
          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono uppercase tracking-wider">
            <Users className="w-3.5 h-3.5 text-purple-400" /> Committed Investors
          </span>
          <p className="text-base font-bold text-purple-300 font-mono">{investorCount} Investors</p>
        </div>
      </div>
    </Card>
  );
};

export default FundraisingProgressCard;
