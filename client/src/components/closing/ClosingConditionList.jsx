import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

export const ClosingConditionList = ({ conditions = [], onUpdateStatus, className = '' }) => {
  if (!conditions.length) {
    return (
      <Card className={`p-4 text-center text-xs text-slate-400 ${className}`}>
        No closing conditions assigned to this transaction yet.
      </Card>
    );
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
      {conditions.map((condition) => {
        const isDone = ['Completed', 'Waived'].includes(condition.status);

        return (
          <div
            key={condition._id}
            className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
              isDone
                ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-200'
                : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
            }`}
          >
            <div className="flex items-start gap-3">
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h5 className="font-semibold text-slate-100">{condition.title}</h5>
                  {condition.required && (
                    <span className="text-[10px] text-rose-400 font-mono font-bold uppercase">* Required</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Category: <span className="text-slate-300">{condition.category}</span> • Party: <span className="text-slate-300">{condition.responsibleParty}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
              <Badge variant={isDone ? 'emerald' : 'amber'} size="xs">
                {condition.status}
              </Badge>

              {!isDone && onUpdateStatus && (
                <Button
                  size="sm"
                  variant="emerald"
                  onClick={() => onUpdateStatus(condition._id, 'Completed')}
                  className="text-[11px] py-1 px-2.5"
                >
                  Mark Complete
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ClosingConditionList;
