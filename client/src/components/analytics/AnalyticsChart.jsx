import React from 'react';
import { Card, CardHeader, CardBody } from '../common/Card';

export const AnalyticsChart = ({ title, subtitle, data = [], type = 'bar', color = 'brand' }) => {
  const maxCount = Math.max(...data.map((d) => d.value || d.count || 0), 1);

  const barColor = {
    brand: 'bg-brand-500',
    emerald: 'bg-emerald-500',
    indigo: 'bg-indigo-500',
    amber: 'bg-amber-500',
    cyan: 'bg-cyan-500',
  }[color] || 'bg-brand-500';

  return (
    <Card>
      {title && <CardHeader title={title} subtitle={subtitle} />}
      <CardBody className="space-y-3">
        {data.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No chart data available.</p>
        ) : (
          data.map((item, idx) => {
            const label = item.label || item._id || `Item ${idx + 1}`;
            const val = item.value !== undefined ? item.value : item.count || 0;
            const percent = Math.round((val / maxCount) * 100);

            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-200">{label}</span>
                  <span className="font-mono text-slate-400">{val}</span>
                </div>
                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className={`${barColor} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </CardBody>
    </Card>
  );
};

export default AnalyticsChart;
