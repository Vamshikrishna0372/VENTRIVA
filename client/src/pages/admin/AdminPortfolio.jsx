import React, { useState, useEffect } from 'react';
import { Briefcase, Building2, User, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import PortfolioHealthBadge from '../../components/portfolio/PortfolioHealthBadge';
import { getMyInvestments, getPortfolioAnalytics } from '../../services/investmentService';

export const AdminPortfolio = () => {
  const [investments, setInvestments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdminPortfolio();
  }, []);

  const fetchAdminPortfolio = async () => {
    setIsLoading(true);
    try {
      const [invRes, anaRes] = await Promise.all([
        getMyInvestments(),
        getPortfolioAnalytics(),
      ]);

      if (invRes?.success) setInvestments(invRes.data);
      if (anaRes?.success) setAnalytics(anaRes.data);
    } catch (err) {
      console.error('Error fetching admin portfolio audit overview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Querying Platform Portfolio Audit Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-slate-100">Platform Portfolio Governance</h1>
          <Badge variant="rose">ADMIN AUDIT</Badge>
        </div>
        <p className="text-sm text-slate-400">Platform-wide audit visibility into active portfolio holdings, total capital deployed, and overall venture health distribution.</p>
      </div>

      <Card>
        <CardHeader title={`Platform Holdings Registry (${investments.length})`} subtitle="Global investment holdings audit" />
        <CardBody>
          {investments.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">No closed investments recorded on the platform.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                    <th className="py-3 px-4">Startup</th>
                    <th className="py-3 px-4">Investor</th>
                    <th className="py-3 px-4">Founder</th>
                    <th className="py-3 px-4">Capital Invested</th>
                    <th className="py-3 px-4">Stake %</th>
                    <th className="py-3 px-4">Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {investments.map((inv) => (
                    <tr key={inv._id} className="hover:bg-slate-950/40">
                      <td className="py-3 px-4 font-semibold text-slate-200">{inv.startup?.startupName || 'Startup'}</td>
                      <td className="py-3 px-4 text-slate-300">{inv.investor?.name || inv.investor?.email || 'Investor'}</td>
                      <td className="py-3 px-4 text-slate-300">{inv.founder?.name || inv.founder?.email || 'Founder'}</td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-200">${(inv.investmentAmount || 0).toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono text-slate-300">{inv.ownershipPercentage}%</td>
                      <td className="py-3 px-4">
                        <PortfolioHealthBadge healthStatus={inv.healthStatus} score={inv.healthScore} size="xs" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default AdminPortfolio;
