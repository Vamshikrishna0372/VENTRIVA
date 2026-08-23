import React, { useState, useEffect } from 'react';
import { Server, Database, HardDrive, Activity, ShieldAlert, Cpu, RefreshCw, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import MetricCard from '../../components/analytics/MetricCard';
import api from '../../services/api';

export const AdminSystemHealth = () => {
  const [healthData, setHealthData] = useState(null);
  const [metricsData, setMetricsData] = useState(null);
  const [jobsData, setJobsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSystemDiagnostics();
  }, []);

  const fetchSystemDiagnostics = async () => {
    setIsLoading(true);
    try {
      const [hRes, mRes, jRes] = await Promise.all([
        api.get('/admin/system/health'),
        api.get('/admin/system/metrics'),
        api.get('/admin/system/jobs'),
      ]);

      if (hRes?.data?.success) setHealthData(hRes.data.data);
      if (mRes?.data?.success) setMetricsData(mRes.data.data);
      if (jRes?.data?.success) setJobsData(jRes.data.data);
    } catch (err) {
      console.error('Error fetching admin system diagnostics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Querying System Health Diagnostics...</p>
      </div>
    );
  }

  const { application = {}, database = {}, storage = {} } = healthData || {};
  const metrics = metricsData || {};
  const jobs = jobsData || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-100">System Operations & Reliability</h1>
              <Badge variant="brand">LIVE DIAGNOSTICS</Badge>
            </div>
            <p className="text-sm text-slate-400">Real-time operational monitoring of API server, MongoDB connection, storage, latency, and background jobs.</p>
          </div>

          <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchSystemDiagnostics}>
            Refresh Diagnostics
          </Button>
        </div>
      </div>

      {/* Primary Component Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardBody className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-400">API Server</span>
              <Server className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-lg font-bold text-slate-100">Operational</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">Uptime: {application.uptimeSeconds}s | Env: {application.environment}</p>
          </CardBody>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardBody className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-400">Database (MongoDB)</span>
              <Database className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${database.status === 'ready' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span className="text-lg font-bold text-slate-100 capitalize">{database.status || 'Unknown'}</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">State: {database.state}</p>
          </CardBody>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardBody className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-400">Virtual Data Room Storage</span>
              <HardDrive className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${storage.status === 'ready' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span className="text-lg font-bold text-slate-100 capitalize">{storage.status || 'Unknown'}</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">Upload Layer Active</p>
          </CardBody>
        </Card>
      </div>

      {/* Operational Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard title="Total HTTP Requests" value={metrics.totalRequests || 0} subtitle="Since server start" icon={Activity} color="brand" />
        <MetricCard title="Avg API Latency" value={`${metrics.avgResponseTimeMs || 0}ms`} subtitle="Response duration" icon={Cpu} color="emerald" />
        <MetricCard title="Rate Limit Events" value={metrics.rateLimitEvents || 0} subtitle="HTTP 429 triggered" icon={ShieldAlert} color="amber" />
        <MetricCard title="Auth Failures" value={metrics.authFailures || 0} subtitle="HTTP 401/403 events" icon={ShieldAlert} color="rose" />
      </div>

      {/* Background Jobs Diagnostics */}
      <Card>
        <CardHeader title="Background Job Scheduler" subtitle="Maintenance workers status" />
        <CardBody className="space-y-3">
          <div className="flex items-center justify-between text-xs bg-slate-950 p-3.5 rounded-xl border border-slate-800">
            <div>
              <p className="font-bold text-slate-200">Cron Scheduler Status</p>
              <p className="text-[11px] text-slate-400">Last execution: {jobs.lastExecutionAt ? new Date(jobs.lastExecutionAt).toLocaleString() : 'Never'}</p>
            </div>
            <Badge variant={jobs.isRunning ? 'emerald' : 'slate'}>
              {jobs.isRunning ? 'RUNNING' : 'STOPPED'}
            </Badge>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AdminSystemHealth;
