import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { ShareholderCard } from '../../components/governance/ShareholderCard';
import { BoardMemberCard } from '../../components/governance/BoardMemberCard';
import { BoardCompositionCard } from '../../components/governance/BoardCompositionCard';
import { BoardMeetingCard } from '../../components/governance/BoardMeetingCard';
import { ResolutionCard } from '../../components/governance/ResolutionCard';
import { VotingPanel } from '../../components/governance/VotingPanel';
import { GovernanceRightsCard } from '../../components/governance/GovernanceRightsCard';
import { GovernanceActivityTimeline } from '../../components/governance/GovernanceActivityTimeline';
import api from '../../services/api';

export const InvestorGovernance = () => {
  const [activeTab, setActiveTab] = useState('board');
  const [boardData, setBoardData] = useState(null);
  const [shareholders, setShareholders] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [resolutions, setResolutions] = useState([]);
  const [rights, setRights] = useState([]);
  const [activity, setActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [votingResolution, setVotingResolution] = useState(null);

  useEffect(() => {
    fetchInvestorGovernanceData();
  }, []);

  const fetchInvestorGovernanceData = async () => {
    setIsLoading(true);
    try {
      const [bRes, sRes, mRes, rRes, grRes, actRes] = await Promise.all([
        api.get('/board'),
        api.get('/shareholders'),
        api.get('/board-meetings'),
        api.get('/board-resolutions'),
        api.get('/governance-rights'),
        api.get('/governance-activity'),
      ]);

      if (bRes.data?.success) setBoardData(bRes.data.data);
      if (sRes.data?.success) setShareholders(sRes.data.data || []);
      if (mRes.data?.success) setMeetings(mRes.data.data || []);
      if (rRes.data?.success) setResolutions(rRes.data.data || []);
      if (grRes.data?.success) setRights(grRes.data.data || []);
      if (actRes.data?.success) setActivity(actRes.data.data || []);
    } catch (err) {
      console.error('Error fetching investor governance data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCastVote = async (resolutionId, vote, comment) => {
    try {
      const res = await api.post(`/board-resolutions/${resolutionId}/vote`, { vote, comment });
      if (res.data?.success) fetchInvestorGovernanceData();
    } catch (err) {
      console.error('Error casting vote:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Investor Governance Portal...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2">
        <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
          <ShieldCheck className="w-7 h-7 text-purple-400" /> Portfolio Venture Corporate Governance
        </h1>
        <p className="text-sm text-slate-400">
          Review board representation, participate in board resolutions, cast votes, track governance rights, and monitor compliance.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-800 text-xs font-semibold no-scrollbar">
        {[
          { key: 'board', label: 'Board Composition' },
          { key: 'resolutions', label: `Pending Votes (${resolutions.length})` },
          { key: 'meetings', label: `Board Meetings (${meetings.length})` },
          { key: 'rights', label: 'Governance Rights' },
          { key: 'shareholders', label: 'Shareholders' },
          { key: 'audit', label: 'Governance Trail' },
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

      {/* Content */}
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

      {activeTab === 'resolutions' && (
        <div className="space-y-4">
          {resolutions.map((r) => (
            <ResolutionCard key={r._id} resolution={r} onVote={(res) => setVotingResolution(res)} />
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

      {activeTab === 'rights' && <GovernanceRightsCard rights={rights} />}

      {activeTab === 'shareholders' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shareholders.map((s) => (
            <ShareholderCard key={s._id} shareholder={s} />
          ))}
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

export default InvestorGovernance;
