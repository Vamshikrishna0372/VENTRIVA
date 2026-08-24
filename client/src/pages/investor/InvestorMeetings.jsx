import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Plus,
  Loader2,
  RefreshCw,
  Search,
  MessageSquare,
  UserCheck,
  Bookmark,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

import MeetingCard from '../../components/meetings/MeetingCard';
import MeetingRequestModal from '../../components/meetings/MeetingRequestModal';
import { getMyMeetings, confirmMeeting, declineMeeting, cancelMeeting, completeMeeting } from '../../services/meetingService';
import { getShortlist } from '../../services/shortlistService';

export const InvestorMeetings = () => {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [shortlisted, setShortlisted] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Modal State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedStartupId, setSelectedStartupId] = useState('');

  useEffect(() => {
    fetchMeetingsAndShortlist();
  }, [filterStatus]);

  const fetchMeetingsAndShortlist = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const [meetRes, shortlistRes] = await Promise.all([
        getMyMeetings({ status: filterStatus !== 'all' ? filterStatus : undefined }),
        getShortlist(),
      ]);

      if (meetRes?.success && Array.isArray(meetRes.meetings)) {
        setMeetings(meetRes.meetings);
      }

      if (shortlistRes?.success && Array.isArray(shortlistRes.shortlists)) {
        const valid = shortlistRes.shortlists.filter((s) => s.startup !== null);
        setShortlisted(valid);
        if (valid.length > 0) setSelectedStartupId(valid[0].startup._id);
      }
    } catch (err) {
      console.error('Error fetching investor meetings:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (meetingId) => {
    setFeedback({ type: '', message: '' });
    try {
      const res = await confirmMeeting(meetingId);
      if (res?.success) {
        setFeedback({ type: 'success', message: 'Pitch meeting confirmed!' });
        fetchMeetingsAndShortlist();
      } else {
        setFeedback({ type: 'error', message: res?.message || 'Failed to confirm meeting' });
      }
    } catch (err) {
      console.error('Error confirming meeting:', err);
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Error confirming meeting' });
    }
  };

  const handleDecline = async (meetingId) => {
    const reason = window.prompt('Provide reason for declining:');
    setFeedback({ type: '', message: '' });
    try {
      const res = await declineMeeting(meetingId, reason || undefined);
      if (res?.success) {
        setFeedback({ type: 'success', message: 'Pitch meeting declined.' });
        fetchMeetingsAndShortlist();
      } else {
        setFeedback({ type: 'error', message: res?.message || 'Failed to decline meeting' });
      }
    } catch (err) {
      console.error('Error declining meeting:', err);
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Error declining meeting' });
    }
  };

  const handleCancel = async (meetingId) => {
    const reason = window.prompt('Provide reason for cancelling:');
    setFeedback({ type: '', message: '' });
    try {
      const res = await cancelMeeting(meetingId, reason || undefined);
      if (res?.success) {
        setFeedback({ type: 'success', message: 'Pitch meeting cancelled.' });
        fetchMeetingsAndShortlist();
      } else {
        setFeedback({ type: 'error', message: res?.message || 'Failed to cancel meeting' });
      }
    } catch (err) {
      console.error('Error cancelling meeting:', err);
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Error cancelling meeting' });
    }
  };

  const handleComplete = async (meetingId) => {
    setFeedback({ type: '', message: '' });
    try {
      const res = await completeMeeting(meetingId);
      if (res?.success) {
        setFeedback({ type: 'success', message: 'Meeting marked as completed!' });
        fetchMeetingsAndShortlist();
      } else {
        setFeedback({ type: 'error', message: res?.message || 'Failed to complete meeting' });
      }
    } catch (err) {
      console.error('Error completing meeting:', err);
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Error completing meeting' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Investor Meeting Schedule</h1>
            <p className="text-sm text-slate-400">Request, schedule, and join pitch meetings with startup founders.</p>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={fetchMeetingsAndShortlist} icon={RefreshCw} variant="outline" size="sm">
              Refresh
            </Button>
            <Button variant="primary" size="sm" icon={Plus} onClick={() => setShowRequestModal(true)}>
              Schedule New Meeting
            </Button>
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

        {/* Connected Workflows Quick Bar */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
          <Link to="/investor/discover" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-brand-400" /> Discovery Engine
          </Link>
          <Link to="/investor/messages" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> Direct Messaging
          </Link>
          <Link to="/investor/interests" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-indigo-400" /> Expressed Interests
          </Link>
          <Link to="/investor/shortlist" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 text-cyan-400" /> Saved Shortlist
          </Link>
        </div>
      </div>

      {feedback.message && (
        <div className={`p-4 rounded-xl border text-xs flex items-center gap-2.5 ${
          feedback.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {isError && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>Failed to load pitch meetings. Please try again.</span>
          </div>
          <Button variant="outline" size="xs" onClick={fetchMeetingsAndShortlist}>Retry</Button>
        </div>
      )}

      {/* Meetings Grid */}
      {isLoading ? (
        <div className="min-h-[300px] flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Loading Meetings...</p>
        </div>
      ) : meetings.length === 0 ? (
        <Card className="text-center py-16 px-4 space-y-4 border-slate-800 bg-slate-900">
          <Calendar className="w-12 h-12 text-slate-500 mx-auto" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-100">No Meetings Scheduled</h3>
            <p className="text-xs text-slate-400">Schedule video calls or phone syncs with founders of interested ventures.</p>
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

      {/* Meeting Request Modal */}
      {showRequestModal && (
        <MeetingRequestModal
          startupId={selectedStartupId}
          shortlistedStartups={shortlisted}
          onClose={() => setShowRequestModal(false)}
          onSuccess={() => fetchMeetingsAndShortlist()}
        />
      )}
    </div>
  );
};

export default InvestorMeetings;

