import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, UserCheck, MessageSquare, Calendar, ArrowRight, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

import { getMyStartup } from '../../services/startupService';
import { getStartupInterests } from '../../services/investorInterestService';
import { getMyConversations } from '../../services/conversationService';
import { getMyMeetings } from '../../services/meetingService';
import ReadinessCard from '../../components/startup/ReadinessCard';
import ActionCenterWidget from '../../components/common/ActionCenterWidget';

export const FounderDashboard = () => {
  const { user } = useAuth();
  const [startup, setStartup] = useState(null);
  const [interestsCount, setInterestsCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [upcomingMeetingsCount, setUpcomingMeetingsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const startupRes = await getMyStartup();
      if (startupRes?.success && startupRes?.startup) {
        setStartup(startupRes.startup);

        const [intRes, convRes, meetRes] = await Promise.all([
          getStartupInterests(startupRes.startup._id),
          getMyConversations(),
          getMyMeetings({ status: 'Confirmed' }),
        ]);

        if (intRes?.success && Array.isArray(intRes.interests)) {
          setInterestsCount(intRes.interests.length);
        }

        if (convRes?.success && Array.isArray(convRes.conversations)) {
          const unreadTotal = convRes.conversations.reduce((acc, c) => acc + (c.unreadCountFounder || 0), 0);
          setUnreadMessages(unreadTotal);
        }

        if (meetRes?.success && Array.isArray(meetRes.meetings)) {
          setUpcomingMeetingsCount(meetRes.meetings.length);
        }
      }
    } catch (err) {
      console.error('Error fetching founder dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-4 min-w-0 max-w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="min-w-0 max-w-full">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-100 truncate">Welcome back, {user?.name}!</h1>
              <Badge variant="emerald">FOUNDER</Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">Manage your venture profile, respond to investor interest, and host scheduled pitch meetings.</p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto shrink-0">
            <Link to="/founder/startup" className="w-full sm:w-auto">
              <Button variant="outline" size="sm" icon={Building2} className="w-full justify-center">Startup Profile</Button>
            </Link>
            <Link to="/founder/documents" className="w-full sm:w-auto">
              <Button variant="primary" size="sm" icon={FileText} className="w-full justify-center">Virtual Data Room</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Investment Readiness Score Card */}
      <ReadinessCard />

      {/* Role Action Center Widget */}
      <ActionCenterWidget />

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardBody className="space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase">Profile Completion</span>
              <Building2 className="w-4 h-4 text-brand-400" />
            </div>
            <p className="text-2xl font-extrabold text-slate-100">{startup ? `${startup.profileCompletion}%` : '0%'}</p>
            <p className="text-[11px] text-slate-400">Ventriva discovery readiness</p>
          </CardBody>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardBody className="space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase">Investor Interests</span>
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-2xl font-extrabold text-emerald-400">{interestsCount}</p>
            <p className="text-[11px] text-slate-400">Expressed by venture capital teams</p>
          </CardBody>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardBody className="space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase">Unread Messages</span>
              <MessageSquare className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-2xl font-extrabold text-indigo-400">{unreadMessages}</p>
            <p className="text-[11px] text-slate-400">Active investor messaging threads</p>
          </CardBody>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardBody className="space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-mono uppercase">Upcoming Meetings</span>
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-extrabold text-amber-400">{upcomingMeetingsCount}</p>
            <p className="text-[11px] text-slate-400">Confirmed pitch & diligence calls</p>
          </CardBody>
        </Card>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/founder/interests">
          <Card className="hover:border-brand-500/50 transition-all cursor-pointer">
            <CardBody className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-100 text-sm">Review Investor Interest</h3>
                <ArrowRight className="w-4 h-4 text-brand-400" />
              </div>
              <p className="text-xs text-slate-400">Accept interest expressions to open direct messaging threads.</p>
            </CardBody>
          </Card>
        </Link>

        <Link to="/founder/messages">
          <Card className="hover:border-brand-500/50 transition-all cursor-pointer">
            <CardBody className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-100 text-sm">Open Direct Messages</h3>
                <ArrowRight className="w-4 h-4 text-brand-400" />
              </div>
              <p className="text-xs text-slate-400">Communicate securely with interested investors.</p>
            </CardBody>
          </Card>
        </Link>

        <Link to="/founder/meetings">
          <Card className="hover:border-brand-500/50 transition-all cursor-pointer">
            <CardBody className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-100 text-sm">Manage Scheduled Meetings</h3>
                <ArrowRight className="w-4 h-4 text-brand-400" />
              </div>
              <p className="text-xs text-slate-400">View upcoming video calls and configure weekly availability.</p>
            </CardBody>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default FounderDashboard;
