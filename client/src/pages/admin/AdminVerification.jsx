import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, XCircle, ShieldCheck, Building2, Eye, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

import { getAdminStartups, updateStartupVerification } from '../../services/adminService';

export const AdminVerification = () => {
  const [startups, setStartups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchVerificationQueue();
  }, []);

  const fetchVerificationQueue = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAdminStartups({ limit: 100 });
      if (res?.success && Array.isArray(res.startups)) {
        setStartups(res.startups);
      } else {
        setError('Unable to load verification queue. Please try again.');
      }
    } catch (err) {
      console.error('Error loading verification queue:', err);
      setError(err?.response?.data?.message || 'Unable to load verification queue. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (startupId, name) => {
    if (!window.confirm(`Approve official verification badge for ${name}?`)) return;
    setIsSubmitting(true);
    try {
      await updateStartupVerification(startupId, 'Verified');
      fetchVerificationQueue();
    } catch (err) {
      alert('Failed to verify startup');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async (startupId) => {
    if (!rejectReason.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }
    setIsSubmitting(true);
    try {
      await updateStartupVerification(startupId, 'Rejected', rejectReason.trim());
      setRejectingId(null);
      setRejectReason('');
      fetchVerificationQueue();
    } catch (err) {
      alert('Failed to reject verification');
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingList = startups.filter((s) => !s.isVerified && s.verificationStatus !== 'Verified' && s.verificationStatus !== 'Rejected');
  const verifiedList = startups.filter((s) => s.isVerified || s.verificationStatus === 'Verified');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Startup Verification Queue</h1>
            <p className="text-sm text-slate-400">Review founder applications, audit traction metrics, and grant verified status badges.</p>
          </div>
          <Badge variant="amber">{pendingList.length} Awaiting Audit</Badge>
        </div>
      </div>

      {/* Error State */}
      {error ? (
        <Card className="text-center py-12 px-4 space-y-4 border-rose-500/30 bg-rose-500/5">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-100">Failed to Load Verification Queue</h3>
            <p className="text-xs text-rose-300">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchVerificationQueue}>
            Retry Request
          </Button>
        </Card>
      ) : isLoading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Loading Verification Queue...</p>
        </div>
      ) : pendingList.length === 0 ? (
        <Card className="text-center py-16 px-4 space-y-4">
          <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-100">Verification Queue Clear</h3>
            <p className="text-xs text-slate-400">All submitted startup profiles have been audited and processed.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Pending Audit Submissions ({pendingList.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingList.map((startup) => (
              <div key={startup._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-100 text-base">{startup.startupName}</h3>
                      <p className="text-xs text-slate-400 font-mono">{startup.sector} • {startup.stage}</p>
                    </div>
                    <Badge variant="amber">Pending Audit</Badge>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2">{startup.tagline}</p>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1">
                    <p><strong>Founder:</strong> {startup.founder?.name} ({startup.founder?.email})</p>
                    <p><strong>Completion:</strong> {startup.profileCompletion}%</p>
                  </div>

                  {rejectingId === startup._id && (
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <textarea
                        rows={2}
                        placeholder="Reason for rejection..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl border border-slate-800 p-2 focus:outline-none focus:ring-1 focus:ring-rose-500"
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setRejectingId(null)}>Cancel</Button>
                        <Button variant="rose" size="sm" isLoading={isSubmitting} onClick={() => handleReject(startup._id)}>Confirm Reject</Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <Link to={`/admin/startups/${startup._id}`}>
                    <Button variant="outline" size="sm" icon={Eye}>
                      Review Details
                    </Button>
                  </Link>

                  {rejectingId !== startup._id && (
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" icon={XCircle} onClick={() => setRejectingId(startup._id)}>
                        Reject
                      </Button>
                      <Button variant="emerald" size="sm" icon={CheckCircle2} isLoading={isSubmitting} onClick={() => handleApprove(startup._id, startup.startupName)}>
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVerification;
