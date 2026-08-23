import React from 'react';
import { Building2, DollarSign, Calendar, FileText, ArrowLeft, Archive, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import DealStatusBadge from './DealStatusBadge';

export const DealHeader = ({ deal, userRole, onStatusChange, onArchive, onProposeTermSheet }) => {
  const { startup, status, targetInvestment, valuation, dealType, closingDate } = deal;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to={userRole === 'founder' ? '/founder/deals' : userRole === 'admin' ? '/admin/deals' : '/investor/deals'}
            className="p-2 text-slate-400 hover:text-white bg-slate-950/60 rounded-xl border border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {startup?.logo ? (
              <img src={startup.logo} alt={startup.startupName} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <Building2 className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-100">{startup?.startupName || 'Startup Investment Room'}</h1>
              <DealStatusBadge status={status} size="md" />
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{startup?.sector} • {startup?.stage} Stage • {dealType}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onProposeTermSheet && status !== 'Closed' && status !== 'Withdrawn' && (
            <Button variant="primary" size="sm" icon={FileText} onClick={onProposeTermSheet}>
              Propose Term Sheet
            </Button>
          )}
          {onArchive && status !== 'Withdrawn' && (
            <Button variant="ghost" size="sm" icon={Archive} onClick={onArchive}>
              Archive
            </Button>
          )}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80">
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
          <p className="text-[10px] font-mono uppercase text-slate-400">Target Investment</p>
          <p className="text-lg font-bold text-slate-100">${(targetInvestment || 0).toLocaleString()}</p>
        </div>
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
          <p className="text-[10px] font-mono uppercase text-slate-400">Valuation (Pre-Money)</p>
          <p className="text-lg font-bold text-slate-100">${(valuation || 0).toLocaleString()}</p>
        </div>
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
          <p className="text-[10px] font-mono uppercase text-slate-400">Deal Instrument</p>
          <p className="text-sm font-semibold text-slate-200 mt-1">{dealType}</p>
        </div>
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/60">
          <p className="text-[10px] font-mono uppercase text-slate-400">Target Closing</p>
          <p className="text-sm font-semibold text-slate-200 mt-1">
            {closingDate ? new Date(closingDate).toLocaleDateString() : 'TBD'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DealHeader;
