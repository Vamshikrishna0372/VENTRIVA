import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { PieChart, Plus } from 'lucide-react';

export const EquityPoolCard = ({ pool, onAllocate, className = '' }) => {
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [sharesToAllocate, setSharesToAllocate] = useState(50000);
  const [recipientName, setRecipientName] = useState('');

  if (!pool) return null;

  const total = pool.totalShares || 1000000;
  const allocated = pool.allocatedShares || 0;
  const available = pool.availableShares || 0;
  const allocatedPct = Number(((allocated / total) * 100).toFixed(1));

  const handleAllocate = (e) => {
    e.preventDefault();
    if (onAllocate) {
      onAllocate(pool._id, Number(sharesToAllocate), recipientName);
      setShowAllocateModal(false);
    }
  };

  return (
    <Card className={`p-4 space-y-3 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2.5">
          <PieChart className="w-5 h-5 text-brand-400 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-slate-100">{pool.name}</h4>
            <p className="text-[11px] text-slate-400 font-mono">
              Type: <span className="text-slate-200 font-semibold">{pool.poolType}</span> • Target:{' '}
              <span className="text-slate-300">{pool.poolPercentage}% of Total Equity</span>
            </p>
          </div>
        </div>

        <Badge variant={pool.status === 'Active' ? 'emerald' : 'slate'} size="xs">
          {pool.status}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/50">
        <div className="flex justify-between items-center text-[11px] font-mono">
          <span className="text-slate-400">Allocated Option Utilization</span>
          <span className="font-bold text-brand-300">{allocatedPct}% ({allocated.toLocaleString()} / {total.toLocaleString()})</span>
        </div>
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex">
          <div className="h-full bg-brand-500 transition-all duration-500" style={{ width: `${allocatedPct}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/40">
        <div>
          <span className="text-slate-500 text-[10px]">Allocated Options</span>
          <p className="font-bold text-slate-200 mt-0.5">{allocated.toLocaleString()}</p>
        </div>
        <div>
          <span className="text-slate-500 text-[10px]">Available Options</span>
          <p className="font-bold text-emerald-400 mt-0.5">{available.toLocaleString()}</p>
        </div>
      </div>

      {onAllocate && available > 0 && (
        <div className="flex justify-end pt-1">
          <Button size="sm" variant="brand" onClick={() => setShowAllocateModal(true)} className="text-xs py-1 px-3 flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Allocate Options
          </Button>
        </div>
      )}

      {showAllocateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4">
            <h4 className="text-sm font-bold text-slate-100">Allocate ESOP Pool Options</h4>
            <form onSubmit={handleAllocate} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Recipient Name</label>
                <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="e.g. Lead Engineer" required />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Number of Shares to Allocate</label>
                <Input type="number" value={sharesToAllocate} onChange={(e) => setSharesToAllocate(e.target.value)} max={available} required />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <Button type="button" variant="ghost" onClick={() => setShowAllocateModal(false)}>Cancel</Button>
                <Button type="submit" variant="brand">Confirm Allocation</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
};

export default EquityPoolCard;
