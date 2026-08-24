import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Loader2,
  RefreshCw,
  PieChart,
  Building2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Target,
  FileText,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
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
  const [investments, setInvestments] = useState([]);
  const [selectedStartupId, setSelectedStartupId] = useState('');
  const [boardData, setBoardData] = useState(null);
  const [shareholders, setShareholders] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [resolutions, setResolutions] = useState([]);
  const [rights, setRights] = useState([]);
  const [activity, setActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [votingResolution, setVotingResolution] = useState(null);

  useEffect(() => {
    fetchPortfolioVentures();
  }, []);

  useEffect(() => {
    fetchInvestorGovernanceData(selectedStartupId);
  }, [selectedStartupId]);

  const fetchPortfolioVentures = async () => {
    try {
      const res = await api.get('/investments');
      if (res.data?.success && res.data?.data?.length > 0) {
        setInvestments(res.data.data);
        const firstStartup = res.data.data[0].startup?._id || res.data.data[0].startup;
        if (firstStartup) setSelectedStartupId(firstStartup);
      }
    } catch (err) {
      console.error('Error fetching investor portfolio ventures:', err);
    }
  };

  const fetchInvestorGovernanceData = async (startupId = '') => {
    setIsLoading(true);
    setIsError(false);
    try {
      const queryParam = startupId ? `?startupId=${startupId}` : '';
      const [bRes, sRes, mRes, rRes, grRes, actRes] = await Promise.all([
        api.get(`/board${queryParam}`),
        api.get(`/shareholders${queryParam}`),
        api.get(`/board-meetings${queryParam}`),
        api.get(`/board-resolutions${queryParam}`),
        api.get(`/governance-rights${queryParam}`),
        api.get(`/governance-activity${queryParam}`),
      ]);

      if (bRes.data?.success) setBoardData(bRes.data.data);
      if (sRes.data?.success) setShareholders(sRes.data.data || []);
      if (mRes.data?.success) setMeetings(mRes.data.data || []);
      if (rRes.data?.success) setResolutions(rRes.data.data || []);
      if (grRes.data?.success) setRights(grRes.data.data || []);
      if (actRes.data?.success) setActivity(actRes.data.data || []);
    } catch (err) {
      console.error('Error fetching investor governance data:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCastVote = async (resolutionId, vote, comment) => {
    setFeedback({ type: '', message: '' });
    try {
      const res = await api.post(`/board-resolutions/${resolutionId}/vote`, { vote, comment });
      if (res.data?.success) {
        setFeedback({ type: 'success', message: `Vote '${vote}' cast and recorded successfully!` });
        setVotingResolution(null);
        fetchInvestorGovernanceData(selectedStartupId);
      } else {
        setFeedback({ type: 'error', message: res.data?.message || 'Failed to record vote' });
      }
    } catch (err) {
      console.error('Error casting vote:', err);
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message || 'Server error recording vote' });
    }
  };

  if (isLoading && !boardData && investments.length === 0) {
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
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
              <ShieldCheck className="w-7 h-7 text-purple-400" /> Portfolio Venture Corporate Governance
            </h1>
            <p className="text-sm text-slate-400">
              Review board representation, participate in board resolutions, cast votes, track governance rights, and monitor compliance.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => fetchInvestorGovernanceData(selectedStartupId)} icon={RefreshCw} variant="outline" size="sm">
              Refresh Portal
            </Button>
          </div>
        </div>

        {/* Connected Workflows Quick Bar */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
          <Link to="/investor/cap-table" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <PieChart className="w-3.5 h-3.5 text-brand-400" /> Cap Table Ownership
          </Link>
          <Link to="/investor/portfolio" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Venture Portfolio
          </Link>
          <Link to="/investor/portfolio/scenarios" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-cyan-400" /> Scenario Simulations
          </Link>
          <Link to="/investor/closings" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Closings Pipeline
          </Link>
        </div>
      </div>

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
            <span>Failed to load governance dataset. Please try again.</span>
          </div>
          <Button variant="outline" size="xs" onClick={() => fetchInvestorGovernanceData(selectedStartupId)}>Retry</Button>
        </div>
      )}

      {/* Portfolio Venture Selection Selector */}
      {investments.length > 0 && (
        <div className="flex items-center gap-3 bg-slate-900 p-3.5 rounded-xl border border-slate-800 text-xs font-mono">
          <span className="text-slate-400">Select Portfolio Venture:</span>
          <select
            value={selectedStartupId}
            onChange={(e) => setSelectedStartupId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-100 focus:border-brand-500 focus:outline-none"
          >
            <option value="">All Portfolio Ventures</option>
            {investments.map((inv) => {
              const s = inv.startup || {};
              return (
                <option key={inv._id} value={s._id || s}>
                  {s.startupName || s.companyName || 'Portfolio Venture'}
                </option>
              );
            })}
          </select>
        </div>
      )}

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
          {resolutions.length === 0 ? (
            <Card className="text-center py-8 text-xs text-slate-400 border-slate-800 bg-slate-900">
              No active board resolutions pending vote.
            </Card>
          ) : (
            resolutions.map((r) => (
              <ResolutionCard key={r._id} resolution={r} onVote={(res) => setVotingResolution(res)} />
            ))
          )}
        </div>
      )}

      {activeTab === 'meetings' && (
        <div className="space-y-4">
          {meetings.length === 0 ? (
            <Card className="text-center py-8 text-xs text-slate-400 border-slate-800 bg-slate-900">
              No scheduled board meetings recorded.
            </Card>
          ) : (
            meetings.map((m) => (
              <BoardMeetingCard key={m._id} meeting={m} />
            ))
          )}
        </div>
      )}

      {activeTab === 'rights' && <GovernanceRightsCard rights={rights} />}

      {activeTab === 'shareholders' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shareholders.length === 0 ? (
            <div className="col-span-2 text-center py-8 text-xs text-slate-400">
              No shareholder records found.
            </div>
          ) : (
            shareholders.map((s) => (
              <ShareholderCard key={s._id} shareholder={s} />
            ))
          )}
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

