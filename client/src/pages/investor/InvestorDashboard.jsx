import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Bookmark,
  Columns,
  Briefcase,
  TrendingUp,
  DollarSign,
  Cpu,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Loader2,
  Building2,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import MetricCard from '../../components/analytics/MetricCard';
import PortfolioHealthBadge from '../../components/portfolio/PortfolioHealthBadge';
import { useAuth } from '../../context/AuthContext';

import { getShortlist } from '../../services/shortlistService';
import { getMyPipelines } from '../../services/pipelineService';
import { getMyInterests } from '../../services/investorInterestService';
import { getMyConversations } from '../../services/conversationService';
import { getMyMeetings } from '../../services/meetingService';
import { getMyInvestments, getPortfolioAnalytics } from '../../services/investmentService';
import { getIntelligenceAlerts } from '../../services/portfolioIntelligenceService';
import InvestorMatchCard from '../../components/investor/InvestorMatchCard';
import ActionCenterWidget from '../../components/common/ActionCenterWidget';

export const InvestorDashboard = () => {
  const { user } = useAuth();
  const [portfolioAnalytics, setPortfolioAnalytics] = useState(null);
  const [recentInvestments, setRecentInvestments] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [shortlistCount, setShortlistCount] = useState(0);
  const [pipelineCount, setPipelineCount] = useState(0);
  const [expectedPipelineValue, setExpectedPipelineValue] = useState(0);
  const [interestsCount, setInterestsCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [upcomingMeetingsCount, setUpcomingMeetingsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const [portAnaRes, invRes, altRes, shortRes, pipeRes, intRes, convRes, meetRes] = await Promise.allSettled([
        getPortfolioAnalytics(),
        getMyInvestments(),
        getIntelligenceAlerts(),
        getShortlist(),
        getMyPipelines(),
        getMyInterests(),
        getMyConversations(),
        getMyMeetings({ status: 'Confirmed' }),
      ]);

      if (portAnaRes.status === 'fulfilled' && portAnaRes.value?.success) {
        setPortfolioAnalytics(portAnaRes.value.data);
      }
      if (invRes.status === 'fulfilled' && invRes.value?.success && Array.isArray(invRes.value.data)) {
        setRecentInvestments(invRes.value.data.slice(0, 4));
      }
      if (altRes.status === 'fulfilled' && altRes.value?.success && Array.isArray(altRes.value.data)) {
        setAlerts(altRes.value.data);
      }
      if (shortRes.status === 'fulfilled' && shortRes.value?.success && Array.isArray(shortRes.value.shortlists)) {
        setShortlistCount(shortRes.value.shortlists.length);
      }
      if (pipeRes.status === 'fulfilled' && pipeRes.value?.success && Array.isArray(pipeRes.value.pipelines)) {
        const pipes = pipeRes.value.pipelines;
        setPipelineCount(pipes.length);
        const val = pipes.reduce((acc, p) => acc + (p.expectedInvestmentAmount || 0), 0);
        setExpectedPipelineValue(val);
      }
      if (intRes.status === 'fulfilled' && intRes.value?.success && Array.isArray(intRes.value.interests)) {
        setInterestsCount(intRes.value.interests.length);
      }
      if (convRes.status === 'fulfilled' && convRes.value?.success && Array.isArray(convRes.value.conversations)) {
        const unreadTotal = convRes.value.conversations.reduce((acc, c) => acc + (c.unreadCountInvestor || 0), 0);
        setUnreadMessages(unreadTotal);
      }
      if (meetRes.status === 'fulfilled' && meetRes.value?.success && Array.isArray(meetRes.value.meetings)) {
        setUpcomingMeetingsCount(meetRes.value.meetings.length);
      }
    } catch (err) {
      console.error('Error fetching investor dashboard data:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const {
    totalCompanies = 0,
    totalInvestedCapital = 0,
    totalCurrentValue = 0,
    returnMultiple = 1.0,
  } = portfolioAnalytics || {};

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Investor Command Center...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-slate-100">Welcome, {user?.name || 'Investor'}</h1>
              {user?.isVerified !== false ? (
                <Badge variant="brand">VERIFIED INVESTOR</Badge>
              ) : (
                <Badge variant="amber">PENDING VERIFICATION</Badge>
              )}
            </div>
            <p className="text-sm text-slate-400">
              Venture portfolio overview, deal flow pipeline, thesis matching, and risk monitoring.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchDashboardData}>
              Refresh
            </Button>
            <Link to="/investor/discover">
              <Button variant="primary" size="sm" icon={Search}>Discovery Engine</Button>
            </Link>
            <Link to="/investor/pipeline">
              <Button variant="secondary" size="sm" icon={Columns}>Deal Pipeline</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Error Recovery Banner */}
      {isError && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>Some dashboard metrics could not be loaded. Click refresh to retry.</span>
          </div>
          <Button variant="outline" size="xs" onClick={fetchDashboardData}>Retry</Button>
        </div>
      )}

      {/* Primary Portfolio Financial Summary Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono">Portfolio Performance Summary</h2>
          <Link to="/investor/portfolio" className="text-xs text-brand-400 hover:underline flex items-center gap-1">
            View Full Portfolio &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <MetricCard
            title="Portfolio Holdings"
            value={totalCompanies}
            subtitle="Active investments"
            icon={Building2}
            color="brand"
          />
          <MetricCard
            title="Capital Deployed"
            value={`$${totalInvestedCapital.toLocaleString()}`}
            subtitle="Total cost basis"
            icon={DollarSign}
            color="indigo"
          />
          <MetricCard
            title="Portfolio Valuation"
            value={`$${totalCurrentValue.toLocaleString()}`}
            subtitle="Current fair value"
            icon={TrendingUp}
            color="emerald"
          />
          <MetricCard
            title="Portfolio MOIC"
            value={`${returnMultiple}x`}
            subtitle="Return multiple"
            icon={Cpu}
            color="teal"
          />
        </div>
      </div>

      {/* Deal Pipeline & Engagement Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Link to="/investor/pipeline">
          <Card className="bg-slate-900 border-slate-800 hover:border-brand-500/50 transition-all cursor-pointer h-full">
            <CardBody className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400">Active Deals</span>
              <p className="text-2xl font-extrabold text-indigo-400">{pipelineCount}</p>
              <p className="text-[10px] text-slate-400">${expectedPipelineValue.toLocaleString()} pipeline value</p>
            </CardBody>
          </Card>
        </Link>

        <Link to="/investor/shortlist">
          <Card className="bg-slate-900 border-slate-800 hover:border-brand-500/50 transition-all cursor-pointer h-full">
            <CardBody className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400">Shortlisted</span>
              <p className="text-2xl font-extrabold text-brand-400">{shortlistCount}</p>
              <p className="text-[10px] text-slate-400">Saved ventures</p>
            </CardBody>
          </Card>
        </Link>

        <Link to="/investor/interests">
          <Card className="bg-slate-900 border-slate-800 hover:border-brand-500/50 transition-all cursor-pointer h-full">
            <CardBody className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400">Submitted Interests</span>
              <p className="text-2xl font-extrabold text-emerald-400">{interestsCount}</p>
              <p className="text-[10px] text-slate-400">To startup founders</p>
            </CardBody>
          </Card>
        </Link>

        <Link to="/investor/messages">
          <Card className="bg-slate-900 border-slate-800 hover:border-brand-500/50 transition-all cursor-pointer h-full">
            <CardBody className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400">Unread Messages</span>
              <p className="text-2xl font-extrabold text-amber-400">{unreadMessages}</p>
              <p className="text-[10px] text-slate-400">Founder chat threads</p>
            </CardBody>
          </Card>
        </Link>

        <Link to="/investor/meetings">
          <Card className="bg-slate-900 border-slate-800 hover:border-brand-500/50 transition-all cursor-pointer h-full">
            <CardBody className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400">Confirmed Calls</span>
              <p className="text-2xl font-extrabold text-cyan-400">{upcomingMeetingsCount}</p>
              <p className="text-[10px] text-slate-400">Upcoming meetings</p>
            </CardBody>
          </Card>
        </Link>
      </div>

      {/* Intelligence & Risk Alert Summary Banner */}
      {alerts.length > 0 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardBody className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">
                  {alerts.length} Active Portfolio Intelligence Alert{alerts.length > 1 ? 's' : ''}
                </h3>
                <p className="text-xs text-slate-400">{alerts[0]?.title || 'Runway and risk signals detected.'}</p>
              </div>
            </div>
            <Link to="/investor/portfolio/intelligence">
              <Button variant="outline" size="sm" icon={Sparkles}>
                Open Risk Monitor
              </Button>
            </Link>
          </CardBody>
        </Card>
      )}

      {/* Recent Portfolio Holdings */}
      {recentInvestments.length > 0 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader
            title="Recent Active Portfolio Holdings"
            subtitle="Post-investment monitoring and health scores"
            action={
              <Link to="/investor/portfolio" className="text-xs text-brand-400 hover:underline font-semibold">
                View All Holdings &rarr;
              </Link>
            }
          />
          <CardBody className="space-y-3 pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recentInvestments.map((inv) => (
                <div key={inv._id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-xs">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-100 text-xs">{inv.startup?.startupName || 'Portfolio Venture'}</h4>
                        <p className="text-[10px] text-slate-400">{inv.startup?.sector || 'Venture'} • {inv.investmentType}</p>
                      </div>
                    </div>
                    <PortfolioHealthBadge healthStatus={inv.healthStatus} score={inv.healthScore} />
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono bg-slate-900/60 p-2 rounded-lg border border-slate-800/60">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">Invested</span>
                      <span className="font-bold text-slate-200">${(inv.investmentAmount || 0).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">Ownership</span>
                      <span className="font-bold text-slate-200">{inv.ownershipPercentage}%</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">Valuation</span>
                      <span className="font-bold text-emerald-400">${(inv.currentValuation || inv.postMoneyValuation || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Thesis Match Recommendation Engine */}
      <InvestorMatchCard limit={3} />

      {/* Real-Time Action Center */}
      <ActionCenterWidget />

      {/* Investor Quick Workflows */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/investor/portfolio">
          <Card className="hover:border-brand-500/50 transition-all cursor-pointer h-full">
            <CardBody className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-100 text-sm">Portfolio Management</h3>
                <ArrowRight className="w-4 h-4 text-brand-400" />
              </div>
              <p className="text-xs text-slate-400">Track active holdings, return multiples, cap table changes, and exit events.</p>
            </CardBody>
          </Card>
        </Link>

        <Link to="/investor/portfolio/intelligence">
          <Card className="hover:border-brand-500/50 transition-all cursor-pointer h-full">
            <CardBody className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-100 text-sm">Portfolio Intelligence & Risk</h3>
                <ArrowRight className="w-4 h-4 text-brand-400" />
              </div>
              <p className="text-xs text-slate-400">Monitor cash runways, revenue alerts, follow-on signals, and concentration risk.</p>
            </CardBody>
          </Card>
        </Link>

        <Link to="/investor/strategy">
          <Card className="hover:border-brand-500/50 transition-all cursor-pointer h-full">
            <CardBody className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-100 text-sm">VC Strategy & Mandates</h3>
                <ArrowRight className="w-4 h-4 text-brand-400" />
              </div>
              <p className="text-xs text-slate-400">Define capital allocation targets, target IRR/MOIC benchmarks, and ranking criteria.</p>
            </CardBody>
          </Card>
        </Link>
      </div>
    </div>
  );
};

export default InvestorDashboard;

