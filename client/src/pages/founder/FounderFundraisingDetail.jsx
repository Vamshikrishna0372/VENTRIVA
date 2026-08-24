import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Target,
  Loader2,
  ArrowLeft,
  Play,
  CheckCircle,
  XCircle,
  Mail,
  FileText,
  Plus,
  Users,
  Activity,
  Award,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { RoundStatusBadge } from '../../components/fundraising/RoundStatusBadge';
import { FundraisingProgressCard } from '../../components/fundraising/FundraisingProgressCard';
import { CommitmentCard } from '../../components/fundraising/CommitmentCard';
import { FundraisingMilestoneList } from '../../components/fundraising/FundraisingMilestoneList';
import { FundraisingActivityTimeline } from '../../components/fundraising/FundraisingActivityTimeline';
import { RoundAnalyticsCard } from '../../components/fundraising/RoundAnalyticsCard';
import { formatCurrency } from '../../utils/fundraisingConstants';
import api from '../../services/api';

export const FounderFundraisingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roundData, setRoundData] = useState(null);
  const [commitments, setCommitments] = useState([]);
  const [invites, setInvites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  // Modals
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteInvestorId, setInviteInvestorId] = useState('');
  const [investorList, setInvestorList] = useState([]);
  const [isInvestorsLoading, setIsInvestorsLoading] = useState(false);
  const [inviteModalError, setInviteModalError] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    fetchRoundDetail();
    fetchInvestors();
  }, [id]);

  const fetchRoundDetail = async () => {
    setIsLoading(true);
    try {
      const [roundRes, commRes, invRes] = await Promise.all([
        api.get(`/fundraising-rounds/${id}`),
        api.get(`/fundraising-rounds/${id}/commitments`),
        api.get(`/fundraising-rounds/${id}/invites`),
      ]);

      if (roundRes.data?.success) setRoundData(roundRes.data.data);
      if (commRes.data?.success) setCommitments(commRes.data.data || []);
      if (invRes.data?.success) setInvites(invRes.data.data || []);
    } catch (err) {
      console.error('Error loading round detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInvestors = async () => {
    setIsInvestorsLoading(true);
    setInviteModalError('');
    try {
      const res = await api.get('/investors');
      if (res.data?.success && Array.isArray(res.data?.data)) {
        setInvestorList(res.data.data);
      } else if (res.data?.success && Array.isArray(res.data?.investors)) {
        setInvestorList(res.data.investors);
      }
    } catch (err) {
      setInviteModalError(err.response?.data?.message || 'Unable to load investors for round invitation');
    } finally {
      setIsInvestorsLoading(false);
    }
  };

  const handleStatusTransition = async (actionEndpoint) => {
    try {
      const res = await api.post(`/fundraising-rounds/${id}/${actionEndpoint}`);
      if (res.data?.success) {
        setActionMessage({ type: 'success', text: `Round status updated to ${res.data.data.status}` });
        fetchRoundDetail();
      } else {
        setActionMessage({ type: 'error', text: res.data?.message || 'Action failed' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Server error during status transition' });
    }
  };

  const handleAcceptCommitment = async (commitmentId) => {
    try {
      const res = await api.post(`/commitments/${commitmentId}/accept`);
      if (res.data?.success) {
        setActionMessage({ type: 'success', text: 'Commitment accepted successfully' });
        fetchRoundDetail();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeclineCommitment = async (commitmentId) => {
    try {
      const res = await api.post(`/commitments/${commitmentId}/decline`);
      if (res.data?.success) {
        setActionMessage({ type: 'success', text: 'Commitment declined' });
        fetchRoundDetail();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkFunded = async (commitmentId) => {
    try {
      const res = await api.post(`/commitments/${commitmentId}/mark-funded`);
      if (res.data?.success) {
        setActionMessage({ type: 'success', text: 'Commitment marked as funded' });
        fetchRoundDetail();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenDealRoom = async (commitment) => {
    try {
      const res = await api.post(`/commitments/${commitment._id}/open-deal-room`);
      if (res.data?.success && res.data?.data) {
        navigate(`/founder/deals/${res.data.data._id}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteInvestorId) {
      setInviteModalError('Please select an investor to invite.');
      return;
    }
    setIsInviting(true);
    setInviteModalError('');

    try {
      const res = await api.post(`/fundraising-rounds/${id}/invites`, {
        investorId: inviteInvestorId,
        message: inviteMessage ? inviteMessage.trim() : '',
      });

      if (res.data?.success) {
        setShowInviteModal(false);
        setInviteMessage('');
        setInviteInvestorId('');
        setActionMessage({ type: 'success', text: 'Investor invitation sent successfully' });
        fetchRoundDetail();
      } else {
        setInviteModalError(res.data?.message || 'Failed to send invite');
      }
    } catch (err) {
      setInviteModalError(err.response?.data?.message || err.message || 'Failed to send invite');
    } finally {
      setIsInviting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Round Management Center...</p>
      </div>
    );
  }

  if (!roundData) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm text-slate-400">Round not found.</p>
        <Link to="/founder/fundraising">
          <Button size="sm" variant="brand">
            Return to Fundraising
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4">
        <Link to="/founder/fundraising" className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 font-mono">
          <ArrowLeft className="w-4 h-4" /> Back to Capital Raise Overview
        </Link>

        <div className="flex items-center gap-2">
          {roundData.status === 'Draft' && (
            <Button size="sm" variant="emerald" onClick={() => handleStatusTransition('open')} className="flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5" /> Launch / Open Round
            </Button>
          )}

          {['Open', 'Soft Commitments', 'In Due Diligence', 'Term Sheet Stage', 'Closing'].includes(roundData.status) && (
            <Button size="sm" variant="brand" onClick={() => handleStatusTransition('close')} className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> Close Fundraising Round
            </Button>
          )}

          {roundData.status !== 'Cancelled' && roundData.status !== 'Closed' && (
            <Button size="sm" variant="ghost" onClick={() => handleStatusTransition('cancel')} className="text-rose-400">
              <XCircle className="w-3.5 h-3.5" /> Cancel Round
            </Button>
          )}
        </div>
      </div>

      {actionMessage.text && (
        <div
          className={`p-3 rounded-xl text-xs ${
            actionMessage.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
          }`}
        >
          {actionMessage.text}
        </div>
      )}

      {/* Round Progress Visualizer */}
      <FundraisingProgressCard round={roundData} analytics={roundData.analytics} />

      {/* Analytics & Syndication Breakdown */}
      <RoundAnalyticsCard analytics={roundData.analytics} />

      {/* Action Toolbar */}
      <div className="flex items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-100">Syndicate & Investor Invitations</h3>
          <p className="text-xs text-slate-400">Identify target investors and send private round invitations.</p>
        </div>
        <Button variant="brand" size="sm" onClick={() => setShowInviteModal(true)} className="flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5" /> Invite Investor
        </Button>
      </div>

      {/* Commitments Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">
          Received Commitments ({commitments.length})
        </h3>

        {commitments.length === 0 ? (
          <Card className="p-6 text-center text-xs text-slate-400">No commitments received yet for this round.</Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commitments.map((commitment) => (
              <CommitmentCard
                key={commitment._id}
                commitment={commitment}
                userRole="founder"
                onAccept={handleAcceptCommitment}
                onDecline={handleDeclineCommitment}
                onMarkFunded={handleMarkFunded}
                onOpenDealRoom={handleOpenDealRoom}
              />
            ))}
          </div>
        )}
      </div>

      {/* Timeline Audit Log & Milestones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">Fundraising Milestones</h3>
          <FundraisingMilestoneList milestones={roundData.milestones || []} />
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">Audit Activity Trail</h3>
          <FundraisingActivityTimeline activities={roundData.activity || []} />
        </div>
      </div>

      {/* Invite Investor Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Invite Investor to Round</h3>

            <form onSubmit={handleSendInvite} className="space-y-4 text-xs">
              {inviteModalError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{inviteModalError}</span>
                </div>
              )}

              {(() => {
                const selectedInvite = invites.find(inv => {
                  const invId = inv.investor?._id || inv.investor;
                  return invId === inviteInvestorId;
                });
                if (selectedInvite) {
                  if (selectedInvite.status === 'Declined') {
                    return (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs">
                        Previous invitation was <strong>Declined</strong>. Submitting will resend a new invitation request to this investor.
                      </div>
                    );
                  }
                  if (selectedInvite.status === 'Pending') {
                    return (
                      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-blue-300 text-xs">
                        An invitation is currently <strong>Pending</strong> for this investor.
                      </div>
                    );
                  }
                  if (selectedInvite.status === 'Accepted') {
                    return (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs">
                        This investor has already <strong>Accepted</strong> the invitation to this round.
                      </div>
                    );
                  }
                }
                return null;
              })()}

              <div>
                <label className="block text-slate-300 font-medium mb-1">Select Investor *</label>
                <select
                  value={inviteInvestorId}
                  onChange={(e) => setInviteInvestorId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:border-brand-500 focus:outline-none"
                  required
                  disabled={isInvestorsLoading}
                >
                  <option value="">-- Choose Investor --</option>
                  {isInvestorsLoading ? (
                    <option disabled>Loading eligible investors...</option>
                  ) : investorList.length === 0 ? (
                    <option disabled>No eligible investors available</option>
                  ) : (
                    investorList.map((inv) => {
                      const invId = inv._id || inv.id || inv.user?._id;
                      const invName = inv.name || inv.user?.name || 'Platform Investor';
                      const invOrg = inv.organization || inv.companyName || inv.email || inv.user?.email || '';
                      return (
                        <option key={invId} value={invId}>
                          {invName} {invOrg ? `(${invOrg})` : ''}
                        </option>
                      );
                    })
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Personal Invitation Message</label>
                <textarea
                  rows={3}
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="We are raising our Seed round and would love for your firm to participate..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <Button type="button" variant="ghost" onClick={() => setShowInviteModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="brand" disabled={isInviting}>
                  {isInviting
                    ? 'Sending...'
                    : invites.some(inv => (inv.investor?._id || inv.investor) === inviteInvestorId && (inv.status === 'Declined' || inv.status === 'Expired'))
                    ? 'Resend Invitation'
                    : 'Send Invitation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FounderFundraisingDetail;
