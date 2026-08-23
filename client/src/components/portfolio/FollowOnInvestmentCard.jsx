import React from 'react';
import { DollarSign, CheckCircle2, TrendingUp } from 'lucide-react';
import { Card, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { FOLLOW_ON_STATUS_COLORS } from '../../utils/portfolioIntelligenceConstants';

export const FollowOnInvestmentCard = ({ opportunity, isInvestor, onApprove, onConvert }) => {
  const { _id, startup, amount, round, reason, ownershipBefore, ownershipAfter, status, createdAt } = opportunity;
  const variant = FOLLOW_ON_STATUS_COLORS[status] || 'indigo';

  return (
    <Card className="border-slate-800 bg-slate-900">
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-sm">{startup?.startupName || 'Portfolio Startup'}</h4>
              <p className="text-xs text-slate-400">{round} • {reason}</p>
            </div>
          </div>
          <Badge variant={variant}>{status}</Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Follow-On Capital</span>
            <span className="font-bold text-slate-200">${(amount || 0).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Prev Stake</span>
            <span className="font-bold text-slate-300">{ownershipBefore}%</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">New Stake</span>
            <span className="font-bold text-emerald-400">{ownershipAfter}%</span>
          </div>
        </div>

        {isInvestor && (
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            {status === 'Proposed' && onApprove && (
              <Button variant="outline" size="sm" onClick={() => onApprove(_id, 'Approved')}>
                Approve Opportunity
              </Button>
            )}
            {status === 'Approved' && onConvert && (
              <Button variant="primary" size="sm" icon={CheckCircle2} onClick={() => onConvert(_id)}>
                Deploy Capital & Convert
              </Button>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default FollowOnInvestmentCard;
