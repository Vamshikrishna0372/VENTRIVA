import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ShieldCheck, UserX } from 'lucide-react';

export const BoardMemberCard = ({ member, onRemove, className = '' }) => {
  if (!member) return null;

  const user = member.user || {};
  const isObserver = member.role === 'Observer';

  return (
    <Card className={`p-4 space-y-3 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-xs">
            {user.name?.charAt(0) || 'D'}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100">{user.name || 'Board Director'}</h4>
            <p className="text-[11px] text-slate-400">{user.companyName || user.email}</p>
          </div>
        </div>

        <Badge variant={isObserver ? 'purple' : 'emerald'} size="xs">
          {member.role}
        </Badge>
      </div>

      <div className="text-xs font-mono bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/50 space-y-1">
        <div className="flex justify-between text-slate-400">
          <span>Appointed:</span>
          <span className="text-slate-200">{new Date(member.appointmentDate).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Voting Power:</span>
          <span className="text-emerald-400 font-bold">{member.votingPower} vote(s)</span>
        </div>
      </div>

      {onRemove && (
        <div className="flex justify-end pt-1">
          <Button size="sm" variant="ghost" onClick={() => onRemove(member._id)} className="text-rose-400 hover:text-rose-300 text-[11px] py-1 px-2">
            <UserX className="w-3.5 h-3.5 mr-1" /> Retire Director
          </Button>
        </div>
      )}
    </Card>
  );
};

export default BoardMemberCard;
