
import React, { useState, useEffect, useRef } from 'react';
import { MessageDTO, ListingDTO, UserMetadata } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import apiService from '../../services/apiService';
import ChatBubble from './ChatBubble';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import Alert from '../ui/Alert';

interface ChatInterfaceProps {
  listing: ListingDTO;
  otherParticipant: UserMetadata;
  initialMessages?: MessageDTO[];
  onBack?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ listing, otherParticipant, initialMessages = [], onBack }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageDTO[]>(initialMessages);
  const [newMessageContent, setNewMessageContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user || !listing.listingId) return;
      setIsLoading(true);
      try {
        const fetchedMessages = await apiService<MessageDTO[]>(
          'GET',
          `/listings/${listing.listingId}/messages`
        );
        fetchedMessages.sort((a, b) => new Date(a.sentAt || 0).getTime() - new Date(b.sentAt || 0).getTime());
        setMessages(fetchedMessages);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message.toLowerCase() : '';
        if (user.userId !== listing.userId && (errorMessage.includes("not authorized") || errorMessage.includes("not found") || errorMessage.includes("404") || errorMessage.includes("no messages found"))) {
          setMessages([]);
          setError(null);
        } else {
          setError(err instanceof Error ? err.message : 'Mesajlar yüklenirken bir hata oluştu.');
        }
        console.error("Error fetching messages in ChatInterface:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessages();
    const intervalId = setInterval(fetchMessages, 15000);
    return () => clearInterval(intervalId);
  }, [listing.listingId, user, otherParticipant.userId, listing.userId]);


  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageContent.trim() || !user || !listing.listingId) return;

    const messageData: MessageDTO = {
      senderId: user.userId,
      receiverId: otherParticipant.userId,
      listingId: listing.listingId,
      content: newMessageContent,
    };

    setIsLoading(true);
    try {
      const sentMessage = await apiService<MessageDTO, MessageDTO>('POST', `/listings/${listing.listingId}/messages`, messageData);
      setMessages(prevMessages => [...prevMessages, sentMessage]);
      setNewMessageContent('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mesaj gönderilemedi.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockUser = async () => {
    if (!user || !otherParticipant.userId) return;
    // eslint-disable-next-line no-restricted-globals
    if (confirm(`${otherParticipant.name} adlı kullanıcıyı engellemek istediğinizden emin misiniz? Bu kullanıcı size bir daha mesaj gönderemeyecek.`)) {
      try {
        await apiService<void, { blockedId: string }>('POST', `/auth/block`, { blockedId: otherParticipant.userId });
        alert(`${otherParticipant.name} başarıyla engellendi.`);
      } catch (err) {
        alert(`Kullanıcı engellenirken bir hata oluştu: ${err instanceof Error ? err.message : 'Bilinmeyen hata'}`);
      }
    }
  };

  if (!user) return <p className="dark:text-darkText">Mesajlaşmak için giriş yapmalısınız.</p>;

  return (
    <div className="flex flex-col h-[70vh] bg-white dark:bg-darkCard shadow-lg rounded-lg transition-colors duration-300">
      <header className="bg-gray-100 dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
        <div className="flex items-center">
            {onBack && (
                <Button onClick={onBack} variant="ghost" className="mr-2 md:hidden dark:text-darkMutedText dark:hover:bg-gray-600">
                    <i className="fas fa-arrow-left"></i>
                </Button>
            )}
            <h2 className="text-lg font-semibold text-gray-800 dark:text-darkText">
                {otherParticipant.name} ({listing.title})
            </h2>
        </div>
        <Button onClick={handleBlockUser} variant="danger" size="sm">
          <i className="fas fa-user-slash mr-2"></i> Engelle
        </Button>
      </header>

      {error && <div className="p-4"><Alert type="error" message={error} onClose={() => setError(null)} /></div>}

      <div className="flex-grow p-4 space-y-4 overflow-y-auto">
        {isLoading && messages.length === 0 && <div className="flex justify-center items-center h-full"><Spinner /></div>}
        {!isLoading && messages.length === 0 && !error && (
          <p className="text-center text-gray-500 dark:text-darkMutedText">Henüz mesaj yok. İlk mesajı siz gönderin!</p>
        )}
        {messages.map((msg, index) => (
          <ChatBubble key={msg.messageId || index} message={msg} isSender={msg.senderId === user.userId} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            value={newMessageContent}
            onChange={(e) => setNewMessageContent(e.target.value)}
            placeholder="Mesajınızı yazın..."
            className="flex-grow"
            containerClassName="mb-0 flex-grow"
            disabled={isLoading}
          />
          <Button type="submit" isLoading={isLoading} disabled={!newMessageContent.trim()} variant="primary">
            Gönder
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
