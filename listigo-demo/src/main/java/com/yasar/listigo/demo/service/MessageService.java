package com.yasar.listigo.demo.service;

import com.yasar.listigo.demo.dto.MessageDTO;

import java.util.List;
import java.util.UUID;

public interface MessageService {

    /**
     * Sends a message related to a specific listing.
     *
     * @param senderId   The ID of the user sending the message
     * @param listingId  The ID of the listing
     * @param messageDTO The message details
     * @return The created message as a DTO
     */
    MessageDTO sendMessage(UUID senderId, Long listingId, MessageDTO messageDTO);

    /**
     * Retrieves all messages for a specific listing that the user is involved in.
     *
     * @param userId    The ID of the user
     * @param listingId The ID of the listing
     * @return List of messages as DTOs
     */
    List<MessageDTO> getMessagesByListingId(UUID userId, Long listingId);

    /**
     * Deletes all messages related to a specific listing for the authenticated user.
     *
     * @param userId    The ID of the user
     * @param listingId The ID of the listing
     */
    void deleteConversation(UUID userId, Long listingId);
}