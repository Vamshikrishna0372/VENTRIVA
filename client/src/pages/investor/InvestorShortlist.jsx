import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, Search, Compass, SlidersHorizontal, ClipboardCheck, Columns, Loader2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import StartupCard from '../../components/investor/StartupCard';
import { getShortlist, removeFromShortlist } from '../../services/shortlistService';
import { getMyEvaluations } from '../../services/evaluationService';
import { getMyPipelines, savePipelineEntry } from '../../services/pipelineService';

export const InvestorShortlist = () => {
  const navigate = useNavigate();
  const [shortlists, setShortlists] = useState([]);
  const [evaluationMap, setEvaluationMap] = useState({});
  const [pipelineMap, setPipelineMap] = useState({});

  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchShortlistAndContext();
  }, []);

  const fetchShortlistAndContext = async () => {
    setIsLoading(true);
    try {
      const [shortlistRes, evalRes, pipeRes] = await Promise.all([
        getShortlist(),
        getMyEvaluations(),
        getMyPipelines(),
      ]);

      if (shortlistRes?.success && Array.isArray(shortlistRes.shortlists)) {
        setShortlists(shortlistRes.shortlists);
      }

      if (evalRes?.success && Array.isArray(evalRes.evaluations)) {
        const map = {};
        evalRes.evaluations.forEach((ev) => {
          if (ev.startup?._id) map[ev.startup._id] = ev;
        });
        setEvaluationMap(map);
      }

      if (pipeRes?.success && Array.isArray(pipeRes.pipelines)) {
        const pMap = {};
        pipeRes.pipelines.forEach((p) => {
          if (p.startup?._id) pMap[p.startup._id] = p;
        });
        setPipelineMap(pMap);
      }
    } catch (err) {
      console.error('Error fetching shortlist context:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveShortlist = async (startupId) => {
    try {
      await removeFromShortlist(startupId);
      setShortlists((prev) => prev.filter((item) => item.startup?._id !== startupId));
    } catch (err) {
      alert('Failed to remove startup from shortlist');
    }
  };

  const handleAddToPipeline = async (startupId) => {
    try {
      const res = await savePipelineEntry({ startupId, stage: 'New', priority: 'Medium' });
      if (res?.success) {
        navigate(`/investor/pipeline/${startupId}`);
      }
    } catch (err) {
      alert('Failed to add startup to pipeline');
    }
  };

  const filteredShortlists = shortlists.filter((item) => {
    if (!item.startup) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.startup.startupName?.toLowerCase().includes(term) ||
      item.startup.sector?.toLowerCase().includes(term) ||
      item.startup.tagline?.toLowerCase().includes(term)
    );
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Saved Shortlist...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-100">Saved Shortlist</h1>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                {shortlists.length} Saved Ventures
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Manage shortlisted startups saved for deal evaluation, scoring, and side-by-side comparison.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {shortlists.length >= 2 && (
              <Link to="/investor/compare">
                <Button variant="outline" size="sm" icon={SlidersHorizontal}>
                  Compare Matrix ({Math.min(3, shortlists.length)})
                </Button>
              </Link>
            )}
            <Link to="/investor/discover">
              <Button variant="primary" size="sm" icon={Compass}>
                Discover More Startups
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Saved Search */}
        {shortlists.length > 0 && (
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search saved startups by name or sector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 text-sm rounded-xl pl-10 pr-4 py-2 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
            />
          </div>
        )}
      </div>

      {/* Shortlist Items Grid */}
      {filteredShortlists.length === 0 ? (
        <Card className="text-center py-16 px-4 space-y-4">
          <Bookmark className="w-12 h-12 text-slate-500 mx-auto" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-100">
              {shortlists.length === 0 ? 'No Saved Startups in Shortlist' : 'No Shortlisted Ventures Match Search'}
            </h3>
            <p className="text-xs text-slate-400">
              {shortlists.length === 0
                ? 'Save interesting startup opportunities while evaluating profiles in the Discovery Engine.'
                : 'Try adjusting your search terms to find saved shortlist entries.'}
            </p>
          </div>
          {shortlists.length === 0 && (
            <Link to="/investor/discover">
              <Button variant="primary" size="sm" icon={Compass}>
                Explore Discovery Engine
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShortlists.map((item) => {
            const ev = evaluationMap[item.startup._id];
            const p = pipelineMap[item.startup._id];

            return (
              <div key={item.startup._id} className="space-y-2">
                <StartupCard
                  startup={item.startup}
                  isShortlisted={true}
                  onToggleShortlist={() => handleRemoveShortlist(item.startup._id)}
                />

                {/* Status Sub-bar */}
                <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-2.5 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <ClipboardCheck className="w-3.5 h-3.5 text-brand-400" />
                      {ev ? (
                        <span className="font-bold text-slate-200">
                          Evaluated: {(ev.overallScore || 0).toFixed(1)}/10
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Not Evaluated</span>
                      )}
                    </div>

                    <Link
                      to={`/investor/startups/${item.startup._id}/evaluate`}
                      className="text-[11px] font-semibold text-brand-400 hover:underline"
                    >
                      {ev ? 'Edit Eval' : 'Evaluate'} &rarr;
                    </Link>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                    <div className="flex items-center gap-1.5">
                      <Columns className="w-3.5 h-3.5 text-indigo-400" />
                      {p ? (
                        <span className="font-bold text-indigo-300">
                          Pipeline: {p.stage} ({p.priority})
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No Pipeline Entry</span>
                      )}
                    </div>

                    {p ? (
                      <Link
                        to={`/investor/pipeline/${item.startup._id}`}
                        className="text-[11px] font-semibold text-indigo-400 hover:underline"
                      >
                        View Deal &rarr;
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddToPipeline(item.startup._id)}
                        className="text-[11px] font-semibold text-emerald-400 hover:underline"
                      >
                        + Add to Pipeline
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InvestorShortlist;
