package com.yasar.listigo.demo.service;

import com.yasar.listigo.demo.dto.ListingDTO;
import com.yasar.listigo.demo.dto.ListingFilterDTO;
import com.yasar.listigo.demo.exception.ListingNotCreatedException;
import com.yasar.listigo.demo.exception.ListingNotDeletedException;
import com.yasar.listigo.demo.exception.ListingNotFoundException;
import com.yasar.listigo.demo.exception.ListingNotUpdatedException;
import com.yasar.listigo.demo.exception.PhotoNotFoundException;
import com.yasar.listigo.demo.exception.PhotoUploadException;

import java.util.List;
import java.util.UUID;

/**
 * Service interface for handling listing-related operations.
 */
public interface ListingService {

    /**
     * Creates a new listing for the authenticated user.
     *
     * @param userId    ID of the authenticated user
     * @param listingDTO Listing details
     * @return Created listing details
     * @throws ListingNotCreatedException if listing creation fails
     * @throws ListingNotFoundException if user or category is not found
     */
    ListingDTO createListing(UUID userId, ListingDTO listingDTO);

    /**
     * Updates an existing listing.
     *
     * @param userId    ID of the authenticated user
     * @param listingId ID of the listing to update
     * @param listingDTO Updated listing details
     * @return Updated listing details
     * @throws ListingNotFoundException if listing or user is not found
     * @throws ListingNotUpdatedException if update fails
     */
    ListingDTO updateListing(UUID userId, Long listingId, ListingDTO listingDTO);

    /**
     * Deletes a listing.
     *
     * @param userId    ID of the authenticated user
     * @param listingId ID of the listing to delete
     * @throws ListingNotFoundException if listing or user is not found
     * @throws ListingNotDeletedException if deletion fails
     */
    void deleteListing(UUID userId, Long listingId);

    /**
     * Retrieves all listings for the authenticated user.
     *
     * @param userId ID of the authenticated user
     * @return List of user's listings
     * @throws ListingNotFoundException if no listings are found for the user
     */
    List<ListingDTO> getUserListings(UUID userId);

    /**
     * Retrieves a listing by its ID.
     *
     * @param listingId ID of the listing
     * @return Listing details
     * @throws ListingNotFoundException if listing is not found
     */
    ListingDTO getListingById(Long listingId);

    /**
     * Retrieves all listings.
     *
     * @return List of all listings
     * @throws ListingNotFoundException if no listings are found
     */
    List<ListingDTO> getAllListings();

    /**
     * Retrieves listings based on filter criteria.
     *
     * @param filterDTO Filter criteria (category, brand, model, etc.)
     * @return List of filtered listings
     */
    List<ListingDTO> getFilteredListings(ListingFilterDTO filterDTO);

    /**
     * Uploads a photo to a listing.
     *
     * @param userId    ID of the authenticated user
     * @param listingId ID of the listing
     * @param photoUrl  URL of the uploaded photo
     * @return Updated listing details
     * @throws ListingNotFoundException if listing or user is not found
     * @throws PhotoUploadException if photo upload fails
     */
    ListingDTO uploadPhotoToListing(UUID userId, Long listingId, String photoUrl);

    /**
     * Deletes a photo from a listing.
     *
     * @param userId    ID of the authenticated user
     * @param listingId ID of the listing
     * @param photoUrl  URL of the photo to delete
     * @return Updated listing details
     * @throws ListingNotFoundException if listing or user is not found
     * @throws PhotoNotFoundException if photo is not found
     */
    ListingDTO deletePhotoFromListing(UUID userId, Long listingId, String photoUrl);

    /**
     * Retrieves photos for a listing.
     *
     * @param listingId ID of the listing
     * @return List of photo URLs
     * @throws ListingNotFoundException if listing is not found
     */
    List<String> getListingPhotos(Long listingId);
}