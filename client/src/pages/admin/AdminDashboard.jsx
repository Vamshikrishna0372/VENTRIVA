import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  CheckCircle2,
  ShieldAlert,
  BarChart3,
  History,
  ArrowRight,
  TrendingUp,
  Clock,
  Loader2,
  Shield
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

import { getAdminDashboardMetrics } from '../../services/adminService';
import ActionCenterWidget from '../../components/common/ActionCenterWidget';

export const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAdminDashboardMetrics();
      if (res?.success && res?.metrics) {
        setMetrics(res.metrics);
      } else {
        setError('Unable to load administrative metrics. Please try again.');
      }
    } catch (err) {
      console.error('Error loading admin metrics:', err);
      setError(err?.response?.data?.message || 'Unable to load administrative metrics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Administrative Metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <p className="text-sm text-rose-400 font-semibold">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchMetrics}>
          Retry
        </Button>
      </div>
    );
  }

  const { users, startups, investorActivity, moderation, recentAuditLogs } = metrics || {};

  const formattedPipelineValue =
    investorActivity?.totalPipelineValue > 0
      ? `$${(investorActivity.totalPipelineValue / 1000000).toFixed(2)}M`
      : '$0';

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-100">Admin Control Center</h1>
            <Badge variant="rose">PLATFORM GOVERNANCE</Badge>
          </div>
          <p className="text-sm text-slate-400">
            Real-time platform monitoring, startup verification workflow, user moderation, and audit logs.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link to="/admin/verification">
            <Button variant="primary" size="sm" icon={CheckCircle2}>
              Verification Queue ({startups?.pendingVerification || 0})
            </Button>
          </Link>
          <Link to="/admin/users">
            <Button variant="outline" size="sm" icon={Users}>
              Manage Users
            </Button>
          </Link>
        </div>
      </div>

      {/* Role Action Center Widget */}
      <ActionCenterWidget />

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card hoverEffect={false} className="p-3.5 text-center">
          <p className="text-[10px] font-mono text-slate-400 uppercase">Total Users</p>
          <p className="text-2xl font-extrabold text-slate-100 mt-1">{users?.total || 0}</p>
          <p className="text-[10px] text-slate-400 mt-1">{users?.founders || 0}F • {users?.investors || 0}I</p>
        </Card>

        <Card hoverEffect={false} className="p-3.5 text-center">
          <p className="text-[10px] font-mono text-slate-400 uppercase">Total Startups</p>
          <p className="text-2xl font-extrabold text-brand-400 mt-1">{startups?.total || 0}</p>
          <p className="text-[10px] text-slate-400 mt-1">{startups?.published || 0} Published</p>
        </Card>

        <Card hoverEffect={false} className="p-3.5 text-center">
          <p className="text-[10px] font-mono text-slate-400 uppercase">Verified Startups</p>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1">{startups?.verified || 0}</p>
          <p className="text-[10px] text-amber-400 mt-1">{startups?.pendingVerification || 0} Pending</p>
        </Card>

        <Card hoverEffect={false} className="p-3.5 text-center">
          <p className="text-[10px] font-mono text-slate-400 uppercase">Evaluations</p>
          <p className="text-2xl font-extrabold text-indigo-400 mt-1">{investorActivity?.evaluations || 0}</p>
          <p className="text-[10px] text-slate-400 mt-1">Investor Scores</p>
        </Card>

        <Card hoverEffect={false} className="p-3.5 text-center">
          <p className="text-[10px] font-mono text-slate-400 uppercase">Pipeline Value</p>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1">{formattedPipelineValue}</p>
          <p className="text-[10px] text-slate-400 mt-1">{investorActivity?.activePipelines || 0} Active Deals</p>
        </Card>

        <Card hoverEffect={false} className="p-3.5 text-center">
          <p className="text-[10px] font-mono text-slate-400 uppercase">Open Moderation Flags</p>
          <p className="text-2xl font-extrabold text-rose-400 mt-1">{moderation?.openFlags || 0}</p>
          <p className="text-[10px] text-slate-400 mt-1">Pending Review</p>
        </Card>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Audit Log Activity Stream */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent Administrative Activity Stream"
            subtitle="Immutable real-time audit log of administrative actions"
          />
          <CardBody>
            {!recentAuditLogs || recentAuditLogs.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No administrative actions logged yet.</p>
            ) : (
              <div className="space-y-3">
                {recentAuditLogs.map((log) => (
                  <div key={log._id} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="brand" size="xs">{log.action}</Badge>
                        <span className="font-semibold text-slate-200">{log.description}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        By {log.admin?.name || 'Admin'} ({log.admin?.email || '—'})
                      </p>
                    </div>

                    <span className="text-[10px] font-mono text-slate-500 shrink-0">
                      {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}

                <div className="pt-2 flex justify-end">
                  <Link to="/admin/audit-logs" className="text-xs text-brand-400 hover:underline flex items-center gap-1 font-semibold">
                    View Full Audit History &rarr;
                  </Link>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Right Column: Platform Quick Actions & Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Governance Shortcuts" />
            <CardBody className="space-y-3">
              <Link to="/admin/verification" className="block">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 transition-all flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Startup Verification Queue</h4>
                    <p className="text-[11px] text-slate-400">{startups?.pendingVerification || 0} Submissions awaiting approval</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
              </Link>

              <Link to="/admin/users" className="block">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-brand-500/50 transition-all flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">User Account Governance</h4>
                    <p className="text-[11px] text-slate-400">Suspend/activate users & verify roles</p>
                  </div>
                  <Users className="w-4 h-4 text-brand-400" />
                </div>
              </Link>

              <Link to="/admin/moderation" className="block">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/50 transition-all flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Moderation Flag Center</h4>
                    <p className="text-[11px] text-slate-400">{moderation?.openFlags || 0} Reported items pending review</p>
                  </div>
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                </div>
              </Link>

              <Link to="/admin/analytics" className="block">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-all flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">Platform Analytics</h4>
                    <p className="text-[11px] text-slate-400">Sector breakdown & conversion metrics</p>
                  </div>
                  <BarChart3 className="w-4 h-4 text-indigo-400" />
                </div>
              </Link>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
