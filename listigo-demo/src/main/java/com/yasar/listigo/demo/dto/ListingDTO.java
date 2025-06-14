package com.yasar.listigo.demo.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ListingDTO {

    private Long listingId;

    @NotBlank(message = "User ID cannot be blank")
    @Size(max = 36, message = "User ID should not exceed 36 characters")
    private String userId;

    @NotNull(message = "Category ID cannot be null")
    @Positive(message = "Category ID must be positive")
    private Long categoryId;

    @NotBlank(message = "Title cannot be blank")
    @Size(min = 3, max = 100, message = "Title must be between 3 and 100 characters")
    private String title;

    @Size(max = 1000, message = "Description should not exceed 1000 characters")
    private String description;

    @NotNull(message = "Price cannot be null")
    @PositiveOrZero(message = "Price must be zero or positive")
    private Double price;

    @Size(max = 50, message = "Brand should not exceed 50 characters")
    private String brand;

    @Size(max = 50, message = "Model should not exceed 50 characters")
    private String model;

    @Positive(message = "Year must be positive")
    @Min(value = 1886, message = "Year must be 1886 or later")
    @Max(value = 9999, message = "Year must be 9999 or earlier")
    private Integer year;

    @PositiveOrZero(message = "Mileage must be zero or positive")
    private Integer mileage;

    @Size(max = 100, message = "Location should not exceed 100 characters")
    private String location;

    private List<String> photos;

    private LocalDateTime createdAt;
}