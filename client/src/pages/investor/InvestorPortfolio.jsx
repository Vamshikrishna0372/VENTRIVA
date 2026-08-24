import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  TrendingUp,
  DollarSign,
  ArrowRight,
  Loader2,
  Cpu,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  PieChart,
  Shield,
  Layers,
  LogOut,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import MetricCard from '../../components/analytics/MetricCard';
import PortfolioHealthBadge from '../../components/portfolio/PortfolioHealthBadge';
import { getMyInvestments, getPortfolioAnalytics } from '../../services/investmentService';

export const InvestorPortfolio = () => {
  const [investments, setInvestments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const [invRes, anaRes] = await Promise.all([
        getMyInvestments(),
        getPortfolioAnalytics(),
      ]);

      if (invRes?.success) setInvestments(invRes.data || []);
      if (anaRes?.success) setAnalytics(anaRes.data || null);
    } catch (err) {
      console.error('Error fetching investor portfolio:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Investment Portfolio Dashboard...</p>
      </div>
    );
  }

  const {
    totalInvestedCapital = 0,
    totalCurrentValue = 0,
    totalCompanies = 0,
    returnMultiple: calcMultiple,
  } = analytics || {};

  const returnMultiple = calcMultiple !== undefined
    ? calcMultiple
    : (totalInvestedCapital > 0 ? (totalCurrentValue / totalInvestedCapital).toFixed(2) : '0.0');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Venture Portfolio Dashboard</h1>
            <p className="text-sm text-slate-400">
              Post-investment monitoring, ownership tracking, founder progress updates, and portfolio financial performance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchPortfolioData}>
              Refresh
            </Button>
            <Link to="/investor/portfolio/intelligence">
              <Button variant="primary" size="sm" icon={Sparkles}>
                Intelligence & Risk
              </Button>
            </Link>
          </div>
        </div>

        {/* Connected Workflows Quick Bar */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
          <Link to="/investor/portfolio/intelligence" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-400" /> Risk & Intelligence
          </Link>
          <Link to="/investor/cap-table" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" /> Cap Table Engine
          </Link>
          <Link to="/investor/governance" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" /> Governance
          </Link>
          <Link to="/investor/follow-on-investments" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" /> Follow-on Opps
          </Link>
          <Link to="/investor/exits" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <LogOut className="w-3.5 h-3.5 text-rose-400" /> Exits & Liquidity
          </Link>
        </div>
      </div>

      {/* Error Recovery Banner */}
      {isError && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Could not refresh portfolio data. Please check connection and try again.</span>
          </div>
          <Button variant="outline" size="xs" onClick={fetchPortfolioData}>Retry</Button>
        </div>
      )}

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <MetricCard title="Portfolio Companies" value={totalCompanies} subtitle="Active holdings" icon={Building2} color="brand" />
        <MetricCard title="Total Capital Deployed" value={`$${totalInvestedCapital.toLocaleString()}`} subtitle="Cost basis" icon={DollarSign} color="indigo" />
        <MetricCard title="Current Portfolio Value" value={`$${totalCurrentValue.toLocaleString()}`} subtitle="Market valuation" icon={TrendingUp} color="emerald" />
        <MetricCard title="Portfolio MOIC" value={`${returnMultiple}x`} subtitle="Return multiplier" icon={Cpu} color="teal" />
      </div>

      {investments.length === 0 ? (
        <Card className="text-center py-12">
          <CardBody className="space-y-3">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-200">No Portfolio Investments Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              When an active Deal Room completes closing, your venture investment will appear here for ongoing post-investment monitoring.
            </p>
            <div className="pt-2">
              <Link to="/investor/pipeline">
                <Button variant="primary" size="sm">Explore Active Deal Pipeline</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {investments.map((inv) => (
            <Card key={inv._id} className="hover:border-slate-700 transition-all">
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100">{inv.startup?.startupName || 'Portfolio Company'}</h3>
                      <p className="text-xs text-slate-400">{inv.startup?.sector || 'Venture'} • {inv.investmentType || 'Equity'}</p>
                    </div>
                  </div>
                  <PortfolioHealthBadge healthStatus={inv.healthStatus} score={inv.healthScore} />
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Invested</span>
                    <span className="font-bold text-slate-200">${(inv.investmentAmount || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Ownership</span>
                    <span className="font-bold text-slate-200">{inv.ownershipPercentage}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">MOIC</span>
                    <span className="font-bold text-emerald-400">{inv.returnMultiple || 1.0}x</span>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-800">
                  <Link to={`/investor/portfolio/${inv._id}`}>
                    <Button variant="outline" size="sm" icon={ArrowRight}>
                      View Portfolio Company
                    </Button>
                  </Link>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvestorPortfolio;

