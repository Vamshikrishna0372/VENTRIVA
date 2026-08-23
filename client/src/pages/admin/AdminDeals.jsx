import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GitPullRequest, Building2, User, Loader2, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import DealStatusBadge from '../../components/deals/DealStatusBadge';
import { getMyDeals } from '../../services/dealService';

export const AdminDeals = () => {
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
      console.error('Error fetching admin deal overview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Querying Platform Investment Transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-slate-100">Platform Investment Transactions</h1>
          <Badge variant="rose">ADMIN AUDIT</Badge>
        </div>
        <p className="text-sm text-slate-400">Platform-wide audit visibility into active deal rooms, term sheets, valuation terms, and closing workflows.</p>
      </div>

      <Card>
        <CardHeader title={`Active Deal Rooms (${deals.length})`} subtitle="Global transaction audit" />
        <CardBody>
          {deals.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No deal rooms initialized on the platform.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                    <th className="py-3 px-4">Startup</th>
                    <th className="py-3 px-4">Investor</th>
                    <th className="py-3 px-4">Founder</th>
                    <th className="py-3 px-4">Target Investment</th>
                    <th className="py-3 px-4">Valuation</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {deals.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-950/40">
                      <td className="py-3 px-4 font-semibold text-slate-200">{d.startup?.startupName || 'Startup'}</td>
                      <td className="py-3 px-4 text-slate-300">{d.investor?.name || d.investor?.email || 'Investor'}</td>
                      <td className="py-3 px-4 text-slate-300">{d.founder?.name || d.founder?.email || 'Founder'}</td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-200">${(d.targetInvestment || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-200">${(d.valuation || 0).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <DealStatusBadge status={d.status} size="xs" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default AdminDeals;
