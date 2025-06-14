package com.yasar.listigo.demo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CategoryDTO {

    private Long categoryId;

    @NotBlank(message = "Category name cannot be blank")
    @Size(min = 3, max = 100, message = "Category name must be between 3 and 100 characters")
    private String categoryName;
}