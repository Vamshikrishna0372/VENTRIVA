import React, { useState, useEffect } from 'react';
import { TrendingUp, Plus, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import FollowOnInvestmentCard from '../../components/portfolio/FollowOnInvestmentCard';
import { getFollowOnOpportunities, updateFollowOnStatus, convertFollowOnToInvestment } from '../../services/followOnInvestmentService';

export const InvestorFollowOnInvestments = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFollowOns();
  }, []);

  const fetchFollowOns = async () => {
    setIsLoading(true);
    try {
      const res = await getFollowOnOpportunities();
      if (res?.success) setOpportunities(res.data);
    } catch (err) {
      console.error('Error fetching follow-on opportunities:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id, status) => {
    try {
      const res = await updateFollowOnStatus(id, status);
      if (res?.success) fetchFollowOns();
    } catch (err) {
      console.error('Error approving follow-on opportunity:', err);
    }
  };

  const handleConvert = async (id) => {
    try {
      const res = await convertFollowOnToInvestment(id);
      if (res?.success) fetchFollowOns();
    } catch (err) {
      console.error('Error converting follow-on opportunity:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Follow-On & Pro-Rata Opportunities...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2">
        <h1 className="text-2xl font-bold text-slate-100">Follow-On & Pro-Rata Investments</h1>
        <p className="text-sm text-slate-400">Manage follow-on funding rounds, track pro-rata ownership rights, and convert approved proposals into deployed capital.</p>
      </div>

      {opportunities.length === 0 ? (
        <Card className="text-center py-12">
          <CardBody className="space-y-3">
            <TrendingUp className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-200">No Follow-On Opportunities Recorded</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Follow-on and pro-rata opportunities for portfolio companies will be listed here for approval and conversion into deployed capital.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {opportunities.map((opp) => (
            <FollowOnInvestmentCard
              key={opp._id}
              opportunity={opp}
              isInvestor={true}
              onApprove={handleApprove}
              onConvert={handleConvert}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default InvestorFollowOnInvestments;
