package com.yasar.listigo.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class BlockUserDTO {

    @NotBlank(message = "Blocked user ID cannot be blank")
    @Size(max = 36, message = "Blocked user ID should not exceed 36 characters")
    private String blockedId;
}