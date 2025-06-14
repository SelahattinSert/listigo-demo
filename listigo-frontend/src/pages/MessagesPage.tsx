
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/apiService';
import { MessageDTO, ListingDTO, UserMetadata, ConversationInfo, Conversation } from '../types';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import ChatInterface from '../components/message/ChatInterface';
import ConversationListItem from '../components/message/ConversationListItem';
import Button from '../components/ui/Button';
import { ROUTES } from '../constants'; 

interface MessagesPageProps {
  entryPoint?: 'conversationsList' | 'chat'; 
}

const MessagesPage: React.FC<MessagesPageProps> = ({ entryPoint }) => {
  const { listingId: listingIdParam } = useParams<{ listingId?: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState<ConversationInfo[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeListingId, setActiveListingId] = useState<number | null>(listingIdParam ? parseInt(listingIdParam) : null);


  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const myOwnedListings = await apiService<ListingDTO[]>('GET', '/listings/my-listings').catch(err => {
        const errorMessage = err instanceof Error ? err.message : '';
        if (errorMessage.toLowerCase().includes("not found") || errorMessage.includes("404") || errorMessage.toLowerCase().includes("no listings found for user")) {
          return []; 
        }
        throw err; 
      });
      const allListings = await apiService<ListingDTO[]>('GET', '/listings/all').catch(err => {
         const errorMessage = err instanceof Error ? err.message : '';
        if (errorMessage.toLowerCase().includes("not found") || errorMessage.includes("404") || errorMessage.toLowerCase().includes("no listings found")) {
          return []; 
        }
        throw err; 
      });

      const involvedListingIds = new Set<number>();
      const potentialConversations: ConversationInfo[] = [];

      const processListingMessages = async (listing: ListingDTO) => {
        if (!listing.listingId || !user || involvedListingIds.has(listing.listingId)) return;
        try {
          const messages = await apiService<MessageDTO[]>('GET', `/listings/${listing.listingId}/messages`);
          if (messages.length > 0) {
            involvedListingIds.add(listing.listingId!);
            let otherParticipantId: string | undefined;
            const otherParticipantsInConversation = new Set<string>();
            messages.forEach(msg => {
              if (msg.senderId !== user.userId) otherParticipantsInConversation.add(msg.senderId);
              if (msg.receiverId !== user.userId) otherParticipantsInConversation.add(msg.receiverId);
            });

            if(otherParticipantsInConversation.size > 0){
              otherParticipantId = Array.from(otherParticipantsInConversation)[0];
            }

            if (otherParticipantId) {
                let otherUserName = `Kullanıcı (${otherParticipantId.substring(0,6)})`;
                if (user.userId === listing.userId) { 
                    otherUserName = `Alıcı Adayı (${otherParticipantId.substring(0,6)})`;
                } else { 
                    otherUserName = `Satıcı (${listing.userId.substring(0,6)})`;
                }
                const lastMsg = messages.sort((a,b) => new Date(b.sentAt || 0).getTime() - new Date(a.sentAt || 0).getTime())[0];
                potentialConversations.push({
                    listingId: listing.listingId!,
                    listingTitle: listing.title,
                    otherParticipantId: otherParticipantId,
                    otherParticipantName: otherUserName, 
                    lastMessage: lastMsg?.content,
                    lastMessageAt: lastMsg?.sentAt,
                    listingImageUrl: listing.photos?.[0],
                });
            }
          }
        } catch (msgErr) {
          const msgErrorMessage = msgErr instanceof Error ? msgErr.message : '';
          if (!msgErrorMessage.toLowerCase().includes("not found") && !msgErrorMessage.includes("404") && !msgErrorMessage.toLowerCase().includes("not authorized")) {
             console.warn(`Mesajlar yüklenemedi ${listing.listingId}:`, msgErr);
          }
        }
      };
      
      const allRelevantListingsMap = new Map<number, ListingDTO>();
      myOwnedListings.forEach(l => l.listingId && allRelevantListingsMap.set(l.listingId, l));
      allListings.forEach(l => l.listingId && allRelevantListingsMap.set(l.listingId, l));

      for (const listing of Array.from(allRelevantListingsMap.values())) {
        await processListingMessages(listing);
      }
      
      potentialConversations.sort((a,b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime());
      const uniqueConversations = Array.from(new Map(potentialConversations.map(item => [`${item.listingId}-${item.otherParticipantId}`, item])).values());
      setConversations(uniqueConversations);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sohbetler yüklenirken bir hata oluştu.';
       if (errorMessage.toLowerCase().includes("not found") || errorMessage.includes("404") || errorMessage.toLowerCase().includes("no listings found for user")) {
        setConversations([]); 
        setError(null); 
      } else {
        setError(errorMessage);
        setConversations([]);
      }
      console.error("Error fetching conversations:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const loadSpecificChat = async () => {
      if (listingIdParam && user) {
        setIsLoading(true);
        setError(null); 
        let fetchedListing: ListingDTO | null = null;
        try {
          const listingIdNum = parseInt(listingIdParam);
          setActiveListingId(listingIdNum);
          fetchedListing = await apiService<ListingDTO>('GET', `/listings/${listingIdNum}`);
          
          let fetchedMessages: MessageDTO[] = [];
          let otherParticipantIdForChat: string;

          if (fetchedListing.userId === user.userId) {
             try {
                fetchedMessages = await apiService<MessageDTO[]>('GET', `/listings/${listingIdNum}/messages`);
            } catch (msgErr) {
                const msgErrMsg = msgErr instanceof Error ? msgErr.message.toLowerCase() : '';
                if (!msgErrMsg.includes("not found") && !msgErrMsg.includes("404") && !msgErrMsg.includes("not authorized")) {
                    throw msgErr; 
                }
            }
            const firstMessageFromOther = fetchedMessages.find(m => m.senderId !== user.userId);
            otherParticipantIdForChat = firstMessageFromOther ? firstMessageFromOther.senderId : 'POTENTIAL_BUYER_PLACEHOLDER';

          } else { 
            otherParticipantIdForChat = fetchedListing.userId;
            try {
              fetchedMessages = await apiService<MessageDTO[]>('GET', `/listings/${listingIdNum}/messages`);
            } catch (msgErr) {
              const msgErrMsg = msgErr instanceof Error ? msgErr.message.toLowerCase() : '';
              if (!msgErrMsg.includes("not found") && !msgErrMsg.includes("404") && !msgErrMsg.includes("not authorized")) {
                throw msgErr; 
              }
            }
          }
          
          const otherParticipant: UserMetadata = { 
              userId: otherParticipantIdForChat, 
              name: otherParticipantIdForChat === 'POTENTIAL_BUYER_PLACEHOLDER' ? 'Potansiyel Alıcı' : `Kullanıcı ${otherParticipantIdForChat.substring(0,6)}`, 
              email: '', phone: '', createdAt: ''
          }; 

          setSelectedConversation({
            listing: fetchedListing,
            messages: fetchedMessages.sort((a, b) => new Date(a.sentAt || 0).getTime() - new Date(b.sentAt || 0).getTime()),
            otherParticipant: otherParticipant
          });

        } catch (err) { 
          const errorMessage = err instanceof Error ? err.message : 'Sohbet yüklenirken bir hata oluştu.';
          if (errorMessage.toLowerCase().includes("not found") || errorMessage.includes("404")){
            setError("İlan bulunamadı veya bu sohbete erişiminiz yok.");
          } else {
            setError(errorMessage);
          }
          setSelectedConversation(null);
        } finally {
          setIsLoading(false);
        }
      } else if (!listingIdParam || entryPoint === 'conversationsList') {
        setSelectedConversation(null); 
        setActiveListingId(null);
        fetchConversations(); 
      }
    };
    loadSpecificChat();
  }, [listingIdParam, user, entryPoint, fetchConversations]);


  const handleSelectConversation = async (convInfo: ConversationInfo) => {
    setIsLoading(true);
    setActiveListingId(convInfo.listingId);
    setError(null);
    try {
      const listing = await apiService<ListingDTO>('GET', `/listings/${convInfo.listingId}`);
      const messages = await apiService<MessageDTO[]>('GET', `/listings/${convInfo.listingId}/messages`).catch(msgErr => {
         const msgErrMsg = msgErr instanceof Error ? msgErr.message : '';
         if (msgErrMsg.toLowerCase().includes("not found") || msgErrMsg.includes("404") || msgErrMsg.toLowerCase().includes("not authorized")) return [];
         throw msgErr;
      });
      
      const otherParticipant : UserMetadata = { 
          userId: convInfo.otherParticipantId, 
          name: convInfo.otherParticipantName, 
          email: '', phone: '', createdAt: '' 
      };

      setSelectedConversation({
        listing,
        messages: messages.sort((a, b) => new Date(a.sentAt || 0).getTime() - new Date(b.sentAt || 0).getTime()),
        otherParticipant
      });
      navigate(`${ROUTES.MESSAGES}/${convInfo.listingId}`); 
    } catch (err) {
       const errorMessage = err instanceof Error ? err.message : 'Sohbet yüklenirken bir hata oluştu.';
       if (errorMessage.toLowerCase().includes("not found") || errorMessage.includes("404")){
         setError("Sohbet detayı yüklenemedi. İlan veya mesajlar bulunamadı.");
       } else {
         setError(errorMessage);
       }
      setSelectedConversation(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBackToConversations = () => {
    setSelectedConversation(null);
    setActiveListingId(null);
    navigate(ROUTES.MESSAGES);
    fetchConversations(); 
  };

  const handleDeleteConversation = async (listingIdToDelete: number) => {
    if (!user) return;
    if (window.confirm("Bu sohbeti silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
      setIsLoading(true);
      try {
        await apiService<void>('DELETE', `/listings/${listingIdToDelete}/messages`);
        setConversations(prev => prev.filter(c => c.listingId !== listingIdToDelete));
        if (selectedConversation && selectedConversation.listing.listingId === listingIdToDelete) {
          handleBackToConversations();
        }
        alert("Sohbet başarıyla silindi.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Sohbet silinirken bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!isAuthenticated) {
    return <div className="p-4"><Alert type="warning" message="Mesajları görüntülemek için lütfen giriş yapın." /></div>;
  }

  if (isLoading && !selectedConversation && conversations.length === 0 && !listingIdParam) {
    return <div className="flex justify-center items-center h-[70vh]"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-darkText mb-8">Mesajlarım</h1>
        {error && !selectedConversation && <Alert type="error" message={error} onClose={() => setError(null)} className="mb-4" />}
        
        <div className="flex flex-col md:flex-row gap-0 md:gap-6 bg-white dark:bg-darkSurface shadow-xl rounded-lg min-h-[70vh] transition-colors duration-300">
            <div className={`border-r border-gray-200 dark:border-gray-700 md:w-1/3 ${selectedConversation ? 'hidden md:block' : 'block w-full'}`}>
                <div className="p-4 border-b dark:border-gray-700 font-semibold text-lg text-gray-800 dark:text-darkText">Sohbetler</div>
                {isLoading && conversations.length === 0 && !listingIdParam && <div className="p-4 flex justify-center"><Spinner /></div>}
                {conversations.length > 0 ? (
                    <div className="overflow-y-auto max-h-[calc(70vh-50px)]">
                        {conversations.map(conv => (
                        <div key={`${conv.listingId}-${conv.otherParticipantId}`} className="relative group">
                             <ConversationListItem 
                                conversation={conv} 
                                onClick={() => handleSelectConversation(conv)}
                                isActive={selectedConversation?.listing.listingId === conv.listingId && selectedConversation?.otherParticipant.userId === conv.otherParticipantId}
                            />
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={(e) => { e.stopPropagation(); handleDeleteConversation(conv.listingId); }}
                                className="absolute top-1/2 right-2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                title="Sohbeti Sil"
                            >
                                <i className="fas fa-trash-alt"></i>
                            </Button>
                        </div>
                        ))}
                    </div>
                ) : (
                    !isLoading && !error && conversations.length === 0 && !listingIdParam && <p className="p-4 text-gray-500 dark:text-darkMutedText">Henüz bir sohbetiniz bulunmuyor.</p>
                )}
            </div>

            <div className={`md:w-2/3 ${selectedConversation ? 'block w-full' : 'hidden md:block'}`}>
                {selectedConversation ? (
                    <ChatInterface 
                        listing={selectedConversation.listing} 
                        otherParticipant={selectedConversation.otherParticipant}
                        initialMessages={selectedConversation.messages}
                        onBack={handleBackToConversations}
                    />
                ) : (
                   !isLoading && !listingIdParam && ( 
                    <div className="flex flex-col justify-center items-center h-full p-8 text-center">
                        <i className="fas fa-comments text-6xl text-gray-300 dark:text-gray-600 mb-4"></i>
                        <p className="text-xl text-gray-500 dark:text-darkMutedText">Görüntülemek için bir sohbet seçin.</p>
                        {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mt-4" />}
                    </div>
                   )
                )}
                 {isLoading && (listingIdParam || selectedConversation) &&  ( 
                    <div className="flex justify-center items-center h-full"><Spinner size="lg" /></div>
                )}
                {error && listingIdParam && !selectedConversation && (
                     <div className="flex flex-col justify-center items-center h-full p-8 text-center">
                         <Alert type="error" message={error} onClose={() => setError(null)} className="mt-4" />
                     </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default MessagesPage;