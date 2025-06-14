package com.yasar.listigo.demo.controller;

import com.yasar.listigo.demo.dto.ListingDTO;
import com.yasar.listigo.demo.dto.ListingFilterDTO;
import com.yasar.listigo.demo.service.ListingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("${api.version}/listings")
@Tag(name = "Listing Controller", description = "Endpoints for managing listings")
public class ListingController {

    private final ListingService listingService;

    @PostMapping
    @Operation(
            description = "Creates a new listing for the authenticated user",
            responses = {
                    @ApiResponse(description = "Listing created successfully", responseCode = "201",
                            content = @Content(schema = @Schema(implementation = ListingDTO.class))),
                    @ApiResponse(description = "Bad request", responseCode = "400"),
                    @ApiResponse(description = "Unauthorized", responseCode = "401"),
                    @ApiResponse(description = "User or category not found", responseCode = "404")
            }
    )
    public ResponseEntity<ListingDTO> createListing(
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody ListingDTO listingDTO) {
        ListingDTO createdListing = listingService.createListing(userId, listingDTO);
        return new ResponseEntity<>(createdListing, HttpStatus.CREATED);
    }

    @PutMapping("/{listingId}")
    @Operation(
            description = "Updates an existing listing for the authenticated user",
            responses = {
                    @ApiResponse(description = "Listing updated successfully", responseCode = "200",
                            content = @Content(schema = @Schema(implementation = ListingDTO.class))),
                    @ApiResponse(description = "Bad request", responseCode = "400"),
                    @ApiResponse(description = "Unauthorized", responseCode = "401"),
                    @ApiResponse(description = "Listing or user not found", responseCode = "404")
            }
    )
    public ResponseEntity<ListingDTO> updateListing(
            @AuthenticationPrincipal UUID userId,
            @PathVariable Long listingId,
            @Valid @RequestBody ListingDTO listingDTO) {
        ListingDTO updatedListing = listingService.updateListing(userId, listingId, listingDTO);
        return ResponseEntity.ok(updatedListing);
    }

    @DeleteMapping("/{listingId}")
    @Operation(
            description = "Deletes a listing for the authenticated user",
            responses = {
                    @ApiResponse(description = "Listing deleted successfully", responseCode = "204"),
                    @ApiResponse(description = "Unauthorized", responseCode = "401"),
                    @ApiResponse(description = "Listing or user not found", responseCode = "404")
            }
    )
    public ResponseEntity<Void> deleteListing(
            @AuthenticationPrincipal UUID userId,
            @PathVariable Long listingId) {
        listingService.deleteListing(userId, listingId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my-listings")
    @Operation(
            description = "Retrieves all listings for the authenticated user",
            responses = {
                    @ApiResponse(description = "Listings retrieved successfully", responseCode = "200",
                            content = @Content(schema = @Schema(implementation = ListingDTO.class))),
                    @ApiResponse(description = "Unauthorized", responseCode = "401"),
                    @ApiResponse(description = "No listings found for user", responseCode = "404")
            }
    )
    public ResponseEntity<List<ListingDTO>> getUserListings(
            @AuthenticationPrincipal UUID userId) {
        List<ListingDTO> listings = listingService.getUserListings(userId);
        return ResponseEntity.ok(listings);
    }

    @GetMapping("/{listingId}")
    @Operation(
            description = "Retrieves a listing by its ID",
            responses = {
                    @ApiResponse(description = "Listing retrieved successfully", responseCode = "200",
                            content = @Content(schema = @Schema(implementation = ListingDTO.class))),
                    @ApiResponse(description = "Listing not found", responseCode = "404")
            }
    )
    public ResponseEntity<ListingDTO> getListingById(
            @PathVariable Long listingId) {
        ListingDTO listing = listingService.getListingById(listingId);
        return ResponseEntity.ok(listing);
    }

    @GetMapping("/all")
    @Operation(
            description = "Retrieves all listings",
            responses = {
                    @ApiResponse(description = "Listings retrieved successfully", responseCode = "200",
                            content = @Content(schema = @Schema(implementation = ListingDTO.class))),
                    @ApiResponse(description = "No listings found", responseCode = "404")
            }
    )
    public ResponseEntity<List<ListingDTO>> getAllListings() {
        List<ListingDTO> listings = listingService.getAllListings();
        return ResponseEntity.ok(listings);
    }

    @PostMapping("/filter")
    @Operation(
            description = "Retrieves listings based on filter criteria",
            responses = {
                    @ApiResponse(description = "Listings retrieved successfully", responseCode = "200",
                            content = @Content(schema = @Schema(implementation = ListingDTO.class))),
                    @ApiResponse(description = "Bad request", responseCode = "400")
            }
    )
    public ResponseEntity<List<ListingDTO>> getFilteredListings(
            @Valid @RequestBody ListingFilterDTO filterDTO) {
        List<ListingDTO> listings = listingService.getFilteredListings(filterDTO);
        return ResponseEntity.ok(listings);
    }

    @PostMapping("/{listingId}/photos")
    @Operation(
            description = "Adds a photo URL to a listing for the authenticated user. URL must be HTTP/HTTPS and end with .png, .jpg, .jpeg, or .gif.",
            responses = {
                    @ApiResponse(description = "Photo URL added successfully", responseCode = "200",
                            content = @Content(schema = @Schema(implementation = ListingDTO.class))),
                    @ApiResponse(description = "Bad request", responseCode = "400"),
                    @ApiResponse(description = "Unauthorized", responseCode = "401"),
                    @ApiResponse(description = "Listing or user not found", responseCode = "404")
            }
    )
    public ResponseEntity<ListingDTO> addPhoto(
            @AuthenticationPrincipal UUID userId,
            @PathVariable Long listingId,
            @RequestParam String photoUrl) {
        ListingDTO updatedListing = listingService.uploadPhotoToListing(userId, listingId, photoUrl);
        return ResponseEntity.ok(updatedListing);
    }

    @DeleteMapping("/{listingId}/photos")
    @Operation(
            description = "Deletes a photo URL from a listing for the authenticated user",
            responses = {
                    @ApiResponse(description = "Photo URL deleted successfully", responseCode = "200",
                            content = @Content(schema = @Schema(implementation = ListingDTO.class))),
                    @ApiResponse(description = "Bad request", responseCode = "400"),
                    @ApiResponse(description = "Unauthorized", responseCode = "401"),
                    @ApiResponse(description = "Listing or photo not found", responseCode = "404")
            }
    )
    public ResponseEntity<ListingDTO> deletePhoto(
            @AuthenticationPrincipal UUID userId,
            @PathVariable Long listingId,
            @RequestParam String photoUrl) {
        ListingDTO updatedListing = listingService.deletePhotoFromListing(userId, listingId, photoUrl);
        return ResponseEntity.ok(updatedListing);
    }

    @GetMapping("/{listingId}/photos")
    @Operation(
            description = "Retrieves all photo URLs for a listing",
            responses = {
                    @ApiResponse(description = "Photo URLs retrieved successfully", responseCode = "200",
                            content = @Content(schema = @Schema(implementation = String.class))),
                    @ApiResponse(description = "Listing not found", responseCode = "404")
            }
    )
    public ResponseEntity<List<String>> getListingPhotos(
            @PathVariable Long listingId) {
        List<String> photos = listingService.getListingPhotos(listingId);
        return ResponseEntity.ok(photos);
    }
}