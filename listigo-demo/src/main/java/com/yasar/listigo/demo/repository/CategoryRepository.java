package com.yasar.listigo.demo.repository;

import com.yasar.listigo.demo.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Category c WHERE c.categoryName = :categoryName")
    boolean existsByCategoryName(@Param("categoryName") String categoryName);
}