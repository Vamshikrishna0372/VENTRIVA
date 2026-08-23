import React from 'react';
import { Shield, TrendingUp, AlertTriangle, CheckCircle2, Lock } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';
import { CATEGORIES, getScoreInterpretation, SCORE_LABELS } from '../../utils/evaluationConstants';

export const EvaluationSummary = ({ evaluation }) => {
  if (!evaluation) return null;

  const score = evaluation.overallScore || 0;
  const interpretation = getScoreInterpretation(score);
  const scores = evaluation.scores || {};

  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardHeader
        title="Private Venture Evaluation Summary"
        subtitle={
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <Lock className="w-3.5 h-3.5" /> Confidential to you
          </span>
        }
        action={
          <Badge variant={evaluation.evaluationStatus === 'Completed' ? 'emerald' : 'amber'}>
            {evaluation.evaluationStatus}
          </Badge>
        }
      />

      <CardBody className="space-y-6">
        {/* Overall Score Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Weighted Overall Score</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-3xl font-extrabold text-slate-100">{score.toFixed(1)}</span>
              <span className="text-sm text-slate-400">/ 10</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant={interpretation.color}>{interpretation.label}</Badge>
            <Badge variant="brand">{evaluation.investmentDecision || 'Undecided'}</Badge>
          </div>
        </div>

        {/* 8 Category Scores Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Category Score Breakdown</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CATEGORIES.map((cat) => {
              const catScore = scores[cat.id];
              return (
                <div key={cat.id} className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-200">{cat.name}</span>
                    <span className="font-mono text-brand-300 font-bold">
                      {catScore ? `${catScore}/10` : '—'}
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-brand-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${((catScore || 0) / 10) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Strengths & Risks Grid */}
        {(evaluation.strengths?.length > 0 || evaluation.risks?.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            {/* Strengths */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono text-emerald-400 uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Venture Strengths
              </h4>
              <ul className="space-y-1">
                {evaluation.strengths.map((str, idx) => (
                  <li key={idx} className="text-xs text-slate-300 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg">
                    • {str}
                  </li>
                ))}
              </ul>
            </div>

            {/* Risks */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono text-amber-400 uppercase flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Identified Risks
              </h4>
              <ul className="space-y-1">
                {evaluation.risks.map((risk, idx) => (
                  <li key={idx} className="text-xs text-slate-300 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg">
                    • {risk}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Private Notes */}
        {evaluation.privateNotes && (
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <h4 className="text-xs font-mono text-slate-400 uppercase">Private Investment Notes</h4>
            <p className="text-xs text-slate-300 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 whitespace-pre-line leading-relaxed">
              {evaluation.privateNotes}
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default EvaluationSummary;
