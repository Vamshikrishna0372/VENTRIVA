import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Loader2, DollarSign, Briefcase } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ClosingStatusBadge } from '../../components/closing/ClosingStatusBadge';
import { formatCurrency } from '../../utils/closingConstants';
import api from '../../services/api';

export const InvestorClosings = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClosings();
  }, []);

  const fetchClosings = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/closings');
      if (res.data?.success) setTransactions(res.data.data || []);
    } catch (err) {
      console.error('Error fetching investor closings:', err);
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
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <ShieldCheck className="w-7 h-7 text-emerald-400" /> Investment Closing Pipeline
        </h1>
        <p className="text-sm text-slate-400">
          Track active closing transactions, fulfill conditions, execute legal documents, submit wire payment references, and review closed investments.
        </p>
      </div>

      {/* Grid */}
      {transactions.length === 0 ? (
        <Card className="text-center py-12">
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
              <Card key={tx._id} className="hover:border-slate-700 transition-all">
                <CardBody className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-100">{startup.companyName || 'Venture'}</h3>
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
