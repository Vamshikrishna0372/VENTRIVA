import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Cpu,
  Plus,
  Loader2,
  RefreshCw,
  PieChart,
  Building2,
  Target,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sliders,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import ScenarioResultCard from '../../components/strategy/ScenarioResultCard';
import { calculateScenario, getSavedScenarios, deleteScenario } from '../../services/portfolioScenarioService';

export const PortfolioScenarios = () => {
  const [scenarios, setScenarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isError, setIsError] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [formData, setFormData] = useState({
    name: 'Growth Upside Simulation (+25%)',
    scenarioType: 'Growth',
    valuationChangePercentage: 25,
    newCapitalDeployment: 500000,
  });

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await getSavedScenarios();
      if (res?.success) setScenarios(res.data || []);
    } catch (err) {
      console.error('Error fetching scenarios:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPreset = (type, pct, capital = 500000) => {
    setFormData({
      name: `${type} Simulation (${pct >= 0 ? '+' : ''}${pct}%)`,
      scenarioType: type,
      valuationChangePercentage: pct,
      newCapitalDeployment: capital,
    });
  };

  const handleRunSimulation = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback({ type: '', message: '' });
    try {
      const res = await calculateScenario(formData);
      if (res?.success) {
        setFeedback({ type: 'success', message: 'Non-mutating scenario simulation calculated & saved successfully!' });
        fetchScenarios();
      } else {
        setFeedback({ type: 'error', message: res?.message || 'Failed to run simulation' });
      }
    } catch (err) {
      console.error('Error running scenario simulation:', err);
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message || 'Server error running simulation' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteScenario = async (id) => {
    if (!window.confirm('Are you sure you want to delete this saved simulation scenario?')) return;
    try {
      const res = await deleteScenario(id);
      if (res?.success) {
        setFeedback({ type: 'success', message: 'Simulation record deleted.' });
        fetchScenarios();
      }
    } catch (err) {
      console.error('Error deleting simulation scenario:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Non-Mutating Portfolio Scenario Simulator...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Cpu className="w-6 h-6 text-cyan-400" />
              <h1 className="text-2xl font-bold text-slate-100">Portfolio Scenario Simulation Engine</h1>
            </div>
            <p className="text-sm text-slate-400">
              Simulate valuation changes (+50%, -25%) and new capital deployment in isolation. <strong className="text-cyan-400">Simulations NEVER mutate real investment records.</strong>
            </p>
          </div>
          <Button onClick={fetchScenarios} icon={RefreshCw} variant="outline" size="sm">
            Refresh Engine
          </Button>
        </div>

        {/* Connected Workflows Quick Bar */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
          <Link to="/investor/portfolio" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Venture Portfolio
          </Link>
          <Link to="/investor/cap-table" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <PieChart className="w-3.5 h-3.5 text-brand-400" /> Cap Table Ownership
          </Link>
          <Link to="/investor/strategy" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-indigo-400" /> Investment Mandate
          </Link>
          <Link to="/investor/governance" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Corporate Governance
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
            <span>Failed to load scenario dataset. Please try again.</span>
          </div>
          <Button variant="outline" size="xs" onClick={fetchScenarios}>Retry</Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulation Control Form */}
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader title="Create Simulation Scenario" subtitle="Non-mutating portfolio stress testing" />
          <CardBody className="space-y-4">
            {/* Quick Presets */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">Quick Preset Scenarios</label>
              <div className="flex flex-wrap gap-1.5">
                <button type="button" onClick={() => handleApplyPreset('Base Case', 0, 0)} className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-mono text-slate-300 hover:border-brand-500">Base Case (0%)</button>
                <button type="button" onClick={() => handleApplyPreset('Conservative', -10, 250000)} className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-mono text-amber-400 hover:border-amber-500">Conservative (-10%)</button>
                <button type="button" onClick={() => handleApplyPreset('Growth', 25, 500000)} className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-mono text-brand-400 hover:border-brand-500">Growth (+25%)</button>
                <button type="button" onClick={() => handleApplyPreset('Aggressive', 50, 1000000)} className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-mono text-emerald-400 hover:border-emerald-500">Aggressive (+50%)</button>
                <button type="button" onClick={() => handleApplyPreset('Downside', -50, 0)} className="px-2 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-mono text-rose-400 hover:border-rose-500">Downside (-50%)</button>
              </div>
            </div>

            <form onSubmit={handleRunSimulation} className="space-y-4 pt-2 border-t border-slate-800">
              <Input
                label="Scenario Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />

              <Select
                label="Scenario Type"
                value={formData.scenarioType}
                onChange={(e) => setFormData({ ...formData, scenarioType: e.target.value })}
                options={[
                  { value: 'Base Case', label: 'Base Case' },
                  { value: 'Conservative', label: 'Conservative (-10%)' },
                  { value: 'Growth', label: 'Growth (+25%)' },
                  { value: 'Aggressive', label: 'Aggressive (+50%)' },
                  { value: 'Downside', label: 'Downside (-50%)' },
                ]}
              />

              <Input
                label="Valuation Change (%)"
                type="number"
                value={formData.valuationChangePercentage}
                onChange={(e) => setFormData({ ...formData, valuationChangePercentage: Number(e.target.value) })}
              />

              <Input
                label="New Capital Deployment ($)"
                type="number"
                min="0"
                value={formData.newCapitalDeployment}
                onChange={(e) => setFormData({ ...formData, newCapitalDeployment: Number(e.target.value) })}
              />

              <Button variant="primary" type="submit" className="w-full" isLoading={isSubmitting} icon={Cpu}>
                Run Scenario Simulation
              </Button>
            </form>
          </CardBody>
        </Card>

        {/* Results List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-100">Saved Simulation Scenarios</h2>
          {scenarios.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400">
              No simulation scenarios run yet. Configure parameters on the left or select a preset to run your first simulation.
            </div>
          ) : (
            scenarios.map((sc) => <ScenarioResultCard key={sc._id} scenario={sc} onDelete={handleDeleteScenario} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioScenarios;

