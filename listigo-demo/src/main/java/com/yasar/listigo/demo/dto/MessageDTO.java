package com.yasar.listigo.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;
@Data
public class MessageDTO {

    private Long messageId;

    @NotBlank(message = "Sender ID cannot be blank")
    @Size(max = 36, message = "Sender ID should not exceed 36 characters")
    private String senderId;

    @NotBlank(message = "Receiver ID cannot be blank")
    @Size(max = 36, message = "Receiver ID should not exceed 36 characters")
    private String receiverId;

    private Long listingId;

    @NotBlank(message = "Content cannot be blank")
    @Size(max = 1000, message = "Content should not exceed 1000 characters")
    private String content;

    private LocalDateTime sentAt;

    private boolean isRead;
}
