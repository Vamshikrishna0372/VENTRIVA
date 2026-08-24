import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GitPullRequest,
  ArrowRight,
  Loader2,
  Building2,
  User,
  RefreshCw,
  Columns,
  ShieldCheck,
  PieChart,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import DealStatusBadge from '../../components/deals/DealStatusBadge';
import { getMyDeals } from '../../services/dealService';

export const InvestorDeals = () => {
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await getMyDeals();
      if (res?.success) setDeals(res.data);
    } catch (err) {
      console.error('Error fetching investor deals:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Investment Deal Rooms...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-100">Deal Rooms & Term Sheets</h1>
            <p className="text-sm text-slate-400">Manage active deal negotiations, term sheet proposals, closing checklists, and transaction commitments.</p>
          </div>
          <Button onClick={fetchDeals} icon={RefreshCw} variant="outline" size="sm">
            Refresh
          </Button>
        </div>

        {/* Connected Workflows Quick Bar */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
          <Link to="/investor/pipeline" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Columns className="w-3.5 h-3.5 text-brand-400" /> Deal Pipeline
          </Link>
          <Link to="/investor/closings" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Investment Closings
          </Link>
          <Link to="/investor/portfolio" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" /> Venture Portfolio
          </Link>
          <Link to="/investor/cap-table" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <PieChart className="w-3.5 h-3.5 text-purple-400" /> Cap Table
          </Link>
          <Link to="/investor/follow-on-investments" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> Follow-On Opportunities
          </Link>
        </div>
      </div>

      {isError && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>Failed to load active Deal Rooms dataset. Please try again.</span>
          </div>
          <Button variant="outline" size="xs" onClick={fetchDeals}>Retry</Button>
        </div>
      )}

      {deals.length === 0 ? (
        <Card className="text-center py-12 border-slate-800 bg-slate-900">
          <CardBody className="space-y-4">
            <GitPullRequest className="w-12 h-12 text-slate-600 mx-auto" />
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-lg font-bold text-slate-200">No Active Deal Rooms</h3>
              <p className="text-xs text-slate-400">
                Advance a startup from your Deal Pipeline into a formal Deal Room to start proposing term sheets.
              </p>
            </div>
            <Link to="/investor/pipeline">
              <Button variant="primary" size="sm" icon={ArrowRight}>
                Go to Deal Pipeline
              </Button>
            </Link>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deals.map((deal) => (
            <Card key={deal._id} className="border-slate-800 bg-slate-900 hover:border-slate-700 transition-all">
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100">{deal.startup?.startupName || deal.startup?.companyName || 'Portfolio Startup'}</h3>
                      <p className="text-xs text-slate-400">Founder: {deal.founder?.name || deal.founder?.email || `${deal.founder?.firstName || ''} ${deal.founder?.lastName || ''}`.trim() || 'Founder'}</p>
                    </div>
                  </div>
                  <DealStatusBadge status={deal.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Target Investment</span>
                    <span className="font-bold text-emerald-400">${(deal.targetInvestment || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Valuation</span>
                    <span className="font-bold text-slate-200">${(deal.valuation || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-800">
                  <Link to={`/investor/deals/${deal._id}`}>
                    <Button variant="outline" size="sm" icon={ArrowRight}>
                      Open Deal Room
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvestorDeals;

