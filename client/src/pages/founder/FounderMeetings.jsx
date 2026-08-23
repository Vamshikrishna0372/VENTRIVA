import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Plus, Loader2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

import MeetingCard from '../../components/meetings/MeetingCard';
import { getMyMeetings, confirmMeeting, declineMeeting, cancelMeeting, completeMeeting } from '../../services/meetingService';

export const FounderMeetings = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMeetings();
  }, [filterStatus]);

  const fetchMeetings = async () => {
    setIsLoading(true);
    try {
      const res = await getMyMeetings({ status: filterStatus !== 'all' ? filterStatus : undefined });
      if (res?.success && Array.isArray(res.meetings)) {
        setMeetings(res.meetings);
      }
    } catch (err) {
      console.error('Error fetching founder meetings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (meetingId) => {
    const link = window.prompt('Enter Video Meeting Link (e.g. Google Meet/Zoom) or leave blank for Jitsi link:');
    try {
      await confirmMeeting(meetingId, link || undefined);
      fetchMeetings();
    } catch (err) {
      alert('Failed to confirm meeting');
    }
  };

  const handleDecline = async (meetingId) => {
    const reason = window.prompt('Provide reason for declining:');
    try {
      await declineMeeting(meetingId, reason || undefined);
      fetchMeetings();
    } catch (err) {
      alert('Failed to decline meeting');
    }
  };

  const handleCancel = async (meetingId) => {
    const reason = window.prompt('Provide reason for cancelling:');
    try {
      await cancelMeeting(meetingId, reason || undefined);
      fetchMeetings();
    } catch (err) {
      alert('Failed to cancel meeting');
    }
  };

  const handleComplete = async (meetingId) => {
    try {
      await completeMeeting(meetingId);
      fetchMeetings();
    } catch (err) {
      alert('Failed to mark meeting as complete');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Scheduled Investor Meetings</h1>
            <p className="text-sm text-slate-400">Manage pitch calls, diligence meetings, and general availability parameters.</p>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/founder/availability">
              <Button variant="outline" size="sm" icon={Clock}>
                Configure Weekly Availability
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex border-b border-slate-800 gap-4 pt-2">
          {['all', 'Requested', 'Confirmed', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`pb-3 text-xs font-bold transition-all border-b-2 capitalize ${
                filterStatus === st ? 'border-brand-500 text-brand-300' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Meetings Grid */}
      {isLoading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Loading Meetings...</p>
        </div>
      ) : meetings.length === 0 ? (
        <Card className="text-center py-16 px-4 space-y-4">
          <Calendar className="w-12 h-12 text-slate-500 mx-auto" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-100">No Meetings Scheduled</h3>
            <p className="text-xs text-slate-400">Meeting requests submitted by interested investors will appear here.</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {meetings.map((m) => (
            <MeetingCard
              key={m._id}
              meeting={m}
              currentUserId={user?._id}
              onConfirm={handleConfirm}
              onDecline={handleDecline}
              onCancel={handleCancel}
              onComplete={handleComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FounderMeetings;
