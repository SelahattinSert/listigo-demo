package com.yasar.listigo.demo.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class UserResponse {

    private UUID userId;
    private String email;
    private String name;
    private String phone;
}