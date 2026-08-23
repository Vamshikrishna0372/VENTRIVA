import React from 'react';
import { Card } from '../common/Card';
import { ClosingStatusBadge } from './ClosingStatusBadge';
import { formatCurrency } from '../../utils/closingConstants';
import { CheckCircle2, DollarSign, Award, Clock, ArrowRight } from 'lucide-react';

const STAGES = [
  'Pending',
  'Due Diligence',
  'Conditions Pending',
  'Documentation Pending',
  'Signature Pending',
  'Payment Pending',
  'Ready to Close',
  'Closed',
];

export const ClosingProgressCard = ({ transaction, className = '' }) => {
  if (!transaction) return null;

  const currentStatus = transaction.transactionStatus;
  const currentIdx = STAGES.indexOf(currentStatus) >= 0 ? STAGES.indexOf(currentStatus) : 0;

  return (
    <Card className={`p-5 sm:p-6 space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-lg font-bold text-slate-100">
              {transaction.startup?.companyName || 'Venture'} Closing Workspace
            </h3>
            <ClosingStatusBadge status={currentStatus} />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {transaction.transactionType} • Pre-Money: {formatCurrency(transaction.preMoneyValuation)} • Post-Money: {formatCurrency(transaction.postMoneyValuation)}
          </p>
        </div>

        <div className="text-right self-start sm:self-auto font-mono">
          <span className="text-xs text-slate-400">Final Check Size</span>
          <p className="text-xl font-bold text-emerald-400">{formatCurrency(transaction.finalInvestmentAmount)}</p>
        </div>
      </div>

      {/* Pipeline Progression Steps */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Closing Workflow Pipeline</span>
          <span>
            Step {currentIdx + 1} of {STAGES.length}: <strong className="text-slate-200">{currentStatus}</strong>
          </span>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 pt-1">
          {STAGES.map((stage, idx) => {
            const isDone = idx < currentIdx || currentStatus === 'Closed';
            const isCurrent = idx === currentIdx && currentStatus !== 'Closed';

            return (
              <div
                key={stage}
                className={`p-2 rounded-xl border text-center transition-all ${
                  isDone
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : isCurrent
                    ? 'bg-brand-500/20 border-brand-500/50 text-brand-300 shadow-md shadow-brand-500/10'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 opacity-60'
                }`}
                title={stage}
              >
                <div className="flex justify-center mb-1">
                  {isDone ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <span className="text-[10px] font-mono font-bold">{idx + 1}</span>
                  )}
                </div>
                <p className="text-[9px] font-semibold truncate leading-tight">{stage}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60">
        <div>
          <span className="text-slate-500">Agreed Ownership</span>
          <p className="text-sm font-bold text-slate-100 mt-0.5">{transaction.ownershipPercentage}%</p>
        </div>

        <div>
          <span className="text-slate-500">Share Class</span>
          <p className="text-sm font-semibold text-slate-200 mt-0.5">{transaction.shareClass}</p>
        </div>

        <div>
          <span className="text-slate-500">Share Price</span>
          <p className="text-sm font-bold text-purple-300 mt-0.5">{formatCurrency(transaction.sharePrice)}</p>
        </div>

        <div>
          <span className="text-slate-500">Shares Issued</span>
          <p className="text-sm font-bold text-slate-100 mt-0.5">{transaction.sharesIssued?.toLocaleString() || 0}</p>
        </div>
      </div>
    </Card>
  );
};

export default ClosingProgressCard;
