import React, { useState, useEffect } from 'react';
import { ShieldCheck, Target, DollarSign, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import MetricCard from '../../components/analytics/MetricCard';
import StrategyHealthCard from '../../components/strategy/StrategyHealthCard';
import { getMyStrategy } from '../../services/investorStrategyService';
import { getStrategyHealthOverview } from '../../services/portfolioStrategyService';

export const InvestorStrategy = () => {
  const [strategy, setStrategy] = useState(null);
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStrategyData();
  }, []);

  const fetchStrategyData = async () => {
    setIsLoading(true);
    try {
      const [strRes, heaRes] = await Promise.all([
        getMyStrategy(),
        getStrategyHealthOverview(),
      ]);

      if (strRes?.success) setStrategy(strRes.data);
      if (heaRes?.success) setHealth(heaRes.data);
    } catch (err) {
      console.error('Error fetching investor strategy profile:', err);
    } finally {
      setIsLoading(false);
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
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2">
        <h1 className="text-2xl font-bold text-slate-100">Investor Portfolio Strategy & Mandate</h1>
        <p className="text-sm text-slate-400">Target capital deployment, check size guidelines, follow-on reserve targets, and strategy alignment health.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard title="Target Capital Deployment" value={`$${((strategy?.targetCapitalDeployment || 5000000) / 1000000).toFixed(1)}M`} subtitle="Fund allocation" icon={DollarSign} color="brand" />
        <MetricCard title="Target Check Size" value={`$${((strategy?.targetInitialCheckSize || 250000) / 1000).toFixed(0)}K`} subtitle="Initial check size" icon={Target} color="indigo" />
        <MetricCard title="Follow-On Reserve Target" value={`${strategy?.targetFollowOnReserve || 40}%`} subtitle="Pro-rata reserve" icon={ShieldCheck} color="emerald" />
        <MetricCard title="Strategy Health" value={`${health?.score || 80}/100`} subtitle={health?.healthCategory || 'Healthy'} icon={ShieldCheck} color="teal" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StrategyHealthCard health={health} />
        </div>

        <Card>
          <CardHeader title="Active Investment Mandate" subtitle="Guidelines and check size rules" />
          <CardBody className="space-y-3 text-xs font-mono">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Strategy Name</span>
              <span className="font-bold text-slate-200">{strategy?.strategyName}</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Ownership Range Target</span>
              <span className="font-bold text-slate-200">{strategy?.targetOwnershipRange?.min}% - {strategy?.targetOwnershipRange?.max}%</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Target Return Multiple</span>
              <span className="font-bold text-emerald-400">{strategy?.targetReturnMultiple}x MOIC</span>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default InvestorStrategy;
