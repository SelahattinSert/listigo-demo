package com.yasar.listigo.demo.repository;

import com.yasar.listigo.demo.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("SELECT m FROM Message m WHERE m.listing.listingId = :listingId " +
            "AND (m.sender.userId = :userId OR m.receiver.userId = :userId)")
    List<Message> findByListingIdAndSenderIdOrReceiverId(
            @Param("listingId") Long listingId,
            @Param("userId") UUID userId);

    @Modifying
    @Query("DELETE FROM Message m WHERE m.listing.listingId = :listingId " +
            "AND (m.sender.userId = :userId OR m.receiver.userId = :userId)")
    void deleteByListingIdAndSenderIdOrReceiverId(
            @Param("listingId") Long listingId,
            @Param("userId") UUID userId);
}
