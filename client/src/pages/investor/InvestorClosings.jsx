import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  Loader2,
  DollarSign,
  Briefcase,
  RefreshCw,
  Target,
  PieChart,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ClosingStatusBadge } from '../../components/closing/ClosingStatusBadge';
import { formatCurrency } from '../../utils/closingConstants';
import api from '../../services/api';

export const InvestorClosings = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    fetchClosings();
  }, []);

  const fetchClosings = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await api.get('/closings');
      if (res.data?.success) setTransactions(res.data.data || []);
    } catch (err) {
      console.error('Error fetching investor closings:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Investment Closing Transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
              <ShieldCheck className="w-7 h-7 text-emerald-400" /> Investment Closing Pipeline
            </h1>
            <p className="text-sm text-slate-400">
              Track active closing transactions, fulfill conditions, execute legal documents, submit wire payment references, and review closed investments.
            </p>
          </div>
          <Button onClick={fetchClosings} icon={RefreshCw} variant="outline" size="sm">
            Refresh Pipeline
          </Button>
        </div>

        {/* Connected Workflows Quick Bar */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
          <Link to="/investor/fundraising" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-amber-400" /> Active Open Rounds
          </Link>
          <Link to="/investor/deals" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-brand-400" /> Deal Rooms
          </Link>
          <Link to="/investor/portfolio" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Venture Portfolio
          </Link>
        </div>
      </div>

      {isError && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>Failed to load closing transactions dataset. Please try again.</span>
          </div>
          <Button variant="outline" size="xs" onClick={fetchClosings}>Retry</Button>
        </div>
      )}

      {/* Grid */}
      {transactions.length === 0 ? (
        <Card className="text-center py-12 border-slate-800 bg-slate-900">
          <CardBody className="space-y-3">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-200">No Active Investment Closings</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              When a startup accepts your investment commitment or term sheet, active transaction closing workspaces will appear here.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {transactions.map((tx) => {
            const startup = tx.startup || {};

            return (
              <Card key={tx._id} className="border-slate-800 bg-slate-900 hover:border-slate-700 transition-all">
                <CardBody className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-100">{startup.startupName || startup.companyName || 'Venture'}</h3>
                      <p className="text-xs text-slate-400">{tx.transactionType}</p>
                    </div>
                    <ClosingStatusBadge status={tx.transactionStatus} />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs bg-slate-950/50 p-3 rounded-xl border border-slate-800/60 font-mono">
                    <div>
                      <span className="text-slate-500">Investment</span>
                      <p className="font-bold text-emerald-400">{formatCurrency(tx.finalInvestmentAmount)}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Ownership</span>
                      <p className="font-bold text-slate-200">{tx.ownershipPercentage}%</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Valuation</span>
                      <p className="font-bold text-slate-300">{formatCurrency(tx.preMoneyValuation)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-2 border-t border-slate-800/60">
                    <Link to={`/investor/closings/${tx._id}`}>
                      <Button size="sm" variant="brand" className="flex items-center gap-1.5 text-xs">
                        Review Workspace & Sign <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InvestorClosings;

