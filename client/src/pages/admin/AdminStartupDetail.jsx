import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Building2,
  Globe,
  MapPin,
  DollarSign,
  TrendingUp,
  Users,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

import { getAdminStartupById, updateStartupVerification, updateStartupPublication } from '../../services/adminService';

export const AdminStartupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [startup, setStartup] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verification Decision Modal / Form State
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchStartupDetail();
  }, [id]);

  const fetchStartupDetail = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminStartupById(id);
      if (res?.success && res?.startup) {
        setStartup(res.startup);
        setProfileCompletion(res.profileCompletion || null);
      }
    } catch (err) {
      console.error('Error fetching startup detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveVerification = async () => {
    if (!window.confirm(`Approve official verification badge for ${startup.startupName}?`)) return;
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await updateStartupVerification(startup._id, 'Verified');
      if (res?.success) {
        setFeedback({ type: 'success', message: 'Startup successfully verified!' });
        fetchStartupDetail();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err?.response?.data?.message || 'Failed to verify startup' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectVerification = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejecting verification.');
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await updateStartupVerification(startup._id, 'Rejected', rejectionReason.trim());
      if (res?.success) {
        setFeedback({ type: 'success', message: 'Verification rejected with reason recorded.' });
        setShowRejectInput(false);
        setRejectionReason('');
        fetchStartupDetail();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err?.response?.data?.message || 'Failed to reject verification' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePublication = async (isPublished, visibility) => {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await updateStartupPublication(startup._id, isPublished, visibility);
      if (res?.success) {
        setFeedback({ type: 'success', message: `Startup publication state updated` });
        fetchStartupDetail();
      }
    } catch (err) {
      setFeedback({ type: 'error', message: 'Failed to update publication state' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Venture Review Profile...</p>
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="text-center py-16 space-y-4">
        <Building2 className="w-12 h-12 text-slate-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-100">Venture Profile Unavailable</h2>
        <Button variant="primary" icon={ArrowLeft} onClick={() => navigate('/admin/startups')}>
          Back to Startup Governance
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back & Top Bar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/admin/startups')} />
            <h1 className="text-2xl font-bold text-slate-100">{startup.startupName}</h1>
            <Badge variant={startup.verificationStatus === 'Verified' ? 'emerald' : startup.verificationStatus === 'Rejected' ? 'rose' : 'amber'}>
              {startup.verificationStatus || 'Unverified'}
            </Badge>
            <Badge variant={startup.isPublished ? 'brand' : 'slate'}>
              {startup.isPublished ? 'Published' : 'Draft'}
            </Badge>
          </div>
          <p className="text-xs text-slate-400 font-mono ml-8">Founder: {startup.founder?.name} ({startup.founder?.email})</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {startup.verificationStatus !== 'Verified' && (
            <Button variant="emerald" size="sm" icon={CheckCircle2} isLoading={isSubmitting} onClick={handleApproveVerification}>
              Approve Verification
            </Button>
          )}

          {startup.verificationStatus !== 'Rejected' && (
            <Button variant="outline" size="sm" icon={XCircle} onClick={() => setShowRejectInput(!showRejectInput)}>
              Reject Verification
            </Button>
          )}

          <Button
            variant={startup.isPublished ? 'ghost' : 'primary'}
            size="sm"
            isLoading={isSubmitting}
            onClick={() => handleTogglePublication(!startup.isPublished, startup.isPublished ? 'Private' : 'Investors Only')}
          >
            {startup.isPublished ? 'Unpublish Venture' : 'Publish Venture'}
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Reject Verification Reason Drawer */}
      {showRejectInput && (
        <Card className="border-rose-500/40 bg-rose-500/5">
          <CardHeader title="Reject Startup Verification" subtitle="Provide a clear explanation for rejecting verification" />
          <CardBody className="space-y-3">
            <textarea
              rows={3}
              placeholder="e.g. Incomplete founder documentation or unverified business registration..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl border border-slate-800 p-3 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowRejectInput(false)}>
                Cancel
              </Button>
              <Button variant="rose" size="sm" isLoading={isSubmitting} onClick={handleRejectVerification}>
                Confirm Rejection
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Detailed Venture Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Executive Overview" />
            <CardBody>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {startup.description}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Traction & Revenue Audit" />
            <CardBody className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Monthly MRR</span>
                <span className="text-lg font-bold text-emerald-400 mt-0.5 block">${startup.monthlyRevenue ? startup.monthlyRevenue.toLocaleString() : '0'}</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Annual ARR</span>
                <span className="text-lg font-bold text-slate-100 mt-0.5 block">${startup.annualRevenue ? startup.annualRevenue.toLocaleString() : '0'}</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">MoM Growth</span>
                <span className="text-lg font-bold text-brand-400 mt-0.5 block">+{startup.revenueGrowth || 0}%</span>
              </div>
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-center">
                <span className="text-[10px] font-mono text-slate-400 uppercase block">Customer Count</span>
                <span className="text-lg font-bold text-slate-100 mt-0.5 block">{startup.customerCount || 0}</span>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Right Column: Profile Quality Score */}
        <div className="space-y-6">
          {profileCompletion && (
            <Card>
              <CardHeader title="Profile Quality Control" />
              <CardBody className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs font-mono text-slate-400">Total Completion Score:</span>
                  <span className="text-xl font-bold text-brand-400">{profileCompletion.totalCompletionPercentage}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-brand-500 h-2 rounded-full"
                    style={{ width: `${profileCompletion.totalCompletionPercentage}%` }}
                  />
                </div>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader title="Venture Taxonomy" />
            <CardBody className="space-y-2 text-xs">
              <p><strong>Sector:</strong> {startup.sector}</p>
              <p><strong>Stage:</strong> {startup.stage}</p>
              <p><strong>Business Model:</strong> {startup.businessModel}</p>
              <p><strong>Location:</strong> {startup.locationDisplay || 'Not specified'}</p>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminStartupDetail;
