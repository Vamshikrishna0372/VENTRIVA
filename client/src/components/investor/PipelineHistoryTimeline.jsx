import React from 'react';
import { History, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';

export const PipelineHistoryTimeline = ({ history = [] }) => {
  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader title="Deal Stage History & Timeline" />
        <CardBody>
          <p className="text-xs text-slate-400 italic">No stage transition history recorded yet.</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Deal Stage Audit History" subtitle="Chronological stage movements and milestones" />
      <CardBody>
        <div className="relative pl-4 space-y-4 border-l border-slate-800">
          {history.map((item, idx) => (
            <div key={item._id || idx} className="relative space-y-1">
              {/* Timeline Dot */}
              <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-brand-500 border-2 border-slate-900" />

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono text-slate-400">
                  {new Date(item.changedAt).toLocaleDateString()} {new Date(item.changedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-slate-500 font-mono">|</span>
                <Badge variant="slate" size="xs">{item.previousStage}</Badge>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <Badge variant="brand" size="xs">{item.newStage}</Badge>
              </div>

              {item.note && (
                <p className="text-xs text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                  {item.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default PipelineHistoryTimeline;
