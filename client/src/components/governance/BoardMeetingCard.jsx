import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Calendar, Clock, MapPin, Video, CheckCircle2 } from 'lucide-react';
import { getGovernanceBadgeVariant } from '../../utils/governanceConstants';

export const BoardMeetingCard = ({ meeting, onComplete, className = '' }) => {
  if (!meeting) return null;

  const dateStr = new Date(meeting.scheduledDate).toLocaleDateString();

  return (
    <Card className={`p-4 space-y-3 ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-5 h-5 text-brand-400 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-slate-100">{meeting.title}</h4>
            <p className="text-[11px] text-slate-400 font-mono">
              Type: <span className="text-slate-200 font-semibold">{meeting.meetingType}</span> • Date:{' '}
              <span className="text-slate-300">{dateStr} ({meeting.startTime})</span>
            </p>
          </div>
        </div>

        <Badge variant={getGovernanceBadgeVariant(meeting.status)} size="xs">
          {meeting.status}
        </Badge>
      </div>

      <div className="text-xs font-mono bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/50 space-y-1">
        <div className="flex items-center justify-between text-slate-400">
          <span>Location / Virtual Link:</span>
          <span className="text-brand-300 font-semibold truncate max-w-[200px]">
            {meeting.meetingLink || meeting.location || 'Virtual Conference'}
          </span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span>Agenda Topics:</span>
          <span className="text-slate-200">{meeting.agenda?.length || 0} items</span>
        </div>
      </div>

      {meeting.status === 'Scheduled' && onComplete && (
        <div className="flex justify-end pt-1">
          <Button size="sm" variant="emerald" onClick={() => onComplete(meeting._id)} className="text-[11px] py-1 px-2.5 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Complete Meeting
          </Button>
        </div>
      )}
    </Card>
  );
};

export default BoardMeetingCard;
