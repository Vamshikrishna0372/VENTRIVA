import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UserCheck,
  MessageSquare,
  Compass,
  Loader2,
  RefreshCw,
  Search,
  Sparkles,
  Calendar,
  Columns,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

import { getMyInterests, withdrawInterest } from '../../services/investorInterestService';

export const InvestorInterests = () => {
  const navigate = useNavigate();
  const [interests, setInterests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    fetchInterests();
  }, []);

  const fetchInterests = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await getMyInterests();
      if (res?.success && Array.isArray(res.interests)) {
        setInterests(res.interests);
      }
    } catch (err) {
      console.error('Error fetching investor interests:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (id) => {
    if (!window.confirm('Withdraw this investor interest submission?')) return;
    setFeedback({ type: '', message: '' });
    try {
      const res = await withdrawInterest(id);
      if (res?.success) {
        setFeedback({ type: 'success', message: 'Investor interest submission withdrawn.' });
        fetchInterests();
      } else {
        setFeedback({ type: 'error', message: res?.message || 'Failed to withdraw interest' });
      }
    } catch (err) {
      console.error('Error withdrawing interest:', err);
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Error withdrawing interest' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Expressed Interests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Expressed Investor Interests</h1>
            <p className="text-sm text-slate-400">Track interest requests submitted to startup founders across your portfolio pipeline.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={fetchInterests} icon={RefreshCw} variant="outline" size="sm">
              Refresh
            </Button>
            <Badge variant="brand">{interests.length} Total Submissions</Badge>
          </div>
        </div>

        {/* Connected Workflows Quick Bar */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
          <Link to="/investor/discover" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-brand-400" /> Discovery Engine
          </Link>
          <Link to="/investor/recommendations" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Recommendations
          </Link>
          <Link to="/investor/messages" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> Direct Messaging
          </Link>
          <Link to="/investor/meetings" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Pitch Meetings
          </Link>
          <Link to="/investor/pipeline" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Columns className="w-3.5 h-3.5 text-amber-400" /> Deal Pipeline
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
            <span>Failed to load expressed interests. Please try again.</span>
          </div>
          <Button variant="outline" size="xs" onClick={fetchInterests}>Retry</Button>
        </div>
      )}

      {/* Interests List */}
      {interests.length === 0 ? (
        <Card className="text-center py-16 px-4 space-y-4 border-slate-800 bg-slate-900">
          <UserCheck className="w-12 h-12 text-slate-500 mx-auto" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-100">No Expressed Interests Submitted</h3>
            <p className="text-xs text-slate-400">Discover startups and click "Express Interest" to initiate direct founder communication.</p>
          </div>
          <Link to="/investor/discover">
            <Button variant="primary" size="sm" icon={Compass}>Explore Discovery Engine</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {interests.map((item) => (
            <Card key={item._id} className="border-slate-800 bg-slate-900">
              <CardBody className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-600/20 border border-brand-500/30 flex items-center justify-center font-bold text-brand-300 text-xs">
                      {item.startup?.startupName ? item.startup.startupName.substring(0, 2).toUpperCase() : 'ST'}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm">{item.startup?.startupName || item.startup?.companyName || 'Portfolio Venture'}</h3>
                      <p className="text-xs text-slate-400">{item.startup?.sector} • {item.startup?.stage}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={item.status === 'Accepted' ? 'emerald' : item.status === 'Declined' ? 'rose' : 'amber'}>
                      {item.status}
                    </Badge>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {item.message && (
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-xs text-slate-300 italic">
                    "{item.message}"
                  </div>
                )}

                <div className="pt-2 border-t border-slate-800 flex justify-end gap-2">
                  {item.status === 'Accepted' && (
                    <Link to="/investor/messages">
                      <Button variant="emerald" size="sm" icon={MessageSquare}>
                        Open Messaging Thread
                      </Button>
                    </Link>
                  )}

                  {item.status === 'Interested' && (
                    <Button variant="outline" size="sm" onClick={() => handleWithdraw(item._id)}>
                      Withdraw Interest
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvestorInterests;

