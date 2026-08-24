import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Filter,
  Loader2,
  Compass,
  RefreshCw,
  Search,
  Bookmark,
  Target,
  BarChart2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
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
  const [isError, setIsError] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Filters
  const [sectorFilter, setSectorFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');
  const [minScoreFilter, setMinScoreFilter] = useState('0');

  useEffect(() => {
    fetchRecommendations();
  }, [sectorFilter, stageFilter, minScoreFilter]);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    setIsError(false);
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
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShortlist = async (startupId) => {
    setFeedback({ type: '', message: '' });
    try {
      await addToShortlist(startupId);
      setFeedback({ type: 'success', message: 'Startup saved to your shortlist!' });
    } catch (err) {
      console.error('Error shortlisting startup:', err);
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to shortlist startup' });
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
              <Badge variant="brand">MATCH ENGINE</Badge>
            </div>
            <p className="text-sm text-slate-400">
              Startups matched against your stated sector, stage, and investment mandate preferences.
              <span className="text-xs text-brand-400 font-mono block mt-0.5">Platform Match Score is calculated from preference alignment and is not financial advice.</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={fetchRecommendations} icon={RefreshCw} variant="outline" size="sm">
              Refresh Matches
            </Button>
            <Badge variant="emerald">{recommendations.length} Matched Startups</Badge>
          </div>
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

        {/* Connected Workflows Quick Bar */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
          <Link to="/investor/discover" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-brand-400" /> Discovery Engine
          </Link>
          <Link to="/investor/strategy" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-indigo-400" /> Investment Thesis & Mandate
          </Link>
          <Link to="/investor/shortlist" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 text-cyan-400" /> Saved Shortlist
          </Link>
          <Link to="/investor/analytics" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5 text-purple-400" /> Deal Analytics
          </Link>
        </div>
      </div>

      {feedback.message && (
        <div className={`p-4 rounded-xl border text-xs flex items-center gap-2.5 ${
          feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {isError && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>Failed to calculate recommendations. Please try again.</span>
          </div>
          <Button variant="outline" size="xs" onClick={fetchRecommendations}>Retry</Button>
        </div>
      )}

      {/* Recommendations Grid */}
      {isLoading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Calculating Platform Match Scores...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <Card className="text-center py-16 px-4 space-y-4 border-slate-800 bg-slate-900">
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

