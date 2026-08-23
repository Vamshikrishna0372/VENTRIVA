import React from 'react';
import { FileText, CheckCircle2, XCircle, Clock, ShieldCheck, User } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const TermSheetCard = ({ termSheet, currentUserId, onAccept, onDecline, onWithdraw }) => {
  const {
    version,
    proposedBy,
    investmentAmount,
    preMoneyValuation,
    postMoneyValuation,
    liquidationPreference,
    boardSeats,
    votingRights,
    expiryDate,
    status,
    notes,
    rejectionReason,
  } = termSheet;

  const isProposer = proposedBy?._id === currentUserId || proposedBy === currentUserId;

  return (
    <Card className={`border-slate-800 bg-slate-900 ${status === 'Accepted' ? 'border-emerald-500/40' : ''}`}>
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400 font-mono font-bold">
              v{version}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">Term Sheet Proposal v{version}</h4>
              <p className="text-[11px] text-slate-400">Proposed by {proposedBy?.firstName ? `${proposedBy.firstName} ${proposedBy.lastName}` : 'Party'}</p>
            </div>
          </div>
          <Badge variant={status === 'Accepted' ? 'emerald' : status === 'Proposed' ? 'amber' : status === 'Rejected' ? 'rose' : 'slate'}>
            {status}
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase block">Investment</span>
            <span className="font-bold text-slate-200">${investmentAmount?.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase block">Pre-Money Val.</span>
            <span className="font-bold text-slate-200">${preMoneyValuation?.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase block">Post-Money Val.</span>
            <span className="font-bold text-emerald-400">${postMoneyValuation?.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase block">Liquidation Pref.</span>
            <span className="font-semibold text-slate-300">{liquidationPreference}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase block">Board Seats</span>
            <span className="font-semibold text-slate-300">{boardSeats}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 font-mono uppercase block">Offer Expiry</span>
            <span className="font-mono text-slate-400">{new Date(expiryDate).toLocaleDateString()}</span>
          </div>
        </div>

        {votingRights && (
          <p className="text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40">
            <strong className="text-slate-300 font-medium">Voting Rights:</strong> {votingRights}
          </p>
        )}

        {notes && (
          <p className="text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40">
            <strong className="text-slate-300 font-medium">Proposer Notes:</strong> {notes}
          </p>
        )}

        {rejectionReason && (
          <p className="text-xs text-rose-300 bg-rose-950/30 p-2.5 rounded-lg border border-rose-900/40">
            <strong className="font-medium">Decline Reason:</strong> {rejectionReason}
          </p>
        )}

        {/* Action Controls */}
        {status === 'Proposed' && (
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
            {!isProposer && (
              <>
                <Button variant="outline" size="sm" icon={XCircle} onClick={() => onDecline(termSheet)}>
                  Decline
                </Button>
                <Button variant="primary" size="sm" icon={CheckCircle2} onClick={() => onAccept(termSheet._id)}>
                  Accept Term Sheet
                </Button>
              </>
            )}
            {isProposer && (
              <Button variant="ghost" size="sm" onClick={() => onWithdraw(termSheet._id)}>
                Withdraw Proposal
              </Button>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default TermSheetCard;
