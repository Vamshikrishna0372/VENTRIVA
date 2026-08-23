import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Calendar, Vote, Briefcase, Plus, Loader2, PieChart, Activity, X } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ShareholderCard } from '../../components/governance/ShareholderCard';
import { BoardMemberCard } from '../../components/governance/BoardMemberCard';
import { BoardCompositionCard } from '../../components/governance/BoardCompositionCard';
import { BoardMeetingCard } from '../../components/governance/BoardMeetingCard';
import { ResolutionCard } from '../../components/governance/ResolutionCard';
import { VotingPanel } from '../../components/governance/VotingPanel';
import { CorporateActionCard } from '../../components/governance/CorporateActionCard';
import { ShareTransferCard } from '../../components/governance/ShareTransferCard';
import { EquityPoolCard } from '../../components/governance/EquityPoolCard';
import { ComplianceCard } from '../../components/governance/ComplianceCard';
import { ComplianceProgressCard } from '../../components/governance/ComplianceProgressCard';
import { GovernanceActivityTimeline } from '../../components/governance/GovernanceActivityTimeline';
import api from '../../services/api';

export const FounderGovernance = () => {
  const [activeTab, setActiveTab] = useState('board');
  const [startup, setStartup] = useState(null);
  const [boardData, setBoardData] = useState(null);
  const [shareholders, setShareholders] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [resolutions, setResolutions] = useState([]);
  const [corporateActions, setCorporateActions] = useState([]);
  const [shareTransfers, setShareTransfers] = useState([]);
  const [equityPools, setEquityPools] = useState([]);
  const [complianceData, setComplianceData] = useState({ items: [], metrics: null });
  const [activity, setActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [votingResolution, setVotingResolution] = useState(null);

  // Modals state
  const [showAddDirectorModal, setShowAddDirectorModal] = useState(false);
  const [showAddShareholderModal, setShowAddShareholderModal] = useState(false);
  const [showScheduleMeetingModal, setShowScheduleMeetingModal] = useState(false);
  const [showProposeResolutionModal, setShowProposeResolutionModal] = useState(false);
  const [showProposeTransferModal, setShowProposeTransferModal] = useState(false);
  const [showAddComplianceModal, setShowAddComplianceModal] = useState(false);

  // Form states
  const [directorForm, setDirectorForm] = useState({ role: 'Founder Director', appointmentReason: 'Founding Equity Governance Seat' });
  const [shareholderForm, setShareholderForm] = useState({ holderName: '', holderType: 'Founder', shareClass: 'Common Stock', sharesOwned: 1000000 });
  const [meetingForm, setMeetingForm] = useState({ title: '', meetingType: 'Regular', scheduledDate: '', location: 'Virtual Video Conference', agendaText: 'Quarterly Strategic Update & Cap Table Review' });
  const [resolutionForm, setResolutionForm] = useState({ title: '', description: '', resolutionType: 'Strategic Decision', requiredApprovalPercentage: 51 });
  const [transferForm, setTransferForm] = useState({ fromShareholderId: '', buyerName: '', shares: 100000, shareClass: 'Common Stock', pricePerShare: 1 });
  const [complianceForm, setComplianceForm] = useState({ title: '', category: 'Corporate', dueDate: '', notes: '' });

  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    fetchGovernanceData();
  }, []);

  const fetchGovernanceData = async () => {
    setIsLoading(true);
    try {
      const startupRes = await api.get('/startups/my');
      const startupObj = startupRes.data?.startup;
      setStartup(startupObj);

      const startupId = startupObj?._id;
      const params = startupId ? { params: { startupId } } : {};

      const [bRes, sRes, mRes, rRes, caRes, stRes, epRes, compRes, actRes] = await Promise.all([
        api.get('/board', params),
        api.get('/shareholders', params),
        api.get('/board-meetings', params),
        api.get('/board-resolutions', params),
        api.get('/corporate-actions', params),
        api.get('/share-transfers', params),
        api.get('/equity-pools', params),
        api.get('/compliance', params),
        api.get('/governance-activity', params),
      ]);

      if (bRes.data?.success) setBoardData(bRes.data.data);
      if (sRes.data?.success) setShareholders(sRes.data.data || []);
      if (mRes.data?.success) setMeetings(mRes.data.data || []);
      if (rRes.data?.success) setResolutions(rRes.data.data || []);
      if (caRes.data?.success) setCorporateActions(caRes.data.data || []);
      if (stRes.data?.success) setShareTransfers(stRes.data.data || []);
      if (epRes.data?.success) setEquityPools(epRes.data.data || []);
      if (compRes.data?.success) setComplianceData({ items: compRes.data.data || [], metrics: compRes.data.metrics });
      if (actRes.data?.success) setActivity(actRes.data.data || []);
    } catch (err) {
      console.error('Error fetching founder governance data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCastVote = async (resolutionId, vote, comment) => {
    try {
      const res = await api.post(`/board-resolutions/${resolutionId}/vote`, { vote, comment });
      if (res.data?.success) fetchGovernanceData();
    } catch (err) {
      console.error('Error casting vote:', err);
    }
  };

  const handleExecuteTransfer = async (transferId) => {
    try {
      const res = await api.post(`/share-transfers/${transferId}/execute`);
      if (res.data?.success) fetchGovernanceData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAllocateOptions = async (poolId, sharesToAllocate, recipientName) => {
    try {
      const res = await api.post(`/equity-pools/${poolId}/allocate`, { sharesToAllocate, recipientName });
      if (res.data?.success) fetchGovernanceData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteCompliance = async (itemId) => {
    try {
      const res = await api.patch(`/compliance/${itemId}/status`, { status: 'Completed' });
      if (res.data?.success) fetchGovernanceData();
    } catch (err) {
      console.error(err);
    }
  };

  // Modal Handlers
  const handleAddDirector = async (e) => {
    e.preventDefault();
    if (!startup?._id) return;
    setModalSubmitting(true);
    setModalError('');
    try {
      await api.post('/board', { startupId: startup._id, ...directorForm });
      setShowAddDirectorModal(false);
      fetchGovernanceData();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to appoint board director');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleAddShareholder = async (e) => {
    e.preventDefault();
    if (!startup?._id) return;
    setModalSubmitting(true);
    setModalError('');
    try {
      await api.post('/shareholders', { startupId: startup._id, ...shareholderForm });
      setShowAddShareholderModal(false);
      fetchGovernanceData();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to add shareholder');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    if (!startup?._id) return;
    setModalSubmitting(true);
    setModalError('');
    try {
      await api.post('/board-meetings', {
        startupId: startup._id,
        title: meetingForm.title,
        meetingType: meetingForm.meetingType,
        scheduledDate: meetingForm.scheduledDate,
        location: meetingForm.location,
        agenda: [{ itemNumber: 1, title: meetingForm.agendaText, allocatedMinutes: 30 }],
      });
      setShowScheduleMeetingModal(false);
      fetchGovernanceData();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to schedule meeting');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleProposeResolution = async (e) => {
    e.preventDefault();
    if (!startup?._id) return;
    setModalSubmitting(true);
    setModalError('');
    try {
      await api.post('/board-resolutions', { startupId: startup._id, ...resolutionForm });
      setShowProposeResolutionModal(false);
      fetchGovernanceData();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to propose resolution');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleProposeTransfer = async (e) => {
    e.preventDefault();
    if (!startup?._id) return;
    setModalSubmitting(true);
    setModalError('');
    try {
      await api.post('/share-transfers', {
        startupId: startup._id,
        fromShareholder: transferForm.fromShareholderId,
        buyerName: transferForm.buyerName,
        shares: Number(transferForm.shares),
        shareClass: transferForm.shareClass,
        pricePerShare: Number(transferForm.pricePerShare),
      });
      setShowProposeTransferModal(false);
      fetchGovernanceData();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to propose share transfer');
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleAddCompliance = async (e) => {
    e.preventDefault();
    if (!startup?._id) return;
    setModalSubmitting(true);
    setModalError('');
    try {
      await api.post('/compliance', { startupId: startup._id, ...complianceForm });
      setShowAddComplianceModal(false);
      fetchGovernanceData();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to add compliance item');
    } finally {
      setModalSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Corporate Governance Workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-emerald-400" /> Corporate Governance Workspace
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage board directors, shareholder registry, meetings, resolutions, voting workflows, secondary share transfers, ESOP option pools, and compliance for {startup?.companyName || 'your startup'}.
          </p>
        </div>

        {/* Dynamic Action Button based on Active Tab */}
        <div>
          {activeTab === 'board' && (
            <Button variant="brand" onClick={() => setShowAddDirectorModal(true)} icon={Plus}>
              Appoint Director
            </Button>
          )}
          {activeTab === 'shareholders' && (
            <Button variant="brand" onClick={() => setShowAddShareholderModal(true)} icon={Plus}>
              Add Shareholder
            </Button>
          )}
          {activeTab === 'meetings' && (
            <Button variant="brand" onClick={() => setShowScheduleMeetingModal(true)} icon={Calendar}>
              Schedule Meeting
            </Button>
          )}
          {activeTab === 'resolutions' && (
            <Button variant="brand" onClick={() => setShowProposeResolutionModal(true)} icon={Vote}>
              Propose Resolution
            </Button>
          )}
          {activeTab === 'transfers' && (
            <Button variant="brand" onClick={() => setShowProposeTransferModal(true)} icon={Briefcase}>
              Propose Share Transfer
            </Button>
          )}
          {activeTab === 'compliance' && (
            <Button variant="brand" onClick={() => setShowAddComplianceModal(true)} icon={Plus}>
              Add Compliance Item
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-800 text-xs font-semibold no-scrollbar">
        {[
          { key: 'board', label: 'Board Directors' },
          { key: 'shareholders', label: `Shareholders (${shareholders.length})` },
          { key: 'meetings', label: `Meetings (${meetings.length})` },
          { key: 'resolutions', label: `Resolutions (${resolutions.length})` },
          { key: 'actions', label: 'Corporate Actions' },
          { key: 'transfers', label: 'Share Transfers' },
          { key: 'esop', label: 'ESOP Option Pools' },
          { key: 'compliance', label: 'Legal Compliance' },
          { key: 'audit', label: 'Governance Audit' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 px-4 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key ? 'border-brand-500 text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Panes */}
      {activeTab === 'board' && (
        <div className="space-y-6">
          <BoardCompositionCard composition={boardData} />
          {boardData?.members?.length === 0 ? (
            <Card className="p-6 text-center text-xs text-slate-400">No board directors appointed yet. Click "Appoint Director" to assign founder, investor, or independent board seats.</Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {boardData?.members?.map((m) => (
                <BoardMemberCard key={m._id} member={m} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'shareholders' && (
        <div>
          {shareholders.length === 0 ? (
            <Card className="p-6 text-center text-xs text-slate-400">No shareholder records registered yet.</Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shareholders.map((s) => (
                <ShareholderCard key={s._id} shareholder={s} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'meetings' && (
        <div className="space-y-4">
          {meetings.length === 0 ? (
            <Card className="p-6 text-center text-xs text-slate-400">No board meetings scheduled yet.</Card>
          ) : (
            meetings.map((m) => <BoardMeetingCard key={m._id} meeting={m} />)
          )}
        </div>
      )}

      {activeTab === 'resolutions' && (
        <div className="space-y-4">
          {resolutions.length === 0 ? (
            <Card className="p-6 text-center text-xs text-slate-400">No board resolutions proposed yet.</Card>
          ) : (
            resolutions.map((r) => <ResolutionCard key={r._id} resolution={r} onVote={(res) => setVotingResolution(res)} />)
          )}
        </div>
      )}

      {activeTab === 'actions' && (
        <div className="space-y-4">
          {corporateActions.length === 0 ? (
            <Card className="p-6 text-center text-xs text-slate-400">No corporate actions recorded yet.</Card>
          ) : (
            corporateActions.map((ca) => <CorporateActionCard key={ca._id} action={ca} />)
          )}
        </div>
      )}

      {activeTab === 'transfers' && (
        <div className="space-y-4">
          {shareTransfers.length === 0 ? (
            <Card className="p-6 text-center text-xs text-slate-400">No secondary share transfer proposals recorded.</Card>
          ) : (
            shareTransfers.map((st) => <ShareTransferCard key={st._id} transfer={st} onExecute={handleExecuteTransfer} />)
          )}
        </div>
      )}

      {activeTab === 'esop' && (
        <div className="space-y-4">
          {equityPools.length === 0 ? (
            <Card className="p-6 text-center text-xs text-slate-400">No equity option pools created yet.</Card>
          ) : (
            equityPools.map((ep) => <EquityPoolCard key={ep._id} pool={ep} onAllocate={handleAllocateOptions} />)
          )}
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <ComplianceProgressCard metrics={complianceData.metrics} />
          <div className="space-y-3">
            {complianceData.items.length === 0 ? (
              <Card className="p-6 text-center text-xs text-slate-400">No compliance items recorded.</Card>
            ) : (
              complianceData.items.map((ci) => <ComplianceCard key={ci._id} item={ci} onComplete={handleCompleteCompliance} />)
            )}
          </div>
        </div>
      )}

      {activeTab === 'audit' && <GovernanceActivityTimeline activities={activity} />}

      {/* Voting Modal */}
      {votingResolution && (
        <VotingPanel
          resolution={votingResolution}
          onSubmitVote={handleCastVote}
          onClose={() => setVotingResolution(null)}
        />
      )}

      {/* Modal: Appoint Board Director */}
      {showAddDirectorModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm">Appoint Board Director</h3>
              <button onClick={() => setShowAddDirectorModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            {modalError && <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">{modalError}</div>}
            <form onSubmit={handleAddDirector} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Director Role *</label>
                <select
                  value={directorForm.role}
                  onChange={(e) => setDirectorForm({ ...directorForm, role: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
                >
                  <option value="Founder Director">Founder Director</option>
                  <option value="Investor Director">Investor Director</option>
                  <option value="Independent Director">Independent Director</option>
                  <option value="Observer">Board Observer</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Appointment Reason *</label>
                <input
                  type="text"
                  value={directorForm.appointmentReason}
                  onChange={(e) => setDirectorForm({ ...directorForm, appointmentReason: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowAddDirectorModal(false)}>Cancel</Button>
                <Button type="submit" variant="brand" disabled={modalSubmitting}>
                  {modalSubmitting ? 'Appointing...' : 'Appoint Director'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Shareholder */}
      {showAddShareholderModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm">Add Shareholder</h3>
              <button onClick={() => setShowAddShareholderModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            {modalError && <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">{modalError}</div>}
            <form onSubmit={handleAddShareholder} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Shareholder Name *</label>
                <input
                  type="text"
                  value={shareholderForm.holderName}
                  onChange={(e) => setShareholderForm({ ...shareholderForm, holderName: e.target.value })}
                  placeholder="e.g. Ventriva Capital Fund I"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Role/Type</label>
                  <select
                    value={shareholderForm.holderType}
                    onChange={(e) => setShareholderForm({ ...shareholderForm, holderType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
                  >
                    <option value="Founder">Founder</option>
                    <option value="Investor">Investor</option>
                    <option value="Employee">Employee/ESOP</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Share Class</label>
                  <select
                    value={shareholderForm.shareClass}
                    onChange={(e) => setShareholderForm({ ...shareholderForm, shareClass: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
                  >
                    <option value="Common Stock">Common Stock</option>
                    <option value="Preferred Stock">Preferred Stock</option>
                    <option value="Options">Options</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Shares Owned *</label>
                <input
                  type="number"
                  value={shareholderForm.sharesOwned}
                  onChange={(e) => setShareholderForm({ ...shareholderForm, sharesOwned: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
                  required
                  min="1"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowAddShareholderModal(false)}>Cancel</Button>
                <Button type="submit" variant="brand" disabled={modalSubmitting}>
                  {modalSubmitting ? 'Adding...' : 'Add Shareholder'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Schedule Board Meeting */}
      {showScheduleMeetingModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm">Schedule Board Meeting</h3>
              <button onClick={() => setShowScheduleMeetingModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            {modalError && <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">{modalError}</div>}
            <form onSubmit={handleScheduleMeeting} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Meeting Title *</label>
                <input
                  type="text"
                  value={meetingForm.title}
                  onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                  placeholder="e.g. Q3 2026 Board of Directors Meeting"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Meeting Type</label>
                  <select
                    value={meetingForm.meetingType}
                    onChange={(e) => setMeetingForm({ ...meetingForm, meetingType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Special">Special</option>
                    <option value="Annual General">Annual General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Date *</label>
                  <input
                    type="date"
                    value={meetingForm.scheduledDate}
                    onChange={(e) => setMeetingForm({ ...meetingForm, scheduledDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Agenda Summary</label>
                <input
                  type="text"
                  value={meetingForm.agendaText}
                  onChange={(e) => setMeetingForm({ ...meetingForm, agendaText: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowScheduleMeetingModal(false)}>Cancel</Button>
                <Button type="submit" variant="brand" disabled={modalSubmitting}>
                  {modalSubmitting ? 'Scheduling...' : 'Schedule Meeting'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Propose Resolution */}
      {showProposeResolutionModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm">Propose Board Resolution</h3>
              <button onClick={() => setShowProposeResolutionModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            {modalError && <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">{modalError}</div>}
            <form onSubmit={handleProposeResolution} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Resolution Title *</label>
                <input
                  type="text"
                  value={resolutionForm.title}
                  onChange={(e) => setResolutionForm({ ...resolutionForm, title: e.target.value })}
                  placeholder="e.g. Approval of Series Seed Financing Terms"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Description *</label>
                <textarea
                  value={resolutionForm.description}
                  onChange={(e) => setResolutionForm({ ...resolutionForm, description: e.target.value })}
                  placeholder="Details of the proposal for board voting..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500 h-20"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowProposeResolutionModal(false)}>Cancel</Button>
                <Button type="submit" variant="brand" disabled={modalSubmitting}>
                  {modalSubmitting ? 'Proposing...' : 'Propose Resolution'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Propose Share Transfer */}
      {showProposeTransferModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm">Propose Secondary Share Transfer</h3>
              <button onClick={() => setShowProposeTransferModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            {modalError && <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">{modalError}</div>}
            <form onSubmit={handleProposeTransfer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Seller Shareholder *</label>
                <select
                  value={transferForm.fromShareholderId}
                  onChange={(e) => setTransferForm({ ...transferForm, fromShareholderId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
                  required
                >
                  <option value="">-- Select Seller Shareholder --</option>
                  {shareholders.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.holderName} ({s.sharesOwned?.toLocaleString()} shares - {s.ownershipPercentage}%)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Buyer Name *</label>
                <input
                  type="text"
                  value={transferForm.buyerName}
                  onChange={(e) => setTransferForm({ ...transferForm, buyerName: e.target.value })}
                  placeholder="e.g. Ventriva Strategic Fund II"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Shares to Transfer *</label>
                  <input
                    type="number"
                    value={transferForm.shares}
                    onChange={(e) => setTransferForm({ ...transferForm, shares: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Price Per Share ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={transferForm.pricePerShare}
                    onChange={(e) => setTransferForm({ ...transferForm, pricePerShare: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
                    required
                    min="0.01"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowProposeTransferModal(false)}>Cancel</Button>
                <Button type="submit" variant="brand" disabled={modalSubmitting}>
                  {modalSubmitting ? 'Proposing...' : 'Propose Share Transfer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Compliance Item */}
      {showAddComplianceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-sm">Add Compliance Record</h3>
              <button onClick={() => setShowAddComplianceModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            {modalError && <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">{modalError}</div>}
            <form onSubmit={handleAddCompliance} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Compliance Item Title *</label>
                <input
                  type="text"
                  value={complianceForm.title}
                  onChange={(e) => setComplianceForm({ ...complianceForm, title: e.target.value })}
                  placeholder="e.g. Annual Shareholder Meeting Filing"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Category</label>
                  <select
                    value={complianceForm.category}
                    onChange={(e) => setComplianceForm({ ...complianceForm, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
                  >
                    <option value="Corporate">Corporate</option>
                    <option value="Tax & Financial">Tax & Financial</option>
                    <option value="Regulatory">Regulatory</option>
                    <option value="IP & Legal">IP & Legal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Due Date *</label>
                  <input
                    type="date"
                    value={complianceForm.dueDate}
                    onChange={(e) => setComplianceForm({ ...complianceForm, dueDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-brand-500"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowAddComplianceModal(false)}>Cancel</Button>
                <Button type="submit" variant="brand" disabled={modalSubmitting}>
                  {modalSubmitting ? 'Adding...' : 'Add Item'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FounderGovernance;
