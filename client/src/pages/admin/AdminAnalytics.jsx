import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Building2, ShieldCheck, Loader2, DollarSign, Activity } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

import MetricCard from '../../components/analytics/MetricCard';
import AnalyticsChart from '../../components/analytics/AnalyticsChart';
import AnalyticsFilter from '../../components/analytics/AnalyticsFilter';
import { getAdminOverviewAnalytics } from '../../services/analyticsService';

export const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminOverviewAnalytics(period);
      if (res?.success && res?.analytics) {
        setAnalytics(res.analytics);
      }
    } catch (err) {
      console.error('Error fetching admin overview analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Aggregated Platform Analytics...</p>
      </div>
    );
  }

  const { users = {}, startups = {}, investorActivity = {}, moderation = {} } = analytics || {};

  const sectorChartData = Array.isArray(startups.sectorBreakdown)
    ? startups.sectorBreakdown.map((s) => ({ label: s._id || 'Unspecified', count: s.count }))
    : [];

  const stageChartData = Array.isArray(startups.stageBreakdown)
    ? startups.stageBreakdown.map((s) => ({ label: s._id || 'Unspecified', count: s.count }))
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-100">Platform Analytics & System Intelligence</h1>
              <Badge variant="brand">REAL MONGODB METRICS</Badge>
            </div>
            <p className="text-sm text-slate-400">Platform-wide aggregation of user growth, startup taxonomy, investor deal activities, and moderation health.</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">Time Period:</span>
            <AnalyticsFilter selectedPeriod={period} onChangePeriod={setPeriod} />
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Total Platform Users"
          value={users.total || 0}
          subtitle={`${users.founders || 0} founders, ${users.investors || 0} investors`}
          icon={Users}
          color="brand"
        />

        <MetricCard
          title="Total Startups"
          value={startups.total || 0}
          subtitle={`${startups.published || 0} published`}
          icon={Building2}
          color="emerald"
        />

        <MetricCard
          title="Verified Startups"
          value={startups.verified || 0}
          subtitle="Identity verified"
          icon={ShieldCheck}
          color="indigo"
        />

        <MetricCard
          title="Total Shortlists"
          value={investorActivity.shortlists || 0}
          subtitle="Shortlisted ventures"
          icon={Activity}
          color="cyan"
        />

        <MetricCard
          title="Deal Evaluations"
          value={investorActivity.evaluations || 0}
          subtitle="Structured evaluations"
          icon={BarChart3}
          color="amber"
        />

        <MetricCard
          title="Meetings Scheduled"
          value={investorActivity.meetings || 0}
          subtitle="Pitch & diligence calls"
          icon={Users}
          color="rose"
        />
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnalyticsChart
          title="Startups by Primary Sector"
          subtitle="Market taxonomy distribution"
          data={sectorChartData}
          color="brand"
        />

        <AnalyticsChart
          title="Startups by Investment Stage"
          subtitle="Funding round stage breakdown"
          data={stageChartData}
          color="emerald"
        />
      </div>
    </div>
  );
};

export default AdminAnalytics;
