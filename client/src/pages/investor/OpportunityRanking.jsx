import React, { useState, useEffect } from 'react';
import { Award, Search, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import OpportunityRankingCard from '../../components/strategy/OpportunityRankingCard';
import { getOpportunityRanking } from '../../services/opportunityRankingService';

export const OpportunityRanking = () => {
  const [rankings, setRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRankings();
  }, []);

  const fetchRankings = async () => {
    setIsLoading(true);
    try {
      const res = await getOpportunityRanking();
      if (res?.success) setRankings(res.data);
    } catch (err) {
      console.error('Error fetching opportunity rankings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Calculating Risk-Adjusted Opportunity Rankings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-2">
        <h1 className="text-2xl font-bold text-slate-100">Risk-Adjusted Opportunity Ranking</h1>
        <p className="text-sm text-slate-400">Ranked startup opportunities evaluated against conviction scores, due diligence progress, and portfolio fit.</p>
      </div>

      {rankings.length === 0 ? (
        <Card className="text-center py-12">
          <CardBody className="space-y-3">
            <Award className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-200">No Published Startup Opportunities Ranked</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              When published startups match your discovery parameters, their risk-adjusted opportunity rankings will be listed here.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rankings.map((item) => (
            <OpportunityRankingCard key={item.startup?._id || item.rank} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OpportunityRanking;
