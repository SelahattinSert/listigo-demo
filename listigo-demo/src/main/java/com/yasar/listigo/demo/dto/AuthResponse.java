package com.yasar.listigo.demo.dto;

import com.yasar.listigo.demo.entity.UserMetadata;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {

    private String accessToken;
    private String refreshToken;
    private UserMetadata user;
}