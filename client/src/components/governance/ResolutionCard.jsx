import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { FileText, CheckCircle2, Vote, Clock } from 'lucide-react';
import { getGovernanceBadgeVariant } from '../../utils/governanceConstants';

export const ResolutionCard = ({ resolution, onVote, className = '' }) => {
  if (!resolution) return null;

  const userVote = resolution.userVote;
  const isVotingOpen = resolution.status === 'Voting' || resolution.status === 'Proposed';

  return (
    <Card className={`p-4 space-y-3 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-100">{resolution.title}</h4>
              <span className="text-[10px] text-slate-400 font-mono">#{resolution.resolutionNumber}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Type: <span className="text-slate-300 font-semibold">{resolution.resolutionType}</span> • Required Majority:{' '}
              <span className="text-slate-200">{resolution.requiredApprovalPercentage}%</span>
            </p>
          </div>
        </div>

        <Badge variant={getGovernanceBadgeVariant(resolution.status)} size="xs">
          {resolution.status}
        </Badge>
      </div>

      <p className="text-xs text-slate-300">{resolution.description}</p>

      {/* Voting Progress Bar */}
      <div className="space-y-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/50">
        <div className="flex justify-between items-center text-[11px] font-mono">
          <span className="text-slate-400">Approval Level</span>
          <span className="font-bold text-emerald-400">{resolution.approvalPercentage || 0}%</span>
        </div>
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${resolution.approvalPercentage || 0}%` }}
          />
        </div>
      </div>

      {/* User Vote Status & Actions */}
      <div className="flex items-center justify-between pt-1">
        <div className="text-xs font-mono">
          {userVote ? (
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Your Vote: {userVote.vote} ({userVote.votingPower} power)
            </span>
          ) : (
            <span className="text-slate-400">Not voted yet</span>
          )}
        </div>

        {isVotingOpen && !userVote && onVote && (
          <Button size="sm" variant="brand" onClick={() => onVote(resolution)} className="text-xs py-1 px-3 flex items-center gap-1">
            <Vote className="w-3.5 h-3.5" /> Cast Vote
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ResolutionCard;
