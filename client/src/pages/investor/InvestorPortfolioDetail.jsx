import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Building2, ArrowLeft, Loader2, DollarSign, TrendingUp, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import PortfolioHealthBadge from '../../components/portfolio/PortfolioHealthBadge';
import PortfolioUpdateCard from '../../components/portfolio/PortfolioUpdateCard';

import { getInvestmentById, updateInvestmentStatus } from '../../services/investmentService';
import { getUpdatesForInvestment, acknowledgePortfolioUpdate } from '../../services/portfolioUpdateService';

export const InvestorPortfolioDetail = () => {
  const { id } = useParams();
  const [investment, setInvestment] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    setIsLoading(true);
    try {
      const [invRes, updRes] = await Promise.all([
        getInvestmentById(id),
        getUpdatesForInvestment(id),
      ]);

      if (invRes?.success) setInvestment(invRes.data);
      if (updRes?.success) setUpdates(updRes.data);
    } catch (err) {
      console.error('Error fetching portfolio detail:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcknowledgeUpdate = async (updateId) => {
    try {
      const res = await acknowledgePortfolioUpdate(updateId);
      if (res?.success) fetchDetail();
    } catch (err) {
      console.error('Error acknowledging portfolio update:', err);
    }
  };

  const handleHealthChange = async (newHealth) => {
    try {
      const res = await updateInvestmentStatus(id, { healthStatus: newHealth });
      if (res?.success) fetchDetail();
    } catch (err) {
      console.error('Error updating health status:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Portfolio Holding Record...</p>
      </div>
    );
  }

  if (!investment) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center">
        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
          <Building2 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-200">Portfolio Holding Record Not Found</h3>
        <p className="text-xs text-slate-400 max-w-sm">The requested investment record could not be found or you do not have permission to view it.</p>
        <Link to="/investor/portfolio">
          <Button variant="primary" size="sm" icon={ArrowLeft}>Back to Portfolio</Button>
        </Link>
      </div>
    );
  }

  const { startup, investmentAmount, ownershipPercentage, currentValuation, currentValue, returnMultiple, healthStatus, healthScore, investmentDate } = investment;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/investor/portfolio" className="p-2 text-slate-400 hover:text-white bg-slate-950/60 rounded-xl border border-slate-800">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-lg">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-100">{startup?.startupName || 'Portfolio Company'}</h1>
                <PortfolioHealthBadge healthStatus={healthStatus} score={healthScore} size="md" />
              </div>
              <p className="text-xs text-slate-400">{startup?.sector} • Invested on {new Date(investmentDate).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={healthStatus}
              onChange={(e) => handleHealthChange(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2"
            >
              <option value="Excellent">Health: Excellent</option>
              <option value="Healthy">Health: Healthy</option>
              <option value="Watch">Health: Watch</option>
              <option value="At Risk">Health: At Risk</option>
              <option value="Critical">Health: Critical</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800 font-mono">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Capital Invested</span>
            <span className="text-base font-bold text-slate-100">${(investmentAmount || 0).toLocaleString()}</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Ownership Stake</span>
            <span className="text-base font-bold text-slate-100">{ownershipPercentage}%</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Holding Market Value</span>
            <span className="text-base font-bold text-emerald-400">${(currentValue || 0).toLocaleString()}</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 uppercase block">Holding MOIC</span>
            <span className="text-base font-bold text-emerald-400">{returnMultiple}x</span>
          </div>
        </div>
      </div>

      {/* Founder Updates List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-100">Founder Progress Reports</h2>
        {updates.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400">
            No founder progress updates submitted yet.
          </div>
        ) : (
          updates.map((u) => (
            <PortfolioUpdateCard
              key={u._id}
              update={u}
              isInvestor={true}
              onAcknowledge={handleAcknowledgeUpdate}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default InvestorPortfolioDetail;
