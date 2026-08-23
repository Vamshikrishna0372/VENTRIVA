import React from 'react';
import { Card } from '../common/Card';
import { formatCurrency } from '../../utils/closingConstants';
import { PieChart, Users, ShieldCheck, Award } from 'lucide-react';

export const CapTablePreview = ({ capTable, className = '' }) => {
  if (!capTable) return null;

  const {
    totalShares = 10000000,
    founderOwnership = 100,
    investorOwnership = 0,
    otherOwnership = 0,
    holdings = [],
  } = capTable;

  return (
    <Card className={`p-5 space-y-4 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <PieChart className="w-5 h-5 text-brand-400" />
          <h4 className="text-sm font-bold text-slate-100">Real-Time Equity Cap Table</h4>
        </div>
        <span className="text-xs font-mono text-slate-400">Total Shares: {totalShares.toLocaleString()}</span>
      </div>

      {/* Visual Ownership Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-mono">
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Founders: {founderOwnership}%
          </span>
          <span className="text-purple-300 flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> Investors: {investorOwnership}%
          </span>
          <span className="text-amber-300 flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> ESOP / Other: {otherOwnership}%
          </span>
        </div>

        <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 flex">
          <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${founderOwnership}%` }} />
          <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${investorOwnership}%` }} />
          <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${otherOwnership}%` }} />
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-slate-950/60 rounded-xl border border-slate-800/80 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-mono">
            <tr>
              <th className="p-2.5">Shareholder</th>
              <th className="p-2.5">Role</th>
              <th className="p-2.5">Share Class</th>
              <th className="p-2.5">Shares</th>
              <th className="p-2.5 text-right">Equity %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {holdings.map((h, i) => (
              <tr key={i} className="hover:bg-slate-900/40">
                <td className="p-2.5 font-semibold text-slate-200">{h.holderName}</td>
                <td className="p-2.5 text-slate-400">{h.holderType}</td>
                <td className="p-2.5 text-slate-400">{h.shareClass || 'Common Stock'}</td>
                <td className="p-2.5 text-slate-300">{h.shares?.toLocaleString() || 0}</td>
                <td className="p-2.5 text-right font-bold text-emerald-400">{h.ownershipPercentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default CapTablePreview;
