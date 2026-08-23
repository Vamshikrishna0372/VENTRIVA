import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { User, ShieldCheck, Award } from 'lucide-react';

export const ShareholderCard = ({ shareholder, className = '' }) => {
  if (!shareholder) return null;

  return (
    <Card className={`p-4 space-y-3 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 font-bold text-xs">
            {shareholder.holderName?.charAt(0) || 'S'}
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100">{shareholder.holderName}</h4>
            <p className="text-[11px] text-slate-400">
              Role: <span className="text-slate-200 font-semibold">{shareholder.holderType}</span> • Class:{' '}
              <span className="text-slate-300">{shareholder.shareClass || 'Common Stock'}</span>
            </p>
          </div>
        </div>
        <Badge variant={shareholder.status === 'Active' ? 'emerald' : 'slate'} size="xs">
          {shareholder.status}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/50">
        <div>
          <span className="text-slate-500 text-[10px]">Shares</span>
          <p className="font-bold text-slate-100 mt-0.5">{shareholder.sharesOwned?.toLocaleString() || 0}</p>
        </div>
        <div>
          <span className="text-slate-500 text-[10px]">Equity %</span>
          <p className="font-bold text-emerald-400 mt-0.5">{shareholder.ownershipPercentage}%</p>
        </div>
        <div>
          <span className="text-slate-500 text-[10px]">Voting %</span>
          <p className="font-bold text-purple-300 mt-0.5">{shareholder.votingPercentage}%</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 pt-1">
        {shareholder.votingRights && <Badge variant="purple" size="xs">Voting Rights</Badge>}
        {shareholder.boardRights && <Badge variant="cyan" size="xs">Board Rights</Badge>}
        {shareholder.informationRights && <Badge variant="slate" size="xs">Information Rights</Badge>}
        {shareholder.proRataRights && <Badge variant="amber" size="xs">Pro-Rata Rights</Badge>}
      </div>
    </Card>
  );
};

export default ShareholderCard;
