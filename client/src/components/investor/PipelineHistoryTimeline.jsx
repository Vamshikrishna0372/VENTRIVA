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
          {history.map((item, idx) => {
            const rawDate = item.createdAt || item.changedAt || item.timestamp || item.updatedAt;
            const dateObj = rawDate ? new Date(rawDate) : null;
            const isValidDate = dateObj && !isNaN(dateObj.getTime());
            const dateStr = isValidDate
              ? `${dateObj.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}, ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
              : 'Date unavailable';

            const prevStage = item.previousStage || item.metadata?.previousStage || 'Initial';
            const newStg = item.newStage || item.metadata?.newStage || 'New';
            const noteText = item.note || item.description || '';

            return (
              <div key={item._id || idx} className="relative space-y-1">
                {/* Timeline Dot */}
                <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-brand-500 border-2 border-slate-900" />

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-mono text-slate-400">{dateStr}</span>
                  <span className="text-slate-500 font-mono">|</span>
                  <Badge variant="slate" size="xs">{prevStage}</Badge>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                  <Badge variant="brand" size="xs">{newStg}</Badge>
                </div>

                {noteText && (
                  <p className="text-xs text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                    {noteText}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
};

export default PipelineHistoryTimeline;
