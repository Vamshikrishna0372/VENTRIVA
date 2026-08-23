import React from 'react';
import { Activity, User, ShieldAlert, FileText, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../common/Card';

export const DealActivityTimeline = ({ activities = [] }) => {
  return (
    <Card>
      <CardHeader title="Transaction Activity Audit Log" subtitle="Chronological history of negotiation events and status changes" />
      <CardBody>
        {activities.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No activity logged yet.</p>
        ) : (
          <div className="relative pl-6 border-l-2 border-slate-800 space-y-4">
            {activities.map((act) => (
              <div key={act._id} className="relative group">
                {/* Node Bullet */}
                <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-brand-500 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-400" />
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1">
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
                    <span>{act.actor?.firstName ? `${act.actor.firstName} ${act.actor.lastName}` : 'System'} ({act.actor?.role || 'user'})</span>
                    <span>{new Date(act.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="font-semibold text-slate-200">{act.description}</p>
                  {act.previousStatus && act.newStatus && (
                    <p className="text-[11px] text-slate-400">
                      Status transition: <span className="text-slate-300 font-mono">{act.previousStatus}</span> → <span className="text-brand-300 font-mono">{act.newStatus}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default DealActivityTimeline;
