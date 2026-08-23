import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GitPullRequest, ArrowRight, Loader2, Building2, User } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import DealStatusBadge from '../../components/deals/DealStatusBadge';
import { getMyDeals } from '../../services/dealService';

export const InvestorDeals = () => {
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    setIsLoading(true);
    try {
      const res = await getMyDeals();
      if (res?.success) setDeals(res.data);
    } catch (err) {
      console.error('Error fetching investor deals:', err);
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
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2">
        <h1 className="text-2xl font-bold text-slate-100">Deal Rooms & Term Sheets</h1>
        <p className="text-sm text-slate-400">Manage active deal negotiations, term sheet proposals, closing checklists, and transaction commitments.</p>
      </div>

      {deals.length === 0 ? (
        <Card className="text-center py-12">
          <CardBody className="space-y-3">
            <GitPullRequest className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-200">No Active Deal Rooms</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Advance a startup from your Deal Pipeline into a formal Deal Room to start proposing term sheets.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deals.map((deal) => (
            <Card key={deal._id} className="hover:border-slate-700 transition-all">
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100">{deal.startup?.startupName || 'Startup'}</h3>
                      <p className="text-xs text-slate-400">Founder: {deal.founder?.name || deal.founder?.email || `${deal.founder?.firstName || ''} ${deal.founder?.lastName || ''}`.trim() || 'Founder'}</p>
                    </div>
                  </div>
                  <DealStatusBadge status={deal.status} />
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Target Investment</span>
                    <span className="font-bold text-slate-200">${(deal.targetInvestment || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-mono uppercase block">Valuation</span>
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
