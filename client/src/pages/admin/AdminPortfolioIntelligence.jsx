import React, { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import RiskAlertCard from '../../components/portfolio/RiskAlertCard';
import PortfolioConcentrationCard from '../../components/portfolio/PortfolioConcentrationCard';
import { getIntelligenceAlerts, getConcentrationAnalysis } from '../../services/portfolioIntelligenceService';

export const AdminPortfolioIntelligence = () => {
  const [alerts, setAlerts] = useState([]);
  const [concentration, setConcentration] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdminIntelligence();
  }, []);

  const fetchAdminIntelligence = async () => {
    setIsLoading(true);
    try {
      const [altRes, conRes] = await Promise.all([
        getIntelligenceAlerts(),
        getConcentrationAnalysis(),
      ]);

      if (altRes?.success) setAlerts(altRes.data);
      if (conRes?.success) setConcentration(conRes.data);
    } catch (err) {
      console.error('Error fetching admin intelligence:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Running Platform Governance Risk Scan...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-slate-100">Platform Portfolio Intelligence & Risk Audit</h1>
          <Badge variant="rose">ADMIN GOVERNANCE</Badge>
        </div>
        <p className="text-sm text-slate-400">Platform-wide risk monitoring, cash runway alert aggregation, and sector concentration audit.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-100">Platform Risk & Intelligence Signals</h2>
          {alerts.length === 0 ? (
            <Card className="text-center py-8">
              <CardBody>
                <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-200">No Systemic Risk Signals Detected</p>
                <p className="text-xs text-slate-400 mt-1">Platform venture portfolio exhibits healthy runway and update execution.</p>
              </CardBody>
            </Card>
          ) : (
            alerts.map((al) => <RiskAlertCard key={al.id} alert={al} />)
          )}
        </div>

        <div>
          <PortfolioConcentrationCard concentration={concentration} />
        </div>
      </div>
    </div>
  );
};

export default AdminPortfolioIntelligence;
