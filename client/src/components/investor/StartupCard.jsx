import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, DollarSign, Bookmark, ArrowRight, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const StartupCard = ({ startup, isShortlisted = false, onToggleShortlist }) => {
  const [isToggling, setIsToggling] = useState(false);

  const handleShortlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isToggling || !onToggleShortlist) return;

    setIsToggling(true);
    try {
      await onToggleShortlist(startup._id, !isShortlisted);
    } catch (err) {
      console.error('Failed to toggle shortlist status:', err);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-brand-500/5 group relative">
      {/* Top Header */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
              {startup.startupName ? startup.startupName.substring(0, 2).toUpperCase() : 'ST'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-slate-100 text-base group-hover:text-brand-300 transition-colors line-clamp-1">
                  {startup.startupName}
                </h3>
                {startup.isVerified && (
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" title="Verified Venture" />
                )}
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5 line-clamp-1">
                {startup.locationDisplay || startup.country || 'Global'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleShortlistClick}
            disabled={isToggling}
            className={`p-2 rounded-xl border transition-all ${
              isShortlisted
                ? 'bg-brand-500/20 border-brand-500/40 text-brand-400 shadow-sm'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
            title={isShortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
          >
            {isToggling ? (
              <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
            ) : (
              <Bookmark className={`w-4 h-4 ${isShortlisted ? 'fill-brand-400' : ''}`} />
            )}
          </button>
        </div>

        {/* Tagline */}
        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed font-normal min-h-[32px]">
          {startup.tagline || startup.description}
        </p>

        {/* Badges Taxonomy */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <Badge variant="brand" size="xs">{startup.sector}</Badge>
          <Badge variant="emerald" size="xs">{startup.stage}</Badge>
          <Badge variant="cyan" size="xs">{startup.businessModel}</Badge>
        </div>
      </div>

      {/* Footer Details */}
      <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Target Raise</span>
          <span className="text-sm font-extrabold text-slate-100">
            {startup.fundingRequired > 0
              ? `${startup.fundingCurrency || 'USD'} $${(startup.fundingRequired / 1000000).toFixed(1)}M`
              : 'Undisclosed'}
          </span>
        </div>

        <Link to={`/investor/startups/${startup._id}`}>
          <Button variant="outline" size="sm" icon={ArrowRight} iconPosition="right">
            Evaluate
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default StartupCard;
