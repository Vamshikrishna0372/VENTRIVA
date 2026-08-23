import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { GovernanceActivityTimeline } from '../../components/governance/GovernanceActivityTimeline';

import api from '../../services/api';

export const AdminGovernance = () => {
  const [analytics, setAnalytics] = useState(null);
  const [activity, setActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdminGovernanceData();
  }, []);

  const fetchAdminGovernanceData = async () => {
    setIsLoading(true);
    try {
      const [analyticsRes, actRes] = await Promise.all([
        api.get('/admin/governance/analytics'),
        api.get('/governance-activity'),
      ]);

      if (analyticsRes.data?.success) setAnalytics(analyticsRes.data.data);
      if (actRes.data?.success) setActivity(actRes.data.data || []);
    } catch (err) {
      console.error('Error fetching admin governance:', err);
    } finally {
      setIsLoading(false);
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Corporate Governance Oversight...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-rose-400" /> Platform Corporate Governance Oversight
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            System-wide oversight of active board compositions, scheduled meetings, resolution voting, and compliance status.
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={fetchAdminGovernanceData} className="flex items-center gap-1.5 self-start sm:self-auto">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Governance Data
        </Button>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-4 space-y-1 font-mono">
            <span className="text-[11px] text-slate-400">Active Boards</span>
            <p className="text-xl font-bold text-slate-100">{analytics.totalBoards}</p>
          </Card>

          <Card className="p-4 space-y-1 font-mono">
            <span className="text-[11px] text-slate-400">Scheduled Meetings</span>
            <p className="text-xl font-bold text-emerald-400">{analytics.upcomingMeetings}</p>
          </Card>

          <Card className="p-4 space-y-1 font-mono">
            <span className="text-[11px] text-slate-400">Pending Resolutions</span>
            <p className="text-xl font-bold text-amber-400">{analytics.pendingResolutions}</p>
          </Card>

          <Card className="p-4 space-y-1 font-mono">
            <span className="text-[11px] text-slate-400">Active Shareholders</span>
            <p className="text-xl font-bold text-purple-300">{analytics.totalShareholders}</p>
          </Card>
        </div>
      )}

      {/* Audit Timeline */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
          System-Wide Governance Audit Stream
        </h3>
        <GovernanceActivityTimeline activities={activity} />
      </div>
    </div>
  );
};

export default AdminGovernance;
