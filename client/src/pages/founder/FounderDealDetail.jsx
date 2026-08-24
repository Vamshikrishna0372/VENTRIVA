import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
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

export const FounderDealDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [deal, setDeal] = useState(null);
  const [termSheets, setTermSheets] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTermSheetModalOpen, setIsTermSheetModalOpen] = useState(false);
  const [isAddMilestoneModalOpen, setIsAddMilestoneModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDealDetails();
  }, [id]);

  const fetchDealDetails = async () => {
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleProposeTermSheet = async (termSheetData) => {
    setIsSubmitting(true);
    try {
      const res = await proposeTermSheet(id, termSheetData);
      if (res?.success) {
        setIsTermSheetModalOpen(false);
        fetchDealDetails();
      }
    } catch (err) {
      console.error('Error proposing term sheet:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAcceptTermSheet = async (termSheetId) => {
    try {
      const res = await acceptTermSheet(id, termSheetId);
      if (res?.success) fetchDealDetails();
    } catch (err) {
      console.error('Error accepting term sheet:', err);
    }
  };

  const handleDeclineTermSheet = async (termSheet) => {
    const reason = window.prompt('Please enter decline / counter-proposal notes:', 'Valuation counter-offer required');
    if (reason !== null) {
      try {
        const res = await declineTermSheet(id, termSheet._id, reason);
        if (res?.success) fetchDealDetails();
      } catch (err) {
        console.error('Error declining term sheet:', err);
      }
    }
  };

  const handleWithdrawTermSheet = async (termSheetId) => {
    try {
      const res = await withdrawTermSheet(id, termSheetId);
      if (res?.success) fetchDealDetails();
    } catch (err) {
      console.error('Error withdrawing term sheet:', err);
    }
  };

  const handleCreateMilestone = async (milestoneData) => {
    setIsSubmitting(true);
    try {
      const res = await createMilestone(id, milestoneData);
      if (res?.success) {
        setIsAddMilestoneModalOpen(false);
        fetchDealDetails();
      }
    } catch (err) {
      console.error('Error creating milestone:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleMilestone = async (milestoneId, status) => {
    try {
      const res = await updateMilestoneStatus(id, milestoneId, status);
      if (res?.success) fetchDealDetails();
    } catch (err) {
      console.error('Error updating milestone status:', err);
    }
  };

  const handleDeleteMilestone = async (milestoneId) => {
    try {
      const res = await deleteMilestone(id, milestoneId);
      if (res?.success) fetchDealDetails();
    } catch (err) {
      console.error('Error deleting milestone:', err);
    }
  };

  const handleArchiveDeal = async () => {
    if (window.confirm('Are you sure you want to archive this Deal Room?')) {
      try {
        const res = await archiveDeal(id);
        if (res?.success) fetchDealDetails();
      } catch (err) {
        console.error('Error archiving deal:', err);
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
      <DealHeader
        deal={deal}
        userRole="founder"
        onArchive={handleArchiveDeal}
        onProposeTermSheet={() => setIsTermSheetModalOpen(true)}
      />

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

export default FounderDealDetail;
