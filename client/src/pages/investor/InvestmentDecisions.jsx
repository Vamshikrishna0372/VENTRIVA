import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  Plus,
  X,
  AlertCircle,
  Building2,
  TrendingUp,
  Edit3,
  Trash2,
  RefreshCw,
  Target,
  Award,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import {
  getMyDecisions,
  recordDecision,
  updateDecision,
  deleteDecision,
} from '../../services/investmentDecisionService';
import { discoverStartups } from '../../services/discoveryService';
import { DECISION_STATUS_COLORS } from '../../utils/strategyConstants';

export const InvestmentDecisions = () => {
  const [decisions, setDecisions] = useState([]);
  const [startups, setStartups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDecision, setEditingDecision] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [startupId, setStartupId] = useState('');
  const [decisionType, setDecisionType] = useState('Invest');
  const [decisionStatus, setDecisionStatus] = useState('Approved');
  const [convictionScore, setConvictionScore] = useState(85);
  const [recommendedInvestmentAmount, setRecommendedInvestmentAmount] = useState(250000);
  const [recommendedOwnership, setRecommendedOwnership] = useState(10);
  const [rationale, setRationale] = useState('');
  const [keyRisks, setKeyRisks] = useState('');
  const [keyUpsideFactors, setKeyUpsideFactors] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const [decRes, startRes] = await Promise.all([
        getMyDecisions(),
        discoverStartups(),
      ]);

      if (decRes?.success) setDecisions(Array.isArray(decRes.data) ? decRes.data : []);
      if (startRes?.success) {
        const startupList = Array.isArray(startRes.data)
          ? startRes.data
          : (startRes.data?.startups || []);
        setStartups(startupList);
      }
    } catch (err) {
      console.error('Error fetching investment decision data:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingDecision(null);
    setStartupId('');
    setDecisionType('Invest');
    setDecisionStatus('Approved');
    setConvictionScore(85);
    setRecommendedInvestmentAmount(250000);
    setRecommendedOwnership(10);
    setRationale('');
    setKeyRisks('');
    setKeyUpsideFactors('');
    setFeedback({ type: '', message: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dec) => {
    setEditingDecision(dec);
    setStartupId(dec.startup?._id || dec.startup || '');
    setDecisionType(dec.decisionType || 'Invest');
    setDecisionStatus(dec.decisionStatus || 'Approved');
    setConvictionScore(dec.convictionScore || 85);
    setRecommendedInvestmentAmount(dec.recommendedInvestmentAmount || 250000);
    setRecommendedOwnership(dec.recommendedOwnership || 10);
    setRationale(dec.rationale || '');
    setKeyRisks(dec.keyRisks || '');
    setKeyUpsideFactors(dec.keyUpsideFactors || '');
    setFeedback({ type: '', message: '' });
    setIsModalOpen(true);
  };

  const handleSaveDecision = async (e) => {
    e.preventDefault();
    if (!editingDecision && !startupId) {
      setFeedback({ type: 'error', message: 'Please select a venture startup for your decision record.' });
      return;
    }

    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const payload = {
        startupId,
        decisionType,
        decisionStatus,
        convictionScore: Number(convictionScore),
        recommendedInvestmentAmount: Number(recommendedInvestmentAmount),
        recommendedOwnership: Number(recommendedOwnership),
        rationale,
        keyRisks,
        keyUpsideFactors,
      };

      const res = editingDecision
        ? await updateDecision(editingDecision._id, payload)
        : await recordDecision(payload);

      if (res?.success) {
        setFeedback({ type: 'success', message: `Private investment decision ${editingDecision ? 'updated' : 'recorded'} & saved securely!` });
        setIsModalOpen(false);
        fetchData();
      } else {
        setFeedback({ type: 'error', message: res?.message || 'Failed to save decision.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message || 'Server error saving decision.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDecision = async (id) => {
    if (!window.confirm('Are you sure you want to remove this private investment decision record?')) return;
    try {
      const res = await deleteDecision(id);
      if (res?.success) {
        setFeedback({ type: 'success', message: 'Decision record removed.' });
        fetchData();
      }
    } catch (err) {
      console.error('Error deleting decision record:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Private Investment Decision Records...</p>
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
              <FileText className="w-7 h-7 text-brand-400" /> Private Investment Decisions
            </h1>
            <p className="text-sm text-slate-400">
              Record investment committee rationale, conviction ratings, and strategic upside/risk analysis (100% private to investor).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={fetchData} icon={RefreshCw} variant="outline" size="sm">
              Refresh
            </Button>
            <Button onClick={handleOpenCreate} icon={Plus} variant="primary" size="sm">
              Record Private Decision
            </Button>
          </div>
        </div>

        {/* Connected Workflows Quick Bar */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
          <Link to="/investor/evaluations" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" /> Due Diligence Evaluations
          </Link>
          <Link to="/investor/opportunities/ranking" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-indigo-400" /> Opportunity Ranking
          </Link>
          <Link to="/investor/fundraising" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-amber-400" /> Active Open Rounds
          </Link>
          <Link to="/investor/closings" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Transaction Closings
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
            <span>Failed to load investment decision records. Please try again.</span>
          </div>
          <Button variant="outline" size="xs" onClick={fetchData}>Retry</Button>
        </div>
      )}

      {decisions.length === 0 ? (
        <Card className="text-center py-12 border-slate-800 bg-slate-900">
          <CardBody className="space-y-4">
            <FileText className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-200">No Investment Decisions Recorded</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your private investment decision records, conviction scores, and rationale will appear here. Create your first private decision above.
            </p>
            <Button onClick={handleOpenCreate} icon={Plus} variant="outline" size="sm">
              Record Decision
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {decisions.map((dec) => (
            <Card key={dec._id} className="border-slate-800 bg-slate-900 hover:border-brand-500/40 transition-colors">
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Link
                      to={`/investor/startups/${dec.startup?._id || dec.startup}`}
                      className="font-bold text-slate-100 text-sm hover:text-brand-400 transition-colors"
                    >
                      {dec.startup?.startupName || 'Startup'}
                    </Link>
                    <p className="text-xs text-slate-400">Type: {dec.decisionType} • Date: {new Date(dec.decisionDate || dec.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={DECISION_STATUS_COLORS[dec.decisionStatus] || 'emerald'}>
                      {dec.decisionStatus || 'Approved'}
                    </Badge>
                    <button onClick={() => handleOpenEdit(dec)} className="text-slate-400 hover:text-slate-200 p-1" title="Edit Decision">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteDecision(dec._id)} className="text-slate-500 hover:text-rose-400 p-1" title="Delete Record">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Conviction</span>
                    <span className="font-bold text-emerald-400">{dec.convictionScore}/100</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Target Amount</span>
                    <span className="font-bold text-slate-200">${(dec.recommendedInvestmentAmount || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Target Ownership</span>
                    <span className="font-bold text-brand-400">{dec.recommendedOwnership || 10}%</span>
                  </div>
                </div>

                {dec.rationale && (
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-slate-300">Investment Rationale:</span>
                    <p className="text-slate-400 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/40 leading-relaxed">{dec.rationale}</p>
                  </div>
                )}

                {dec.keyRisks && (
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-amber-400">Key Risks & Mitigation:</span>
                    <p className="text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">{dec.keyRisks}</p>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Record/Edit Private Decision Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-400" />
                <span>{editingDecision ? 'Edit Private Investment Decision' : 'Record Private Investment Decision'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDecision} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {!editingDecision && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Select Target Venture</label>
                  <select
                    className="w-full bg-slate-950 text-slate-100 text-sm rounded-xl border border-slate-800 p-2.5"
                    value={startupId}
                    onChange={(e) => setStartupId(e.target.value)}
                    required
                  >
                    <option value="">-- Select Published Startup --</option>
                    {startups.map((st) => (
                      <option key={st._id} value={st._id}>
                        {st.startupName} ({st.sector} • {st.stage})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Decision Type</label>
                  <select
                    className="w-full bg-slate-950 text-slate-100 text-sm rounded-xl border border-slate-800 p-2.5"
                    value={decisionType}
                    onChange={(e) => setDecisionType(e.target.value)}
                  >
                    <option value="Invest">Invest</option>
                    <option value="Follow-On">Follow-On</option>
                    <option value="Hold">Hold</option>
                    <option value="Pass">Pass</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Decision Status</label>
                  <select
                    className="w-full bg-slate-950 text-slate-100 text-sm rounded-xl border border-slate-800 p-2.5"
                    value={decisionStatus}
                    onChange={(e) => setDecisionStatus(e.target.value)}
                  >
                    <option value="Approved">Approved</option>
                    <option value="Draft">Draft</option>
                    <option value="Submitted">Submitted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <Input
                label="Conviction Score (0-100)"
                type="number"
                min="0"
                max="100"
                value={convictionScore}
                onChange={(e) => setConvictionScore(Number(e.target.value))}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Target Check ($)"
                  type="number"
                  value={recommendedInvestmentAmount}
                  onChange={(e) => setRecommendedInvestmentAmount(Number(e.target.value))}
                  required
                />
                <Input
                  label="Target Ownership (%)"
                  type="number"
                  value={recommendedOwnership}
                  onChange={(e) => setRecommendedOwnership(Number(e.target.value))}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Investment Rationale</label>
                <textarea
                  rows={2}
                  className="w-full bg-slate-950 text-slate-100 text-sm rounded-xl border border-slate-800 p-2.5"
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder="Record core thesis & conviction drivers..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Key Risks & Mitigation</label>
                <textarea
                  rows={2}
                  className="w-full bg-slate-950 text-slate-100 text-sm rounded-xl border border-slate-800 p-2.5"
                  value={keyRisks}
                  onChange={(e) => setKeyRisks(e.target.value)}
                  placeholder="Record market, execution, or valuation risks..."
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
                  Save Decision
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestmentDecisions;

