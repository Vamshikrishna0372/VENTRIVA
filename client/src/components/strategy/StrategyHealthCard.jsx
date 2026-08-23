import React from 'react';
import { ShieldCheck, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';

export const StrategyHealthCard = ({ health }) => {
  const { score = 80, healthCategory = 'Healthy', warnings = [], strengths = [], deployment = {} } = health || {};

  return (
    <Card className="border-slate-800 bg-slate-900">
      <CardHeader title="Portfolio Strategy Mandate Health" subtitle="Deployment alignment & risk rating" />
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between bg-slate-950/60 p-4 rounded-xl border border-slate-800">
          <div>
            <span className="text-xs text-slate-400 font-mono block">Strategy Health Score</span>
            <span className="text-2xl font-bold text-slate-100">{score}/100</span>
          </div>
          <Badge variant={healthCategory === 'Excellent' ? 'emerald' : healthCategory === 'Healthy' ? 'teal' : 'amber'}>
            {healthCategory} Alignment
          </Badge>
        </div>

        {strengths.length > 0 && (
          <div className="space-y-1 text-xs">
            <span className="font-bold text-emerald-400">Strategy Strengths:</span>
            {strengths.map((str, i) => (
              <p key={i} className="text-slate-300 bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">{str}</p>
            ))}
          </div>
        )}

        {warnings.length > 0 && (
          <div className="space-y-1 text-xs">
            <span className="font-bold text-amber-300">Mandate Risk Warnings:</span>
            {warnings.map((warn, i) => (
              <p key={i} className="text-slate-300 bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">{warn}</p>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default StrategyHealthCard;
