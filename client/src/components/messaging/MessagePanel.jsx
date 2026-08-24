import React, { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

import { getConversationById, markConversationRead } from '../../services/conversationService';
import { getMessages, sendMessage } from '../../services/messageService';

export const MessagePanel = ({ conversationId, currentUserId, onBackMobile, onMessageSent }) => {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!conversationId) {
      setIsLoading(false);
      setConversation(null);
      setMessages([]);
      return;
    }
    setIsLoading(true);
    setConversation(null);
    setMessages([]);
    fetchThread();
    const interval = setInterval(fetchThread, 5000); // 5s refresh
    return () => clearInterval(interval);
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchThread = async () => {
    try {
      const [convRes, msgRes] = await Promise.all([
        getConversationById(conversationId),
        getMessages(conversationId),
      ]);

      if (convRes?.success && convRes?.conversation) {
        setConversation(convRes.conversation);
      }

      if (msgRes?.success && Array.isArray(msgRes.messages)) {
        setMessages(msgRes.messages);
      }

      markConversationRead(conversationId).catch(() => {});
    } catch (err) {
      console.error('Error fetching message thread:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim() || isSending) return;

    const currentText = text.trim();
    setText('');
    setIsSending(true);

    try {
      const res = await sendMessage(conversationId, currentText);
      if (res?.success && res?.data) {
        setMessages((prev) => [...prev, res.data]);
        if (onMessageSent) {
          onMessageSent();
        }
      }
    } catch (err) {
      alert('Failed to send message');
      setText(currentText);
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full min-h-[400px] flex flex-col items-center justify-center space-y-3 bg-slate-900 rounded-2xl border border-slate-800">
        <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Loading Conversation Thread...</p>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="h-full min-h-[400px] flex items-center justify-center bg-slate-900 rounded-2xl border border-slate-800 p-8 text-slate-400 text-xs italic">
        Select a conversation thread to view messages
      </div>
    );
  }

  const getUserIdString = (val) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (val._id) return String(val._id);
    if (val.id) return String(val.id);
    return String(val);
  };

  const currentUserIdStr = getUserIdString(currentUserId);
  const founderIdStr = getUserIdString(conversation.founder);
  const isFounderSelf = founderIdStr === currentUserIdStr;
  const otherUser = isFounderSelf ? conversation.investor : conversation.founder;

  return (
    <div className="h-full flex flex-col justify-between bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      {/* Thread Header */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBackMobile && (
            <button onClick={onBackMobile} className="lg:hidden text-slate-400 hover:text-slate-100 p-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          <div className="w-10 h-10 rounded-full bg-brand-600/20 border border-brand-500/30 flex items-center justify-center font-bold text-brand-300 text-xs">
            {otherUser?.name ? otherUser.name.substring(0, 2).toUpperCase() : 'US'}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-100 text-sm">{otherUser?.name || 'User'}</h3>
              {conversation.startup?.startupName && (
                <Badge variant="brand" size="xs">{conversation.startup.startupName}</Badge>
              )}
            </div>
            <p className="text-[11px] text-slate-400">{otherUser?.organization || (otherUser?.role === 'founder' ? 'Founder' : 'Investor')}</p>
          </div>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[300px]">
        {messages.length === 0 ? (
          <p className="text-center text-xs text-slate-500 pt-12 italic">No messages sent yet. Start the conversation below.</p>
        ) : (
          messages.map((msg) => {
            const senderIdStr = getUserIdString(msg.sender);
            const isMe = senderIdStr === currentUserIdStr;

            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] p-3 rounded-2xl text-xs space-y-1 ${
                    isMe ? 'bg-brand-600 text-white rounded-br-none' : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  <span className="text-[9px] font-mono block text-right opacity-70">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer */}
      <form onSubmit={handleSend} className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2">
        <input
          type="text"
          placeholder="Type secure message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 bg-slate-900 text-slate-100 text-xs rounded-xl px-3.5 py-2.5 border border-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <Button variant="primary" size="sm" type="submit" icon={Send} isLoading={isSending} disabled={!text.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
};

export default MessagePanel;
