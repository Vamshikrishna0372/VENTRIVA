import React from 'react';
import { MessageSquare, Building2, User } from 'lucide-react';
import { Badge } from '../common/Badge';

export const ConversationList = ({ conversations, selectedId, onSelect, currentUserId }) => {
  if (conversations.length === 0) {
    return (
      <div className="p-8 text-center space-y-2">
        <MessageSquare className="w-8 h-8 text-slate-500 mx-auto" />
        <p className="text-xs text-slate-400">No active conversations</p>
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

  return (
    <div className="divide-y divide-slate-800/80">
      {conversations.map((conv) => {
        const isSelected = conv._id === selectedId;
        const founderIdStr = getUserIdString(conv.founder);
        const isFounderSelf = founderIdStr === currentUserIdStr;
        const otherUser = isFounderSelf ? conv.investor : conv.founder;
        const unread = isFounderSelf ? conv.unreadCountFounder : conv.unreadCountInvestor;

        return (
          <div
            key={conv._id}
            onClick={() => onSelect(conv._id)}
            className={`p-4 cursor-pointer transition-all flex items-center justify-between gap-3 ${
              isSelected ? 'bg-brand-500/10 border-l-4 border-brand-500' : 'hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 text-xs shrink-0">
                {otherUser?.name ? otherUser.name.substring(0, 2).toUpperCase() : 'US'}
              </div>

              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-100 text-xs truncate">{otherUser?.name || 'User'}</h4>
                  <Badge variant="slate" size="xs">{conv.startup?.startupName || 'Venture'}</Badge>
                </div>
                <p className="text-[11px] text-slate-400 truncate">{conv.subject}</p>
              </div>
            </div>

            <div className="text-right shrink-0 space-y-1">
              <span className="text-[10px] text-slate-500 font-mono">
                {new Date(conv.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>
              {unread > 0 && (
                <span className="w-4 h-4 bg-brand-500 text-white font-mono font-bold text-[10px] rounded-full flex items-center justify-center ml-auto">
                  {unread}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;
