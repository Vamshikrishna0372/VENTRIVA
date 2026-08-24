import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Target,
  DollarSign,
  Loader2,
  Edit3,
  X,
  CheckCircle2,
  AlertCircle,
  Award,
  PieChart,
  Building2,
  RefreshCw,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import MetricCard from '../../components/analytics/MetricCard';
import StrategyHealthCard from '../../components/strategy/StrategyHealthCard';
import { getMyStrategy, saveStrategy } from '../../services/investorStrategyService';
import { getStrategyHealthOverview } from '../../services/portfolioStrategyService';
import { SECTORS, STAGES } from '../../utils/constants';

export const InvestorStrategy = () => {
  const [strategy, setStrategy] = useState(null);
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isError, setIsError] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [formData, setFormData] = useState({
    strategyName: '',
    targetCapitalDeployment: 5000000,
    targetInitialCheckSize: 250000,
    targetFollowOnReserve: 40,
    targetOwnershipMin: 5,
    targetOwnershipMax: 20,
    targetReturnMultiple: 3.0,
    description: '',
    preferredSectors: [],
    preferredStages: [],
    minimumInvestment: 50000,
    maximumInvestment: 1000000,
    investmentCurrency: 'USD',
  });

  useEffect(() => {
    fetchStrategyData();
  }, []);

  const fetchStrategyData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const [strRes, heaRes] = await Promise.all([
        getMyStrategy(),
        getStrategyHealthOverview(),
      ]);

      if (strRes?.success && strRes.data) {
        setStrategy(strRes.data);
        setFormData({
          strategyName: strRes.data.strategyName || 'Core Venture Mandate',
          targetCapitalDeployment: strRes.data.targetCapitalDeployment || 5000000,
          targetInitialCheckSize: strRes.data.targetInitialCheckSize || 250000,
          targetFollowOnReserve: strRes.data.targetFollowOnReserve || 40,
          targetOwnershipMin: strRes.data.targetOwnershipRange?.min || 5,
          targetOwnershipMax: strRes.data.targetOwnershipRange?.max || 20,
          targetReturnMultiple: strRes.data.targetReturnMultiple || 3.0,
          description: strRes.data.description || '',
          preferredSectors: strRes.data.preferredSectors || [],
          preferredStages: strRes.data.preferredStages || [],
          minimumInvestment: strRes.data.minimumInvestment || strRes.data.targetInitialCheckSize || 50000,
          maximumInvestment: strRes.data.maximumInvestment || 1000000,
          investmentCurrency: strRes.data.investmentCurrency || 'USD',
        });
      }
      if (heaRes?.success) setHealth(heaRes.data);
    } catch (err) {
      console.error('Error fetching investor strategy profile:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEdit = () => {
    setFeedback({ type: '', message: '' });
    if (strategy) {
      setFormData({
        strategyName: strategy.strategyName || 'Core Venture Mandate',
        targetCapitalDeployment: strategy.targetCapitalDeployment || 5000000,
        targetInitialCheckSize: strategy.targetInitialCheckSize || 250000,
        targetFollowOnReserve: strategy.targetFollowOnReserve || 40,
        targetOwnershipMin: strategy.targetOwnershipRange?.min || 5,
        targetOwnershipMax: strategy.targetOwnershipRange?.max || 20,
        targetReturnMultiple: strategy.targetReturnMultiple || 3.0,
        description: strategy.description || '',
        preferredSectors: strategy.preferredSectors || [],
        preferredStages: strategy.preferredStages || [],
        minimumInvestment: strategy.minimumInvestment || 50000,
        maximumInvestment: strategy.maximumInvestment || 1000000,
        investmentCurrency: strategy.investmentCurrency || 'USD',
      });
    }
    setIsEditOpen(true);
  };

  const toggleSector = (sector) => {
    setFormData((prev) => {
      const exists = prev.preferredSectors.includes(sector);
      return {
        ...prev,
        preferredSectors: exists
          ? prev.preferredSectors.filter((s) => s !== sector)
          : [...prev.preferredSectors, sector],
      };
    });
  };

  const toggleStage = (stage) => {
    setFormData((prev) => {
      const exists = prev.preferredStages.includes(stage);
      return {
        ...prev,
        preferredStages: exists
          ? prev.preferredStages.filter((s) => s !== stage)
          : [...prev.preferredStages, stage],
      };
    });
  };

  const handleSaveStrategy = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback({ type: '', message: '' });

    try {
      const res = await saveStrategy(formData);
      if (res?.success) {
        setFeedback({ type: 'success', message: 'Strategy mandate updated & synchronized to MongoDB!' });
        setStrategy(res.data);
        setIsEditOpen(false);
        const heaRes = await getStrategyHealthOverview();
        if (heaRes?.success) setHealth(heaRes.data);
      } else {
        setFeedback({ type: 'error', message: res?.message || 'Failed to update strategy mandate.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message || 'Server error saving strategy.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Investment Mandate & Portfolio Strategy...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-100">Investor Portfolio Strategy & Mandate</h1>
            <p className="text-sm text-slate-400">
              Target capital deployment, check size bounds, target sectors/stages, and thesis alignment health.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={fetchStrategyData} icon={RefreshCw} variant="outline" size="sm">
              Refresh
            </Button>
            <Button onClick={handleOpenEdit} icon={Edit3} variant="primary" size="sm">
              Edit Mandate
            </Button>
          </div>
        </div>

        {/* Connected Workflows Quick Bar */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
          <Link to="/investor/opportunities/ranking" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-brand-400" /> Opportunity Ranking Engine
          </Link>
          <Link to="/investor/capital-allocation" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <PieChart className="w-3.5 h-3.5 text-indigo-400" /> Capital Allocation Plans
          </Link>
          <Link to="/investor/portfolio" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Venture Portfolio
          </Link>
          <Link to="/investor/discover" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Discovery Matching
          </Link>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback.message && (
        <div className={`p-4 rounded-xl border text-xs flex items-center gap-2.5 ${
          feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Error Recovery Banner */}
      {isError && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>Could not load portfolio strategy data. Please try again.</span>
          </div>
          <Button variant="outline" size="xs" onClick={fetchStrategyData}>Retry</Button>
        </div>
      )}

      {/* Key Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard title="Target Deployment" value={`$${((strategy?.targetCapitalDeployment || 5000000) / 1000000).toFixed(1)}M`} subtitle="Fund allocation" icon={DollarSign} color="brand" />
        <MetricCard title="Target Initial Check" value={`$${((strategy?.targetInitialCheckSize || 250000) / 1000).toFixed(0)}K`} subtitle="Single check size" icon={Target} color="indigo" />
        <MetricCard title="Follow-On Reserve" value={`${strategy?.targetFollowOnReserve || 40}%`} subtitle="Pro-rata reserve" icon={ShieldCheck} color="emerald" />
        <MetricCard title="Strategy Health" value={`${health?.score || 80}/100`} subtitle={health?.healthCategory || 'Healthy'} icon={ShieldCheck} color="teal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StrategyHealthCard health={health} />
        </div>

        <Card className="border-slate-800 bg-slate-900">
          <CardHeader title="Active Investment Mandate" subtitle="Guidelines and check size rules" />
          <CardBody className="space-y-3 text-xs font-mono">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Strategy Name</span>
              <span className="font-bold text-slate-200">{strategy?.strategyName || 'Core Venture Allocation Strategy'}</span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Target Sectors</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {strategy?.preferredSectors && strategy.preferredSectors.length > 0 ? (
                  strategy.preferredSectors.map((sec) => (
                    <Badge key={sec} variant="brand" size="xs">{sec}</Badge>
                  ))
                ) : (
                  <span className="text-slate-400 italic">All Sectors</span>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Target Stages</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {strategy?.preferredStages && strategy.preferredStages.length > 0 ? (
                  strategy.preferredStages.map((stg) => (
                    <Badge key={stg} variant="indigo" size="xs">{stg}</Badge>
                  ))
                ) : (
                  <span className="text-slate-400 italic">All Stages</span>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Check Size Range</span>
              <span className="font-bold text-slate-200">
                ${((strategy?.minimumInvestment || strategy?.targetInitialCheckSize || 50000) / 1000).toFixed(0)}K - ${((strategy?.maximumInvestment || 1000000) / 1000).toFixed(0)}K
              </span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Target Ownership Range</span>
              <span className="font-bold text-slate-200">{strategy?.targetOwnershipRange?.min || 5}% - {strategy?.targetOwnershipRange?.max || 20}%</span>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Target Return Multiple</span>
              <span className="font-bold text-emerald-400">{strategy?.targetReturnMultiple || 3.0}x MOIC</span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Edit Strategy Mandate Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-brand-400" />
                <span>Edit Investment Mandate & Thesis</span>
              </h3>
              <button onClick={() => setIsEditOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStrategy} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <Input
                label="Strategy Mandate Name"
                value={formData.strategyName}
                onChange={(e) => setFormData({ ...formData, strategyName: e.target.value })}
                placeholder="e.g. Core Seed Venture Mandate"
                required
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Target Capital Deployment ($)"
                  type="number"
                  value={formData.targetCapitalDeployment}
                  onChange={(e) => setFormData({ ...formData, targetCapitalDeployment: Number(e.target.value) })}
                  required
                />
                <Input
                  label="Target Initial Check Size ($)"
                  type="number"
                  value={formData.targetInitialCheckSize}
                  onChange={(e) => setFormData({ ...formData, targetInitialCheckSize: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Minimum Ticket Size ($)"
                  type="number"
                  value={formData.minimumInvestment}
                  onChange={(e) => setFormData({ ...formData, minimumInvestment: Number(e.target.value) })}
                />
                <Input
                  label="Maximum Ticket Size ($)"
                  type="number"
                  value={formData.maximumInvestment}
                  onChange={(e) => setFormData({ ...formData, maximumInvestment: Number(e.target.value) })}
                />
              </div>

              {/* Target Sectors Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase">Target Sectors</label>
                <div className="flex flex-wrap gap-1.5 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  {(SECTORS || ['AI / Machine Learning', 'FinTech', 'SaaS / B2B Enterprise', 'HealthTech / BioTech', 'E-Commerce', 'CleanTech', 'DeepTech']).map((sec) => {
                    const isSelected = formData.preferredSectors.includes(sec);
                    return (
                      <button
                        type="button"
                        key={sec}
                        onClick={() => toggleSector(sec)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
                          isSelected
                            ? 'bg-brand-500/20 border-brand-500/60 text-brand-300 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{sec}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Stages Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase">Target Stages</label>
                <div className="flex flex-wrap gap-1.5 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  {(STAGES || ['Pre-Seed', 'Seed', 'Series A', 'Series B', 'Growth']).map((stg) => {
                    const isSelected = formData.preferredStages.includes(stg);
                    return (
                      <button
                        type="button"
                        key={stg}
                        onClick={() => toggleStage(stg)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all border ${
                          isSelected
                            ? 'bg-indigo-500/20 border-indigo-500/60 text-indigo-300 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{stg}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Follow-On Reserve (%)"
                  type="number"
                  value={formData.targetFollowOnReserve}
                  onChange={(e) => setFormData({ ...formData, targetFollowOnReserve: Number(e.target.value) })}
                  required
                />
                <Input
                  label="Min Ownership (%)"
                  type="number"
                  value={formData.targetOwnershipMin}
                  onChange={(e) => setFormData({ ...formData, targetOwnershipMin: Number(e.target.value) })}
                  required
                />
                <Input
                  label="Max Ownership (%)"
                  type="number"
                  value={formData.targetOwnershipMax}
                  onChange={(e) => setFormData({ ...formData, targetOwnershipMax: Number(e.target.value) })}
                  required
                />
              </div>

              <Input
                label="Target Return Multiple (x MOIC)"
                type="number"
                step="0.1"
                value={formData.targetReturnMultiple}
                onChange={(e) => setFormData({ ...formData, targetReturnMultiple: Number(e.target.value) })}
                required
              />

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                  Save Mandate
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorStrategy;

