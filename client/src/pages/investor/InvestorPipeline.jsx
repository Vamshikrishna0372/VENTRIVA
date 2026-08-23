import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Columns, List, Search, Filter, Compass, AlertTriangle, Clock, DollarSign, Plus, Loader2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

import PipelineCard from '../../components/investor/PipelineCard';
import { PIPELINE_STAGES, PIPELINE_PRIORITIES, PIPELINE_STATUSES } from '../../utils/pipelineConstants';
import { getMyPipelines, getPipelineAnalytics, updatePipelineStage } from '../../services/pipelineService';

export const InvestorPipeline = () => {
  const [pipelines, setPipelines] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & View State
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' vs 'list'
  const [mobileStageTab, setMobileStageTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [followUpFilter, setFollowUpFilter] = useState('all');

  useEffect(() => {
    fetchPipelineData();
  }, [priorityFilter, statusFilter, followUpFilter]);

  const fetchPipelineData = async () => {
    setIsLoading(true);
    try {
      const [pipeRes, analyticsRes] = await Promise.all([
        getMyPipelines({
          priority: priorityFilter,
          status: statusFilter,
          followUp: followUpFilter,
          search: searchTerm,
        }),
        getPipelineAnalytics(),
      ]);

      if (pipeRes?.success && Array.isArray(pipeRes.pipelines)) {
        setPipelines(pipeRes.pipelines);
      }
      if (analyticsRes?.success && analyticsRes?.analytics) {
        setAnalytics(analyticsRes.analytics);
      }
    } catch (err) {
      console.error('Error fetching pipeline data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStageChange = async (startupId, newStage) => {
    try {
      await updatePipelineStage(startupId, newStage);
      // Optimistically update local pipelines state
      setPipelines((prev) =>
        prev.map((item) =>
          item.startup._id === startupId ? { ...item, stage: newStage } : item
        )
      );
      // Refresh aggregate analytics
      const analyticsRes = await getPipelineAnalytics();
      if (analyticsRes?.success && analyticsRes?.analytics) {
        setAnalytics(analyticsRes.analytics);
      }
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to update deal stage');
      fetchPipelineData();
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPipelineData();
  };

  const formattedTotalValue =
    analytics?.totalPipelineValue > 0
      ? `$${(analytics.totalPipelineValue / 1000000).toFixed(2)}M`
      : '$0';

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-100">Deal Pipeline Workspace</h1>
              <Badge variant="brand">{analytics?.activeCount || 0} Active Deals</Badge>
            </div>
            <p className="text-sm text-slate-400">
              Track investment opportunities across 9 pipeline stages, manage priorities, and schedule follow-ups.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex gap-1">
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  viewMode === 'kanban' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Kanban Board View"
              >
                <Columns className="w-4 h-4" /> Board
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  viewMode === 'list' ? 'bg-brand-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" /> List
              </button>
            </div>

            <Link to="/investor/discover">
              <Button variant="primary" size="sm" icon={Compass}>
                Add Deals
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search deal pipeline..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl pl-10 pr-3 py-2 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </form>

          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            options={[{ value: 'all', label: 'All Priorities' }, ...PIPELINE_PRIORITIES.map((p) => ({ value: p, label: `${p} Priority` }))]}
          />

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[{ value: 'all', label: 'All Statuses' }, ...PIPELINE_STATUSES.map((s) => ({ value: s, label: `${s} Status` }))]}
          />

          <Select
            value={followUpFilter}
            onChange={(e) => setFollowUpFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Follow-ups' },
              { value: 'dueToday', label: 'Due Today' },
              { value: 'overdue', label: 'Overdue' },
            ]}
          />
        </div>
      </div>

      {/* Pipeline Analytics Metrics Bar */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Card hoverEffect={false} className="p-3 text-center">
            <p className="text-[10px] font-mono text-slate-400 uppercase">Expected Pipeline Value</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">{formattedTotalValue}</p>
          </Card>
          <Card hoverEffect={false} className="p-3 text-center">
            <p className="text-[10px] font-mono text-slate-400 uppercase">High Priority Deals</p>
            <p className="text-2xl font-extrabold text-rose-400 mt-1">{analytics.highPriorityCount}</p>
          </Card>
          <Card hoverEffect={false} className="p-3 text-center">
            <p className="text-[10px] font-mono text-slate-400 uppercase">Due Diligence</p>
            <p className="text-2xl font-extrabold text-indigo-400 mt-1">{analytics.dueDiligenceCount}</p>
          </Card>
          <Card hoverEffect={false} className="p-3 text-center">
            <p className="text-[10px] font-mono text-slate-400 uppercase">Follow-ups Due Today</p>
            <p className="text-2xl font-extrabold text-amber-400 mt-1">{analytics.followUpDueTodayCount}</p>
          </Card>
          <Card hoverEffect={false} className="p-3 text-center">
            <p className="text-[10px] font-mono text-slate-400 uppercase">Overdue Follow-ups</p>
            <p className="text-2xl font-extrabold text-rose-500 mt-1">{analytics.followUpOverdueCount}</p>
          </Card>
        </div>
      )}

      {/* Main Content Area */}
      {isLoading ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Loading Deal Pipeline...</p>
        </div>
      ) : pipelines.length === 0 ? (
        <Card className="text-center py-16 px-4 space-y-4">
          <Columns className="w-12 h-12 text-slate-500 mx-auto" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-100">No Deals in Pipeline</h3>
            <p className="text-xs text-slate-400">
              Add shortlisted or evaluated startup ventures to your deal tracking pipeline to begin stage management.
            </p>
          </div>
          <Link to="/investor/discover">
            <Button variant="primary" size="sm" icon={Compass}>
              Discover Startups & Add to Pipeline
            </Button>
          </Link>
        </Card>
      ) : viewMode === 'kanban' ? (
        /* KANBAN BOARD VIEW */
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x">
          {PIPELINE_STAGES.map((stageName) => {
            const stageDeals = pipelines.filter((p) => p.stage === stageName);
            const stageValue = stageDeals.reduce((sum, item) => sum + (item.expectedInvestment || 0), 0);

            return (
              <div key={stageName} className="w-80 shrink-0 bg-slate-950 border border-slate-800/80 rounded-2xl p-3 space-y-3 snap-start">
                {/* Column Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 px-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-200 text-xs">{stageName}</h3>
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-semibold">
                      {stageDeals.length}
                    </span>
                  </div>
                  {stageValue > 0 && (
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      ${(stageValue / 1000).toFixed(0)}K
                    </span>
                  )}
                </div>

                {/* Column Cards List */}
                <div className="space-y-3 min-h-[150px]">
                  {stageDeals.length === 0 ? (
                    <div className="h-24 rounded-xl border border-dashed border-slate-800/80 flex items-center justify-center text-[11px] text-slate-500 italic">
                      No deals in {stageName}
                    </div>
                  ) : (
                    stageDeals.map((item) => (
                      <PipelineCard
                        key={item._id}
                        pipeline={item}
                        onStageChange={handleStageChange}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST / COMPACT VIEW */
        <div className="space-y-4">
          {/* Mobile Stage Selector Tabs */}
          <div className="flex overflow-x-auto gap-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setMobileStageTab('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                mobileStageTab === 'all' ? 'bg-brand-500 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              All Stages ({pipelines.length})
            </button>
            {PIPELINE_STAGES.map((stg) => {
              const count = pipelines.filter((p) => p.stage === stg).length;
              return (
                <button
                  key={stg}
                  onClick={() => setMobileStageTab(stg)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    mobileStageTab === stg ? 'bg-brand-500 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {stg} ({count})
                </button>
              );
            })}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pipelines
              .filter((p) => mobileStageTab === 'all' || p.stage === mobileStageTab)
              .map((item) => (
                <PipelineCard
                  key={item._id}
                  pipeline={item}
                  onStageChange={handleStageChange}
                />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorPipeline;
