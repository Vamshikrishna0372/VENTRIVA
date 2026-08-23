import React from 'react';
import { AlertTriangle, TrendingDown, Clock, Lightbulb } from 'lucide-react';
import { Card, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';
import { ALERT_PRIORITY_COLORS } from '../../utils/portfolioIntelligenceConstants';

export const RiskAlertCard = ({ alert }) => {
  const { title, description, priority, type, recommendedAction, startupName } = alert;
  const variant = ALERT_PRIORITY_COLORS[priority] || 'rose';

  return (
    <Card className="border-slate-800 bg-slate-900">
      <CardBody className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${priority === 'Critical' ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`} />
            <span className="text-xs font-mono text-slate-400 font-bold">{type}</span>
          </div>
          <Badge variant={variant}>{priority} Priority</Badge>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-100">{title}</h4>
          <p className="text-xs text-slate-400 mt-1">{description}</p>
        </div>

        {recommendedAction && (
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 flex items-start gap-2 text-xs">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span className="text-slate-300"><strong className="text-slate-200">Recommended Action:</strong> {recommendedAction}</span>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default RiskAlertCard;
