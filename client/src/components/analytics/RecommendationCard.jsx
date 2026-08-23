import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Check, X, ArrowRight, Eye, Bookmark } from 'lucide-react';
import { Card, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { getMatchScoreColor } from '../../utils/analyticsConstants';

export const RecommendationCard = ({ startup, onShortlist }) => {
  const badgeVariant = getMatchScoreColor(startup.matchScore);

  return (
    <Card className="bg-slate-900 border-slate-800 space-y-4">
      <CardBody className="space-y-4">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center text-white text-lg font-bold shadow-lg shrink-0">
              {startup.startupName ? startup.startupName.substring(0, 2).toUpperCase() : 'ST'}
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm line-clamp-1">{startup.startupName}</h3>
              <p className="text-xs text-slate-400 font-mono">{startup.sector} • {startup.stage}</p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <Badge variant={badgeVariant} size="sm">
              <Sparkles className="w-3 h-3 mr-1" /> {startup.matchScore}% Match
            </Badge>
            <p className="text-[9px] text-slate-500 font-mono mt-0.5">Platform Match Score</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 line-clamp-2">{startup.tagline}</p>

        {/* Matching Factors */}
        {Array.isArray(startup.matchingFactors) && startup.matchingFactors.length > 0 && (
          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 space-y-1">
            <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">Matching Mandate Factors:</p>
            <div className="flex flex-wrap gap-1">
              {startup.matchingFactors.slice(0, 3).map((factor, idx) => (
                <span key={idx} className="text-[10px] text-slate-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-400" /> {factor}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
          <Link to={`/investor/startups/${startup._id}`}>
            <Button variant="outline" size="sm" icon={Eye}>
              View Startup Profile
            </Button>
          </Link>

          {onShortlist && (
            <Button variant="primary" size="sm" icon={Bookmark} onClick={() => onShortlist(startup._id)}>
              Save to Shortlist
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default RecommendationCard;
