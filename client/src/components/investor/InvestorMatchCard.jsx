import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Building2, CheckCircle2, ArrowRight, TrendingUp, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { getInvestorMatches } from '../../services/discoveryService';

export const InvestorMatchCard = ({ limit = 3 }) => {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    setIsLoading(true);
    try {
      const res = await getInvestorMatches({ limit });
      if (res?.success && Array.isArray(res.matches)) {
        setMatches(res.matches);
      }
    } catch (err) {
      console.error('Error fetching investor matches:', err);
    } font: {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-900 border-slate-800 p-6 flex items-center justify-center space-y-2">
        <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
        <span className="text-xs text-slate-400 font-mono ml-2">Calculating Mandate Match Engine...</span>
      </Card>
    );
  }

  if (matches.length === 0) {
    return (
      <Card className="bg-slate-900 border-slate-800 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-400" />
          <h3 className="text-sm font-bold text-slate-100">Recommended Startups (Thesis Match)</h3>
        </div>
        <p className="text-xs text-slate-400">Configure your preferred sectors, stages, and ticket sizes in Investor Settings to see personalized startup matches.</p>
        <Link to="/investor/settings">
          <Button variant="outline" size="sm">Configure Mandate</Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-800 space-y-4">
      <CardHeader
        title="Recommended For You (AI Thesis Match)"
        subtitle="Ranked startup opportunities matched against your VC investment strategy"
      />
      <CardBody className="space-y-3 pt-0">
        {matches.map(({ startup, matchScore, matchedCriteria, recommendationReason }) => (
          <div key={startup._id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-3 hover:border-brand-500/40 transition-all">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-100 text-sm">{startup.startupName}</h4>
                  <Badge variant={matchScore >= 80 ? 'emerald' : matchScore >= 60 ? 'brand' : 'slate'}>
                    {matchScore}% MATCH
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 line-clamp-1">{startup.tagline || startup.description}</p>
              </div>

              <Link to={`/investor/startups/${startup._id}`}>
                <Button variant="primary" size="xs" icon={ArrowRight}>
                  Review Deal
                </Button>
              </Link>
            </div>

            {/* Matched Chips */}
            {matchedCriteria && matchedCriteria.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {matchedCriteria.slice(0, 3).map((chip, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-300">
                    {chip}
                  </span>
                ))}
              </div>
            )}

            <p className="text-[11px] text-slate-400 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
              "{recommendationReason}"
            </p>
          </div>
        ))}

        <div className="pt-1 flex justify-end">
          <Link to="/investor/discover" className="text-xs text-brand-400 hover:underline flex items-center gap-1 font-semibold">
            Explore All Discovery Matches &rarr;
          </Link>
        </div>
      </CardBody>
    </Card>
  );
};

export default InvestorMatchCard;
