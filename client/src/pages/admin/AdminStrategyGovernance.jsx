import React, { useState, useEffect } from 'react';
import { ShieldCheck, Target, BarChart3, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import StrategyHealthCard from '../../components/strategy/StrategyHealthCard';
import { getStrategyHealthOverview } from '../../services/portfolioStrategyService';

export const AdminStrategyGovernance = () => {
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdminStrategy();
  }, []);

  const fetchAdminStrategy = async () => {
    setIsLoading(true);
    try {
      const res = await getStrategyHealthOverview();
      if (res?.success) setHealth(res.data);
    } catch (err) {
      console.error('Error fetching admin strategy governance overview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Querying Platform Mandate & Strategy Audit Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-slate-100">Platform Strategy & Mandate Governance</h1>
          <Badge variant="rose">ADMIN AUDIT</Badge>
        </div>
        <p className="text-sm text-slate-400">Aggregate platform audit visibility into active investor mandates, capital deployment rates, and strategy health ratings.</p>
      </div>

      <div className="max-w-2xl">
        <StrategyHealthCard health={health} />
      </div>
    </div>
  );
};

export default AdminStrategyGovernance;
