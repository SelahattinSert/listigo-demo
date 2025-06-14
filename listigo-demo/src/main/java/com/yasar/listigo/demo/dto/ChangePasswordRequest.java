package com.yasar.listigo.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordRequest {

    @NotBlank(message = "Old password cannot be blank")
    private String oldPassword;

    @NotBlank(message = "New password cannot be blank")
    @Size(min = 6, max = 100, message = "New password should be 6-100 characters")
    private String newPassword;

    @NotBlank(message = "Confirm new password cannot be blank")
    private String confirmNewPassword;
}