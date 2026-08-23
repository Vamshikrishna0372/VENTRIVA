import React, { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, PieChart, TrendingUp, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import RiskAlertCard from '../../components/portfolio/RiskAlertCard';
import PortfolioConcentrationCard from '../../components/portfolio/PortfolioConcentrationCard';
import { getIntelligenceAlerts, getConcentrationAnalysis } from '../../services/portfolioIntelligenceService';

export const InvestorPortfolioIntelligence = () => {
  const [alerts, setAlerts] = useState([]);
  const [concentration, setConcentration] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchIntelligenceData();
  }, []);

  const fetchIntelligenceData = async () => {
    setIsLoading(true);
    try {
      const [altRes, conRes] = await Promise.all([
        getIntelligenceAlerts(),
        getConcentrationAnalysis(),
      ]);

      if (altRes?.success) setAlerts(altRes.data);
      if (conRes?.success) setConcentration(conRes.data);
    } catch (err) {
      console.error('Error fetching portfolio intelligence:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Running Deterministic Portfolio Intelligence & Risk Engines...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-brand-400" />
          <h1 className="text-2xl font-bold text-slate-100">Portfolio Intelligence & Risk Monitor</h1>
        </div>
        <p className="text-sm text-slate-400">Automated risk signals, cash runway monitoring, follow-on opportunity detection, and concentration analysis.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Risk & Opportunity Signals */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-100">Active Risk & Intelligence Signals</h2>
          {alerts.length === 0 ? (
            <Card className="text-center py-8">
              <CardBody>
                <Sparkles className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-200">Portfolio Health Optimal</p>
                <p className="text-xs text-slate-400 mt-1">No critical runway, revenue, or milestone risk alerts detected across active holdings.</p>
              </CardBody>
            </Card>
          ) : (
            alerts.map((al) => <RiskAlertCard key={al.id} alert={al} />)
          )}
        </div>

        {/* Right Column: Concentration Analysis */}
        <div>
          <PortfolioConcentrationCard concentration={concentration} />
        </div>
      </div>
    </div>
  );
};

export default InvestorPortfolioIntelligence;
