import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, MessageSquare, Calendar, Bookmark, FileText, AlertCircle } from 'lucide-react';
import { Badge } from '../common/Badge';

import { useAuth } from '../../context/AuthContext';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/notificationService';

export const NotificationPanel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // 15s poll
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      if (res?.success && Array.isArray(res.notifications)) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      // Silent error
    }
  };

  const getNotificationTargetRoute = (notif, role) => {
    const { type, relatedEntityId } = notif;

    if (role === 'founder') {
      switch (type) {
        case 'InvestorInterest':
        case 'InterestResponse':
          return '/founder/interests';
        case 'NewMessage':
          return '/founder/messages';
        case 'MeetingRequest':
        case 'MeetingConfirmed':
        case 'MeetingDeclined':
        case 'MeetingCancelled':
        case 'MeetingReminder':
          return '/founder/meetings';
        case 'DocumentRequest':
          return '/founder/document-requests';
        case 'DealUpdate':
        case 'DEAL_UPDATE':
        case 'TermSheetUpdate':
          return relatedEntityId ? `/founder/deals/${relatedEntityId}` : '/founder/deals';
        case 'FundraisingInvite':
        case 'CommitmentUpdate':
          return relatedEntityId ? `/founder/fundraising/${relatedEntityId}` : '/founder/fundraising';
        case 'PortfolioUpdate':
          return '/founder/portfolio';
        case 'GovernanceVote':
        case 'BoardResolution':
          return '/founder/governance';
        default:
          return '/founder/dashboard';
      }
    }

    if (role === 'admin') {
      switch (type) {
        case 'InvestorInterest':
        case 'InterestResponse':
        case 'NewMessage':
        case 'MeetingRequest':
        case 'MeetingConfirmed':
        case 'MeetingDeclined':
        case 'MeetingCancelled':
        case 'MeetingReminder':
          return '/admin/communication';
        case 'DocumentRequest':
          return '/admin/document-audit';
        case 'DealUpdate':
        case 'DEAL_UPDATE':
        case 'TermSheetUpdate':
          return '/admin/deals';
        case 'FundraisingInvite':
        case 'CommitmentUpdate':
          return '/admin/fundraising';
        case 'PortfolioUpdate':
          return '/admin/portfolio';
        case 'GovernanceVote':
        case 'BoardResolution':
          return '/admin/governance';
        default:
          return '/admin/dashboard';
      }
    }

    // Default: investor role
    switch (type) {
      case 'InvestorInterest':
      case 'InterestResponse':
        return '/investor/interests';
      case 'NewMessage':
        return '/investor/messages';
      case 'MeetingRequest':
      case 'MeetingConfirmed':
      case 'MeetingDeclined':
      case 'MeetingCancelled':
      case 'MeetingReminder':
        return '/investor/meetings';
      case 'DocumentRequest':
        return '/investor/document-requests';
      case 'DealUpdate':
      case 'DEAL_UPDATE':
      case 'TermSheetUpdate':
        return relatedEntityId ? `/investor/deals/${relatedEntityId}` : '/investor/deals';
      case 'FundraisingInvite':
      case 'CommitmentUpdate':
        return relatedEntityId ? `/investor/fundraising/${relatedEntityId}` : '/investor/fundraising';
      case 'PortfolioUpdate':
        return relatedEntityId ? `/investor/portfolio/${relatedEntityId}` : '/investor/portfolio';
      case 'GovernanceVote':
      case 'BoardResolution':
        return '/investor/governance';
      default:
        return '/investor/dashboard';
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await markNotificationRead(notif._id);
        fetchNotifications();
      }
      setIsOpen(false);
      const role = user?.role || 'investor';
      const targetRoute = getNotificationTargetRoute(notif, role);
      navigate(targetRoute);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-slate-100 rounded-xl hover:bg-slate-800/60 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-brand-500 text-white font-mono font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden space-y-2 animate-fade-in">
            <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-xs">Notifications</span>
                {unreadCount > 0 && <Badge variant="brand" size="xs">{unreadCount} Unread</Badge>}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] text-brand-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 text-xs">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-slate-400 italic">No notifications</div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif._id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 space-y-1 transition-colors cursor-pointer ${
                      !notif.isRead ? 'bg-slate-800/40 border-l-2 border-brand-500' : 'hover:bg-slate-800/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-200 line-clamp-1">{notif.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] line-clamp-2">{notif.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationPanel;

