import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { RoundStatusBadge } from './RoundStatusBadge';
import { formatCurrency } from '../../utils/fundraisingConstants';
import { Mail, CheckCircle, XCircle, Clock } from 'lucide-react';

export const FundraisingInviteCard = ({ invite, onAccept, onDecline, className = '' }) => {
  if (!invite) return null;

  const round = invite.fundraisingRound || {};
  const startup = invite.startup || {};

  return (
    <Card className={`p-4 sm:p-5 space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/60 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">{startup.companyName || 'Startup Venture'}</h4>
            <p className="text-xs text-slate-400">
              Invited to: <span className="text-slate-200 font-semibold">{round.roundName}</span> ({round.roundType})
            </p>
          </div>
        </div>
        <RoundStatusBadge status={invite.status} />
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/40 p-3 rounded-xl border border-slate-800/50">
        <div>
          <span className="text-slate-500 font-mono">Target Raise</span>
          <p className="text-sm font-bold text-slate-100 font-mono mt-0.5">{formatCurrency(round.targetAmount || 0)}</p>
        </div>
        <div>
          <span className="text-slate-500 font-mono">Target Valuation</span>
          <p className="text-sm font-semibold text-slate-200 font-mono mt-0.5">
            {formatCurrency(round.preMoneyValuation || 0)} Pre-Money
          </p>
        </div>
      </div>

      {invite.message && (
        <div className="text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/40 italic">
          "{invite.message}"
        </div>
      )}

      {invite.status === 'Pending' && (
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/40">
          {onDecline && (
            <Button size="sm" variant="ghost" onClick={() => onDecline(invite._id)} className="text-rose-400">
              <XCircle className="w-3.5 h-3.5 mr-1" /> Decline
            </Button>
          )}
          {onAccept && (
            <Button size="sm" variant="brand" onClick={() => onAccept(invite._id)}>
              <CheckCircle className="w-3.5 h-3.5 mr-1" /> Accept & View Round
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};

export default FundraisingInviteCard;
