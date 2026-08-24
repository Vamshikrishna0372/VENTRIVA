import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, CheckCircle2, DollarSign, Bookmark, ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { addToShortlist } from '../../services/shortlistService';
import { expressInterest } from '../../services/investorInterestService';

export const OpportunityRankingCard = ({ item, onActionComplete }) => {
  const { rank, startup, overallOpportunityScore, convictionScore, portfolioFitScore, riskScore, recommendedAction, recommendedCheckSize, explanation } = item;
  const [isShortlisting, setIsShortlisting] = useState(false);
  const [isExpressingInterest, setIsExpressingInterest] = useState(false);
  const [actionFeedback, setActionFeedback] = useState('');

  const handleShortlist = async () => {
    if (!startup?._id || isShortlisting) return;
    setIsShortlisting(true);
    setActionFeedback('');
    try {
      const res = await addToShortlist(startup._id, 'Opportunity Ranking Fit');
      if (res?.success) {
        setActionFeedback('Shortlisted!');
        if (onActionComplete) onActionComplete();
      }
    } catch (err) {
      setActionFeedback(err.response?.data?.message || 'Already in shortlist');
    } finally {
      setIsShortlisting(false);
    }
  };

  const handleExpressInterest = async () => {
    if (!startup?._id || isExpressingInterest) return;
    setIsExpressingInterest(true);
    setActionFeedback('');
    try {
      const res = await expressInterest(startup._id, 'High Opportunity Fit');
      if (res?.success) {
        setActionFeedback('Interest Expressed!');
        if (onActionComplete) onActionComplete();
      }
    } catch (err) {
      setActionFeedback(err.response?.data?.message || 'Interest already submitted');
    } finally {
      setIsExpressingInterest(false);
    }
  };

  return (
    <Card className="border-slate-800 bg-slate-900 hover:border-brand-500/40 transition-colors">
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold font-mono text-base">
              #{rank}
            </div>
            <div>
              <Link
                to={`/investor/startups/${startup?._id}`}
                className="font-bold text-slate-100 text-sm hover:text-brand-400 transition-colors inline-flex items-center gap-1.5"
              >
                <span>{startup?.startupName || 'Startup'}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <p className="text-xs text-slate-400">{startup?.sector} • {startup?.stage}</p>
            </div>
          </div>
          <Badge variant={recommendedAction === 'Invest Now' ? 'emerald' : recommendedAction === 'Deep Review' ? 'teal' : 'amber'}>
            {recommendedAction}
          </Badge>
        </div>

        <div className="grid grid-cols-4 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Opportunity</span>
            <span className="font-bold text-emerald-400">{overallOpportunityScore}/100</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Conviction</span>
            <span className="font-bold text-slate-200">{convictionScore}/100</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Portfolio Fit</span>
            <span className="font-bold text-slate-200">{portfolioFitScore}/100</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Risk Score</span>
            <span className="font-bold text-amber-400">{riskScore ?? Math.max(0, 100 - overallOpportunityScore)}/100</span>
          </div>
        </div>

        <p className="text-xs text-slate-400 font-mono bg-slate-950/40 p-2 rounded-lg border border-slate-800/40">
          Target check size: ${(recommendedCheckSize || 0).toLocaleString()} • {explanation}
        </p>

        {actionFeedback && (
          <p className="text-[11px] text-brand-300 font-mono">{actionFeedback}</p>
        )}

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <Button
            variant="outline"
            size="xs"
            onClick={handleShortlist}
            isLoading={isShortlisting}
            icon={Bookmark}
          >
            Shortlist
          </Button>

          <Button
            variant="primary"
            size="xs"
            onClick={handleExpressInterest}
            isLoading={isExpressingInterest}
            icon={CheckCircle2}
          >
            Express Interest
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default OpportunityRankingCard;
