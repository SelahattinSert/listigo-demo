package com.yasar.listigo.demo.repository;

import com.yasar.listigo.demo.entity.Listing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface ListingRepository extends JpaRepository<Listing, Long> {

    List<Listing> findByUserUserId(UUID userId);

    @Query(value = "SELECT * FROM listings l WHERE " +
            "(:categoryId IS NULL OR l.category_id = :categoryId) " +
            "AND (:brand IS NULL OR l.brand = :brand) " +
            "AND (:model IS NULL OR l.model = :model) " +
            "AND (:minYear IS NULL OR l.year >= :minYear) " +
            "AND (:maxYear IS NULL OR l.year <= :maxYear) " +
            "AND (:minPrice IS NULL OR l.price >= :minPrice) " +
            "AND (:maxPrice IS NULL OR l.price <= :maxPrice) " +
            "AND (:location IS NULL OR l.location = :location) " +
            "AND (:searchText IS NULL OR to_tsvector('turkish', l.title || ' ' || COALESCE(l.description, '')) @@ to_tsquery('turkish', :searchText))",
            nativeQuery = true)
    List<Listing> findByFilter(
            @Param("categoryId") Long categoryId,
            @Param("brand") String brand,
            @Param("model") String model,
            @Param("minYear") Integer minYear,
            @Param("maxYear") Integer maxYear,
            @Param("minPrice") Double minPrice,
            @Param("maxPrice") Double maxPrice,
            @Param("location") String location,
            @Param("searchText") String searchText);
}