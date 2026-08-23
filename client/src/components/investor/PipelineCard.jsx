import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, DollarSign, ArrowRight, ShieldCheck, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { Badge } from '../common/Badge';
import { PIPELINE_STAGES, PRIORITY_COLORS, getFollowUpStatus } from '../../utils/pipelineConstants';

export const PipelineCard = ({ pipeline, onStageChange }) => {
  const [isChangingStage, setIsChangingStage] = useState(false);
  const startup = pipeline.startup;
  if (!startup) return null;

  const followUp = getFollowUpStatus(pipeline.nextFollowUpDate);

  const handleStageSelect = async (e) => {
    const newStage = e.target.value;
    if (newStage === pipeline.stage || isChangingStage || !onStageChange) return;

    setIsChangingStage(true);
    try {
      await onStageChange(startup._id, newStage);
    } catch (err) {
      console.error('Failed to change deal stage:', err);
    } finally {
      setIsChangingStage(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800/90 hover:border-slate-700 rounded-2xl p-4 space-y-3 transition-all duration-300 shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {startup.startupName ? startup.startupName.substring(0, 2).toUpperCase() : 'ST'}
          </div>
          <div>
            <Link to={`/investor/pipeline/${startup._id}`} className="font-bold text-slate-100 text-sm hover:text-brand-300 line-clamp-1">
              {startup.startupName}
            </Link>
            <p className="text-[11px] text-slate-400 font-mono line-clamp-1">{startup.sector} • {startup.stage}</p>
          </div>
        </div>

        <Badge variant={PRIORITY_COLORS[pipeline.priority] || 'indigo'} size="xs">
          {pipeline.priority}
        </Badge>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
        <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
          <span className="text-[9px] font-mono text-slate-400 uppercase block">Expected Check</span>
          <span className="font-bold text-emerald-400">
            {pipeline.expectedInvestment > 0
              ? `${pipeline.investmentCurrency || 'USD'} $${(pipeline.expectedInvestment / 1000).toFixed(0)}K`
              : 'Undisclosed'}
          </span>
        </div>

        <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
          <span className="text-[9px] font-mono text-slate-400 uppercase block">Evaluation</span>
          <span className="font-bold text-slate-100">
            {pipeline.evaluationScore ? `${pipeline.evaluationScore.toFixed(1)}/10` : 'Not Rated'}
          </span>
        </div>
      </div>

      {/* Follow-up Warning Badge */}
      {followUp && (
        <div className={`p-2 rounded-xl text-[11px] flex items-center gap-1.5 border ${
          followUp.status === 'overdue'
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            : followUp.status === 'dueToday'
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 font-semibold'
            : 'bg-slate-950/60 border-slate-800 text-slate-400'
        }`}>
          {followUp.status === 'overdue' ? <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" /> : <Clock className="w-3.5 h-3.5 shrink-0" />}
          <span>{followUp.label}: {new Date(pipeline.nextFollowUpDate).toLocaleDateString()}</span>
        </div>
      )}

      {/* Stage Change Dropdown */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="relative flex-1">
          {isChangingStage ? (
            <div className="flex items-center gap-1 text-[11px] text-brand-400 font-mono py-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Moving deal...
            </div>
          ) : (
            <select
              value={pipeline.stage}
              onChange={handleStageSelect}
              className="w-full bg-slate-950 text-slate-200 text-xs rounded-xl px-2.5 py-1.5 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              {PIPELINE_STAGES.map((stg) => (
                <option key={stg} value={stg}>
                  {stg}
                </option>
              ))}
            </select>
          )}
        </div>

        <Link to={`/investor/pipeline/${startup._id}`} className="text-slate-400 hover:text-brand-300 p-1">
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default PipelineCard;
