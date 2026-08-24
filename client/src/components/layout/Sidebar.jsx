import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Search,
  Bookmark,
  GitPullRequest,
  Users,
  ShieldCheck,
  Settings,
  User,
  ChevronRight,
  Menu,
  X,
  FileText,
  FileCheck,
  ClipboardCheck,
  BarChart3,
  Lightbulb,
  Sparkles,
  MessageSquare,
  Calendar,
  Clock,
  Cpu,
  Briefcase,
  TrendingUp,
  Award,
  Target,
  PieChart
} from 'lucide-react';
import { Badge } from '../common/Badge';

const roleMenus = {
  founder: [
    { label: 'Overview', path: '/founder/dashboard', icon: LayoutDashboard },
    { label: 'Venture Analytics', path: '/founder/analytics', icon: BarChart3 },
    { label: 'Financial Performance', path: '/founder/performance', icon: TrendingUp },
    { label: 'Startup Profile', path: '/founder/startup', icon: Building2 },
    { label: 'Founder Profile', path: '/founder/profile', icon: User },
    { label: 'Investor Relations', path: '/founder/portfolio', icon: Briefcase },
    { label: 'Capital Raise', path: '/founder/fundraising', icon: Target },
    { label: 'Transaction Closings', path: '/founder/closings', icon: ShieldCheck },
    { label: 'Corporate Governance', path: '/founder/governance', icon: ShieldCheck },
    { label: 'Cap Table', path: '/founder/cap-table', icon: PieChart },
    { label: 'Deal Rooms', path: '/founder/deals', icon: GitPullRequest },
    { label: 'Received Interests', path: '/founder/interests', icon: Users },
    { label: 'Direct Messages', path: '/founder/messages', icon: MessageSquare },
    { label: 'Pitch Meetings', path: '/founder/meetings', icon: Calendar },
    { label: 'Weekly Availability', path: '/founder/availability', icon: Clock },
    { label: 'Virtual Data Room', path: '/founder/documents', icon: FileText },
    { label: 'Document Requests', path: '/founder/document-requests', icon: FileCheck },
  ],
  investor: [
    { label: 'Dashboard', path: '/investor/dashboard', icon: LayoutDashboard },
    { label: 'Portfolio Dashboard', path: '/investor/portfolio', icon: Briefcase },
    { label: 'Portfolio Intelligence', path: '/investor/portfolio/intelligence', icon: Sparkles },
    { label: 'Portfolio Strategy Mandate', path: '/investor/strategy', icon: Target },
    { label: 'Opportunity Ranking', path: '/investor/opportunities/ranking', icon: Award },
    { label: 'Capital Allocation Plans', path: '/investor/capital-allocation', icon: PieChart },
    { label: 'Investment Decisions', path: '/investor/investment-decisions', icon: FileText },
    { label: 'Fundraising Opportunities', path: '/investor/fundraising', icon: Target },
    { label: 'Transaction Closings', path: '/investor/closings', icon: ShieldCheck },
    { label: 'Corporate Governance', path: '/investor/governance', icon: ShieldCheck },
    { label: 'Cap Table', path: '/investor/cap-table', icon: PieChart },
    { label: 'Portfolio Scenarios', path: '/investor/portfolio/scenarios', icon: Cpu },
    { label: 'Follow-On Investments', path: '/investor/follow-on-investments', icon: TrendingUp },
    { label: 'Exits & Returns', path: '/investor/exits', icon: Award },
    { label: 'Discover Startups', path: '/investor/discover', icon: Search },
    { label: 'Match Recommendations', path: '/investor/recommendations', icon: Sparkles },
    { label: 'Deal & Portfolio Intelligence', path: '/investor/analytics', icon: BarChart3 },
    { label: 'Opportunity Insights', path: '/investor/insights', icon: Lightbulb },
    { label: 'Expressed Interests', path: '/investor/interests', icon: Users },
    { label: 'Direct Messages', path: '/investor/messages', icon: MessageSquare },
    { label: 'Pitch Meetings', path: '/investor/meetings', icon: Calendar },
    { label: 'Shortlist', path: '/investor/shortlist', icon: Bookmark },
    { label: 'Deal Pipeline', path: '/investor/pipeline', icon: GitPullRequest },
    { label: 'Deal Rooms', path: '/investor/deals', icon: GitPullRequest },
    { label: 'Evaluation Hub', path: '/investor/evaluations', icon: ClipboardCheck },
    { label: 'Data Room Hub', path: '/investor/documents', icon: FileText },
    { label: 'Document Requests', path: '/investor/document-requests', icon: FileCheck },
    { label: 'Settings', path: '/investor/settings', icon: Settings },
  ],
  admin: [
    { label: 'Admin Command', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'System Operations', path: '/admin/system', icon: Cpu },
    { label: 'Portfolio Governance', path: '/admin/portfolio', icon: Briefcase },
    { label: 'Strategy Governance', path: '/admin/strategy-governance', icon: Target },
    { label: 'Fundraising Governance', path: '/admin/fundraising', icon: Target },
    { label: 'Closing Governance', path: '/admin/closings', icon: ShieldCheck },
    { label: 'Corporate Governance', path: '/admin/governance', icon: ShieldCheck },
    { label: 'Portfolio Risk Intelligence', path: '/admin/portfolio/intelligence', icon: Sparkles },
    { label: 'Deal Transactions Audit', path: '/admin/deals', icon: GitPullRequest },
    { label: 'Platform Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'User Directory', path: '/admin/users', icon: Users },
    { label: 'Startup Registry', path: '/admin/startups', icon: Building2 },
    { label: 'Verification Queue', path: '/admin/verification', icon: ShieldCheck },
    { label: 'Communication Moderation', path: '/admin/communication', icon: MessageSquare },
    { label: 'Document Governance', path: '/admin/documents', icon: FileText },
    { label: 'Platform Settings', path: '/admin/settings', icon: Settings },
  ],
};

export const Sidebar = ({ role = 'investor' }) => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const items = roleMenus[role] || roleMenus.investor;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-5 right-5 z-50 p-3 bg-brand-500 text-white rounded-full shadow-lg shadow-brand-500/40 focus:outline-none"
        aria-label="Toggle navigation"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Backdrop overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-16 bottom-0 left-0 z-40 w-64 bg-slate-900/95 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0 space-y-6">
          {/* Role Header Banner */}
          <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Active Workspace</p>
              <p className="text-sm font-semibold text-slate-100 capitalize">{role} Portal</p>
            </div>
            <Badge variant={role === 'admin' ? 'rose' : role === 'founder' ? 'emerald' : 'brand'} size="xs">
              {role}
            </Badge>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {items.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path !== '/' &&
                  !item.path.endsWith('/dashboard') &&
                  location.pathname.startsWith(item.path + '/'));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-150 group
                    ${
                      isActive
                        ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100 text-brand-400' : 'text-slate-600'}`} />
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Sticky Bottom Footer Info */}
        <div className="p-4 border-t border-slate-800/80 shrink-0 mt-auto bg-slate-900/95 space-y-2">
          <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/50 text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-300 font-medium">
              <span>Ventriva Core</span>
              <span className="font-mono text-[10px] text-emerald-400">v1.0.0</span>
            </div>
            <p className="text-[11px] text-slate-400">Production Infrastructure Active</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
