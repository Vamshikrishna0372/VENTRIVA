import React from 'react';
import { Card } from '../common/Card';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

export const ComplianceProgressCard = ({ metrics, className = '' }) => {
  if (!metrics) return null;

  const {
    totalItems = 0,
    completedItems = 0,
    pendingItems = 0,
    overdueItems = 0,
    compliancePercentage = 100,
  } = metrics;

  return (
    <Card className={`p-5 space-y-4 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h4 className="text-sm font-bold text-slate-100">Legal & Regulatory Compliance Score</h4>
        </div>
        <span className="text-xl font-bold font-mono text-emerald-400">{compliancePercentage}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 flex">
        <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${compliancePercentage}%` }} />
      </div>

      <div className="grid grid-cols-4 gap-2 text-xs font-mono text-center">
        <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/60">
          <span className="text-slate-500 text-[10px]">Total Requirements</span>
          <p className="font-bold text-slate-200 mt-0.5">{totalItems}</p>
        </div>

        <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/60">
          <span className="text-slate-500 text-[10px]">Completed</span>
          <p className="font-bold text-emerald-400 mt-0.5">{completedItems}</p>
        </div>

        <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/60">
          <span className="text-slate-500 text-[10px]">Pending</span>
          <p className="font-bold text-amber-400 mt-0.5">{pendingItems}</p>
        </div>

        <div className="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/60">
          <span className="text-slate-500 text-[10px]">Overdue</span>
          <p className="font-bold text-rose-400 mt-0.5">{overdueItems}</p>
        </div>
      </div>
    </Card>
  );
};

export default ComplianceProgressCard;
