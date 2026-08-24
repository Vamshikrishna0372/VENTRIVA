import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, AlertTriangle, PieChart, TrendingUp, Loader2, RefreshCw, ArrowLeft, Building2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import RiskAlertCard from '../../components/portfolio/RiskAlertCard';
import PortfolioConcentrationCard from '../../components/portfolio/PortfolioConcentrationCard';
import { getIntelligenceAlerts, getConcentrationAnalysis } from '../../services/portfolioIntelligenceService';

export const InvestorPortfolioIntelligence = () => {
  const [alerts, setAlerts] = useState([]);
  const [concentration, setConcentration] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    fetchIntelligenceData();
  }, []);

  const fetchIntelligenceData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const [altRes, conRes] = await Promise.all([
        getIntelligenceAlerts(),
        getConcentrationAnalysis(),
      ]);

      if (altRes?.success) setAlerts(altRes.data || []);
      if (conRes?.success) setConcentration(conRes.data || null);
    } catch (err) {
      console.error('Error fetching portfolio intelligence:', err);
      setIsError(true);
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
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-brand-400" />
              <h1 className="text-2xl font-bold text-slate-100">Portfolio Intelligence & Risk Monitor</h1>
            </div>
            <p className="text-sm text-slate-400">
              Automated risk signals, cash runway monitoring, follow-on opportunity detection, and concentration analysis.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchIntelligenceData}>
              Refresh
            </Button>
            <Link to="/investor/portfolio">
              <Button variant="secondary" size="sm" icon={Building2}>
                View Holdings
              </Button>
            </Link>
          </div>
        </div>

        {/* Navigation Breadcrumb Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono text-slate-400">
          <Link to="/investor/dashboard" className="hover:text-brand-400 transition-colors">Dashboard</Link>
          <span>/</span>
          <Link to="/investor/portfolio" className="hover:text-brand-400 transition-colors">Portfolio</Link>
          <span>/</span>
          <span className="text-slate-200">Intelligence & Risk</span>
        </div>
      </div>

      {/* Error Recovery Banner */}
      {isError && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Could not load portfolio risk analysis. Please try again.</span>
          </div>
          <Button variant="outline" size="xs" onClick={fetchIntelligenceData}>Retry</Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Risk & Opportunity Signals */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-100">Active Risk & Intelligence Signals</h2>
          {alerts.length === 0 ? (
            <Card className="text-center py-8">
              <CardBody>
                <Sparkles className="w-10 h-10 text-brand-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-200">
                  {concentration?.totalHoldings === 0 ? 'No Active Portfolio Holdings to Evaluate' : 'Portfolio Health Optimal'}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {concentration?.totalHoldings === 0
                    ? 'Complete deal closings to monitor post-investment runway, revenue, and concentration risks.'
                    : 'No critical runway, revenue, or milestone risk alerts detected across active holdings.'}
                </p>
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

