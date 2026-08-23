import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';

export const MetricCard = ({ title, value, subtitle, trend, trendValue, icon: Icon, color = 'brand' }) => {
  const colorMap = {
    brand: 'text-brand-400 border-brand-500/30',
    emerald: 'text-emerald-400 border-emerald-500/30',
    indigo: 'text-indigo-400 border-indigo-500/30',
    amber: 'text-amber-400 border-amber-500/30',
    cyan: 'text-cyan-400 border-cyan-500/30',
    rose: 'text-rose-400 border-rose-500/30',
  };

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardBody className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">{title}</span>
          {Icon && <Icon className={`w-4 h-4 ${colorMap[color] ? colorMap[color].split(' ')[0] : 'text-brand-400'}`} />}
        </div>

        <div className="flex items-baseline justify-between">
          <p className={`text-2xl font-extrabold ${colorMap[color] ? colorMap[color].split(' ')[0] : 'text-slate-100'}`}>
            {value}
          </p>

          {trend && (
            <div
              className={`flex items-center gap-1 text-[11px] font-mono font-bold ${
                trend === 'positive' ? 'text-emerald-400' : trend === 'negative' ? 'text-rose-400' : 'text-slate-400'
              }`}
            >
              {trend === 'positive' && <TrendingUp className="w-3 h-3" />}
              {trend === 'negative' && <TrendingDown className="w-3 h-3" />}
              {trend === 'neutral' && <Minus className="w-3 h-3" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>

        {subtitle && <p className="text-[11px] text-slate-400 leading-tight">{subtitle}</p>}
      </CardBody>
    </Card>
  );
};

export default MetricCard;
