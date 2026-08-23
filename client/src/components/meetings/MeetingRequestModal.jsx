import React, { useState } from 'react';
import { Calendar, X, Clock, AlertCircle } from 'lucide-react';
import { Card } from '../common/Card';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';

import { requestMeeting } from '../../services/meetingService';

export const MeetingRequestModal = ({ startupId, investorId, onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledStart, setScheduledStart] = useState('');
  const [scheduledEnd, setScheduledEnd] = useState('');
  const [meetingType, setMeetingType] = useState('Video Call');
  const [meetingLink, setMeetingLink] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    const start = new Date(scheduledStart);
    const end = new Date(scheduledEnd);
    const now = new Date();

    if (start < now) {
      setErrorMsg('Cannot schedule a meeting in the past.');
      return;
    }

    if (end <= start) {
      setErrorMsg('Scheduled end time must be later than start time.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await requestMeeting({
        startupId,
        investorId,
        title: title.trim(),
        description: description.trim(),
        scheduledStart: start.toISOString(),
        scheduledEnd: end.toISOString(),
        meetingType,
        meetingLink: meetingLink.trim(),
      });

      if (res?.success) {
        onSuccess(res.meeting);
        onClose();
      }
    } catch (err) {
      setErrorMsg(err?.response?.data?.message || 'Failed to request meeting');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <Card className="w-full max-w-lg bg-slate-900 border-slate-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-brand-400" />
            <h3 className="text-lg font-bold text-slate-100">Schedule Meeting</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <Input
            label="Meeting Title"
            placeholder="e.g. Introductory Investment Discussion"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Start Date & Time"
              type="datetime-local"
              value={scheduledStart}
              onChange={(e) => setScheduledStart(e.target.value)}
              required
            />
            <Input
              label="End Date & Time"
              type="datetime-local"
              value={scheduledEnd}
              onChange={(e) => setScheduledEnd(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Meeting Format"
              value={meetingType}
              onChange={(e) => setMeetingType(e.target.value)}
              options={[
                { value: 'Video Call', label: 'Video Call' },
                { value: 'Phone Call', label: 'Phone Call' },
                { value: 'In Person', label: 'In Person' },
              ]}
            />
            <Input
              label="Meeting Link (Optional)"
              placeholder="e.g. https://meet.google.com/xyz"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
            />
          </div>

          <textarea
            rows={2}
            placeholder="Agenda or topics to cover during meeting..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-slate-950 text-slate-100 text-xs rounded-xl border border-slate-800 p-3 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>Submit Meeting Request</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default MeetingRequestModal;
