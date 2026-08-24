import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  PieChart,
  Plus,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  Target,
  Award,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import MetricCard from '../../components/analytics/MetricCard';
import { getAllocationPlans, saveAllocationPlan } from '../../services/capitalAllocationService';
import { getMyStrategy } from '../../services/investorStrategyService';
import { discoverStartups } from '../../services/discoveryService';

export const CapitalAllocation = () => {
  const [plans, setPlans] = useState([]);
  const [strategy, setStrategy] = useState(null);
  const [startups, setStartups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const [planningPeriod, setPlanningPeriod] = useState('Q3-Q4 2026');
  const [totalAvailableCapital, setTotalAvailableCapital] = useState(5000000);
  const [selectedStartupId, setSelectedStartupId] = useState('');
  const [proposedAmount, setProposedAmount] = useState(250000);
  const [expectedOwnership, setExpectedOwnership] = useState(10);
  const [expectedValuation, setExpectedValuation] = useState(2500000);
  const [priority, setPriority] = useState('High');
  const [rationale, setRationale] = useState('High conviction investment target');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const [planRes, strRes, startRes] = await Promise.all([
        getAllocationPlans(),
        getMyStrategy(),
        discoverStartups(),
      ]);

      if (planRes?.success) setPlans(planRes.data || []);
      if (strRes?.success && strRes.data) {
        setStrategy(strRes.data);
        if (strRes.data.targetCapitalDeployment) {
          setTotalAvailableCapital(strRes.data.targetCapitalDeployment);
        }
        if (strRes.data.targetInitialCheckSize) {
          setProposedAmount(strRes.data.targetInitialCheckSize);
        }
      }
      if (startRes?.success) {
        const startupList = Array.isArray(startRes.data)
          ? startRes.data
          : (startRes.data?.startups || []);
        setStartups(startupList);
      }
    } catch (err) {
      console.error('Error fetching capital allocation data:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback({ type: '', message: '' });

    try {
      const proposedAllocations = selectedStartupId
        ? [
            {
              startup: selectedStartupId,
              proposedAmount: Number(proposedAmount),
              expectedOwnership: Number(expectedOwnership),
              expectedValuation: Number(expectedValuation),
              priority,
              rationale,
            },
          ]
        : [];

      const payload = {
        planningPeriod,
        totalAvailableCapital: Number(totalAvailableCapital),
        proposedAllocations,
      };

      const res = await saveAllocationPlan(payload);
      if (res?.success) {
        setFeedback({ type: 'success', message: 'Capital allocation plan created & approved successfully!' });
        setIsModalOpen(false);
        fetchData();
      } else {
        setFeedback({ type: 'error', message: res?.message || 'Failed to create allocation plan.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || err.message || 'Server error creating plan.' });
    } finally {
      setIsSaving(false);
    }
  };

  const activePlan = plans[0] || null;
  const availableCap = activePlan?.totalAvailableCapital || strategy?.targetCapitalDeployment || 5000000;
  const alreadyDeployed = activePlan?.alreadyDeployedCapital || 0;
  const reservedFollowOn = activePlan?.reservedFollowOnCapital || (strategy?.targetFollowOnReserve ? Math.round((availableCap * strategy.targetFollowOnReserve) / 100) : 0);
  const totalProposed = activePlan?.totalProposedCapital || 0;
  const remainingCap = availableCap - alreadyDeployed - totalProposed;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Capital Allocation & Deployment Plans...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-100">Capital Deployment & Allocation Plans</h1>
            <p className="text-sm text-slate-400">
              Manage deployment targets, follow-on reserves, check size allocations, and fund constraints.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={fetchData} icon={RefreshCw} variant="outline" size="sm">
              Refresh
            </Button>
            <Button onClick={() => setIsModalOpen(true)} icon={Plus} variant="primary" size="sm">
              Create Allocation Plan
            </Button>
          </div>
        </div>

        {/* Connected Workflows Quick Bar */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
          <Link to="/investor/strategy" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-brand-400" /> Investment Mandate Strategy
          </Link>
          <Link to="/investor/opportunities/ranking" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-indigo-400" /> Opportunity Ranking
          </Link>
          <Link to="/investor/portfolio" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Venture Portfolio
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

      {/* Error Recovery Banner */}
      {isError && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Could not load allocation plan dataset. Please try again.</span>
          </div>
          <Button variant="outline" size="xs" onClick={fetchData}>Retry</Button>
        </div>
      )}

      {/* Over-allocation Warning */}
      {remainingCap < 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-center gap-3 text-xs text-amber-300">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <strong className="font-bold">Over-Allocation Warning:</strong> Total proposed allocations + deployed capital exceed available fund pool by ${Math.abs(remainingCap).toLocaleString()}.
          </div>
        </div>
      )}

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard
          title="Total Available Capital"
          value={`$${(availableCap / 1000000).toFixed(1)}M`}
          subtitle="Fund Allocation Pool"
          icon={DollarSign}
          color="brand"
        />
        <MetricCard
          title="Already Deployed"
          value={`$${(alreadyDeployed / 1000).toFixed(0)}K`}
          subtitle="Closed Holdings"
          icon={CheckCircle2}
          color="indigo"
        />
        <MetricCard
          title="Follow-On Reserve"
          value={`$${(reservedFollowOn / 1000).toFixed(0)}K`}
          subtitle="Pro-Rata Reserved"
          icon={PieChart}
          color="emerald"
        />
        <MetricCard
          title="Proposed Allocations"
          value={`$${(totalProposed / 1000).toFixed(0)}K`}
          subtitle="Planned Check Sizes"
          icon={DollarSign}
          color="teal"
        />
      </div>

      {plans.length === 0 ? (
        <Card className="text-center py-12 border-slate-800 bg-slate-900">
          <CardBody className="space-y-4">
            <PieChart className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-200">No Allocation Plans Formally Recorded</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your capital allocation plans and check size deployment targets will appear here. Create your first plan above.
            </p>
            <Button onClick={() => setIsModalOpen(true)} icon={Plus} variant="outline" size="sm">
              Record First Plan
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {plans.map((pl) => (
            <Card key={pl._id} className="border-slate-800 bg-slate-900">
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">Planning Period: {pl.planningPeriod}</h4>
                    <p className="text-xs text-slate-400">Total Available: ${(pl.totalAvailableCapital || 0).toLocaleString()}</p>
                  </div>
                  <Badge variant={pl.status === 'Approved' ? 'emerald' : 'amber'}>{pl.status}</Badge>
                </div>

                <div className="grid grid-cols-4 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Deployed</span>
                    <span className="font-bold text-slate-200">${(pl.alreadyDeployedCapital || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Follow-On Reserve</span>
                    <span className="font-bold text-slate-300">${(pl.reservedFollowOnCapital || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Proposed Allocations</span>
                    <span className="font-bold text-emerald-400">${(pl.totalProposedCapital || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Remaining</span>
                    <span className={`font-bold ${(pl.remainingCapital || 0) < 0 ? 'text-rose-400' : 'text-brand-400'}`}>
                      ${(pl.remainingCapital || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {pl.proposedAllocations && pl.proposedAllocations.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-xs font-bold text-slate-300 block">Target Startup Allocations</span>
                    <div className="space-y-2">
                      {pl.proposedAllocations.map((item, idx) => (
                        <div key={idx} className="p-3 bg-slate-950/40 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs font-mono">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-brand-400 shrink-0" />
                            <div>
                              <Link
                                to={`/investor/startups/${item.startup?._id || item.startup}`}
                                className="font-bold text-slate-200 hover:text-brand-400 transition-colors"
                              >
                                {item.startup?.startupName || 'Target Startup'}
                              </Link>
                              <p className="text-[10px] text-slate-400">{item.rationale || 'Strategic fit'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-emerald-400 block">${(item.proposedAmount || 0).toLocaleString()}</span>
                            <span className="text-[10px] text-slate-400">{item.expectedOwnership}% Target Ownership</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}


      {/* Create Capital Allocation Plan Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-400" />
                <span>Create Capital Allocation Plan</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <Input
                label="Planning Period"
                value={planningPeriod}
                onChange={(e) => setPlanningPeriod(e.target.value)}
                placeholder="e.g. Q3-Q4 2026 or FY 2027"
                required
              />

              <Input
                label="Total Available Capital ($)"
                type="number"
                value={totalAvailableCapital}
                onChange={(e) => setTotalAvailableCapital(Number(e.target.value))}
                required
              />

              <div className="pt-2 border-t border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-200 block">Proposed Check Allocation (Optional)</span>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Select Target Startup</label>
                  <select
                    className="w-full bg-slate-950 text-slate-100 text-sm rounded-xl border border-slate-800 p-2.5"
                    value={selectedStartupId}
                    onChange={(e) => setSelectedStartupId(e.target.value)}
                  >
                    <option value="">-- No initial startup selection --</option>
                    {startups.map((st) => (
                      <option key={st._id} value={st._id}>
                        {st.startupName} ({st.sector} • {st.stage})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedStartupId && (
                  <div className="space-y-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="Proposed Check ($)"
                        type="number"
                        value={proposedAmount}
                        onChange={(e) => setProposedAmount(Number(e.target.value))}
                      />
                      <Input
                        label="Expected Ownership (%)"
                        type="number"
                        value={expectedOwnership}
                        onChange={(e) => setExpectedOwnership(Number(e.target.value))}
                      />
                    </div>
                    <Input
                      label="Investment Rationale"
                      value={rationale}
                      onChange={(e) => setRationale(e.target.value)}
                      placeholder="e.g. High conviction Seed round participation"
                    />
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                  Approve Plan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CapitalAllocation;
