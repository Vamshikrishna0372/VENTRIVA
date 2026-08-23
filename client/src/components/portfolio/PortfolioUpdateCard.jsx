import React from 'react';
import { FileText, CheckCircle2, TrendingUp, DollarSign, Calendar, Clock } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const PortfolioUpdateCard = ({ update, isInvestor, onAcknowledge }) => {
  const {
    reportingPeriod,
    revenue,
    revenueGrowth,
    monthlyRecurringRevenue,
    annualRecurringRevenue,
    customerCount,
    burnRate,
    runwayMonths,
    cashBalance,
    majorMilestones,
    keyWins,
    keyChallenges,
    founderNotes,
    outlook,
    status,
    createdAt,
  } = update;

  return (
    <Card className="border-slate-800 bg-slate-900">
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-400" />
            <div>
              <h4 className="text-sm font-bold text-slate-100">Progress Update: {reportingPeriod}</h4>
              <p className="text-[11px] text-slate-400 font-mono">Submitted {new Date(createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={outlook === 'Optimistic' ? 'emerald' : outlook === 'Stable' ? 'teal' : 'amber'}>
              Outlook: {outlook}
            </Badge>
            <Badge variant={status === 'Acknowledged' ? 'emerald' : 'amber'}>
              {status}
            </Badge>
          </div>
        </div>

        {/* Financial KPI Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60 text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">ARR / MRR</span>
            <span className="font-bold text-slate-200">${(annualRecurringRevenue || 0).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Rev Growth</span>
            <span className={`font-bold ${revenueGrowth >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {revenueGrowth > 0 ? `+${revenueGrowth}%` : `${revenueGrowth}%`}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Monthly Burn</span>
            <span className="font-bold text-slate-200">${(burnRate || 0).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Runway</span>
            <span className={`font-bold ${runwayMonths >= 12 ? 'text-emerald-400' : runwayMonths >= 6 ? 'text-amber-400' : 'text-rose-400'}`}>
              {runwayMonths} months
            </span>
          </div>
        </div>

        {keyWins && (
          <div className="text-xs space-y-1">
            <span className="font-bold text-slate-300">Key Wins & Progress:</span>
            <p className="text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40">{keyWins}</p>
          </div>
        )}

        {keyChallenges && (
          <div className="text-xs space-y-1">
            <span className="font-bold text-amber-300">Challenges & Roadblocks:</span>
            <p className="text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40">{keyChallenges}</p>
          </div>
        )}

        {founderNotes && (
          <div className="text-xs space-y-1">
            <span className="font-bold text-slate-300">Founder Notes:</span>
            <p className="text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40">{founderNotes}</p>
          </div>
        )}

        {isInvestor && status === 'Submitted' && onAcknowledge && (
          <div className="flex justify-end pt-2 border-t border-slate-800">
            <Button variant="outline" size="sm" icon={CheckCircle2} onClick={() => onAcknowledge(update._id)}>
              Acknowledge Update
            </Button>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default PortfolioUpdateCard;
