package com.yasar.listigo.demo.controller;

import com.yasar.listigo.demo.dto.MessageDTO;
import com.yasar.listigo.demo.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.version}/listings/{listingId}/messages")
@Tag(name = "Message Controller", description = "Endpoints for managing messages related to listings")
public class MessageController {

    private final MessageService messageService;

    @PostMapping
    @Operation(
            description = "Sends a new message related to a listing. Receiver must be the listing owner.",
            responses = {
                    @ApiResponse(description = "Message sent successfully", responseCode = "201",
                            content = @Content(schema = @Schema(implementation = MessageDTO.class))),
                    @ApiResponse(description = "Bad request", responseCode = "400"),
                    @ApiResponse(description = "Unauthorized", responseCode = "401"),
                    @ApiResponse(description = "Listing or user not found", responseCode = "404"),
                    @ApiResponse(description = "Internal server error", responseCode = "500")
            }
    )
    public ResponseEntity<MessageDTO> sendMessage(
            @AuthenticationPrincipal UUID userId,
            @PathVariable Long listingId,
            @Valid @RequestBody MessageDTO messageDTO) {
        MessageDTO sentMessage = messageService.sendMessage(userId, listingId, messageDTO);
        return new ResponseEntity<>(sentMessage, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(
            description = "Retrieves all messages for a listing that the authenticated user is involved in.",
            responses = {
                    @ApiResponse(description = "Messages retrieved successfully", responseCode = "200",
                            content = @Content(schema = @Schema(implementation = MessageDTO.class))),
                    @ApiResponse(description = "Unauthorized", responseCode = "401"),
                    @ApiResponse(description = "Listing or messages not found", responseCode = "404")
            }
    )
    public ResponseEntity<List<MessageDTO>> getMessagesByListingId(
            @AuthenticationPrincipal UUID userId,
            @PathVariable Long listingId) {
        List<MessageDTO> messages = messageService.getMessagesByListingId(userId, listingId);
        return ResponseEntity.ok(messages);
    }

    @DeleteMapping
    @Operation(
            description = "Deletes all messages related to a listing for the authenticated user.",
            responses = {
                    @ApiResponse(description = "Conversation deleted successfully", responseCode = "204"),
                    @ApiResponse(description = "Unauthorized", responseCode = "401"),
                    @ApiResponse(description = "Listing not found", responseCode = "404"),
                    @ApiResponse(description = "Internal server error", responseCode = "500")
            }
    )
    public ResponseEntity<Void> deleteConversation(
            @AuthenticationPrincipal UUID userId,
            @PathVariable Long listingId) {
        messageService.deleteConversation(userId, listingId);
        return ResponseEntity.noContent().build();
    }
}