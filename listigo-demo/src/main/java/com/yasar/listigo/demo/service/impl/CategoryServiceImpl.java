package com.yasar.listigo.demo.service.impl;

import com.yasar.listigo.demo.dto.CategoryDTO;
import com.yasar.listigo.demo.entity.Category;
import com.yasar.listigo.demo.exception.CategoryNotCreatedException;
import com.yasar.listigo.demo.exception.CategoryNotDeletedException;
import com.yasar.listigo.demo.exception.CategoryNotFoundException;
import com.yasar.listigo.demo.exception.CategoryNotUpdatedException;
import com.yasar.listigo.demo.repository.CategoryRepository;
import com.yasar.listigo.demo.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        if (categoryRepository.existsByCategoryName(categoryDTO.getCategoryName())) {
            log.warn("Category already exists with name: {}", categoryDTO.getCategoryName());
            throw new IllegalArgumentException("Category already exists with name: " + categoryDTO.getCategoryName());
        }

        try {
            Category category = new Category();
            category.setCategoryName(categoryDTO.getCategoryName());
            Category savedCategory = categoryRepository.save(category);
            log.info("Category created with ID: {}", savedCategory.getCategoryId());
            return mapToDTO(savedCategory);
        } catch (Exception ex) {
            log.error("Exception occurred while creating category: {}", ex.getMessage());
            throw new CategoryNotCreatedException("Error occurred while creating category: " + ex.getMessage());
        }
    }

    @Override
    @Transactional
    public CategoryDTO updateCategory(Long categoryId, CategoryDTO categoryDTO) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> {
                    log.warn("Category not found with ID: {}", categoryId);
                    return new CategoryNotFoundException("Category not found with ID: " + categoryId);
                });

        if (categoryRepository.existsByCategoryName(categoryDTO.getCategoryName()) &&
                !category.getCategoryName().equals(categoryDTO.getCategoryName())) {
            log.warn("Category name already exists: {}", categoryDTO.getCategoryName());
            throw new IllegalArgumentException("Category name already exists: " + categoryDTO.getCategoryName());
        }

        try {
            category.setCategoryName(categoryDTO.getCategoryName());
            Category updatedCategory = categoryRepository.save(category);
            log.info("Category updated with ID: {}", categoryId);
            return mapToDTO(updatedCategory);
        } catch (Exception ex) {
            log.error("Exception occurred while updating category {}: {}", categoryId, ex.getMessage());
            throw new CategoryNotUpdatedException("Error occurred while updating category: " + ex.getMessage());
        }
    }

    @Override
    @Transactional
    public void deleteCategory(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> {
                    log.warn("Category not found with ID: {}", categoryId);
                    return new CategoryNotFoundException("Category not found with ID: " + categoryId);
                });

        if (!category.getListings().isEmpty()) {
            log.warn("Category {} has associated listings and cannot be deleted", categoryId);
            throw new IllegalArgumentException("Category has associated listings and cannot be deleted");
        }

        try {
            categoryRepository.delete(category);
            log.info("Category deleted with ID: {}", categoryId);
        } catch (Exception ex) {
            log.error("Exception occurred while deleting category {}: {}", categoryId, ex.getMessage());
            throw new CategoryNotDeletedException("Error occurred while deleting category: " + ex.getMessage());
        }
    }

    @Override
    public CategoryDTO getCategoryById(Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> {
                    log.warn("Category not found with ID: {}", categoryId);
                    return new CategoryNotFoundException("Category not found with ID: " + categoryId);
                });

        log.info("Retrieved category with ID: {}", categoryId);
        return mapToDTO(category);
    }

    @Override
    public List<CategoryDTO> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        if (categories.isEmpty()) {
            log.warn("No categories found");
            throw new CategoryNotFoundException("No categories found");
        }

        log.info("Retrieved {} categories", categories.size());
        return categories.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private CategoryDTO mapToDTO(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setCategoryId(category.getCategoryId());
        dto.setCategoryName(category.getCategoryName());
        return dto;
    }
}