import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Loader2, DollarSign, RefreshCw, BarChart3 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ClosingStatusBadge } from '../../components/closing/ClosingStatusBadge';
import { formatCurrency } from '../../utils/closingConstants';

import api from '../../services/api';

export const AdminClosings = () => {
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchAdminClosings();
  }, [statusFilter]);

  const fetchAdminClosings = async () => {
    setIsLoading(true);
    try {
      const [txRes, analyticsRes] = await Promise.all([
        api.get(`/admin/closings/transactions?status=${statusFilter}`),
        api.get('/admin/closings/analytics'),
      ]);

      if (txRes.data?.success) setTransactions(txRes.data.data || []);
      if (analyticsRes.data?.success) setAnalytics(analyticsRes.data.data);
    } catch (err) {
      console.error('Error fetching admin closings:', err);
    } finally {
      setIsLoading(false);
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Admin Closing Governance Command...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-rose-400" /> Platform Transaction Closing Governance
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            System-wide administration of investment closings, cap table updates, legal document compliance, and payment verification.
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={fetchAdminClosings} className="flex items-center gap-1.5 self-start sm:self-auto">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
        </Button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-4 space-y-1">
            <span className="text-[11px] text-slate-400 font-mono">Active Closings</span>
            <p className="text-xl font-bold text-slate-100 font-mono">{analytics.activeTransactions}</p>
          </Card>

          <Card className="p-4 space-y-1">
            <span className="text-[11px] text-slate-400 font-mono">Total Capital Closed</span>
            <p className="text-xl font-bold text-emerald-400 font-mono">{formatCurrency(analytics.totalCapitalClosed)}</p>
          </Card>

          <Card className="p-4 space-y-1">
            <span className="text-[11px] text-slate-400 font-mono">Closed Transactions</span>
            <p className="text-xl font-bold text-purple-300 font-mono">{analytics.closedTransactions}</p>
          </Card>

          <Card className="p-4 space-y-1">
            <span className="text-[11px] text-slate-400 font-mono">Average Closing Size</span>
            <p className="text-xl font-bold text-amber-400 font-mono">{formatCurrency(analytics.averageClosingSize)}</p>
          </Card>
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono">
              <tr>
                <th className="p-3.5">Startup</th>
                <th className="p-3.5">Investor</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Amount ($)</th>
                <th className="p-3.5">Ownership %</th>
                <th className="p-3.5">Pre-Valuation ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {transactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold text-slate-100">{tx.startup?.startupName || tx.startup?.companyName || 'Venture'}</td>

                  <td className="p-3.5 text-slate-300">{tx.investor?.name || 'Investor'}</td>
                  <td className="p-3.5 text-slate-400">{tx.transactionType}</td>
                  <td className="p-3.5">
                    <ClosingStatusBadge status={tx.transactionStatus} size="xs" />
                  </td>
                  <td className="p-3.5 font-bold text-emerald-400">{formatCurrency(tx.finalInvestmentAmount)}</td>
                  <td className="p-3.5 text-slate-200">{tx.ownershipPercentage}%</td>
                  <td className="p-3.5 text-slate-400">{formatCurrency(tx.preMoneyValuation)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminClosings;
