import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Building2, UserCheck, MessageSquare, Calendar, FileText, Loader2, Lightbulb, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

import MetricCard from '../../components/analytics/MetricCard';
import InsightCard from '../../components/analytics/InsightCard';
import AnalyticsChart from '../../components/analytics/AnalyticsChart';
import { getFounderAnalytics, getFounderInsights } from '../../services/analyticsService';

export const FounderAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [analyticsRes, insightsRes] = await Promise.all([
        getFounderAnalytics(),
        getFounderInsights(),
      ]);

      if (analyticsRes?.success && analyticsRes?.analytics) {
        setAnalytics(analyticsRes.analytics);
      }

      if (insightsRes?.success && Array.isArray(insightsRes.insights)) {
        setInsights(insightsRes.insights);
      }
    } catch (err) {
      console.error('Error fetching founder analytics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Founder Analytics & Intelligence...</p>
      </div>
    );
  }

  const { profileHealth = {}, startupMetrics = null, engagement = {} } = analytics || {};

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-100">Founder Venture Intelligence</h1>
              <Badge variant="brand">REAL MONGODB METRICS</Badge>
            </div>
            <p className="text-sm text-slate-400">Audit venture readiness, investor engagement metrics, and action recommendations.</p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Startup Profile Readiness"
          value={`${profileHealth.startupCompletion || 0}%`}
          subtitle="Ventriva discovery completeness"
          icon={Building2}
          color="brand"
        />

        <MetricCard
          title="Investor Interest Expressions"
          value={engagement.interestsCount || 0}
          subtitle={`${engagement.acceptedInterests || 0} accepted threads`}
          icon={UserCheck}
          color="emerald"
        />

        <MetricCard
          title="Active Messaging Threads"
          value={engagement.conversationsCount || 0}
          subtitle={`${engagement.unreadMessages || 0} unread messages`}
          icon={MessageSquare}
          color="indigo"
        />

        <MetricCard
          title="Pitch & Diligence Meetings"
          value={engagement.meetingsCount || 0}
          subtitle={`${engagement.upcomingMeetings || 0} confirmed upcoming`}
          icon={Calendar}
          color="amber"
        />
      </div>

      {/* Rule-Based Recommendations Action Center */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-400" /> Action Center & Recommendations ({insights.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((ins) => (
              <InsightCard key={ins.id} insight={ins} />
            ))}
          </div>
        </div>
      )}

      {/* Startup Metrics & Fundraising Snapshot */}
      {startupMetrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Fundraising Terms & Capital Snapshot" />
            <CardBody className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Required Funding</span>
                  <span className="text-2xl font-extrabold text-emerald-400 mt-1 block">
                    ${(startupMetrics.fundingRequired || 0).toLocaleString()}
                  </span>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Previous Funding</span>
                  <span className="text-2xl font-extrabold text-slate-100 mt-1 block">
                    ${(startupMetrics.previousFunding || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-300 space-y-1.5 pt-2 border-t border-slate-800">
                <p><strong>Stage:</strong> {startupMetrics.stage}</p>
                <p><strong>Sector:</strong> {startupMetrics.sector}</p>
                <p><strong>Business Model:</strong> {startupMetrics.businessModel}</p>
              </div>
            </CardBody>
          </Card>

          <AnalyticsChart
            title="Investor Engagement Funnel"
            subtitle="Real database event breakdown"
            data={[
              { label: 'Investor Interest Received', count: engagement.interestsCount || 0 },
              { label: 'Accepted Interest Threads', count: engagement.acceptedInterests || 0 },
              { label: 'Scheduled Pitch Meetings', count: engagement.meetingsCount || 0 },
              { label: 'Document Requests Received', count: engagement.documentRequestsCount || 0 },
            ]}
            color="emerald"
          />
        </div>
      )}
    </div>
  );
};

export default FounderAnalytics;
