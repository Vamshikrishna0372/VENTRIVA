import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Columns,
  Bookmark,
  ClipboardCheck,
  Sparkles,
  Lightbulb,
  DollarSign,
  Loader2,
  RefreshCw,
  Search,
  Building2,
  Award,
  AlertCircle,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

import MetricCard from '../../components/analytics/MetricCard';
import AnalyticsChart from '../../components/analytics/AnalyticsChart';
import { getInvestorAnalytics } from '../../services/analyticsService';

export const InvestorAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await getInvestorAnalytics();
      if (res?.success && res?.analytics) {
        setAnalytics(res.analytics);
      }
    } catch (err) {
      console.error('Error fetching investor analytics:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Deal & Portfolio Intelligence...</p>
      </div>
    );
  }

  const { overview = {}, funnel = {}, pipelineDistribution = {} } = analytics || {};

  const pipelineChartData = Object.keys(pipelineDistribution).map((st) => ({
    label: st,
    count: pipelineDistribution[st],
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-100">Deal & Portfolio Intelligence</h1>
              <Badge variant="brand">REAL MONGODB METRICS</Badge>
            </div>
            <p className="text-sm text-slate-400">Track deal pipeline funnel conversion, evaluation scores, and portfolio capital deployment.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={fetchAnalytics} icon={RefreshCw} variant="outline" size="sm">
              Refresh Metrics
            </Button>
            <Link to="/investor/insights">
              <Button variant="outline" size="sm" icon={Lightbulb}>Opportunity Insights</Button>
            </Link>
            <Link to="/investor/recommendations">
              <Button variant="primary" size="sm" icon={Sparkles}>Match Recommendations</Button>
            </Link>
          </div>
        </div>

        {/* Connected Workflows Quick Bar */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
          <Link to="/investor/discover" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-brand-400" /> Discovery Engine
          </Link>
          <Link to="/investor/portfolio" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Venture Portfolio
          </Link>
          <Link to="/investor/portfolio/intelligence" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-purple-400" /> Portfolio Intelligence
          </Link>
          <Link to="/investor/exits" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Realized Exits
          </Link>
        </div>
      </div>

      {isError && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>Failed to load deal analytics. Please try again.</span>
          </div>
          <Button variant="outline" size="xs" onClick={fetchAnalytics}>Retry</Button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Active Deals"
          value={overview.activeDealsCount || 0}
          subtitle="In pipeline"
          icon={Columns}
          color="brand"
        />

        <MetricCard
          title="Pipeline Value"
          value={`$${((overview.expectedPipelineValue || 0) / 1000).toFixed(0)}k`}
          subtitle="Target investment"
          icon={DollarSign}
          color="emerald"
        />

        <MetricCard
          title="Evaluations"
          value={overview.totalEvaluationsCount || 0}
          subtitle={`Avg Score: ${overview.avgEvaluationScore || 0}/10`}
          icon={ClipboardCheck}
          color="indigo"
        />

        <MetricCard
          title="Shortlisted"
          value={overview.shortlistedCount || 0}
          subtitle="Saved ventures"
          icon={Bookmark}
          color="cyan"
        />

        <MetricCard
          title="Due Diligence"
          value={overview.dueDiligenceDealsCount || 0}
          subtitle="Deep review"
          icon={Columns}
          color="amber"
        />

        <MetricCard
          title="Invested Deals"
          value={overview.investedDealsCount || 0}
          subtitle="Closed Won"
          icon={DollarSign}
          color="emerald"
        />
      </div>

      {/* Deal Funnel Visualization */}
      <Card className="border-slate-800 bg-slate-900">
        <CardHeader title="Investment Funnel Conversion" subtitle="Stage progression pipeline" />
        <CardBody className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">1. Discovered</span>
            <span className="text-xl font-extrabold text-slate-100 mt-1 block">{funnel.discovered || 0}</span>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">2. Shortlisted</span>
            <span className="text-xl font-extrabold text-cyan-400 mt-1 block">{funnel.shortlisted || 0}</span>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">3. Evaluated</span>
            <span className="text-xl font-extrabold text-indigo-400 mt-1 block">{funnel.evaluated || 0}</span>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">4. Interested</span>
            <span className="text-xl font-extrabold text-brand-400 mt-1 block">{funnel.interested || 0}</span>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">5. Due Diligence</span>
            <span className="text-xl font-extrabold text-amber-400 mt-1 block">{funnel.dueDiligence || 0}</span>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">6. Invested</span>
            <span className="text-xl font-extrabold text-emerald-400 mt-1 block">{funnel.invested || 0}</span>
          </div>
        </CardBody>
      </Card>

      {/* Pipeline Stage Distribution Chart */}
      <AnalyticsChart
        title="Pipeline Deals by Stage"
        subtitle="Distribution of opportunities"
        data={pipelineChartData}
        color="brand"
      />
    </div>
  );
};

export default InvestorAnalytics;

