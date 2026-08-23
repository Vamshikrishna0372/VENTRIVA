import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import MetricCard from '../../components/analytics/MetricCard';
import { getMyInvestments } from '../../services/investmentService';
import { getUpdatesForInvestment } from '../../services/portfolioUpdateService';

export const FounderPerformance = () => {
  const [investments, setInvestments] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFounderPerf();
  }, []);

  const fetchFounderPerf = async () => {
    setIsLoading(true);
    try {
      const invRes = await getMyInvestments();
      if (invRes?.success && invRes.data.length > 0) {
        setInvestments(invRes.data);
        const updRes = await getUpdatesForInvestment(invRes.data[0]._id);
        if (updRes?.success) setUpdates(updRes.data);
      }
    } catch (err) {
      console.error('Error fetching founder performance:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Performance & Financial Growth Analytics...</p>
      </div>
    );
  }

  const latestUpdate = updates[0] || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2">
        <h1 className="text-2xl font-bold text-slate-100">Financial Growth & Reporting Performance</h1>
        <p className="text-sm text-slate-400">Historical performance metrics, revenue growth trajectory, cash burn, and runway analysis for active investors.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard title="Annual Recurring Rev" value={`$${(latestUpdate.annualRecurringRevenue || 0).toLocaleString()}`} subtitle="ARR trajectory" icon={TrendingUp} color="brand" />
        <MetricCard title="Monthly Recurring Rev" value={`$${(latestUpdate.monthlyRecurringRevenue || 0).toLocaleString()}`} subtitle="MRR baseline" icon={DollarSign} color="emerald" />
        <MetricCard title="Monthly Burn Rate" value={`$${(latestUpdate.burnRate || 0).toLocaleString()}`} subtitle="Cash outflow" icon={BarChart3} color="indigo" />
        <MetricCard title="Runway Remaining" value={`${latestUpdate.runwayMonths || 12} Mos`} subtitle="Cash sustainability" icon={TrendingUp} color="teal" />
      </div>

      <Card>
        <CardHeader title="Historical Progress Reports" subtitle="Submitted quarterly and monthly performance entries" />
        <CardBody>
          {updates.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No historical performance updates submitted yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="py-3 px-4">Period</th>
                    <th className="py-3 px-4">ARR ($)</th>
                    <th className="py-3 px-4">Growth %</th>
                    <th className="py-3 px-4">Burn ($)</th>
                    <th className="py-3 px-4">Runway</th>
                    <th className="py-3 px-4">Outlook</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {updates.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-950/40">
                      <td className="py-3 px-4 font-bold text-slate-200">{u.reportingPeriod}</td>
                      <td className="py-3 px-4 text-slate-200">${(u.annualRecurringRevenue || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 text-emerald-400">+{u.revenueGrowth || 0}%</td>
                      <td className="py-3 px-4 text-slate-300">${(u.burnRate || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-300">{u.runwayMonths} mos</td>
                      <td className="py-3 px-4 text-slate-300">{u.outlook}</td>
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

export default FounderPerformance;
