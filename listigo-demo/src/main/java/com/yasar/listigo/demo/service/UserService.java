package com.yasar.listigo.demo.service;

import com.yasar.listigo.demo.dto.AuthResponse;
import com.yasar.listigo.demo.dto.BlockUserDTO;
import com.yasar.listigo.demo.dto.UserDto;
import com.yasar.listigo.demo.entity.UserMetadata;
import com.yasar.listigo.demo.exception.JwtTokenExpiredException;
import com.yasar.listigo.demo.exception.JwtTokenGenerationException;
import com.yasar.listigo.demo.exception.JwtTokenInvalidException;
import com.yasar.listigo.demo.exception.UserAlreadyExistsException;
import com.yasar.listigo.demo.exception.UserNotFoundException;
import com.yasar.listigo.demo.exception.UserNotRegisteredException;
import com.yasar.listigo.demo.exception.UserProfileNotUpdatedException;
import com.yasar.listigo.demo.exception.InternalServerException;
import com.yasar.listigo.demo.exception.InvalidPasswordException;

import java.util.UUID;

/**
 * Service interface for handling user-related operations.
 */
public interface UserService {

    /**
     * Registers a new user.
     *
     * @param userDto User details for registration
     * @return Registered user metadata
     * @throws UserAlreadyExistsException if email already exists
     * @throws UserNotRegisteredException if an error occurs during registration
     * @throws InternalServerException for unexpected errors during registration
     */
    UserMetadata handleRegisterUser(UserDto userDto);

    /**
     * Logs in a user and returns authentication tokens.
     *
     * @param email    User's email
     * @param password User's password
     * @return Authentication response with tokens
     * @throws UserNotFoundException if user is not found or credentials are invalid
     * @throws JwtTokenGenerationException if token generation fails
     * @throws InternalServerException for unexpected errors during login
     */
    AuthResponse handleLoginUser(String email, String password);

    /**
     * Retrieves the current user's profile.
     *
     * @param userId Current user's ID (from JWT)
     * @return User profile
     * @throws UserNotFoundException if user is not found
     */
    UserMetadata handleGetProfile(UUID userId);

    /**
     * Updates the current user's profile.
     *
     * @param userId Current user's ID (from JWT)
     * @param userDto Updated user details
     * @return Updated user metadata
     * @throws UserNotFoundException if user is not found
     * @throws UserProfileNotUpdatedException if an error occurs during profile update
     * @throws InternalServerException for unexpected errors during profile update
     */
    UserMetadata handleUpdateProfile(UUID userId, UserDto userDto);

    /**
     * Refreshes the access token using a refresh token.
     *
     * @param refreshToken Current refresh token
     * @return Updated authentication response with new tokens
     * @throws UserNotFoundException if user is not found
     * @throws JwtTokenInvalidException if the refresh token is invalid
     * @throws JwtTokenExpiredException if the refresh token has expired
     * @throws JwtTokenGenerationException if new token generation fails
     * @throws InternalServerException for unexpected errors during token refresh
     */
    AuthResponse handleRefreshToken(String refreshToken);

    /**
     * Changes the password for the specified user.
     *
     * @param userId the ID of the user
     * @param oldPassword the current password
     * @param newPassword the new password
     * @throws UserNotFoundException if the user is not found
     * @throws InvalidPasswordException if the old password is incorrect
     */
    void handleChangePassword(UUID userId, String oldPassword, String newPassword);

    void blockUser(UUID blockerId, BlockUserDTO blockUserDTO);
}