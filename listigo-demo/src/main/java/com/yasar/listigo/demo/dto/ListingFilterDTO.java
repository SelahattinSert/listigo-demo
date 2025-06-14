package com.yasar.listigo.demo.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ListingFilterDTO {

    @Positive(message = "Category ID must be positive")
    private Long categoryId;

    @Size(max = 50, message = "Brand should not exceed 50 characters")
    private String brand;

    @Size(max = 50, message = "Model should not exceed 50 characters")
    private String model;

    @Positive(message = "Minimum year must be positive")
    @Min(value = 1886, message = "Minimum year must be 1886 or later")
    private Integer minYear;

    @Positive(message = "Maximum year must be positive")
    @Max(value = 9999, message = "Maximum year must be 9999 or earlier")
    private Integer maxYear;

    @PositiveOrZero(message = "Minimum price must be zero or positive")
    private Double minPrice;

    @PositiveOrZero(message = "Maximum price must be zero or positive")
    private Double maxPrice;

    @Size(max = 100, message = "Location should not exceed 100 characters")
    private String location;

    @Size(max = 255, message = "Search text should not exceed 255 characters")
    private String searchText;
}