import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare, Loader2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';

import ConversationList from '../../components/messaging/ConversationList';
import MessagePanel from '../../components/messaging/MessagePanel';
import { getMyConversations } from '../../services/conversationService';

export const FounderMessages = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobilePanel, setShowMobilePanel] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setIsLoading(true);
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
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
        <h1 className="text-2xl font-bold text-slate-100">Founder Direct Messaging</h1>
        <p className="text-sm text-slate-400">Communicate securely with interested venture investors and fund managers.</p>
      </div>

      {/* Messaging Layout Container */}
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
    </div>
  );
};

export default FounderMessages;
