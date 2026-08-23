import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Building2, TrendingUp, DollarSign, ArrowRight, Loader2, Cpu } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import MetricCard from '../../components/analytics/MetricCard';
import PortfolioHealthBadge from '../../components/portfolio/PortfolioHealthBadge';
import { getMyInvestments, getPortfolioAnalytics } from '../../services/investmentService';

export const InvestorPortfolio = () => {
  const [investments, setInvestments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    setIsLoading(true);
    try {
      const [invRes, anaRes] = await Promise.all([
        getMyInvestments(),
        getPortfolioAnalytics(),
      ]);

      if (invRes?.success) setInvestments(invRes.data);
      if (anaRes?.success) setAnalytics(anaRes.data);
    } catch (err) {
      console.error('Error fetching investor portfolio:', err);
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

  const { totalInvestedCapital = 0, totalCurrentValue = 0, unrealizedGainLoss = 0, returnMultiple = 1.0, totalCompanies = 0 } = analytics || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2">
        <h1 className="text-2xl font-bold text-slate-100">Venture Portfolio Dashboard</h1>
        <p className="text-sm text-slate-400">Post-investment monitoring, ownership tracking, founder progress updates, and portfolio financial performance.</p>
      </div>

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
                      <p className="text-xs text-slate-400">{inv.startup?.sector} • {inv.investmentType}</p>
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
                    <span className="font-bold text-emerald-400">{inv.returnMultiple}x</span>
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
