import React, { useState, useEffect } from 'react';
import { Sparkles, Filter, Loader2, Compass } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';

import RecommendationCard from '../../components/analytics/RecommendationCard';
import { getInvestorRecommendations } from '../../services/recommendationService';
import { addToShortlist } from '../../services/shortlistService';

export const InvestorRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [sectorFilter, setSectorFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [minScoreFilter, setMinScoreFilter] = useState('0');

  useEffect(() => {
    fetchRecommendations();
  }, [sectorFilter, stageFilter, minScoreFilter]);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const res = await getInvestorRecommendations({
        sector: sectorFilter,
        stage: stageFilter,
        minMatchScore: minScoreFilter,
      });

      if (res?.success && Array.isArray(res.recommendations)) {
        setRecommendations(res.recommendations);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShortlist = async (startupId) => {
    try {
      await addToShortlist(startupId);
      alert('Startup saved to shortlist!');
    } catch (err) {
      alert('Failed to shortlist startup');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-100">Personalized Startup Recommendations</h1>
              <Badge variant="brand">DISCOVERY ENGINE</Badge>
            </div>
            <p className="text-sm text-slate-400">
              Startups matched against your stated sector, stage, and investment mandate preferences.
              <span className="text-xs text-brand-400 font-mono block mt-0.5">Platform Match Score is calculated from preference alignment and is not financial advice.</span>
            </p>
          </div>

          <Badge variant="emerald">{recommendations.length} Matched Startups</Badge>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
          <Select
            value={sectorFilter}
            onChange={(e) => setSectorFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Sectors' },
              { value: 'FinTech', label: 'FinTech' },
              { value: 'HealthTech', label: 'HealthTech' },
              { value: 'AI/ML', label: 'AI/ML' },
              { value: 'SaaS', label: 'SaaS' },
              { value: 'CleanTech', label: 'CleanTech' },
            ]}
          />

          <Select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Investment Stages' },
              { value: 'Pre-Seed', label: 'Pre-Seed' },
              { value: 'Seed', label: 'Seed' },
              { value: 'Series A', label: 'Series A' },
              { value: 'Series B+', label: 'Series B+' },
            ]}
          />

          <Select
            value={minScoreFilter}
            onChange={(e) => setMinScoreFilter(e.target.value)}
            options={[
              { value: '0', label: 'All Match Scores' },
              { value: '70', label: '70%+ Match Score' },
              { value: '80', label: '80%+ Match Score' },
              { value: '90', label: '90%+ Match Score' },
            ]}
          />
        </div>
      </div>

      {/* Recommendations Grid */}
      {isLoading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Calculating Platform Match Scores...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <Card className="text-center py-16 px-4 space-y-4">
          <Sparkles className="w-12 h-12 text-slate-500 mx-auto" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-100">No Startup Recommendations Matched</h3>
            <p className="text-xs text-slate-400">Try broadening your preference criteria or minimum match score filter.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendations.map((startup) => (
            <RecommendationCard
              key={startup._id}
              startup={startup}
              onShortlist={handleShortlist}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default InvestorRecommendations;
