import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { getGovernanceBadgeVariant } from '../../utils/governanceConstants';

export const ComplianceCard = ({ item, onComplete, className = '' }) => {
  if (!item) return null;

  const isDone = item.status === 'Completed' || item.status === 'Waived';
  const isOverdue = item.status === 'Overdue';
  const dueStr = new Date(item.dueDate).toLocaleDateString();

  return (
    <Card className={`p-4 space-y-3 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2.5">
          {isDone ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : isOverdue ? (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <Clock className="w-5 h-5 text-amber-400 shrink-0" />
          )}
          <div>
            <h4 className="text-xs font-bold text-slate-100">{item.title}</h4>
            <p className="text-[11px] text-slate-400 font-mono">
              Category: <span className="text-slate-200 font-semibold">{item.category}</span> • Due Date:{' '}
              <span className={isOverdue ? 'text-rose-400 font-bold' : 'text-slate-300'}>{dueStr}</span>
            </p>
          </div>
        </div>

        <Badge variant={getGovernanceBadgeVariant(item.status)} size="xs">
          {item.status}
        </Badge>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-[10px] font-mono text-slate-400">
          Priority: <strong className="text-slate-200">{item.priority}</strong>
        </span>

        {!isDone && onComplete && (
          <Button size="sm" variant="emerald" onClick={() => onComplete(item._id)} className="text-[11px] py-1 px-2.5">
            Mark Completed
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ComplianceCard;
