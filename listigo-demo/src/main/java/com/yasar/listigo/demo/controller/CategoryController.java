package com.yasar.listigo.demo.controller;

import com.yasar.listigo.demo.dto.CategoryDTO;
import com.yasar.listigo.demo.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.version}/categories")
@Tag(name = "Category Controller", description = "Endpoints for managing categories")
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            description = "Creates a new category (admin only).",
            responses = {
                    @ApiResponse(description = "Category created successfully", responseCode = "201",
                            content = @Content(schema = @Schema(implementation = CategoryDTO.class))),
                    @ApiResponse(description = "Bad request", responseCode = "400"),
                    @ApiResponse(description = "Unauthorized", responseCode = "401"),
                    @ApiResponse(description = "Forbidden", responseCode = "403")
            }
    )
    public ResponseEntity<CategoryDTO> createCategory(@Valid @RequestBody CategoryDTO categoryDTO) {
        CategoryDTO createdCategory = categoryService.createCategory(categoryDTO);
        return new ResponseEntity<>(createdCategory, HttpStatus.CREATED);
    }

    @PutMapping("/{categoryId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            description = "Updates an existing category (admin only).",
            responses = {
                    @ApiResponse(description = "Category updated successfully", responseCode = "200",
                            content = @Content(schema = @Schema(implementation = CategoryDTO.class))),
                    @ApiResponse(description = "Bad request", responseCode = "400"),
                    @ApiResponse(description = "Unauthorized", responseCode = "401"),
                    @ApiResponse(description = "Forbidden", responseCode = "403"),
                    @ApiResponse(description = "Category not found", responseCode = "404")
            }
    )
    public ResponseEntity<CategoryDTO> updateCategory(
            @PathVariable Long categoryId,
            @Valid @RequestBody CategoryDTO categoryDTO) {
        CategoryDTO updatedCategory = categoryService.updateCategory(categoryId, categoryDTO);
        return ResponseEntity.ok(updatedCategory);
    }

    @DeleteMapping("/{categoryId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(
            description = "Deletes a category (admin only).",
            responses = {
                    @ApiResponse(description = "Category deleted successfully", responseCode = "204"),
                    @ApiResponse(description = "Unauthorized", responseCode = "401"),
                    @ApiResponse(description = "Forbidden", responseCode = "403"),
                    @ApiResponse(description = "Category not found", responseCode = "404")
            }
    )
    public ResponseEntity<Void> deleteCategory(@PathVariable Long categoryId) {
        categoryService.deleteCategory(categoryId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{categoryId}")
    @Operation(
            description = "Retrieves a category by ID.",
            responses = {
                    @ApiResponse(description = "Category retrieved successfully", responseCode = "200",
                            content = @Content(schema = @Schema(implementation = CategoryDTO.class))),
                    @ApiResponse(description = "Category not found", responseCode = "404")
            }
    )
    public ResponseEntity<CategoryDTO> getCategoryById(@PathVariable Long categoryId) {
        CategoryDTO category = categoryService.getCategoryById(categoryId);
        return ResponseEntity.ok(category);
    }

    @GetMapping
    @Operation(
            description = "Retrieves all categories.",
            responses = {
                    @ApiResponse(description = "Categories retrieved successfully", responseCode = "200",
                            content = @Content(schema = @Schema(implementation = CategoryDTO.class))),
                    @ApiResponse(description = "No categories found", responseCode = "404")
            }
    )
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        List<CategoryDTO> categories = categoryService.getAllCategories();
        return ResponseEntity.ok(categories);
    }
}