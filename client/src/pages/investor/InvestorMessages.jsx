import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Loader2,
  MessageSquare,
  Compass,
  RefreshCw,
  Search,
  UserCheck,
  Calendar,
  Columns,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardBody } from '../../components/common/Card';
import { Button } from '../../components/common/Button';

import ConversationList from '../../components/messaging/ConversationList';
import MessagePanel from '../../components/messaging/MessagePanel';
import { getMyConversations } from '../../services/conversationService';

export const InvestorMessages = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [showMobilePanel, setShowMobilePanel] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await getMyConversations();
      if (res?.success && Array.isArray(res.conversations)) {
        setConversations(res.conversations);
        const queryConvId = searchParams.get('conversationId');
        if (queryConvId && res.conversations.some((c) => c._id === queryConvId)) {
          setSelectedId(queryConvId);
          setShowMobilePanel(true);
        } else if (res.conversations.length > 0) {
          setSelectedId(res.conversations[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectConversation = (id) => {
    setSelectedId(id);
    setShowMobilePanel(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Messages Workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">Investor Direct Messaging</h1>
            <p className="text-sm text-slate-400">Communicate directly with founders of accepted interest ventures.</p>
          </div>
          <Button onClick={fetchConversations} icon={RefreshCw} variant="outline" size="sm">
            Refresh
          </Button>
        </div>

        {/* Connected Workflows Quick Bar */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
          <Link to="/investor/interests" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-brand-400" /> Expressed Interests
          </Link>
          <Link to="/investor/discover" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-cyan-400" /> Discovery Engine
          </Link>
          <Link to="/investor/meetings" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Pitch Meetings
          </Link>
          <Link to="/investor/pipeline" className="px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300 hover:border-brand-500/50 transition-all flex items-center gap-1.5">
            <Columns className="w-3.5 h-3.5 text-amber-400" /> Deal Pipeline
          </Link>
        </div>
      </div>

      {isError && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-4 rounded-xl flex items-center justify-between text-xs text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400" />
            <span>Failed to load conversations thread. Please try again.</span>
          </div>
          <Button variant="outline" size="xs" onClick={fetchConversations}>Retry</Button>
        </div>
      )}

      {conversations.length === 0 ? (
        <Card className="text-center py-16 px-4 space-y-4 border-slate-800 bg-slate-900">
          <MessageSquare className="w-12 h-12 text-slate-500 mx-auto" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-100">No Active Messaging Threads</h3>
            <p className="text-xs text-slate-400">
              Direct messaging unlocks when a startup founder accepts your expressed interest request.
            </p>
          </div>
          <Link to="/investor/discover">
            <Button variant="primary" size="sm" icon={Compass}>
              Explore Discovery Engine
            </Button>
          </Link>
        </Card>
      ) : (
        /* Layout */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[650px]">
          {/* Left Column: Conversation List */}
          <div className={`lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-y-auto ${showMobilePanel ? 'hidden lg:block' : 'block'}`}>
            <div className="p-4 border-b border-slate-800 font-bold text-xs text-slate-100 uppercase tracking-wider">
              Active Threads ({conversations.length})
            </div>
            <ConversationList
              conversations={conversations}
              selectedId={selectedId}
              onSelect={handleSelectConversation}
              currentUserId={user?._id}
            />
          </div>

          {/* Right Column: Message Stream Panel */}
          <div className={`lg:col-span-2 ${!showMobilePanel ? 'hidden lg:block' : 'block'}`}>
            <MessagePanel
              conversationId={selectedId}
              currentUserId={user?._id}
              onBackMobile={() => setShowMobilePanel(false)}
              onMessageSent={fetchConversations}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorMessages;

