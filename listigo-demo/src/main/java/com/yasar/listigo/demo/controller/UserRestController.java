package com.yasar.listigo.demo.controller;

import com.yasar.listigo.demo.converter.UserDtoConverter;
import com.yasar.listigo.demo.dto.BlockUserDTO;
import com.yasar.listigo.demo.dto.ChangePasswordRequest;
import com.yasar.listigo.demo.dto.LoginRequest;
import com.yasar.listigo.demo.dto.RefreshTokenRequest;
import com.yasar.listigo.demo.dto.UserDto;
import com.yasar.listigo.demo.dto.UserResponse;
import com.yasar.listigo.demo.entity.UserMetadata;
import com.yasar.listigo.demo.exception.AuthenticationFailedException;
import com.yasar.listigo.demo.exception.PasswordsDoNotMatchException;
import com.yasar.listigo.demo.service.UserService;
import com.yasar.listigo.demo.dto.AuthResponse;
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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.version}/auth")
@Tag(name = "User Authentication Controller")
public class UserRestController {

    private final UserService userService;

    private final UserDtoConverter userDtoConverter;

    @PostMapping("/register")
    @Operation(
            description = "Registers a new user",
            responses = {
                    @ApiResponse(description = "User registered", responseCode = "201",
                            content = @Content(schema = @Schema(implementation = UserResponse.class))),
                    @ApiResponse(description = "Bad request", responseCode = "400"),
                    @ApiResponse(description = "Email already exists", responseCode = "409")
            }
    )
    public ResponseEntity<UserResponse> registerUser(@Valid @RequestBody UserDto userDto) {
        UserMetadata user = userService.handleRegisterUser(userDto);
        UserResponse response = userDtoConverter.toUserResponse(user);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(
            description = "Logs in a user and returns authentication tokens",
            responses = {
                    @ApiResponse(description = "Login successful", responseCode = "200"),
                    @ApiResponse(description = "Bad request", responseCode = "400"),
                    @ApiResponse(description = "Invalid credentials", responseCode = "401")
            }
    )
    public ResponseEntity<AuthResponse> loginUser(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse authResponse = userService.handleLoginUser(loginRequest.getEmail(), loginRequest.getPassword());
        return ResponseEntity.ok(authResponse);
    }

    @GetMapping("/users/profile")
    @Operation(
            description = "Retrieves the current user's profile",
            responses = {
                    @ApiResponse(description = "User profile retrieved", responseCode = "200",
                            content = @Content(schema = @Schema(implementation = UserResponse.class))),
                    @ApiResponse(description = "Unauthorized", responseCode = "401"),
                    @ApiResponse(description = "User not found", responseCode = "404")
            }
    )
    public ResponseEntity<UserResponse> getProfile() {
        UUID userId = getUserIdFromSecurityContext();
        UserMetadata user = userService.handleGetProfile(userId);
        UserResponse response = userDtoConverter.toUserResponse(user);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/users/profile")
    @Operation(
            description = "Updates the current user's profile",
            responses = {
                    @ApiResponse(description = "Profile updated", responseCode = "200",
                            content = @Content(schema = @Schema(implementation = UserResponse.class))),
                    @ApiResponse(description = "Unauthorized", responseCode = "401"),
                    @ApiResponse(description = "User not found", responseCode = "404")
            }
    )
    public ResponseEntity<UserResponse> updateProfile(@Valid @RequestBody UserDto userDto) {
        UUID userId = (UUID) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        UserMetadata user = userService.handleUpdateProfile(userId, userDto);
        UserResponse response = userDtoConverter.toUserResponse(user);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    @Operation(
            description = "Refreshes the access token using a refresh token",
            responses = {
                    @ApiResponse(description = "Token refreshed successfully", responseCode = "200",
                            content = @Content(schema = @Schema(implementation = AuthResponse.class))),
                    @ApiResponse(description = "Bad request", responseCode = "400"),
                    @ApiResponse(description = "Invalid refresh token", responseCode = "401")
            }
    )
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest refreshTokenRequest) {
        AuthResponse authResponse = userService.handleRefreshToken(refreshTokenRequest.getRefreshToken());
        return ResponseEntity.ok(authResponse);
    }

    @PostMapping("/block")
    @Operation(
            description = "Blocks a user, preventing them from sending messages to the authenticated user.",
            responses = {
                    @ApiResponse(description = "User blocked successfully", responseCode = "204"),
                    @ApiResponse(description = "Bad request", responseCode = "400"),
                    @ApiResponse(description = "Unauthorized", responseCode = "401"),
                    @ApiResponse(description = "User not found", responseCode = "404"),
                    @ApiResponse(description = "User already blocked", responseCode = "403")
            }
    )
    public ResponseEntity<Void> blockUser(
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody BlockUserDTO blockUserDTO) {
        userService.blockUser(userId, blockUserDTO);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/users/profile/change-password")
    @Operation(
            description = "Changes the password for the current user",
            responses = {
                    @ApiResponse(description = "Password changed successfully", responseCode = "204"),
                    @ApiResponse(description = "Bad request", responseCode = "400"),
                    @ApiResponse(description = "Unauthorized", responseCode = "401"),
                    @ApiResponse(description = "User not found", responseCode = "404"),
                    @ApiResponse(description = "Invalid old password", responseCode = "403")
            }
    )
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new PasswordsDoNotMatchException("New passwords do not match");
        }
        userService.handleChangePassword(userId, request.getOldPassword(), request.getNewPassword());
        return ResponseEntity.noContent().build();
    }

    private UUID getUserIdFromSecurityContext() {
        try {
            return (UUID) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        } catch (Exception e) {
            throw new AuthenticationFailedException("Failed to retrieve user ID from security context: " + e.getMessage());
        }
    }
}