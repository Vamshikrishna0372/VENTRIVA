import React from 'react';
import { Award, CheckCircle2, DollarSign } from 'lucide-react';
import { Card, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';

export const OpportunityRankingCard = ({ item }) => {
  const { rank, startup, overallOpportunityScore, convictionScore, portfolioFitScore, recommendedAction, recommendedCheckSize, explanation } = item;

  return (
    <Card className="border-slate-800 bg-slate-900">
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold font-mono text-base">
              #{rank}
            </div>
            <div>
              <h4 className="font-bold text-slate-100 text-sm">{startup?.startupName || 'Startup'}</h4>
              <p className="text-xs text-slate-400">{startup?.sector} • {startup?.stage}</p>
            </div>
          </div>
          <Badge variant={recommendedAction === 'Invest Now' ? 'emerald' : recommendedAction === 'Deep Review' ? 'teal' : 'amber'}>
            {recommendedAction}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Opportunity Score</span>
            <span className="font-bold text-emerald-400">{overallOpportunityScore}/100</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Conviction</span>
            <span className="font-bold text-slate-200">{convictionScore}/100</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Portfolio Fit</span>
            <span className="font-bold text-slate-200">{portfolioFitScore}/100</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 font-mono bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
          Target check size: ${(recommendedCheckSize || 0).toLocaleString()} • {explanation}
        </p>
      </CardBody>
    </Card>
  );
};

export default OpportunityRankingCard;
