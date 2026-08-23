import React, { useState, useEffect } from 'react';
import { Cpu, Plus, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import ScenarioResultCard from '../../components/strategy/ScenarioResultCard';
import { calculateScenario, getSavedScenarios } from '../../services/portfolioScenarioService';

export const PortfolioScenarios = () => {
  const [scenarios, setScenarios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: 'Q4 Valuation Upside (+25%)',
    scenarioType: 'Growth',
    valuationChangePercentage: 25,
    newCapitalDeployment: 500000,
  });

  useEffect(() => {
    fetchScenarios();
  }, []);

  const fetchScenarios = async () => {
    setIsLoading(true);
    try {
      const res = await getSavedScenarios();
      if (res?.success) setScenarios(res.data);
    } catch (err) {
      console.error('Error fetching scenarios:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunSimulation = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await calculateScenario(formData);
      if (res?.success) fetchScenarios();
    } catch (err) {
      console.error('Error running scenario simulation:', err);
    } finally {
      setIsSubmitting(false);
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
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-6 h-6 text-cyan-400" />
          <h1 className="text-2xl font-bold text-slate-100">Portfolio Scenario Simulation Engine</h1>
        </div>
        <p className="text-sm text-slate-400">Simulate valuation changes (+50%, -25%) and new capital deployment in isolation. <strong className="text-cyan-400">Simulations NEVER mutate real investment records.</strong></p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulation Control Form */}
        <Card className="border-slate-800 bg-slate-900">
          <CardHeader title="Create Simulation Scenario" subtitle="Non-mutating portfolio stress testing" />
          <CardBody>
            <form onSubmit={handleRunSimulation} className="space-y-4">
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
              No simulation scenarios run yet. Configure parameters on the left to run your first simulation.
            </div>
          ) : (
            scenarios.map((sc) => <ScenarioResultCard key={sc._id} scenario={sc} />)
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioScenarios;
