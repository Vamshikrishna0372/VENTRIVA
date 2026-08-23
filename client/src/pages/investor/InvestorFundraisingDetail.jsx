import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Target,
  Loader2,
  ArrowLeft,
  DollarSign,
  FileText,
  Plus,
  GitPullRequest,
  CheckCircle2,
  ShieldCheck,
  Building2,
  ExternalLink,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { RoundStatusBadge } from '../../components/fundraising/RoundStatusBadge';
import { FundraisingProgressCard } from '../../components/fundraising/FundraisingProgressCard';
import { CommitmentModal } from '../../components/fundraising/CommitmentModal';
import { CommitmentCard } from '../../components/fundraising/CommitmentCard';
import { formatCurrency } from '../../utils/fundraisingConstants';
import api from '../../services/api';

export const InvestorFundraisingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roundData, setRoundData] = useState(null);
  const [myCommitment, setMyCommitment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCommitmentModal, setShowCommitmentModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchOpportunityDetails();
  }, [id]);

  const fetchOpportunityDetails = async () => {
    setIsLoading(true);
    try {
      const [roundRes, commRes] = await Promise.all([
        api.get(`/fundraising-rounds/${id}`),
        api.get(`/fundraising-rounds/${id}/commitments`),
      ]);

      if (roundRes.data?.success) setRoundData(roundRes.data.data);
      if (commRes.data?.success && commRes.data?.data?.length > 0) {
        setMyCommitment(commRes.data.data[0]);
      }
    } catch (err) {
      console.error('Error fetching opportunity detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommitmentSubmit = async (commitmentData) => {
    setIsSubmitting(true);
    setActionMessage({ type: '', text: '' });

    try {
      const isUpdate = !!myCommitment;
      const url = isUpdate ? `/commitments/${myCommitment._id}` : `/fundraising-rounds/${id}/commitments`;
      
      const res = isUpdate
        ? await api.patch(url, commitmentData)
        : await api.post(url, commitmentData);

      if (res.data?.success) {
        setShowCommitmentModal(false);
        setActionMessage({ type: 'success', text: `Commitment successfully ${isUpdate ? 'updated' : 'submitted'}!` });
        fetchOpportunityDetails();
      } else {
        setActionMessage({ type: 'error', text: res.data?.message || 'Commitment submission failed' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Network error submitting commitment' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdrawCommitment = async () => {
    if (!myCommitment) return;
    try {
      const res = await api.post(`/commitments/${myCommitment._id}/withdraw`);
      if (res.data?.success) {
        setActionMessage({ type: 'success', text: 'Commitment withdrawn' });
        fetchOpportunityDetails();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLaunchDueDiligence = () => {
    if (roundData?.startup?._id) {
      navigate(`/investor/due-diligence/${roundData.startup._id}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Round Parameters & Strategy Fit...</p>
      </div>
    );
  }

  if (!roundData) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-sm text-slate-400">Opportunity not found.</p>
        <Link to="/investor/fundraising">
          <Button size="sm" variant="brand">
            Back to Opportunities
          </Button>
        </Link>
      </div>
    );
  }

  const startup = roundData.startup || {};

  return (
    <div className="space-y-6">
      <Link to="/investor/fundraising" className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 font-mono">
        <ArrowLeft className="w-4 h-4" /> Back to Opportunities
      </Link>

      {actionMessage.text && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
            actionMessage.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
          }`}
        >
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Venture Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-300 font-bold text-lg">
            {(startup.startupName || startup.name || startup.companyName) ? (startup.startupName || startup.name || startup.companyName).charAt(0).toUpperCase() : <Building2 className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-100">{startup.startupName || startup.name || startup.companyName || 'Venture Startup'}</h1>
              <RoundStatusBadge status={roundData.status} />
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {startup.sector} • {startup.stage} Stage • {roundData.roundName} ({roundData.roundType})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" onClick={handleLaunchDueDiligence} className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Due Diligence Vault
          </Button>
          <Button variant="brand" size="sm" onClick={() => setShowCommitmentModal(true)} className="flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5" /> {myCommitment ? 'Update Commitment' : 'Submit Commitment'}
          </Button>
        </div>
      </div>

      {/* Capital Progress Card */}
      <FundraisingProgressCard round={roundData} analytics={roundData.analytics} />

      {/* Your Submitted Commitment */}
      {myCommitment && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">Your Submitted Commitment Record</h3>
          <CommitmentCard
            commitment={myCommitment}
            userRole="investor"
            onWithdraw={handleWithdrawCommitment}
          />
        </div>
      )}

      {/* Round Overview & Use of Funds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Target className="w-4 h-4 text-brand-400" /> Round Terms & Parameters
          </h3>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Target Raise</span>
              <span className="font-bold text-slate-100">{formatCurrency(roundData.targetAmount)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Pre-Money Valuation</span>
              <span className="font-bold text-slate-100">{formatCurrency(roundData.preMoneyValuation)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Minimum Check Size</span>
              <span className="font-bold text-slate-200">{formatCurrency(roundData.minimumTicketSize || 0)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-400">Target Ownership</span>
              <span className="font-bold text-slate-200">{roundData.targetOwnershipPercentage || 0}%</span>
            </div>
          </div>
        </Card>

        <Card className="p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" /> Planned Use of Capital
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 italic">
            "{roundData.useOfFunds || 'Use of funds details will be provided during formal due diligence.'}"
          </p>
        </Card>
      </div>

      {/* Commitment Modal */}
      <CommitmentModal
        isOpen={showCommitmentModal}
        onClose={() => setShowCommitmentModal(false)}
        onSubmit={handleCommitmentSubmit}
        round={roundData}
        existingCommitment={myCommitment}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default InvestorFundraisingDetail;
