import React from 'react';
import { MessageDTO } from '../../types';

interface ChatBubbleProps {
  message: MessageDTO;
  isSender: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isSender }) => {
  const bubbleAlignment = isSender ? 'justify-end' : 'justify-start';
  const bubbleColor = isSender 
    ? 'bg-primary text-white dark:bg-blue-600' 
    : 'bg-gray-200 text-gray-800 dark:bg-gray-600 dark:text-gray-100';
  const timeAlignment = isSender ? 'text-right' : 'text-left';
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${bubbleAlignment} mb-3`}>
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${bubbleColor}`}>
        <p className="text-sm break-words">{message.content}</p>
        <div className={`flex items-center ${isSender ? 'justify-end' : 'justify-start'} mt-1`}>
          <p className={`text-xs opacity-75 ${timeAlignment}`}>{formatDate(message.sentAt)}</p>
          {isSender && (
            <div className="ml-1.5 flex items-center">
              {message.isRead ? (
                <i className="fas fa-check-double text-xs text-sky-300 dark:text-sky-200"></i>
              ) : (
                <i className="fas fa-check text-xs text-gray-300 dark:text-gray-400"></i>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;