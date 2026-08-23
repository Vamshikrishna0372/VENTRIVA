import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { ShieldCheck, Award } from 'lucide-react';

export const GovernanceRightsCard = ({ rights = [], className = '' }) => {
  if (!rights.length) {
    return (
      <Card className={`p-4 text-center text-xs text-slate-400 ${className}`}>
        No active investor governance rights registered yet.
      </Card>
    );
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
      {rights.map((r) => (
        <Card key={r._id} className="p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <h5 className="font-bold text-slate-100">{r.rightType}</h5>
            </div>
            <Badge variant={r.status === 'Active' ? 'emerald' : 'slate'} size="xs">
              {r.status}
            </Badge>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Holder: <span className="text-slate-200">{r.holder?.name || 'Investor'}</span> • Source:{' '}
            <span className="text-slate-300">{r.source}</span>
          </p>
        </Card>
      ))}
    </div>
  );
};

export default GovernanceRightsCard;
