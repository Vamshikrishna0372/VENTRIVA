import React from 'react';
import { Card } from '../common/Card';
import { ShieldCheck, Activity, User, Calendar } from 'lucide-react';

export const FundraisingActivityTimeline = ({ activities = [], className = '' }) => {
  if (!activities.length) {
    return (
      <Card className={`p-4 text-center text-xs text-slate-400 ${className}`}>
        No audit activity recorded yet.
      </Card>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {activities.map((act) => {
        const actorName = act.actor?.name || 'System / Admin';
        const dateStr = new Date(act.createdAt).toLocaleString();

        return (
          <div
            key={act._id}
            className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60 flex items-start gap-3 text-xs"
          >
            <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-300 shrink-0 mt-0.5">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-slate-200">{act.description}</span>
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {dateStr}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Actor: <span className="text-slate-300">{actorName}</span> • Event: <span className="text-brand-300">{act.action}</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FundraisingActivityTimeline;
