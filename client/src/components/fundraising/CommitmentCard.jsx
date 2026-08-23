import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { RoundStatusBadge } from './RoundStatusBadge';
import { formatCurrency } from '../../utils/fundraisingConstants';
import { User, DollarSign, Award, CheckCircle, XCircle, ExternalLink, ShieldCheck } from 'lucide-react';

export const CommitmentCard = ({
  commitment,
  userRole = 'founder',
  onAccept,
  onDecline,
  onWithdraw,
  onMarkFunded,
  onOpenDealRoom,
  className = '',
}) => {
  if (!commitment) return null;

  const investor = commitment.investor || {};
  const status = commitment.commitmentStatus;

  return (
    <Card className={`p-4 sm:p-5 space-y-4 hover:border-slate-700/80 transition-colors ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-300 font-bold text-sm">
            {investor.name ? investor.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-slate-100">{investor.name || 'Anonymous Investor'}</h4>
              {commitment.investorRole === 'Lead Investor' && (
                <span className="bg-purple-500/15 border border-purple-500/30 text-purple-300 px-2 py-0.5 rounded-md text-[10px] font-mono uppercase font-semibold flex items-center gap-1">
                  <Award className="w-3 h-3 text-purple-400" /> Lead
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {investor.companyName || investor.email || 'Platform Verified Investor'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <RoundStatusBadge status={status} />
        </div>
      </div>

      {/* Commitment Amounts & Details */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
        <div>
          <span className="text-slate-500 font-mono">Committed Amount</span>
          <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
            {formatCurrency(commitment.committedAmount || commitment.requestedAmount || 0)}
          </p>
        </div>

        <div>
          <span className="text-slate-500 font-mono">Proposed Ownership</span>
          <p className="text-sm font-semibold text-slate-200 font-mono mt-0.5">
            {commitment.proposedOwnership ? `${commitment.proposedOwnership}%` : 'N/A'}
          </p>
        </div>

        <div>
          <span className="text-slate-500 font-mono">Role / Source</span>
          <p className="text-sm font-semibold text-slate-300 mt-0.5 capitalize">
            {commitment.investorRole} • {commitment.source || 'Platform'}
          </p>
        </div>
      </div>

      {commitment.message && (
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/40 text-xs text-slate-300 italic">
          "{commitment.message}"
        </div>
      )}

      {/* Action Buttons based on status & role */}
      <div className="flex flex-wrap items-center justify-end gap-2 pt-1 border-t border-slate-800/40">
        {userRole === 'founder' && ['Soft Committed', 'Interested', 'Invited', 'Term Sheet Proposed'].includes(status) && (
          <>
            {onAccept && (
              <Button size="sm" variant="emerald" onClick={() => onAccept(commitment._id)} className="flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Accept Commitment
              </Button>
            )}
            {onDecline && (
              <Button size="sm" variant="ghost" onClick={() => onDecline(commitment._id)} className="text-rose-400 hover:text-rose-300">
                <XCircle className="w-3.5 h-3.5" /> Decline
              </Button>
            )}
          </>
        )}

        {userRole === 'investor' && ['Soft Committed', 'Interested', 'Committed'].includes(status) && onWithdraw && (
          <Button size="sm" variant="ghost" onClick={() => onWithdraw(commitment._id)} className="text-rose-400 hover:text-rose-300">
            Withdraw Commitment
          </Button>
        )}

        {['Committed', 'Soft Committed'].includes(status) && onMarkFunded && (
          <Button size="sm" variant="emerald" onClick={() => onMarkFunded(commitment._id)} className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" /> Mark Funded
          </Button>
        )}

        {['Committed', 'Funded'].includes(status) && onOpenDealRoom && (
          <Button size="sm" variant="brand" onClick={() => onOpenDealRoom(commitment)} className="flex items-center gap-1">
            <ExternalLink className="w-3.5 h-3.5" /> Open Deal Room
          </Button>
        )}
      </div>
    </Card>
  );
};

export default CommitmentCard;
