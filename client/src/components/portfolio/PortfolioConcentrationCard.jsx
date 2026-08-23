import React from 'react';
import { PieChart, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';

export const PortfolioConcentrationCard = ({ concentration }) => {
  const { totalHoldings = 0, top1Percentage = 0, top3Percentage = 0, top5Percentage = 0, riskCategory = 'Low', sectorDistribution = [] } = concentration || {};

  return (
    <Card className="border-slate-800 bg-slate-900">
      <CardHeader
        title="Portfolio Concentration & Diversification"
        subtitle="Exposure breakdown by holding weight and sector"
      />
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-brand-400" />
            <span className="text-xs font-bold text-slate-200">Concentration Risk Rating</span>
          </div>
          <Badge variant={riskCategory === 'Critical' ? 'rose' : riskCategory === 'High' ? 'amber' : 'emerald'}>
            {riskCategory} Concentration
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs font-mono">
          <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 text-center">
            <span className="text-[10px] text-slate-500 uppercase block">Top Holding</span>
            <span className="font-bold text-slate-100">{top1Percentage}%</span>
          </div>
          <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 text-center">
            <span className="text-[10px] text-slate-500 uppercase block">Top 3 Holdings</span>
            <span className="font-bold text-slate-100">{top3Percentage}%</span>
          </div>
          <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60 text-center">
            <span className="text-[10px] text-slate-500 uppercase block">Top 5 Holdings</span>
            <span className="font-bold text-slate-100">{top5Percentage}%</span>
          </div>
        </div>

        {sectorDistribution.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <span className="text-xs font-bold text-slate-300">Sector Exposure Breakdown:</span>
            {sectorDistribution.map((sec) => (
              <div key={sec.sector} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">{sec.sector}</span>
                  <span className="font-bold text-slate-200">{sec.percentage}%</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-brand-500 h-full rounded-full" style={{ width: `${Math.min(100, sec.percentage)}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default PortfolioConcentrationCard;
