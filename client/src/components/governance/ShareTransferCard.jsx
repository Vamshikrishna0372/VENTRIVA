import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { formatCurrency, getGovernanceBadgeVariant } from '../../utils/governanceConstants';

export const ShareTransferCard = ({ transfer, onExecute, className = '' }) => {
  if (!transfer) return null;

  const sellerName = transfer.fromShareholder?.holderName || 'Seller';
  const buyerName = transfer.buyerName || 'Buyer';

  return (
    <Card className={`p-4 space-y-3 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div>
          <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5 font-mono">
            <span>{sellerName}</span>
            <ArrowRight className="w-3.5 h-3.5 text-brand-400" />
            <span>{buyerName}</span>
          </h4>
          <p className="text-[11px] text-slate-400">Class: {transfer.shareClass || 'Common Stock'}</p>
        </div>

        <Badge variant={getGovernanceBadgeVariant(transfer.status)} size="xs">
          {transfer.status}
        </Badge>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs font-mono bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/50">
        <div>
          <span className="text-slate-500 text-[10px]">Transferred</span>
          <p className="font-bold text-purple-300 mt-0.5">{transfer.shares?.toLocaleString() || 0} shares</p>
        </div>
        <div>
          <span className="text-slate-500 text-[10px]">Price / Share</span>
          <p className="font-bold text-slate-200 mt-0.5">{formatCurrency(transfer.pricePerShare)}</p>
        </div>
        <div>
          <span className="text-slate-500 text-[10px]">Total Value</span>
          <p className="font-bold text-emerald-400 mt-0.5">{formatCurrency(transfer.totalValue)}</p>
        </div>
      </div>

      {transfer.status === 'Proposed' && onExecute && (
        <div className="flex justify-end pt-1">
          <Button size="sm" variant="emerald" onClick={() => onExecute(transfer._id)} className="text-xs py-1 px-3 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Execute Share Transfer
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ShareTransferCard;
