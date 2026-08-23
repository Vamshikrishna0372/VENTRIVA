import React from 'react';
import { SCORE_LABELS } from '../../utils/evaluationConstants';
import { Badge } from '../common/Badge';

export const EvaluationScoreInput = ({ category, score, onChange }) => {
  const currentScore = score || 0;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
      {/* Category Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-slate-100 text-sm">{category.name}</h4>
            <Badge variant="slate" size="xs">{(category.weight * 100).toFixed(0)}% Weight</Badge>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{category.description}</p>
        </div>

        {/* Score Badge Indicator */}
        <div className="shrink-0">
          {currentScore > 0 ? (
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-brand-500/20 text-brand-300 border border-brand-500/30">
              {currentScore} / 10 — {SCORE_LABELS[currentScore]}
            </span>
          ) : (
            <span className="text-xs text-slate-400 italic">Not Scored</span>
          )}
        </div>
      </div>

      {/* Score Buttons (1-10) */}
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 pt-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
          const isSelected = currentScore === num;
          return (
            <button
              key={num}
              type="button"
              onClick={() => onChange(category.id, num)}
              className={`h-10 rounded-xl font-bold text-xs transition-all flex flex-col items-center justify-center ${
                isSelected
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30 scale-105'
                  : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <span>{num}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default EvaluationScoreInput;
