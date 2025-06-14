
import React from 'react';
import { ConversationInfo } from '../../types';
import { DEFAULT_PLACEHOLDER_IMAGE } from '../../constants';

interface ConversationListItemProps {
  conversation: ConversationInfo;
  onClick: () => void;
  isActive?: boolean;
}

const ConversationListItem: React.FC<ConversationListItemProps> = ({ conversation, onClick, isActive }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('tr-TR');
  };

  return (
    <button 
      onClick={onClick}
      className={`w-full text-left p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary ${isActive ? 'bg-blue-50 dark:bg-blue-900' : ''}`}
    >
      <div className="flex items-center space-x-3">
        <img 
          src={conversation.listingImageUrl || DEFAULT_PLACEHOLDER_IMAGE} 
          alt={conversation.listingTitle} 
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          onError={(e) => (e.currentTarget.src = DEFAULT_PLACEHOLDER_IMAGE)}
        />
        <div className="flex-grow overflow-hidden">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-gray-800 dark:text-darkText truncate">{conversation.otherParticipantName}</h3>
            {conversation.lastMessageAt && (
              <span className="text-xs text-gray-500 dark:text-darkMutedText whitespace-nowrap">{formatDate(conversation.lastMessageAt)}</span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-darkMutedText truncate italic">İlan: {conversation.listingTitle}</p>
          <div className="flex justify-between items-center mt-1">
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{conversation.lastMessage || 'Henüz mesaj yok'}</p>
            {conversation.unreadCount && conversation.unreadCount > 0 && (
              <span className="bg-secondary text-white text-xs font-bold rounded-full px-2 py-0.5">
                {conversation.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
};

export default ConversationListItem;