import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Bookmark, Columns, ClipboardCheck, UserCheck, MessageSquare, Calendar, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

import { getShortlist } from '../../services/shortlistService';
import { getMyPipelines } from '../../services/pipelineService';
import { getMyInterests } from '../../services/investorInterestService';
import { getMyConversations } from '../../services/conversationService';
import { getMyMeetings } from '../../services/meetingService';
import InvestorMatchCard from '../../components/investor/InvestorMatchCard';
import ActionCenterWidget from '../../components/common/ActionCenterWidget';

export const InvestorDashboard = () => {
  const { user } = useAuth();
  const [shortlistCount, setShortlistCount] = useState(0);
  const [pipelineCount, setPipelineCount] = useState(0);
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
      const [shortRes, pipeRes, intRes, convRes, meetRes] = await Promise.all([
        getShortlist(),
        getMyPipelines(),
        getMyInterests(),
        getMyConversations(),
        getMyMeetings({ status: 'Confirmed' }),
      ]);

      if (shortRes?.success && Array.isArray(shortRes.shortlists)) setShortlistCount(shortRes.shortlists.length);
      if (pipeRes?.success && Array.isArray(pipeRes.pipelines)) setPipelineCount(pipeRes.pipelines.length);
      if (intRes?.success && Array.isArray(intRes.interests)) setInterestsCount(intRes.interests.length);
      if (convRes?.success && Array.isArray(convRes.conversations)) {
        const unreadTotal = convRes.conversations.reduce((acc, c) => acc + (c.unreadCountInvestor || 0), 0);
        setUnreadMessages(unreadTotal);
      }
      if (meetRes?.success && Array.isArray(meetRes.meetings)) setUpcomingMeetingsCount(meetRes.meetings.length);
    } catch (err) {
      console.error('Error fetching investor dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-100">Investor Workspace</h1>
              <Badge variant="brand">VERIFIED INVESTOR</Badge>
            </div>
            <p className="text-sm text-slate-400">Discover startups, track pipeline stages, express interest, and host founder pitch calls.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to="/investor/discover">
              <Button variant="primary" size="sm" icon={Search}>Discovery Engine</Button>
            </Link>
            <Link to="/investor/pipeline">
              <Button variant="outline" size="sm" icon={Columns}>Deal Pipeline</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardBody className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-400">Shortlisted</span>
            <p className="text-2xl font-extrabold text-brand-400">{shortlistCount}</p>
            <p className="text-[10px] text-slate-400">Saved ventures</p>
          </CardBody>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardBody className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-400">Pipeline Deals</span>
            <p className="text-2xl font-extrabold text-indigo-400">{pipelineCount}</p>
            <p className="text-[10px] text-slate-400">Active deal tracking</p>
          </CardBody>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardBody className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-400">Submitted Interests</span>
            <p className="text-2xl font-extrabold text-emerald-400">{interestsCount}</p>
            <p className="text-[10px] text-slate-400">To startup founders</p>
          </CardBody>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardBody className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-400">Unread Messages</span>
            <p className="text-2xl font-extrabold text-amber-400">{unreadMessages}</p>
            <p className="text-[10px] text-slate-400">Founder chat threads</p>
          </CardBody>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardBody className="space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-400">Confirmed Calls</span>
            <p className="text-2xl font-extrabold text-cyan-400">{upcomingMeetingsCount}</p>
            <p className="text-[10px] text-slate-400">Upcoming meetings</p>
          </CardBody>
        </Card>
      </div>

      {/* Recommended Startups Matching Engine Widget */}
      <InvestorMatchCard limit={3} />

      {/* Role Action Center Widget */}
      <ActionCenterWidget />

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/investor/interests">
          <Card className="hover:border-brand-500/50 transition-all cursor-pointer">
            <CardBody className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-100 text-sm">Track Expressed Interests</h3>
                <ArrowRight className="w-4 h-4 text-brand-400" />
              </div>
              <p className="text-xs text-slate-400">View founder response status for submitted interest requests.</p>
            </CardBody>
          </Card>
        </Link>

        <Link to="/investor/messages">
          <Card className="hover:border-brand-500/50 transition-all cursor-pointer">
            <CardBody className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-100 text-sm">Direct Messaging Hub</h3>
                <ArrowRight className="w-4 h-4 text-brand-400" />
              </div>
              <p className="text-xs text-slate-400">Send direct messages to founders of accepted interest ventures.</p>
            </CardBody>
          </Card>
        </Link>

        <Link to="/investor/meetings">
          <Card className="hover:border-brand-500/50 transition-all cursor-pointer">
            <CardBody className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-100 text-sm">Scheduled Pitch Meetings</h3>
                <ArrowRight className="w-4 h-4 text-brand-400" />
              </div>
              <p className="text-xs text-slate-400">Schedule, confirm, and join video pitch calls.</p>
            </CardBody>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default InvestorDashboard;
