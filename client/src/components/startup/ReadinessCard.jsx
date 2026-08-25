import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, ShieldCheck, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { getMyStartupReadiness } from '../../services/startupService';

export const ReadinessCard = () => {
  const [readiness, setReadiness] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReadiness();
  }, []);

  const fetchReadiness = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getMyStartupReadiness();
      if (res?.success && res?.data) {
        setReadiness(res.data);
      }
    } catch (err) {
      console.error('Error fetching readiness score:', err);
      setError('Unable to load readiness score.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-900 border-slate-800 p-6 flex items-center justify-center space-y-2">
        <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
        <span className="text-xs text-slate-400 font-mono ml-2">Calculating Investment Readiness Score...</span>
      </Card>
    );
  }

  if (error || !readiness) {
    return null; // Gracefully hide if no startup profile
  }

  const { overallScore, categoryScores, completedItems, missingItems, recommendedActions } = readiness;

  const getScoreVariant = (score) => {
    if (score >= 80) return 'emerald';
    if (score >= 50) return 'amber';
    return 'rose';
  };

  return (
    <Card className="bg-slate-900 border-slate-800 space-y-5 min-w-0 max-w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 rounded-xl border border-slate-800 min-w-0 max-w-full">
        <div className="flex items-center gap-3 min-w-0 max-w-full">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 shrink-0">
            <Award className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0 max-w-full">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-100">Investment Readiness Score</h2>
              <Badge variant={getScoreVariant(overallScore)}>{overallScore} / 100</Badge>
            </div>
            <p className="text-xs text-slate-400">Institutional venture capital diligence readiness score based on real platform data.</p>
          </div>
        </div>

        <Button variant="ghost" size="sm" icon={RefreshCw} onClick={fetchReadiness} className="self-start sm:self-auto shrink-0">
          Recalculate
        </Button>
      </div>

      <CardBody className="space-y-6 pt-0 min-w-0 max-w-full">
        {/* Progress Bar */}
        <div className="space-y-1.5 min-w-0 max-w-full">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-400">Readiness Completion</span>
            <span className="text-brand-400 font-bold">{overallScore}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className={`h-full transition-all duration-500 ${
                overallScore >= 80 ? 'bg-emerald-500' : overallScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${overallScore}%` }}
            />
          </div>
        </div>

        {/* Category Breakdown Grid */}
        <div className="min-w-0 max-w-full">
          <h4 className="text-xs font-mono uppercase text-slate-400 mb-3">Readiness Category Breakdown</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 min-w-0 max-w-full">
            {Object.entries(categoryScores || {}).map(([key, cat]) => (
              <div key={key} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs min-w-0 max-w-full">
                <span className="text-slate-300 truncate mr-2">{cat.name}</span>
                <span className={`font-mono font-bold shrink-0 ${cat.score === cat.maxScore ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {cat.score}/{cat.maxScore}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Actions List */}
        {recommendedActions && recommendedActions.length > 0 && (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-mono uppercase text-slate-400">Recommended Priority Actions</h4>
            <div className="space-y-2">
              {recommendedActions.map((action, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-100 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>{action.title}</span>
                    </p>
                    <p className="text-[11px] text-slate-400">{action.description}</p>
                  </div>

                  <Link to={action.targetRoute} className="shrink-0">
                    <Button variant="primary" size="sm" icon={ArrowRight}>
                      Resolve
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default ReadinessCard;
