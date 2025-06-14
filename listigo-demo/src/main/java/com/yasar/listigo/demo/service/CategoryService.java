package com.yasar.listigo.demo.service;

import com.yasar.listigo.demo.dto.CategoryDTO;

import java.util.List;

public interface CategoryService {

    /**
     * Creates a new category (admin only).
     *
     * @param categoryDTO The category to create
     * @return The created category DTO
     */
    CategoryDTO createCategory(CategoryDTO categoryDTO);

    /**
     * Updates an existing category (admin only).
     *
     * @param categoryId The ID of the category
     * @param categoryDTO The updated category details
     * @return The updated category DTO
     */
    CategoryDTO updateCategory(Long categoryId, CategoryDTO categoryDTO);

    /**
     * Deletes a category (admin only).
     *
     * @param categoryId The ID of the category
     */
    void deleteCategory(Long categoryId);

    /**
     * Retrieves a category by ID.
     *
     * @param categoryId The ID of the category
     * @return The category DTO
     */
    CategoryDTO getCategoryById(Long categoryId);

    /**
     * Retrieves all categories.
     *
     * @return List of category DTOs
     */
    List<CategoryDTO> getAllCategories();
}