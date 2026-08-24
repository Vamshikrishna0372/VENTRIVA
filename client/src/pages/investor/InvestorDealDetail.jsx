import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Loader2,
  Briefcase,
  RefreshCw,
  ArrowLeft,
  Columns,
  ShieldCheck,
  Building2,
  PieChart,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import DealHeader from '../../components/deals/DealHeader';
import TermSheetCard from '../../components/deals/TermSheetCard';
import TermSheetModal from '../../components/deals/TermSheetModal';
import AddMilestoneModal from '../../components/deals/AddMilestoneModal';
import DealMilestoneList from '../../components/deals/DealMilestoneList';
import DealActivityTimeline from '../../components/deals/DealActivityTimeline';

import { getDealById, archiveDeal } from '../../services/dealService';
import { getTermSheetsForDeal, proposeTermSheet, acceptTermSheet, declineTermSheet, withdrawTermSheet } from '../../services/termSheetService';
import { getMilestonesForDeal, createMilestone, updateMilestoneStatus, deleteMilestone } from '../../services/dealMilestoneService';
import { getDealActivities } from '../../services/dealActivityService';
import { createInvestmentFromDeal } from '../../services/investmentService';

export const InvestorDealDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deal, setDeal] = useState(null);
  const [termSheets, setTermSheets] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isTermSheetModalOpen, setIsTermSheetModalOpen] = useState(false);
  const [isAddMilestoneModalOpen, setIsAddMilestoneModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchDealDetails();
  }, [id]);

  const fetchDealDetails = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const [dRes, tRes, mRes, aRes] = await Promise.all([
        getDealById(id),
        getTermSheetsForDeal(id),
        getMilestonesForDeal(id),
        getDealActivities(id),
      ]);

      if (dRes?.success) setDeal(dRes.data);
      if (tRes?.success) setTermSheets(tRes.data);
      if (mRes?.success) setMilestones(mRes.data);
      if (aRes?.success) setActivities(aRes.data);
    } catch (err) {
      console.error('Error fetching deal room details:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvertToInvestment = async () => {
    setIsConverting(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await createInvestmentFromDeal(id, { ownershipPercentage: 10 });
      if (res?.success && res?.data) {
        setFeedback({ type: 'success', message: 'Deal successfully converted to portfolio investment holding!' });
        navigate(`/investor/portfolio/${res.data._id}`);
      } else {
        setFeedback({ type: 'error', message: res?.message || 'Failed to convert deal to portfolio investment' });
      }
    } catch (err) {
      console.error('Error converting deal to portfolio holding:', err);
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Error converting deal to portfolio investment' });
    } finally {
      setIsConverting(false);
    }
  };

  const handleProposeTermSheet = async (termSheetData) => {
    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await proposeTermSheet(id, termSheetData);
      if (res?.success) {
        setFeedback({ type: 'success', message: 'Term sheet proposed successfully!' });
        setIsTermSheetModalOpen(false);
        fetchDealDetails();
      } else {
        setFeedback({ type: 'error', message: res?.message || 'Failed to propose term sheet' });
      }
    } catch (err) {
      console.error('Error proposing term sheet:', err);
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Error proposing term sheet' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptTermSheet = async (termSheetId) => {
    setFeedback({ type: '', message: '' });
    try {
      const res = await acceptTermSheet(id, termSheetId);
      if (res?.success) {
        setFeedback({ type: 'success', message: 'Term sheet accepted! Deal status updated.' });
        fetchDealDetails();
      } else {
        setFeedback({ type: 'error', message: res?.message || 'Failed to accept term sheet' });
      }
    } catch (err) {
      console.error('Error accepting term sheet:', err);
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Error accepting term sheet' });
    }
  };

  const handleDeclineTermSheet = async (termSheet) => {
    const reason = window.prompt('Please enter decline / counter-proposal notes:', 'Valuation counter-offer required');
    if (reason !== null) {
      setFeedback({ type: '', message: '' });
      try {
        const res = await declineTermSheet(id, termSheet._id, reason);
        if (res?.success) {
          setFeedback({ type: 'success', message: 'Term sheet declined. Negotiation notes updated.' });
          fetchDealDetails();
        } else {
          setFeedback({ type: 'error', message: res?.message || 'Failed to decline term sheet' });
        }
      } catch (err) {
        console.error('Error declining term sheet:', err);
        setFeedback({ type: 'error', message: err.response?.data?.message || 'Error declining term sheet' });
      }
    }
  };

  const handleWithdrawTermSheet = async (termSheetId) => {
    setFeedback({ type: '', message: '' });
    try {
      const res = await withdrawTermSheet(id, termSheetId);
      if (res?.success) {
        setFeedback({ type: 'success', message: 'Term sheet proposal withdrawn.' });
        fetchDealDetails();
      } else {
        setFeedback({ type: 'error', message: res?.message || 'Failed to withdraw term sheet' });
      }
    } catch (err) {
      console.error('Error withdrawing term sheet:', err);
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Error withdrawing term sheet' });
    }
  };

  const handleCreateMilestone = async (milestoneData) => {
    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await createMilestone(id, milestoneData);
      if (res?.success) {
        setFeedback({ type: 'success', message: 'Closing milestone added successfully.' });
        setIsAddMilestoneModalOpen(false);
        fetchDealDetails();
      } else {
        setFeedback({ type: 'error', message: res?.message || 'Failed to create milestone' });
      }
    } catch (err) {
      console.error('Error creating milestone:', err);
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Error creating milestone' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleMilestone = async (milestoneId, status) => {
    setFeedback({ type: '', message: '' });
    try {
      const res = await updateMilestoneStatus(id, milestoneId, status);
      if (res?.success) {
        setFeedback({ type: 'success', message: `Milestone status updated to ${status}.` });
        fetchDealDetails();
      }
    } catch (err) {
      console.error('Error updating milestone status:', err);
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Error updating milestone' });
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    setFeedback({ type: '', message: '' });
    try {
      const res = await deleteMilestone(id, milestoneId);
      if (res?.success) {
        setFeedback({ type: 'success', message: 'Milestone removed.' });
        fetchDealDetails();
      }
    } catch (err) {
      console.error('Error deleting milestone:', err);
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Error deleting milestone' });
    }
  };

  const handleArchiveDeal = async () => {
    if (window.confirm('Are you sure you want to archive this Deal Room?')) {
      setFeedback({ type: '', message: '' });
      try {
        const res = await archiveDeal(id);
        if (res?.success) {
          setFeedback({ type: 'success', message: 'Deal Room archived.' });
          fetchDealDetails();
        }
      } catch (err) {
        console.error('Error archiving deal:', err);
        setFeedback({ type: 'error', message: err.response?.data?.message || 'Error archiving deal' });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Opening Deal Room Workspace...</p>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <p className="text-sm font-semibold text-slate-300">Deal Record Unavailable</p>
        <p className="text-xs text-slate-400">The requested deal room record does not exist or is no longer accessible.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
        <Link to="/investor/deals" className="text-xs text-slate-400 hover:text-slate-100 flex items-center gap-1.5 font-mono">
          <ArrowLeft className="w-4 h-4" /> Back to Deal Rooms
        </Link>
        <div className="flex items-center gap-2">
          <Button onClick={fetchDealDetails} icon={RefreshCw} variant="outline" size="xs">
            Refresh
          </Button>
        </div>
      </div>

      <DealHeader
        deal={deal}
        userRole="investor"
        onArchive={handleArchiveDeal}
        onProposeTermSheet={() => setIsTermSheetModalOpen(true)}
      />

      {feedback.message && (
        <div className={`p-4 rounded-xl border text-xs flex items-center gap-2.5 ${
          feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {isError && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>Failed to load deal room data. Please try again.</span>
          </div>
          <Button variant="outline" size="xs" onClick={fetchDealDetails}>Retry</Button>
        </div>
      )}

      {/* Convert to Portfolio CTA if Term Sheet Accepted or Deal Active */}
      {(deal.status === 'Term Sheet Accepted' || deal.status === 'Invested') && (
        <div className="bg-emerald-950/40 border border-emerald-500/40 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-100 text-sm">Deal Ready for Portfolio Conversion</h3>
            <p className="text-xs text-slate-400">Term sheet accepted. Convert this deal into an active portfolio company holding.</p>
          </div>
          <Button variant="primary" size="sm" icon={Briefcase} isLoading={isConverting} onClick={handleConvertToInvestment}>
            Convert to Investment Portfolio
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Term Sheets & Milestones */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-100">Term Sheet Proposals</h2>
            {termSheets.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400">
                No term sheet proposed yet. Click "Propose Term Sheet" above to submit an initial proposal.
              </div>
            ) : (
              termSheets.map((ts) => (
                <TermSheetCard
                  key={ts._id}
                  termSheet={ts}
                  currentUserId={user?._id}
                  onAccept={handleAcceptTermSheet}
                  onDecline={handleDeclineTermSheet}
                  onWithdraw={handleWithdrawTermSheet}
                />
              ))
            )}
          </div>

          <DealMilestoneList
            milestones={milestones}
            onCreate={handleCreateMilestone}
            onToggle={handleToggleMilestone}
            onDelete={handleDeleteMilestone}
            onOpenAddModal={() => setIsAddMilestoneModalOpen(true)}
          />
        </div>

        {/* Right Column: Activity Timeline */}
        <div>
          <DealActivityTimeline activities={activities} />
        </div>
      </div>

      <TermSheetModal
        isOpen={isTermSheetModalOpen}
        onClose={() => setIsTermSheetModalOpen(false)}
        onSubmit={handleProposeTermSheet}
        isSubmitting={isSubmitting}
      />

      <AddMilestoneModal
        isOpen={isAddMilestoneModalOpen}
        onClose={() => setIsAddMilestoneModalOpen(false)}
        onSubmit={handleCreateMilestone}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default InvestorDealDetail;

