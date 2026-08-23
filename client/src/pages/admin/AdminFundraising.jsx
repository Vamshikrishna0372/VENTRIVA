import React, { useState, useEffect } from 'react';
import { Target, Search, Loader2, ShieldCheck, BarChart3, Activity, DollarSign, Users, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { RoundStatusBadge } from '../../components/fundraising/RoundStatusBadge';
import { FundraisingActivityTimeline } from '../../components/fundraising/FundraisingActivityTimeline';
import { formatCurrency } from '../../utils/fundraisingConstants';

import api from '../../services/api';

export const AdminFundraising = () => {
  const [rounds, setRounds] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activity, setActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('rounds');

  useEffect(() => {
    fetchAdminData();
  }, [search]);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [roundsRes, analyticsRes, activityRes] = await Promise.all([
        api.get(`/admin/fundraising/rounds?search=${encodeURIComponent(search)}`),
        api.get('/admin/fundraising/analytics'),
        api.get('/admin/fundraising/activity'),
      ]);

      if (roundsRes.data?.success) setRounds(roundsRes.data.data || []);
      if (analyticsRes.data?.success) setAnalytics(analyticsRes.data.data);
      if (activityRes.data?.success) setActivity(activityRes.data.data || []);
    } catch (err) {
      console.error('Error fetching admin fundraising data:', err);
    } finally {
      setIsLoading(false);
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Admin Fundraising Governance Command...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-rose-400" /> Platform Capital Raise Governance
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            System-wide oversight of active fundraising rounds, capital deployment metrics, and activity audit trails.
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={fetchAdminData} className="flex items-center gap-1.5 self-start sm:self-auto">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
        </Button>
      </div>

      {/* Analytics Metric Cards */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-4 space-y-1">
            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-brand-400" /> Total Active Rounds
            </span>
            <p className="text-xl font-bold text-slate-100 font-mono">{analytics.activeRounds}</p>
          </Card>

          <Card className="p-4 space-y-1">
            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Target Capital Seek
            </span>
            <p className="text-xl font-bold text-emerald-400 font-mono">{formatCurrency(analytics.totalTargetCapital)}</p>
          </Card>

          <Card className="p-4 space-y-1">
            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5 text-purple-400" /> Total Committed Capital
            </span>
            <p className="text-xl font-bold text-purple-300 font-mono">{formatCurrency(analytics.totalCommittedCapital)}</p>
          </Card>

          <Card className="p-4 space-y-1">
            <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-amber-400" /> Average Round Size
            </span>
            <p className="text-xl font-bold text-amber-400 font-mono">{formatCurrency(analytics.averageRoundSize)}</p>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('rounds')}
          className={`pb-3 px-4 border-b-2 transition-colors ${
            activeTab === 'rounds' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Fundraising Rounds ({rounds.length})
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`pb-3 px-4 border-b-2 transition-colors ${
            activeTab === 'activity' ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Audit Activity Stream ({activity.length})
        </button>
      </div>

      {activeTab === 'rounds' ? (
        <div className="space-y-4">
          <div className="max-w-xs">
            <Input
              type="text"
              placeholder="Search rounds by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-xs"
            />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono">
                  <tr>
                    <th className="p-3.5">Round Name</th>
                    <th className="p-3.5">Startup</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Target ($)</th>
                    <th className="p-3.5">Committed ($)</th>
                    <th className="p-3.5">Pre-Valuation ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {rounds.map((round) => (
                    <tr key={round._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-bold text-slate-100">{round.roundName}</td>
                      <td className="p-3.5 text-slate-300">{round.startup?.startupName || round.startup?.companyName || 'Venture'}</td>

                      <td className="p-3.5 text-slate-400">{round.roundType}</td>
                      <td className="p-3.5">
                        <RoundStatusBadge status={round.status} size="xs" />
                      </td>
                      <td className="p-3.5 font-mono text-slate-200">{formatCurrency(round.targetAmount)}</td>
                      <td className="p-3.5 font-mono text-emerald-400 font-semibold">{formatCurrency(round.committedAmount)}</td>
                      <td className="p-3.5 font-mono text-slate-400">{formatCurrency(round.preMoneyValuation)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <FundraisingActivityTimeline activities={activity} />
      )}
    </div>
  );
};

export default AdminFundraising;
