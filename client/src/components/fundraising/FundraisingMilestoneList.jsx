import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { CheckCircle2, Clock, Calendar } from 'lucide-react';

export const FundraisingMilestoneList = ({ milestones = [], className = '' }) => {
  if (!milestones.length) {
    return (
      <Card className={`p-4 text-center text-xs text-slate-400 ${className}`}>
        No workflow milestones defined for this round yet.
      </Card>
    );
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
      {milestones.map((milestone) => {
        const isCompleted = milestone.status === 'Completed';
        return (
          <div
            key={milestone._id}
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
              isCompleted
                ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-200'
                : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              )}
              <div>
                <h5 className="font-semibold text-slate-100">{milestone.title}</h5>
                {milestone.description && <p className="text-slate-400 text-[11px] mt-0.5">{milestone.description}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {milestone.dueDate && (
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  {new Date(milestone.dueDate).toLocaleDateString()}
                </span>
              )}
              <Badge variant={isCompleted ? 'emerald' : 'amber'} size="xs">
                {milestone.status}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FundraisingMilestoneList;
