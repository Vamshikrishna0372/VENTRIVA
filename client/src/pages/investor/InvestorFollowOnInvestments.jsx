import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  Plus,
  Loader2,
  X,
  RefreshCw,
  Building2,
  PieChart,
  Target,
  Award,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import FollowOnInvestmentCard from '../../components/portfolio/FollowOnInvestmentCard';
import {
  getFollowOnOpportunities,
  updateFollowOnStatus,
  convertFollowOnToInvestment,
  createFollowOnOpportunity,
} from '../../services/followOnInvestmentService';
import api from '../../services/api';

export const InvestorFollowOnInvestments = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [formData, setFormData] = useState({
    investmentId: '',
    amount: 100000,
    round: 'Series A',
    reason: 'Pro-rata allocation right exercise',
    ownershipAfter: 5,
  });

  useEffect(() => {
    fetchFollowOns();
    fetchInvestments();
  }, []);

  const fetchFollowOns = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await getFollowOnOpportunities();
      if (res?.success) setOpportunities(res.data || []);
    } catch (err) {
      console.error('Error fetching follow-on opportunities:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInvestments = async () => {
    try {
      const res = await api.get('/investments');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setInvestments(res.data.data);
        if (res.data.data.length > 0) {
          setFormData((prev) => ({ ...prev, investmentId: res.data.data[0]._id }));
        }
      }
    } catch (err) {
      console.error('Error fetching portfolio investments:', err);
    }
  };

  const handleApprove = async (id, status) => {
    setFeedback({ type: '', message: '' });
    try {
      const res = await updateFollowOnStatus(id, status);
      if (res?.success) {
        setFeedback({ type: 'success', message: `Follow-on opportunity status updated to ${status}!` });
        fetchFollowOns();
      } else {
        setFeedback({ type: 'error', message: res?.message || 'Failed to update status' });
      }
    } catch (err) {
      console.error('Error approving follow-on opportunity:', err);
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message || 'Error updating status' });
    }
  };

  const handleConvert = async (id) => {
    setFeedback({ type: '', message: '' });
    try {
      const res = await convertFollowOnToInvestment(id);
      if (res?.success) {
        setFeedback({ type: 'success', message: 'Follow-on capital deployed & converted to portfolio holding successfully!' });
        fetchFollowOns();
      } else {
        setFeedback({ type: 'error', message: res?.message || 'Conversion failed' });
      }
    } catch (err) {
      console.error('Error converting follow-on opportunity:', err);
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message || 'Error converting follow-on' });
    }
  };

  const handleCreateFollowOn = async (e) => {
    e.preventDefault();
    if (!formData.investmentId) {
      alert('Please select a portfolio venture investment');
      return;
    }
    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await createFollowOnOpportunity(formData);
      if (res?.success) {
        setFeedback({ type: 'success', message: 'Follow-on opportunity recorded successfully!' });
        setShowModal(false);
        fetchFollowOns();
      } else {
        setFeedback({ type: 'error', message: res?.message || 'Failed to record follow-on' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err?.response?.data?.message || err.message || 'Failed to record follow-on opportunity' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Follow-On & Pro-Rata Opportunities...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-brand-400" /> Follow-On & Pro-Rata Investments
            </h1>
            <p className="text-sm text-slate-400">
              Manage follow-on funding rounds, track pro-rata ownership rights, and convert approved proposals into deployed capital.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={fetchFollowOns} icon={RefreshCw} variant="outline" size="sm">
              Refresh
            </Button>
            {investments.length > 0 && (
              <Button variant="brand" size="sm" icon={Plus} onClick={() => setShowModal(true)}>
                Propose Follow-On
              </Button>
            )}
          </div>
        </div>

        {/* Connected Workflows Quick Bar */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
          <Link to="/investor/portfolio" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Venture Portfolio
          </Link>
          <Link to="/investor/capital-allocation" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-indigo-400" /> Capital Allocation
          </Link>
          <Link to="/investor/exits" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-emerald-400" /> Venture Exits
          </Link>
          <Link to="/investor/cap-table" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <PieChart className="w-3.5 h-3.5 text-brand-400" /> Cap Table Ownership
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
            <span>Failed to load follow-on opportunities dataset. Please try again.</span>
          </div>
          <Button variant="outline" size="xs" onClick={fetchFollowOns}>Retry</Button>
        </div>
      )}

      {opportunities.length === 0 ? (
        <Card className="text-center py-12 border-slate-800 bg-slate-900">
          <CardBody className="space-y-3">
            <TrendingUp className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-200">No Follow-On Opportunities Recorded</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Follow-on and pro-rata opportunities for portfolio companies will be listed here for approval and conversion into deployed capital.
            </p>
            {investments.length > 0 && (
              <Button variant="outline" size="sm" icon={Plus} onClick={() => setShowModal(true)}>
                Propose First Follow-On Opportunity
              </Button>
            )}
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.map((opp) => (
            <FollowOnInvestmentCard
              key={opp._id}
              opportunity={opp}
              isInvestor={true}
              onApprove={handleApprove}
              onConvert={handleConvert}
            />
          ))}
        </div>
      )}

      {/* Propose Follow-On Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-brand-400" /> Propose Follow-On Opportunity
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFollowOn} className="space-y-4">
              <Select
                label="Portfolio Venture Investment"
                value={formData.investmentId}
                onChange={(e) => setFormData({ ...formData, investmentId: e.target.value })}
                options={investments.map((inv) => {
                  const sName = inv.startup?.startupName || inv.startup?.companyName || 'Portfolio Startup';
                  const invAmount = inv.totalInvested || inv.investmentAmount || 0;
                  return {
                    value: inv._id,
                    label: `${sName} ($${invAmount.toLocaleString()})`,
                  };
                })}
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Follow-On Check ($)"
                  type="number"
                  min="1000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  required
                />

                <Select
                  label="Round Stage"
                  value={formData.round}
                  onChange={(e) => setFormData({ ...formData, round: e.target.value })}
                  options={[
                    { value: 'Seed', label: 'Seed Round' },
                    { value: 'Series A', label: 'Series A' },
                    { value: 'Series B', label: 'Series B' },
                    { value: 'Series C+', label: 'Series C+' },
                  ]}
                />
              </div>

              <Input
                label="Target Ownership After Follow-On (%)"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.ownershipAfter}
                onChange={(e) => setFormData({ ...formData, ownershipAfter: Number(e.target.value) })}
              />

              <Input
                label="Strategic Rationale / Notes"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Pro-rata right exercise for upcoming round..."
              />

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <Button variant="ghost" onClick={() => setShowModal(false)} type="button">
                  Cancel
                </Button>
                <Button variant="primary" type="submit" isLoading={isSubmitting}>
                  Save Opportunity
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorFollowOnInvestments;

