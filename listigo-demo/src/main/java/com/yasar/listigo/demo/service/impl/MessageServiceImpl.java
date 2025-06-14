package com.yasar.listigo.demo.service.impl;

import com.yasar.listigo.demo.dto.MessageDTO;
import com.yasar.listigo.demo.entity.Listing;
import com.yasar.listigo.demo.entity.Message;
import com.yasar.listigo.demo.entity.UserMetadata;
import com.yasar.listigo.demo.exception.ListingNotFoundException;
import com.yasar.listigo.demo.exception.MessageNotDeletedException;
import com.yasar.listigo.demo.exception.MessageNotFoundException;
import com.yasar.listigo.demo.exception.MessageNotSentException;
import com.yasar.listigo.demo.exception.UserBlockedException;
import com.yasar.listigo.demo.exception.UserNotFoundException;
import com.yasar.listigo.demo.repository.BlockedUserRepository;
import com.yasar.listigo.demo.repository.ListingRepository;
import com.yasar.listigo.demo.repository.MessageRepository;
import com.yasar.listigo.demo.repository.UserRepository;
import com.yasar.listigo.demo.service.MessageService;
import com.yasar.listigo.demo.util.DateTimeFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final DateTimeFactory dateTimeFactory;
    private final BlockedUserRepository blockedUserRepository;

    @Override
    @Transactional
    public MessageDTO sendMessage(UUID senderId, Long listingId, MessageDTO messageDTO) {
        UserMetadata sender = userRepository.findById(senderId)
                .orElseThrow(() -> {
                    log.warn("Sender not found with ID: {}", senderId);
                    return new UserNotFoundException("Sender not found with ID: " + senderId);
                });

        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> {
                    log.warn("Listing not found with ID: {}", listingId);
                    return new ListingNotFoundException("Listing not found with ID: " + listingId);
                });

        UUID receiverId = UUID.fromString(messageDTO.getReceiverId());
        UserMetadata receiver = userRepository.findById(receiverId)
                .orElseThrow(() -> {
                    log.warn("Receiver not found with ID: {}", receiverId);
                    return new UserNotFoundException("Receiver not found with ID: " + receiverId);
                });

        UUID listingOwnerId = listing.getUser().getUserId();
        boolean senderIsOwner = senderId.equals(listingOwnerId);
        boolean messageDtoReceiverIsOwner = receiverId.equals(listingOwnerId);

        if (!senderIsOwner && !messageDtoReceiverIsOwner) {
            log.warn("Message for listing {} is not between the owner and another party. Sender: {}, Receiver in DTO: {}, Owner: {}",
                    listingId, senderId, receiverId, listingOwnerId);
            throw new IllegalArgumentException("Messages must be directly to or from the listing owner.");
        }

        if (senderId.equals(receiverId)) {
            log.warn("Sender {} cannot send message to themselves for listing {}", senderId, listingId);
            throw new IllegalArgumentException("Cannot send message to yourself");
        }

        if (blockedUserRepository.existsByBlockerIdAndBlockedId(receiverId, senderId)) {
            log.warn("Sender {} is blocked by receiver {} for listing {}", senderId, receiverId, listingId);
            throw new UserBlockedException("You are blocked by the receiver");
        }

        try {
            Message message = new Message();
            message.setSender(sender);
            message.setReceiver(receiver);
            message.setListing(listing);
            message.setContent(messageDTO.getContent());
            message.setSentAt(dateTimeFactory.now());
            message.setRead(false);

            Message savedMessage = messageRepository.save(message);
            log.info("Message sent from {} to {} for listing {}", senderId, receiverId, listingId);
            return mapToDTO(savedMessage);
        } catch (Exception ex) {
            log.error("Exception occurred while sending message for listing {}: {}", listingId, ex.getMessage());
            throw new MessageNotSentException("Error occurred while sending message: " + ex.getMessage());
        }
    }

    @Override
    public List<MessageDTO> getMessagesByListingId(UUID userId, Long listingId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> {
                    log.warn("Listing not found with ID: {}", listingId);
                    return new ListingNotFoundException("Listing not found with ID: " + listingId);
                });

        if (!listing.getUser().getUserId().equals(userId) &&
                messageRepository.findByListingIdAndSenderIdOrReceiverId(listingId, userId).stream()
                        .noneMatch(m -> m.getSender().getUserId().equals(userId) || m.getReceiver().getUserId().equals(userId))) {
            log.warn("User {} is not authorized to view messages for listing {}", userId, listingId);
            throw new ListingNotFoundException("User is not authorized to view messages for this listing");
        }

        List<Message> messages = messageRepository.findByListingIdAndSenderIdOrReceiverId(listingId, userId);
        if (messages.isEmpty()) {
            log.warn("No messages found for listing {} and user {}", listingId, userId);
            throw new MessageNotFoundException("No messages found for listing: " + listingId);
        }

        messages.stream()
                .filter(m -> m.getReceiver().getUserId().equals(userId) && !m.isRead())
                .forEach(m -> {
                    m.setRead(true);
                    messageRepository.save(m);
                });

        log.info("Retrieved {} messages for listing {} and user {}", messages.size(), listingId, userId);
        return messages.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteConversation(UUID userId, Long listingId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> {
                    log.warn("Listing not found with ID: {}", listingId);
                    return new ListingNotFoundException("Listing not found with ID: " + listingId);
                });

        if (!listing.getUser().getUserId().equals(userId) &&
                messageRepository.findByListingIdAndSenderIdOrReceiverId(listingId, userId).stream()
                        .noneMatch(m -> m.getSender().getUserId().equals(userId) || m.getReceiver().getUserId().equals(userId))) {
            log.warn("User {} is not authorized to delete conversation for listing {}", userId, listingId);
            throw new ListingNotFoundException("User is not authorized to delete conversation for this listing");
        }

        try {
            messageRepository.deleteByListingIdAndSenderIdOrReceiverId(listingId, userId);
            log.info("Conversation deleted for listing {} and user {}", listingId, userId);
        } catch (Exception ex) {
            log.error("Exception occurred while deleting conversation for listing {}: {}", listingId, ex.getMessage());
            throw new MessageNotDeletedException("Error occurred while deleting conversation: " + ex.getMessage());
        }
    }

    private MessageDTO mapToDTO(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setMessageId(message.getMessageId());
        dto.setSenderId(message.getSender().getUserId().toString());
        dto.setReceiverId(message.getReceiver().getUserId().toString());
        dto.setListingId(message.getListing().getListingId());
        dto.setContent(message.getContent());
        dto.setSentAt(message.getSentAt());
        dto.setRead(message.isRead());
        return dto;
    }
}