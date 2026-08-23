import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export const TrendIndicator = ({ trend = 'neutral', value }) => {
  if (trend === 'positive') {
    return (
      <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-mono font-bold">
        <TrendingUp className="w-3.5 h-3.5" /> +{value}%
      </span>
    );
  }
  if (trend === 'negative') {
    return (
      <span className="inline-flex items-center gap-1 text-rose-400 text-xs font-mono font-bold">
        <TrendingDown className="w-3.5 h-3.5" /> -{value}%
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-slate-400 text-xs font-mono font-bold">
      <Minus className="w-3.5 h-3.5" /> 0%
    </span>
  );
};

export default TrendIndicator;
