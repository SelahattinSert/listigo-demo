package com.yasar.listigo.demo.repository;

import com.yasar.listigo.demo.entity.BlockedUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface BlockedUserRepository extends JpaRepository<BlockedUser, Long> {

    @Query("SELECT CASE WHEN COUNT(b) > 0 THEN true ELSE false END " +
            "FROM BlockedUser b WHERE b.blockerId = :blockerId AND b.blockedId = :blockedId")
    boolean existsByBlockerIdAndBlockedId(@Param("blockerId") UUID blockerId, @Param("blockedId") UUID blockedId);
}