package com.yasar.listigo.demo.repository;

import com.yasar.listigo.demo.entity.UserMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserMetadata, UUID> {
    Optional<UserMetadata> findByEmail(String email);

    @Query(value = "SELECT role FROM user_roles WHERE user_id = :userId", nativeQuery = true)
    List<String> findRolesByUserId(@Param("userId") UUID userId);

    @Modifying
    @Query(value = "INSERT INTO user_roles (user_id, role) VALUES (:userId, :role)", nativeQuery = true)
    void saveUserRole(@Param("userId") UUID userId, @Param("role") String role);
}
