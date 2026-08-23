import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Briefcase, TrendingUp, DollarSign } from 'lucide-react';
import { formatCurrency, getGovernanceBadgeVariant } from '../../utils/governanceConstants';

export const CorporateActionCard = ({ action, className = '' }) => {
  if (!action) return null;

  return (
    <Card className={`p-4 space-y-3 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div>
          <h4 className="text-xs font-bold text-slate-100">{action.title}</h4>
          <p className="text-[11px] text-slate-400 font-mono">
            Type: <span className="text-slate-200 font-semibold">{action.actionType}</span>
          </p>
        </div>
        <Badge variant={getGovernanceBadgeVariant(action.status)} size="xs">
          {action.status}
        </Badge>
      </div>

      <p className="text-xs text-slate-300">{action.description}</p>

      <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/50">
        <div>
          <span className="text-slate-500 text-[10px]">Share Impact</span>
          <p className="font-bold text-purple-300 mt-0.5">{action.shareImpact?.toLocaleString() || 0} shares</p>
        </div>
        <div>
          <span className="text-slate-500 text-[10px]">Valuation Impact</span>
          <p className="font-bold text-emerald-400 mt-0.5">{formatCurrency(action.valuationImpact)}</p>
        </div>
      </div>
    </Card>
  );
};

export default CorporateActionCard;
