import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Lock,
  Building2,
  DollarSign,
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sliders,
  TrendingUp,
  GitPullRequest
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

import PipelineHistoryTimeline from '../../components/investor/PipelineHistoryTimeline';
import { PIPELINE_STAGES, PIPELINE_PRIORITIES, PIPELINE_STATUSES, CURRENCIES, getFollowUpStatus } from '../../utils/pipelineConstants';
import { getStartupDetailForInvestor } from '../../services/discoveryService';
import { getPipelineByStartup, savePipelineEntry } from '../../services/pipelineService';
import { createDealFromPipeline } from '../../services/dealService';

export const InvestorPipelineDetail = () => {
  const { startupId } = useParams();
  const navigate = useNavigate();

  const [startup, setStartup] = useState(null);
  const [pipeline, setPipeline] = useState(null);
  const [history, setHistory] = useState([]);

  // Form State
  const [stage, setStage] = useState('New');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Active');
  const [notes, setNotes] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [lastContactDate, setLastContactDate] = useState('');
  const [expectedInvestment, setExpectedInvestment] = useState(0);
  const [investmentCurrency, setInvestmentCurrency] = useState('USD');
  const [internalRating, setInternalRating] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpeningDeal, setIsOpeningDeal] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchDetail();
  }, [startupId]);

  const fetchDetail = async () => {
    setIsLoading(true);
    try {
      const [startupRes, pipeRes] = await Promise.all([
        getStartupDetailForInvestor(startupId),
        getPipelineByStartup(startupId),
      ]);

      if (startupRes?.success && startupRes?.startup) {
        setStartup(startupRes.startup);
      }

      if (pipeRes?.success && pipeRes?.pipeline) {
        const p = pipeRes.pipeline;
        setPipeline(p);
        setHistory(pipeRes.history || []);

        setStage(p.stage || 'New');
        setPriority(p.priority || 'Medium');
        setStatus(p.status || 'Active');
        setNotes(p.notes || '');
        setNextFollowUpDate(p.nextFollowUpDate ? p.nextFollowUpDate.split('T')[0] : '');
        setLastContactDate(p.lastContactDate ? p.lastContactDate.split('T')[0] : '');
        setExpectedInvestment(p.expectedInvestment || 0);
        setInvestmentCurrency(p.investmentCurrency || 'USD');
        setInternalRating(p.internalRating || '');
        setTags(p.tags || []);
      }
    } catch (err) {
      console.error('Error fetching pipeline detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDealRoom = async () => {
    setIsOpeningDeal(true);
    try {
      const res = await createDealFromPipeline({
        startupId,
        pipelineEntryId: pipeline?._id,
        targetInvestment: expectedInvestment || 0,
        valuation: startup?.fundingRequired || 0,
      });

      if (res?.success && res?.data) {
        navigate(`/investor/deals/${res.data._id}`);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err?.response?.data?.message || 'Failed to initialize Deal Room' });
    } finally {
      setIsOpeningDeal(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags((prev) => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    try {
      const payload = {
        startupId,
        stage,
        priority,
        status,
        notes,
        nextFollowUpDate: nextFollowUpDate || null,
        lastContactDate: lastContactDate || null,
        expectedInvestment: Number(expectedInvestment) || 0,
        investmentCurrency,
        internalRating: internalRating ? Number(internalRating) : null,
        tags,
      };

      const res = await savePipelineEntry(payload);
      if (res?.success) {
        setFeedback({ type: 'success', message: 'Deal pipeline updated successfully!' });
        fetchDetail();
      } else {
        setFeedback({ type: 'error', message: res?.message || 'Failed to update pipeline' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err?.response?.data?.message || 'Failed to update deal pipeline' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const followUp = getFollowUpStatus(nextFollowUpDate);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Deal Management Workspace...</p>
      </div>
    );
  }

  if (!startup) {
    return (
      <div className="text-center py-16 space-y-4">
        <Building2 className="w-12 h-12 text-slate-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-100">Venture Profile Unavailable</h2>
        <Button variant="primary" icon={ArrowLeft} onClick={() => navigate('/investor/pipeline')}>
          Back to Deal Pipeline
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="sm" icon={ArrowLeft} onClick={() => navigate('/investor/pipeline')} />
            <h1 className="text-2xl font-bold text-slate-100">{startup.startupName}</h1>
            <Badge variant="brand">{stage}</Badge>
            <Badge variant="indigo">{priority} Priority</Badge>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-1.5 ml-8">
            <Lock className="w-3.5 h-3.5 text-emerald-400" /> Private deal management. All pipeline terms and notes are strictly confidential to you.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={GitPullRequest} isLoading={isOpeningDeal} onClick={handleOpenDealRoom}>
            Open Deal Room
          </Button>
          <Button variant="primary" size="sm" isLoading={isSubmitting} onClick={handleSubmit}>
            Save Deal Updates
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

      {/* Follow-up Warning Banner if set */}
      {followUp && (
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
          followUp.status === 'overdue'
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            : followUp.status === 'dueToday'
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 font-bold'
            : 'bg-slate-900 border-slate-800 text-slate-300'
        }`}>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 shrink-0" />
            <span>
              Follow-up {followUp.label}:{' '}
              {new Date(nextFollowUpDate.includes('T') ? nextFollowUpDate : `${nextFollowUpDate}T00:00:00`).toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
          <Badge variant={followUp.color}>{followUp.label}</Badge>
        </div>
      )}

      {/* Main Grid Editor */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stage, Financial Terms, Notes */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Deal Parameters & Stage Management" />
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                  label="Current Deal Stage"
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  options={PIPELINE_STAGES.map((stg) => ({ value: stg, label: stg }))}
                />
                <Select
                  label="Deal Priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  options={PIPELINE_PRIORITIES.map((p) => ({ value: p, label: `${p} Priority` }))}
                />
                <Select
                  label="Deal Pipeline Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={PIPELINE_STATUSES.map((s) => ({ value: s, label: s }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                <Input
                  label="Expected Check / Investment ($)"
                  type="number"
                  min="0"
                  value={expectedInvestment}
                  onChange={(e) => setExpectedInvestment(e.target.value)}
                  icon={DollarSign}
                />
                <Select
                  label="Currency"
                  value={investmentCurrency}
                  onChange={(e) => setInvestmentCurrency(e.target.value)}
                  options={CURRENCIES.map((curr) => ({ value: curr, label: curr }))}
                />
                <Input
                  label="Internal Rating (1-10)"
                  type="number"
                  min="1"
                  max="10"
                  placeholder="e.g. 8"
                  value={internalRating}
                  onChange={(e) => setInternalRating(e.target.value)}
                />
              </div>
            </CardBody>
          </Card>

          {/* Follow-up & Contact Scheduler */}
          <Card>
            <CardHeader title="Schedule & Contact Tracking" />
            <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Next Follow-up Date"
                type="date"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                icon={Calendar}
              />
              <Input
                label="Last Contact Date"
                type="date"
                value={lastContactDate}
                onChange={(e) => setLastContactDate(e.target.value)}
                icon={Calendar}
              />
            </CardBody>
          </Card>

          {/* Private Notes */}
          <Card>
            <CardHeader title="Private Deal Notes" subtitle="Confidential pipeline commentary" />
            <CardBody>
              <textarea
                rows={6}
                placeholder="Record private due diligence progress, call notes, partner feedback..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl border border-slate-800 p-3 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              />
            </CardBody>
          </Card>

          {/* Chronological History Timeline */}
          <PipelineHistoryTimeline history={history} />
        </div>

        {/* Right Column: Tags & Venture Overview */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Deal Tags & Labels" />
            <CardBody className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add tag (e.g. Priority Deal)"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="flex-1 bg-slate-950 text-slate-100 text-xs rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <Button size="sm" icon={Plus} onClick={handleAddTag}>
                  Add
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {tags.map((tag) => (
                  <span key={tag} className="text-xs bg-slate-950 text-slate-300 border border-slate-800 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                    {tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className="text-slate-400 hover:text-rose-400">
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Venture Summary" subtitle={startup.startupName} />
            <CardBody className="space-y-2 text-xs">
              <p className="text-slate-300">{startup.tagline}</p>
              <div className="pt-2 border-t border-slate-800 space-y-1 text-slate-400">
                <p><strong>Sector:</strong> {startup.sector}</p>
                <p><strong>Stage:</strong> {startup.stage}</p>
                <p><strong>Target Funding:</strong> ${startup.fundingRequired ? startup.fundingRequired.toLocaleString() : '0'}</p>
              </div>
            </CardBody>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default InvestorPipelineDetail;
