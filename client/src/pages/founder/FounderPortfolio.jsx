import React, { useState, useEffect } from 'react';
import { Briefcase, Building2, Plus, FileText, Loader2, Users } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import PortfolioUpdateModal from '../../components/portfolio/PortfolioUpdateModal';
import PortfolioUpdateCard from '../../components/portfolio/PortfolioUpdateCard';
import { getMyInvestments } from '../../services/investmentService';
import { getUpdatesForInvestment, submitPortfolioUpdate } from '../../services/portfolioUpdateService';

export const FounderPortfolio = () => {
  const [investments, setInvestments] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchFounderPortfolio();
  }, []);

  const fetchFounderPortfolio = async () => {
    setIsLoading(true);
    try {
      const invRes = await getMyInvestments();
      if (invRes?.success && invRes.data.length > 0) {
        setInvestments(invRes.data);
        // Fetch updates for primary investment
        const updRes = await getUpdatesForInvestment(invRes.data[0]._id);
        if (updRes?.success) setUpdates(updRes.data);
      }
    } catch (err) {
      console.error('Error fetching founder portfolio:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitUpdate = async (updateData) => {
    if (investments.length === 0) return;
    setIsSubmitting(true);
    try {
      const res = await submitPortfolioUpdate({
        ...updateData,
        investmentId: investments[0]._id,
      });
      if (res?.success) {
        setIsUpdateModalOpen(false);
        fetchFounderPortfolio();
      }
    } catch (err) {
      console.error('Error submitting update:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Founder Investor Relations Workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Investor Relations & Reporting</h1>
            <p className="text-sm text-slate-400">Manage ongoing investor communications, submit monthly/quarterly progress reports, and track active venture investors.</p>
          </div>

          {investments.length > 0 && (
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setIsUpdateModalOpen(true)}>
              Submit Investor Update
            </Button>
          )}
        </div>
      </div>

      {investments.length === 0 ? (
        <Card className="text-center py-12">
          <CardBody className="space-y-3">
            <Users className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-200">No Active Investor Holdings</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              When an investor completes an active investment deal room for your startup, your investor relationship portal will activate here.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Investors List */}
          <div>
            <Card>
              <CardHeader title="Active Venture Investors" subtitle="Cap table investor holdings" />
              <CardBody className="space-y-3">
                {investments.map((inv) => (
                  <div key={inv._id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-200">{inv.investor?.firstName} {inv.investor?.lastName}</span>
                      <span className="text-xs font-mono font-bold text-brand-400">{inv.ownershipPercentage}% Stake</span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">Invested: ${(inv.investmentAmount || 0).toLocaleString()} • {inv.investmentType}</p>
                  </div>
                ))}
              </CardBody>
            </Card>
          </div>

          {/* Submitted Updates List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-slate-100">Submitted Progress Reports</h2>
            {updates.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-400">
                No progress reports submitted yet. Click "Submit Investor Update" above to create your first report.
              </div>
            ) : (
              updates.map((u) => <PortfolioUpdateCard key={u._id} update={u} isInvestor={false} />)
            )}
          </div>
        </div>
      )}

      <PortfolioUpdateModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        onSubmit={handleSubmitUpdate}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default FounderPortfolio;
