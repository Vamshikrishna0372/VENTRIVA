import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Calendar, Vote, Briefcase, Plus, Loader2, PieChart, Activity } from 'lucide-react';
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

  useEffect(() => {
    fetchGovernanceData();
  }, []);

  const fetchGovernanceData = async () => {
    setIsLoading(true);
    try {
      const [bRes, sRes, mRes, rRes, caRes, stRes, epRes, compRes, actRes] = await Promise.all([
        api.get('/board'),
        api.get('/shareholders'),
        api.get('/board-meetings'),
        api.get('/board-resolutions'),
        api.get('/corporate-actions'),
        api.get('/share-transfers'),
        api.get('/equity-pools'),
        api.get('/compliance'),
        api.get('/governance-activity'),
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
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <ShieldCheck className="w-7 h-7 text-emerald-400" /> Corporate Governance Workspace
        </h1>
        <p className="text-sm text-slate-400">
          Manage board directors, shareholder registry, meetings, resolutions, voting workflows, secondary share transfers, ESOP option pools, and compliance.
        </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {boardData?.members?.map((m) => (
              <BoardMemberCard key={m._id} member={m} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'shareholders' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shareholders.map((s) => (
            <ShareholderCard key={s._id} shareholder={s} />
          ))}
        </div>
      )}

      {activeTab === 'meetings' && (
        <div className="space-y-4">
          {meetings.map((m) => (
            <BoardMeetingCard key={m._id} meeting={m} />
          ))}
        </div>
      )}

      {activeTab === 'resolutions' && (
        <div className="space-y-4">
          {resolutions.map((r) => (
            <ResolutionCard key={r._id} resolution={r} onVote={(res) => setVotingResolution(res)} />
          ))}
        </div>
      )}

      {activeTab === 'actions' && (
        <div className="space-y-4">
          {corporateActions.map((ca) => (
            <CorporateActionCard key={ca._id} action={ca} />
          ))}
        </div>
      )}

      {activeTab === 'transfers' && (
        <div className="space-y-4">
          {shareTransfers.map((st) => (
            <ShareTransferCard key={st._id} transfer={st} onExecute={handleExecuteTransfer} />
          ))}
        </div>
      )}

      {activeTab === 'esop' && (
        <div className="space-y-4">
          {equityPools.map((ep) => (
            <EquityPoolCard key={ep._id} pool={ep} onAllocate={handleAllocateOptions} />
          ))}
        </div>
      )}

      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <ComplianceProgressCard metrics={complianceData.metrics} />
          <div className="space-y-3">
            {complianceData.items.map((ci) => (
              <ComplianceCard key={ci._id} item={ci} onComplete={handleCompleteCompliance} />
            ))}
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
    </div>
  );
};

export default FounderGovernance;
