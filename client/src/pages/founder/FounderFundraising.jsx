import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Target, Plus, Loader2, ArrowRight, DollarSign, Users, Briefcase, Calendar, ShieldCheck, Building2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { RoundStatusBadge } from '../../components/fundraising/RoundStatusBadge';
import { FundraisingProgressCard } from '../../components/fundraising/FundraisingProgressCard';
import { ROUND_TYPES, formatCurrency } from '../../utils/fundraisingConstants';
import api from '../../services/api';

export const FounderFundraising = () => {
  const navigate = useNavigate();
  const [rounds, setRounds] = useState([]);
  const [startups, setStartups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [formData, setFormData] = useState({
    startupId: '',
    roundName: 'Seed Round 2026',
    roundType: 'Seed',
    targetAmount: 1000000,
    minimumAmount: 500000,
    maximumAmount: 1500000,
    preMoneyValuation: 5000000,
    minimumTicketSize: 25000,
    description: '',
    useOfFunds: '',
    isPublic: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [roundsRes, myStartupRes, startupsRes] = await Promise.all([
        api.get('/fundraising-rounds').catch(() => null),
        api.get('/startups/my').catch(() => null),
        api.get('/startups').catch(() => null),
      ]);

      if (roundsRes?.data?.success) setRounds(roundsRes.data.data || []);

      const list = [];
      const single = myStartupRes?.data?.startup;
      if (single && single._id) list.push(single);

      const multiple = startupsRes?.data?.startups || startupsRes?.data?.data || [];
      multiple.forEach((st) => {
        if (st && st._id && !list.some((existing) => existing._id === st._id)) {
          list.push(st);
        }
      });

      setStartups(list);
      if (list.length > 0) {
        setFormData((prev) => ({ ...prev, startupId: prev.startupId || list[0]._id }));
      }
    } catch (err) {
      console.error('Error loading fundraising workspace:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRound = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      const res = await api.post('/fundraising-rounds', formData);
      if (res.data?.success) {
        setShowCreateModal(false);
        fetchData();
        navigate(`/founder/fundraising/${res.data.data._id}`);
      } else {
        setFormError(res.data?.message || 'Failed to create fundraising round');
      }
    } catch (err) {
      setFormError('Network error while creating round');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Capital Raise Workspace...</p>
      </div>
    );
  }

  const activeRound = rounds.find((r) => ['Open', 'Soft Commitments', 'In Due Diligence', 'Term Sheet Stage', 'Closing'].includes(r.status));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Target className="w-7 h-7 text-brand-400" /> Capital Raise Workspace
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage fundraising rounds, set valuation & terms, invite investors, and accept investment commitments.
          </p>
        </div>

        <Button variant="brand" onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Create Fundraising Round
        </Button>
      </div>

      {/* Active Startup Selection Banner */}
      {startups.length > 0 && (
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-500/10 border border-brand-500/30 text-brand-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Active Founder Startup</span>
              <span className="font-bold text-slate-100 text-sm">
                {(startups.find((s) => s._id === formData.startupId) || startups[0]).startupName || (startups.find((s) => s._id === formData.startupId) || startups[0]).name || (startups.find((s) => s._id === formData.startupId) || startups[0]).companyName}
              </span>
              <span className="text-slate-500 text-xs ml-2.5 font-normal">
                ({(startups.find((s) => s._id === formData.startupId) || startups[0]).sector} • {(startups.find((s) => s._id === formData.startupId) || startups[0]).stage} Stage)
              </span>
            </div>
          </div>
          {startups.length > 1 && (
            <div className="flex items-center gap-2">
              <label className="text-slate-400 text-xs font-medium">Switch Startup:</label>
              <select
                value={formData.startupId}
                onChange={(e) => setFormData({ ...formData, startupId: e.target.value })}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:border-brand-500 focus:outline-none"
              >
                {startups.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.startupName || s.name || s.companyName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Active Round Progress Banner */}
      {activeRound && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">Active Capital Raise</h2>
          <FundraisingProgressCard round={activeRound} analytics={activeRound.analytics || { targetAmount: activeRound.targetAmount, committedAmount: activeRound.committedAmount, fundedAmount: activeRound.fundedAmount, remainingAmount: Math.max(0, activeRound.targetAmount - activeRound.committedAmount), commitmentPercentage: activeRound.targetAmount ? Math.min(100, Math.round((activeRound.committedAmount / activeRound.targetAmount) * 100)) : 0 }} />
        </div>
      )}

      {/* Rounds Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider font-mono">All Fundraising Rounds</h2>

        {rounds.length === 0 ? (
          <Card className="text-center py-12">
            <CardBody className="space-y-3">
              <Target className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-slate-200">No Fundraising Rounds Created</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Launch your venture's fundraising round to set target capital, invite verified investors, and receive commitments.
              </p>
              <Button variant="brand" size="sm" onClick={() => setShowCreateModal(true)}>
                Launch First Round
              </Button>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rounds.map((round) => (
              <Card key={round._id} className="hover:border-slate-700 transition-all">
                <CardBody className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-100">{round.roundName}</h3>
                      <p className="text-xs text-slate-400">{round.roundType} Round</p>
                    </div>
                    <RoundStatusBadge status={round.status} />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs bg-slate-950/50 p-3 rounded-xl border border-slate-800/60 font-mono">
                    <div>
                      <span className="text-slate-500">Target</span>
                      <p className="font-bold text-slate-100">{formatCurrency(round.targetAmount)}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Committed</span>
                      <p className="font-bold text-emerald-400">{formatCurrency(round.committedAmount)}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Valuation</span>
                      <p className="font-bold text-slate-300">{formatCurrency(round.preMoneyValuation)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-2">
                    <Link to={`/founder/fundraising/${round._id}`}>
                      <Button size="sm" variant="outline" className="flex items-center gap-1.5 text-xs">
                        Manage Round & Commitments <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Round Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-100">Create Fundraising Round</h3>

            {formError && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-xl text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateRound} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Select Startup</label>
                {isLoading ? (
                  <Select value="" disabled>
                    <option value="">Loading startups...</option>
                  </Select>
                ) : startups.length === 0 ? (
                  <Select value="" disabled>
                    <option value="">No startups available. Create a startup profile first.</option>
                  </Select>
                ) : (
                  <Select
                    value={formData.startupId}
                    onChange={(e) => setFormData({ ...formData, startupId: e.target.value })}
                    required
                    options={startups.map((s) => ({
                      value: s._id,
                      label: s.startupName || s.name || s.companyName || 'Ventriva Startup',
                    }))}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Round Name</label>
                  <Input
                    value={formData.roundName}
                    onChange={(e) => setFormData({ ...formData, roundName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Round Type</label>
                  <Select
                    value={formData.roundType}
                    onChange={(e) => setFormData({ ...formData, roundType: e.target.value })}
                  >
                    {ROUND_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Target Raise ($)</label>
                  <Input
                    type="number"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Min Target ($)</label>
                  <Input
                    type="number"
                    value={formData.minimumAmount}
                    onChange={(e) => setFormData({ ...formData, minimumAmount: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Pre-Money Valuation ($)</label>
                  <Input
                    type="number"
                    value={formData.preMoneyValuation}
                    onChange={(e) => setFormData({ ...formData, preMoneyValuation: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Minimum Ticket Size ($)</label>
                  <Input
                    type="number"
                    value={formData.minimumTicketSize}
                    onChange={(e) => setFormData({ ...formData, minimumTicketSize: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Max Ticket Size ($)</label>
                  <Input
                    type="number"
                    value={formData.maximumAmount}
                    onChange={(e) => setFormData({ ...formData, maximumAmount: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Use of Funds Description</label>
                <textarea
                  rows={3}
                  value={formData.useOfFunds}
                  onChange={(e) => setFormData({ ...formData, useOfFunds: e.target.value })}
                  placeholder="e.g. 50% Product & Engineering, 30% Sales & Marketing, 20% Operations..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-100 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="brand" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Draft Round'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FounderFundraising;
