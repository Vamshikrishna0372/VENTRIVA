import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardCheck,
  Search,
  Filter,
  Compass,
  Edit3,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Loader2,
  RefreshCw,
  Sparkles,
  Columns,
  Target,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Select } from '../../components/common/Select';
import { INVESTMENT_DECISIONS, EVALUATION_STATUSES, getScoreInterpretation } from '../../utils/evaluationConstants';
import { getMyEvaluations, getEvaluationAnalytics, deleteEvaluation } from '../../services/evaluationService';

export const InvestorEvaluationsDashboard = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [decisionFilter, setDecisionFilter] = useState('all');

  useEffect(() => {
    fetchEvaluationsData();
  }, [statusFilter, decisionFilter]);

  const fetchEvaluationsData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const [evalRes, analyticsRes] = await Promise.all([
        getMyEvaluations({ status: statusFilter, decision: decisionFilter, search: searchTerm }),
        getEvaluationAnalytics(),
      ]);

      if (evalRes?.success && Array.isArray(evalRes.evaluations)) {
        setEvaluations(evalRes.evaluations);
      }
      if (analyticsRes?.success && analyticsRes?.analytics) {
        setAnalytics(analyticsRes.analytics);
      }
    } catch (err) {
      console.error('Error fetching evaluations:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (startupId) => {
    if (!window.confirm('Are you sure you want to delete your private evaluation for this startup?')) return;
    setFeedback({ type: '', message: '' });
    try {
      const res = await deleteEvaluation(startupId);
      if (res?.success) {
        setFeedback({ type: 'success', message: 'Venture evaluation deleted successfully.' });
        fetchEvaluationsData();
      } else {
        setFeedback({ type: 'error', message: res?.message || 'Failed to delete evaluation' });
      }
    } catch (err) {
      console.error('Error deleting evaluation:', err);
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Error deleting evaluation' });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvaluationsData();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Private Venture Evaluation Hub</h1>
            <p className="text-sm text-slate-400">Review, score, and track confidential investment evaluations across shortlisted ventures.</p>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={fetchEvaluationsData} icon={RefreshCw} variant="outline" size="sm">
              Refresh
            </Button>
            <Link to="/investor/discover">
              <Button variant="primary" size="sm" icon={Compass}>
                Discover & Evaluate
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter & Search Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search evaluated startups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl pl-10 pr-3 py-2.5 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </form>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[{ value: 'all', label: 'All Evaluation Statuses' }, ...EVALUATION_STATUSES.map((s) => ({ value: s, label: s }))]}
          />

          <Select
            value={decisionFilter}
            onChange={(e) => setDecisionFilter(e.target.value)}
            options={[{ value: 'all', label: 'All Investment Decisions' }, ...INVESTMENT_DECISIONS.map((d) => ({ value: d, label: d }))]}
          />
        </div>

        {/* Connected Workflows Quick Bar */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
          <Link to="/investor/discover" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-brand-400" /> Discovery Engine
          </Link>
          <Link to="/investor/recommendations" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Recommendations
          </Link>
          <Link to="/investor/pipeline" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Columns className="w-3.5 h-3.5 text-emerald-400" /> Deal Pipeline
          </Link>
          <Link to="/investor/investment-decisions" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-indigo-400" /> Investment Decisions
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
            <span>Failed to load venture evaluations dataset. Please try again.</span>
          </div>
          <Button variant="outline" size="xs" onClick={fetchEvaluationsData}>Retry</Button>
        </div>
      )}

      {/* Analytics Summary Cards */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card hoverEffect={false} className="p-3 text-center">
            <p className="text-[10px] font-mono text-slate-400 uppercase">Total Evaluated</p>
            <p className="text-2xl font-extrabold text-slate-100 mt-1">{analytics.totalCount}</p>
          </Card>
          <Card hoverEffect={false} className="p-3 text-center">
            <p className="text-[10px] font-mono text-slate-400 uppercase">Completed</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">{analytics.completedCount}</p>
          </Card>
          <Card hoverEffect={false} className="p-3 text-center">
            <p className="text-[10px] font-mono text-slate-400 uppercase">Drafts</p>
            <p className="text-2xl font-extrabold text-amber-400 mt-1">{analytics.draftCount}</p>
          </Card>
          <Card hoverEffect={false} className="p-3 text-center">
            <p className="text-[10px] font-mono text-slate-400 uppercase">High Potential</p>
            <p className="text-2xl font-extrabold text-brand-400 mt-1">{analytics.highPotentialCount}</p>
          </Card>
          <Card hoverEffect={false} className="p-3 text-center">
            <p className="text-[10px] font-mono text-slate-400 uppercase">Interested</p>
            <p className="text-2xl font-extrabold text-indigo-400 mt-1">{analytics.interestedCount}</p>
          </Card>
          <Card hoverEffect={false} className="p-3 text-center">
            <p className="text-[10px] font-mono text-slate-400 uppercase">Avg Score</p>
            <p className="text-2xl font-extrabold text-slate-100 mt-1">{analytics.averageOverallScore}/10</p>
          </Card>
        </div>
      )}

      {/* Evaluations List */}
      {isLoading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Loading Venture Evaluations...</p>
        </div>
      ) : evaluations.length === 0 ? (
        <Card className="text-center py-16 px-4 space-y-4 border-slate-800 bg-slate-900">
          <ClipboardCheck className="w-12 h-12 text-slate-500 mx-auto" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-100">No Private Evaluations Found</h3>
            <p className="text-xs text-slate-400">
              Score startups using Ventriva's 8-category structured evaluation framework to track venture quality.
            </p>
          </div>
          <Link to="/investor/discover">
            <Button variant="primary" size="sm" icon={Compass}>
              Explore Discovery & Start Evaluating
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {evaluations.map((item) => {
            const startup = item.startup;
            const interp = getScoreInterpretation(item.overallScore || 0);

            return (
              <div key={item._id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-slate-100 text-base">{startup?.startupName || startup?.companyName || 'Portfolio Startup'}</h3>
                      <p className="text-xs text-slate-400 font-mono">{startup?.sector} • {startup?.stage}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-extrabold text-slate-100 block">
                        {(item.overallScore || 0).toFixed(1)}
                        <span className="text-xs text-slate-400 font-normal">/10</span>
                      </span>
                      <Badge variant={item.evaluationStatus === 'Completed' ? 'emerald' : 'amber'} size="xs">
                        {item.evaluationStatus}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <Badge variant={interp.color} size="xs">{interp.label}</Badge>
                    <Badge variant="brand" size="xs">{item.investmentDecision}</Badge>
                  </div>

                  {item.strengths?.length > 0 && (
                    <div className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold block">Top Strength</span>
                      <p className="line-clamp-1">• {item.strengths[0]}</p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleDelete(startup?._id)}
                    className="text-xs text-slate-500 hover:text-rose-400 p-1.5 transition-colors"
                    title="Delete Evaluation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <Link to={`/investor/startups/${startup?._id}/evaluate`}>
                    <Button variant="outline" size="sm" icon={Edit3}>
                      Edit Evaluation
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InvestorEvaluationsDashboard;

