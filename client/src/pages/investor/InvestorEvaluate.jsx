import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Loader2,
  Building2,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

import EvaluationScoreInput from '../../components/investor/EvaluationScoreInput';
import { CATEGORIES, INVESTMENT_DECISIONS, calculateOverallScore, getScoreInterpretation } from '../../utils/evaluationConstants';
import { getStartupDetailForInvestor } from '../../services/discoveryService';
import { getEvaluationByStartup, saveEvaluation } from '../../services/evaluationService';

export const InvestorEvaluate = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [startup, setStartup] = useState(null);
  const [scores, setScores] = useState({});
  const [strengths, setStrengths] = useState([]);
  const [newStrength, setNewStrength] = useState('');
  const [risks, setRisks] = useState([]);
  const [newRisk, setNewRisk] = useState('');
  const [privateNotes, setPrivateNotes] = useState('');
  const [investmentDecision, setInvestmentDecision] = useState('Undecided');
  const [evaluationStatus, setEvaluationStatus] = useState('Draft');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchEvaluationData();
  }, [id]);

  const fetchEvaluationData = async () => {
    setIsLoading(true);
    try {
      const [startupRes, evalRes] = await Promise.all([
        getStartupDetailForInvestor(id),
        getEvaluationByStartup(id),
      ]);

      if (startupRes?.success && startupRes?.startup) {
        setStartup(startupRes.startup);
      } else {
        setStartup(null);
      }

      if (evalRes?.success && evalRes?.evaluation) {
        const ev = evalRes.evaluation;
        setScores(ev.scores || {});
        setStrengths(ev.strengths || []);
        setRisks(ev.risks || []);
        setPrivateNotes(ev.privateNotes || '');
        setInvestmentDecision(ev.investmentDecision || 'Undecided');
        setEvaluationStatus(ev.evaluationStatus || 'Draft');
      }
    } catch (err) {
      console.error('Error fetching evaluation data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScoreChange = (catId, num) => {
    setScores((prev) => ({ ...prev, [catId]: num }));
  };

  const handleAddStrength = () => {
    if (newStrength.trim()) {
      setStrengths((prev) => [...prev, newStrength.trim()]);
      setNewStrength('');
    }
  };

  const handleRemoveStrength = (idx) => {
    setStrengths((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddRisk = () => {
    if (newRisk.trim()) {
      setRisks((prev) => [...prev, newRisk.trim()]);
      setNewRisk('');
    }
  };

  const handleRemoveRisk = (idx) => {
    setRisks((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async (targetStatus = 'Draft') => {
    setFeedback(null);
    setIsSubmitting(true);

    try {
      const payload = {
        startupId: id,
        scores,
        strengths,
        risks,
        privateNotes,
        investmentDecision,
        evaluationStatus: targetStatus,
      };

      const res = await saveEvaluation(payload);
      if (res?.success) {
        setEvaluationStatus(res.evaluation.evaluationStatus);
        setFeedback({ type: 'success', message: 'Evaluation saved successfully!' });
      } else {
        setFeedback({ type: 'error', message: res?.message || 'Failed to save evaluation' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err?.response?.data?.message || 'Failed to save evaluation' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const overallScore = calculateOverallScore(scores);
  const scoreInterpretation = getScoreInterpretation(overallScore);
  const scoredCount = CATEGORIES.filter((cat) => scores[cat.id] >= 1 && scores[cat.id] <= 10).length;
  const progressPercent = Math.round((scoredCount / CATEGORIES.length) * 100);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Venture Evaluation Workspace...</p>
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="text-center py-16 space-y-4">
        <Building2 className="w-12 h-12 text-slate-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-100">Venture Profile Unavailable</h2>
        <p className="text-xs text-slate-400">This startup is not available for investor evaluation.</p>
        <Button variant="primary" icon={ArrowLeft} onClick={() => navigate('/investor/discover')}>
          Back to Discovery
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back & Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate(`/investor/startups/${startup._id}`)} />
            <h1 className="text-2xl font-bold text-slate-100">Evaluate {startup.startupName}</h1>
            <Badge variant="brand">{startup.stage}</Badge>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 ml-8">
            <Lock className="w-3.5 h-3.5 text-emerald-400" /> Private investor workspace. Evaluations are confidential to your account.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" isLoading={isSubmitting} onClick={() => handleSave('Draft')}>
            Save Draft
          </Button>
          <Button variant="primary" size="sm" isLoading={isSubmitting} onClick={() => handleSave('Completed')}>
            Complete Evaluation
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Progress & Score Overview Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card hoverEffect={false}>
          <p className="text-xs font-mono text-slate-400 uppercase">Weighted Score</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-slate-100">{overallScore.toFixed(1)}</span>
            <span className="text-sm text-slate-400">/ 10</span>
          </div>
          <div className="mt-2">
            <Badge variant={scoreInterpretation.color}>{scoreInterpretation.label}</Badge>
          </div>
        </Card>

        <Card hoverEffect={false}>
          <p className="text-xs font-mono text-slate-400 uppercase">Framework Completion</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold text-slate-100">{scoredCount} / 8</span>
            <span className="text-xs text-slate-400 font-mono">({progressPercent}%)</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-brand-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </Card>

        <Card hoverEffect={false}>
          <p className="text-xs font-mono text-slate-400 uppercase">Investment Decision</p>
          <p className="text-lg font-bold text-emerald-400 mt-1">{investmentDecision}</p>
          <p className="text-xs text-slate-400 mt-2">Status: {evaluationStatus}</p>
        </Card>
      </div>

      {/* 8 Scoring Category Rating Blocks */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          Structured Evaluation Categories (Weighted Framework)
        </h3>
        {CATEGORIES.map((category) => (
          <EvaluationScoreInput
            key={category.id}
            category={category}
            score={scores[category.id]}
            onChange={handleScoreChange}
          />
        ))}
      </div>

      {/* Strengths & Risks Editors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card>
          <CardHeader title="Venture Strengths" subtitle="Key thesis drivers and positive catalysts" />
          <CardBody className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Technical moat with 2 granted patents"
                value={newStrength}
                onChange={(e) => setNewStrength(e.target.value)}
                className="flex-1 bg-slate-950 text-slate-100 text-xs rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <Button size="sm" icon={Plus} onClick={handleAddStrength}>
                Add
              </Button>
            </div>

            <ul className="space-y-2">
              {strengths.map((item, idx) => (
                <li key={idx} className="flex items-center justify-between text-xs text-slate-200 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <span>• {item}</span>
                  <button type="button" onClick={() => handleRemoveStrength(idx)} className="text-slate-400 hover:text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        {/* Risks */}
        <Card>
          <CardHeader title="Identified Risks & Concerns" subtitle="Key risk factors and market headwinds" />
          <CardBody className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. High customer concentration in top 2 accounts"
                value={newRisk}
                onChange={(e) => setNewRisk(e.target.value)}
                className="flex-1 bg-slate-950 text-slate-100 text-xs rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <Button size="sm" icon={Plus} onClick={handleAddRisk}>
                Add
              </Button>
            </div>

            <ul className="space-y-2">
              {risks.map((item, idx) => (
                <li key={idx} className="flex items-center justify-between text-xs text-slate-200 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
                  <span>• {item}</span>
                  <button type="button" onClick={() => handleRemoveRisk(idx)} className="text-slate-400 hover:text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>

      {/* Private Notes & Investment View */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader title="Private Investment Notes" subtitle="Confidential internal commentary" />
          <CardBody>
            <textarea
              rows={5}
              placeholder="Record your private thoughts, founder impression, follow-up questions for due diligence..."
              value={privateNotes}
              onChange={(e) => setPrivateNotes(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl border border-slate-800 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Investment Decision" subtitle="Preliminary decision status" />
          <CardBody className="space-y-2">
            {INVESTMENT_DECISIONS.map((dec) => (
              <label
                key={dec}
                className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                  investmentDecision === dec
                    ? 'bg-brand-500/20 border-brand-500/50 text-brand-300 font-bold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="investmentDecision"
                  value={dec}
                  checked={investmentDecision === dec}
                  onChange={(e) => setInvestmentDecision(e.target.value)}
                  className="text-brand-500 focus:ring-brand-500"
                />
                <span>{dec}</span>
              </label>
            ))}
          </CardBody>
        </Card>
      </div>

      {/* Footer Submit Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" isLoading={isSubmitting} onClick={() => handleSave('Draft')}>
          Save Draft Evaluation
        </Button>
        <Button variant="primary" isLoading={isSubmitting} onClick={() => handleSave('Completed')}>
          Complete Evaluation
        </Button>
      </div>
    </div>
  );
};

export default InvestorEvaluate;
