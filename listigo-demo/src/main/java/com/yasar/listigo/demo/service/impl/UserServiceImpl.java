package com.yasar.listigo.demo.service.impl;

import com.yasar.listigo.demo.dto.AuthResponse;
import com.yasar.listigo.demo.dto.BlockUserDTO;
import com.yasar.listigo.demo.dto.UserDto;
import com.yasar.listigo.demo.entity.BlockedUser;
import com.yasar.listigo.demo.entity.UserMetadata;
import com.yasar.listigo.demo.exception.InternalServerException;
import com.yasar.listigo.demo.exception.InvalidPasswordException;
import com.yasar.listigo.demo.exception.JwtTokenExpiredException;
import com.yasar.listigo.demo.exception.JwtTokenGenerationException;
import com.yasar.listigo.demo.exception.JwtTokenInvalidException;
import com.yasar.listigo.demo.exception.UserAlreadyExistsException;
import com.yasar.listigo.demo.exception.UserBlockedException;
import com.yasar.listigo.demo.exception.UserNotFoundException;
import com.yasar.listigo.demo.exception.UserNotRegisteredException;
import com.yasar.listigo.demo.exception.UserProfileNotUpdatedException;
import com.yasar.listigo.demo.repository.BlockedUserRepository;
import com.yasar.listigo.demo.repository.UserRepository;
import com.yasar.listigo.demo.service.UserService;
import com.yasar.listigo.demo.util.DateTimeFactory;
import com.yasar.listigo.demo.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final DateTimeFactory dateTimeFactory;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final BlockedUserRepository blockedUserRepository;

    @Override
    @Transactional
    public UserMetadata handleRegisterUser(UserDto userDto) {
        if (userRepository.findByEmail(userDto.getEmail()).isPresent()) {
            log.warn("Attempted to register with existing email: {}", userDto.getEmail());
            throw new UserAlreadyExistsException("Email already exists: " + userDto.getEmail());
        }

        try {
            UserMetadata user = new UserMetadata();
            user.setEmail(userDto.getEmail());
            user.setPassword(passwordEncoder.encode(userDto.getPassword()));
            user.setName(userDto.getName());
            user.setPhone(userDto.getPhone());
            user.setCreatedAt(dateTimeFactory.now());

            UserMetadata savedUser = userRepository.save(user);
            userRepository.saveUserRole(savedUser.getUserId(), "ROLE_USER");
            updateRefreshToken(savedUser);
            log.info("User registered with ID: {}", savedUser.getUserId());
            return savedUser;
        } catch (Exception ex) {
            log.error("Exception occurred while registering user: {}", ex.getMessage());
            throw new UserNotRegisteredException("Error occurred while registering user: " + ex.getMessage());
        }
    }

    @Override
    @Transactional
    public AuthResponse handleLoginUser(String email, String password) {
        UserMetadata user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("User not found with email: {}", email);
                    return new UserNotFoundException("User not found with email: " + email);
                });

        if (!passwordEncoder.matches(password, user.getPassword())) {
            log.warn("Invalid credentials for email: {}", email);
            throw new UserNotFoundException("Invalid credentials");
        }

        try {
            List<SimpleGrantedAuthority> authorities = userRepository.findRolesByUserId(user.getUserId()).stream()
                    .map(SimpleGrantedAuthority::new)
                    .toList();
            String accessToken = jwtUtil.generateToken(user.getUserId(), authorities);
            updateRefreshToken(user);
            log.info("User logged in successfully with email: {}", email);
            return new AuthResponse(accessToken, user.getRefreshToken(), user);
        } catch (JwtTokenGenerationException ex) {
            log.error("Exception occurred while generating tokens for user: {}", email, ex);
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected error occurred while generating tokens for user: {}", email, ex);
            throw new InternalServerException("Unexpected error occurred while generating tokens: " + ex.getMessage());
        }
    }

    @Override
    public UserMetadata handleGetProfile(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", userId);
                    return new UserNotFoundException("User not found with ID: " + userId);
                });
    }

    @Override
    @Transactional
    public UserMetadata handleUpdateProfile(UUID userId, UserDto userDto) {
        UserMetadata user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", userId);
                    return new UserNotFoundException("User not found with ID: " + userId);
                });

        try {
            user.setName(userDto.getName());
            user.setPhone(userDto.getPhone());
            UserMetadata updatedUser = userRepository.save(user);
            log.info("User profile updated for ID: {}", userId);
            return updatedUser;
        } catch (Exception ex) {
            log.error("Exception occurred while updating user profile for ID: {}", userId, ex);
            throw new UserProfileNotUpdatedException("Error occurred while updating user profile: " + ex.getMessage());
        }
    }

    @Override
    @Transactional
    public AuthResponse handleRefreshToken(String refreshToken) {
        try {
            UUID userId = jwtUtil.extractUserId(refreshToken);
            UserMetadata user = userRepository.findById(userId)
                    .orElseThrow(() -> {
                        log.warn("User not found with ID: {}", userId);
                        return new UserNotFoundException("User not found with ID: " + userId);
                    });

            if (!refreshToken.equals(user.getRefreshToken())) {
                log.warn("Provided refresh token does not match stored token for user ID: {}", userId);
                throw new JwtTokenInvalidException("Invalid refresh token");
            }

            if (user.getRefreshTokenExpiration() == null || user.getRefreshTokenExpiration().isBefore(Instant.now())) {
                log.warn("Refresh token expired for user ID: {}", userId);
                throw new JwtTokenExpiredException("Refresh token has expired");
            }

            List<SimpleGrantedAuthority> authorities = userRepository.findRolesByUserId(userId).stream()
                    .map(SimpleGrantedAuthority::new)
                    .toList();
            String newAccessToken = jwtUtil.generateToken(userId, authorities);
            updateRefreshToken(user);

            log.info("Tokens refreshed successfully for user ID: {}", userId);
            return new AuthResponse(newAccessToken, user.getRefreshToken(), user);
        } catch (JwtTokenExpiredException | JwtTokenInvalidException ex) {
            log.error("Invalid or expired refresh token: {}", ex.getMessage());
            throw ex;
        } catch (Exception ex) {
            log.error("Unexpected error occurred while refreshing token: {}", ex.getMessage());
            throw new InternalServerException("Unexpected error occurred while refreshing token: " + ex.getMessage());
        }
    }

    @Override
    @Transactional
    public void blockUser(UUID blockerId, BlockUserDTO blockUserDTO) {
        UserMetadata blocker = userRepository.findById(blockerId)
                .orElseThrow(() -> {
                    log.warn("Blocker not found with ID: {}", blockerId);
                    return new UserNotFoundException("Blocker not found with ID: " + blockerId);
                });

        UUID blockedId = UUID.fromString(blockUserDTO.getBlockedId());
        UserMetadata blocked = userRepository.findById(blockedId)
                .orElseThrow(() -> {
                    log.warn("Blocked user not found with ID: {}", blockedId);
                    return new UserNotFoundException("Blocked user not found with ID: " + blockedId);
                });

        if (blockerId.equals(blockedId)) {
            log.warn("User {} cannot block themselves", blockerId);
            throw new IllegalArgumentException("Cannot block yourself");
        }

        if (blockedUserRepository.existsByBlockerIdAndBlockedId(blockerId, blockedId)) {
            log.warn("User {} has already blocked user {}", blockerId, blockedId);
            throw new UserBlockedException("User is already blocked");
        }

        try {
            BlockedUser blockedUser = new BlockedUser();
            blockedUser.setBlockerId(blockerId);
            blockedUser.setBlockedId(blockedId);
            blockedUserRepository.save(blockedUser);
            log.info("User {} blocked user {}", blockerId, blockedId);
        } catch (Exception ex) {
            log.error("Exception occurred while blocking user {}: {}", blockedId, ex.getMessage());
            throw new RuntimeException("Error occurred while blocking user: " + ex.getMessage());
        }
    }

    @Override
    @Transactional
    public void handleChangePassword(UUID userId, String oldPassword, String newPassword) {
        UserMetadata user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", userId);
                    return new UserNotFoundException("User not found with ID: " + userId);
                });

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            log.warn("Invalid old password for user ID: {}", userId);
            throw new InvalidPasswordException("Invalid old password");
        }

        try {
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            log.info("Password changed successfully for user ID: {}", userId);
        } catch (Exception ex) {
            log.error("Exception occurred while changing password for user ID: {}", userId, ex);
            throw new RuntimeException("Error occurred while changing password: " + ex.getMessage());
        }
    }

    private void updateRefreshToken(UserMetadata user) {
        String newRefreshToken = jwtUtil.generateToken(user.getUserId(), jwtUtil.getRefreshExpiration());
        Instant expiration = Instant.now().plusMillis(jwtUtil.getRefreshExpiration());

        user.setRefreshToken(newRefreshToken);
        user.setRefreshTokenExpiration(expiration);
        userRepository.save(user);
    }
}