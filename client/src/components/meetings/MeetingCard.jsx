import React from 'react';
import { Calendar, Clock, Video, Phone, MapPin, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import { Card, CardBody } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const MeetingCard = ({ meeting, currentUserId, onConfirm, onDecline, onCancel, onComplete }) => {
  const isFounder = meeting.founder?._id === currentUserId;
  const otherUser = isFounder ? meeting.investor : meeting.founder;

  const isRequestedByMe = meeting.requestedBy === currentUserId;

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="brand" size="xs">{meeting.meetingType}</Badge>
            <Badge
              variant={
                meeting.status === 'Confirmed'
                  ? 'emerald'
                  : meeting.status === 'Requested'
                  ? 'amber'
                  : meeting.status === 'Completed'
                  ? 'cyan'
                  : 'rose'
              }
              size="xs"
            >
              {meeting.status}
            </Badge>
          </div>

          <span className="text-[10px] font-mono text-slate-400">
            {new Date(meeting.scheduledStart).toLocaleDateString()}
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="font-bold text-slate-100 text-sm">{meeting.title}</h3>
          <p className="text-xs text-brand-400 font-medium">{meeting.startup?.startupName || 'Venture'}</p>
          <p className="text-xs text-slate-400">With {otherUser?.name} ({otherUser?.organization || 'Ventriva User'})</p>
        </div>

        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-400 shrink-0" />
            <span>
              {new Date(meeting.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
              {new Date(meeting.scheduledEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({meeting.timezone})
            </span>
          </div>

          {meeting.meetingLink && (
            <div className="flex items-center gap-2 text-emerald-400">
              <Video className="w-4 h-4 shrink-0" />
              <a href={meeting.meetingLink} target="_blank" rel="noreferrer" className="underline truncate flex items-center gap-1">
                Join Video Meeting <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-end gap-2">
          {meeting.status === 'Requested' && !isRequestedByMe && (
            <>
              <Button variant="outline" size="sm" icon={XCircle} onClick={() => onDecline(meeting._id)}>
                Decline
              </Button>
              <Button variant="emerald" size="sm" icon={CheckCircle2} onClick={() => onConfirm(meeting._id)}>
                Confirm Meeting
              </Button>
            </>
          )}

          {meeting.status === 'Confirmed' && (
            <>
              <Button variant="outline" size="sm" icon={XCircle} onClick={() => onCancel(meeting._id)}>
                Cancel Meeting
              </Button>
              <Button variant="emerald" size="sm" icon={CheckCircle2} onClick={() => onComplete(meeting._id)}>
                Mark Completed
              </Button>
            </>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default MeetingCard;
