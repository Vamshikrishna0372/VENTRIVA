import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Search,
  Loader2,
  RefreshCw,
  SlidersHorizontal,
  PieChart,
  Target,
  Building2,
  AlertCircle,
  Filter,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import OpportunityRankingCard from '../../components/strategy/OpportunityRankingCard';
import { getOpportunityRanking } from '../../services/opportunityRankingService';
import { SECTORS, STAGES } from '../../utils/constants';

export const OpportunityRanking = () => {
  const [rankings, setRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedStage, setSelectedStage] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRankings();
  }, [selectedSector, selectedStage]);

  const fetchRankings = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await getOpportunityRanking({
        sector: selectedSector,
        stage: selectedStage,
        search: searchQuery,
      });
      if (res?.success) {
        setRankings(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching opportunity rankings:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRankings();
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
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-100">Risk-Adjusted Opportunity Ranking</h1>
            <p className="text-sm text-slate-400">
              Ranked startup opportunities evaluated against conviction scores, thesis fit, and portfolio strategy.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={fetchRankings} icon={RefreshCw} variant="outline" size="sm">
              Refresh Ranking
            </Button>
            <Link to="/investor/strategy">
              <Button variant="primary" size="sm" icon={Target}>
                Edit Strategy Thesis
              </Button>
            </Link>
          </div>
        </div>

        {/* Connected Workflows Quick Bar */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
          <Link to="/investor/strategy" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-brand-400" /> Investment Mandate Strategy
          </Link>
          <Link to="/investor/capital-allocation" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <PieChart className="w-3.5 h-3.5 text-indigo-400" /> Capital Allocation Plans
          </Link>
          <Link to="/investor/portfolio" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Venture Portfolio
          </Link>
        </div>
      </div>

      {/* Error Recovery Banner */}
      {isError && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>Failed to load opportunity ranking dataset. Please try again.</span>
          </div>
          <Button variant="outline" size="xs" onClick={fetchRankings}>Retry</Button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <Card className="border-slate-800 bg-slate-900">
        <CardBody className="p-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search ranked opportunities by startup name or sector..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-brand-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2"
              >
                <option value="all">All Sectors</option>
                {(SECTORS || []).map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>

              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-2"
              >
                <option value="all">All Stages</option>
                {(STAGES || []).map((stg) => (
                  <option key={stg} value={stg}>{stg}</option>
                ))}
              </select>

              <Button type="submit" variant="secondary" size="sm" icon={Filter}>
                Filter
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {rankings.length === 0 ? (
        <Card className="text-center py-12">
          <CardBody className="space-y-3">
            <Award className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-200">No Startup Opportunities Ranked</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              When published startups match your strategy mandate and search filters, their opportunity rankings will appear here.
            </p>
            <div className="pt-2">
              <Link to="/investor/discover">
                <Button variant="outline" size="sm">Explore Discovery Directory</Button>
              </Link>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rankings.map((item) => (
            <OpportunityRankingCard key={item.startup?._id || item.rank} item={item} onActionComplete={fetchRankings} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OpportunityRanking;

