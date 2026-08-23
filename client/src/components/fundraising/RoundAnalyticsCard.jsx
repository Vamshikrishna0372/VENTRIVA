import React from 'react';
import { Card } from '../common/Card';
import { formatCurrency } from '../../utils/fundraisingConstants';
import { PieChart, BarChart3, Users, DollarSign, Award, TrendingUp } from 'lucide-react';

export const RoundAnalyticsCard = ({ analytics, className = '' }) => {
  if (!analytics) return null;

  const {
    averageCommitment = 0,
    minimumCommitment = 0,
    maximumCommitment = 0,
    roundConcentration = 0,
    leadInvestor = null,
    investorCount = 0,
  } = analytics;

  return (
    <Card className={`p-5 space-y-4 ${className}`}>
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <BarChart3 className="w-5 h-5 text-brand-400" />
        <h4 className="text-sm font-bold text-slate-100">Round Analytics & Syndication Metrics</h4>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
          <span className="text-slate-400 font-mono text-[11px]">Avg Ticket Size</span>
          <p className="text-sm font-bold text-slate-100 font-mono">{formatCurrency(averageCommitment)}</p>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
          <span className="text-slate-400 font-mono text-[11px]">Max Check Committed</span>
          <p className="text-sm font-bold text-emerald-400 font-mono">{formatCurrency(maximumCommitment)}</p>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
          <span className="text-slate-400 font-mono text-[11px]">Round Concentration</span>
          <p className="text-sm font-bold text-amber-400 font-mono">{roundConcentration}%</p>
        </div>

        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 space-y-1">
          <span className="text-slate-400 font-mono text-[11px]">Lead Investor</span>
          <p className="text-xs font-semibold text-purple-300 truncate">
            {leadInvestor?.name || leadInvestor?.companyName || 'Unassigned'}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default RoundAnalyticsCard;
