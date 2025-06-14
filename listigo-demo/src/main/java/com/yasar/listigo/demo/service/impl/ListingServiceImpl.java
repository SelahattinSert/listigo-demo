package com.yasar.listigo.demo.service.impl;

import com.yasar.listigo.demo.converter.ListingDtoConverter;
import com.yasar.listigo.demo.dto.ListingDTO;
import com.yasar.listigo.demo.dto.ListingFilterDTO;
import com.yasar.listigo.demo.entity.Category;
import com.yasar.listigo.demo.entity.Listing;
import com.yasar.listigo.demo.entity.UserMetadata;
import com.yasar.listigo.demo.exception.InternalServerException;
import com.yasar.listigo.demo.exception.ListingNotCreatedException;
import com.yasar.listigo.demo.exception.ListingNotDeletedException;
import com.yasar.listigo.demo.exception.ListingNotFoundException;
import com.yasar.listigo.demo.exception.ListingNotUpdatedException;
import com.yasar.listigo.demo.exception.PhotoNotFoundException;
import com.yasar.listigo.demo.exception.PhotoUploadException;
import com.yasar.listigo.demo.exception.UserNotFoundException;
import com.yasar.listigo.demo.repository.CategoryRepository;
import com.yasar.listigo.demo.repository.ListingRepository;
import com.yasar.listigo.demo.repository.UserRepository;
import com.yasar.listigo.demo.service.ListingService;
import com.yasar.listigo.demo.util.DateTimeFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Service
public class ListingServiceImpl implements ListingService {

    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final DateTimeFactory dateTimeFactory;
    private final ListingDtoConverter listingDtoConverter;

    private static final Pattern URL_PATTERN = Pattern.compile(
            "^https?://[a-zA-Z0-9.-]+(?:\\.[a-zA-Z]{2,})+(?:/[^#\\s]*)?\\.(?:png|jpg|jpeg|gif)$"
    );

    @Override
    @Transactional
    public ListingDTO createListing(UUID userId, ListingDTO listingDTO) {
        UserMetadata user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", userId);
                    return new UserNotFoundException("User not found with ID: " + userId);
                });

        Category category = categoryRepository.findById(listingDTO.getCategoryId())
                .orElseThrow(() -> {
                    log.warn("Category not found with ID: {}", listingDTO.getCategoryId());
                    return new ListingNotFoundException("Category not found with ID: " + listingDTO.getCategoryId());
                });

        try {
            Listing listing = new Listing();
            listing.setUser(user);
            listing.setCategory(category);
            listing.setTitle(listingDTO.getTitle());
            listing.setDescription(listingDTO.getDescription());
            listing.setPrice(listingDTO.getPrice());
            listing.setBrand(listingDTO.getBrand());
            listing.setModel(listingDTO.getModel());
            listing.setYear(listingDTO.getYear());
            listing.setMileage(listingDTO.getMileage());
            listing.setLocation(listingDTO.getLocation());
            listing.setPhotos(listingDTO.getPhotos());
            listing.setCreatedAt(dateTimeFactory.now());

            Listing savedListing = listingRepository.save(listing);
            log.info("Listing created with ID: {} for user: {}", savedListing.getListingId(), userId);
            return listingDtoConverter.toListingDTO(savedListing);
        } catch (Exception ex) {
            log.error("Exception occurred while creating listing for user: {}", userId, ex);
            throw new ListingNotCreatedException("Error occurred while creating listing: " + ex.getMessage());
        }
    }

    @Override
    @Transactional
    public ListingDTO updateListing(UUID userId, Long listingId, ListingDTO listingDTO) {
        UserMetadata user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", userId);
                    return new UserNotFoundException("User not found with ID: " + userId);
                });

        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> {
                    log.warn("Listing not found with ID: {}", listingId);
                    return new ListingNotFoundException("Listing not found with ID: " + listingId);
                });

        if (!listing.getUser().getUserId().equals(userId)) {
            log.warn("User {} is not authorized to update listing {}", userId, listingId);
            throw new ListingNotFoundException("User is not authorized to update this listing");
        }

        Category category = categoryRepository.findById(listingDTO.getCategoryId())
                .orElseThrow(() -> {
                    log.warn("Category not found with ID: {}", listingDTO.getCategoryId());
                    return new ListingNotFoundException("Category not found with ID: " + listingDTO.getCategoryId());
                });

        try {
            listing.setCategory(category);
            listing.setTitle(listingDTO.getTitle());
            listing.setDescription(listingDTO.getDescription());
            listing.setPrice(listingDTO.getPrice());
            listing.setBrand(listingDTO.getBrand());
            listing.setModel(listingDTO.getModel());
            listing.setYear(listingDTO.getYear());
            listing.setMileage(listingDTO.getMileage());
            listing.setLocation(listingDTO.getLocation());
            listing.setPhotos(listingDTO.getPhotos());

            Listing updatedListing = listingRepository.save(listing);
            log.info("Listing updated with ID: {} for user: {}", listingId, userId);
            return listingDtoConverter.toListingDTO(updatedListing);
        } catch (Exception ex) {
            log.error("Exception occurred while updating listing {} for user: {}", listingId, userId, ex);
            throw new ListingNotUpdatedException("Error occurred while updating listing: " + ex.getMessage());
        }
    }

    @Override
    @Transactional
    public void deleteListing(UUID userId, Long listingId) {
        UserMetadata user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", userId);
                    return new UserNotFoundException("User not found with ID: " + userId);
                });

        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> {
                    log.warn("Listing not found with ID: {}", listingId);
                    return new ListingNotFoundException("Listing not found with ID: " + listingId);
                });

        if (!listing.getUser().getUserId().equals(userId)) {
            log.warn("User {} is not authorized to delete listing {}", userId, listingId);
            throw new ListingNotFoundException("User is not authorized to delete this listing");
        }

        try {
            listingRepository.delete(listing);
            log.info("Listing deleted with ID: {} for user: {}", listingId, userId);
        } catch (Exception ex) {
            log.error("Exception occurred while deleting listing {} for user: {}", listingId, userId, ex);
            throw new ListingNotDeletedException("Error occurred while deleting listing: " + ex.getMessage());
        }
    }

    @Override
    public List<ListingDTO> getUserListings(UUID userId) {
        List<Listing> listings = listingRepository.findByUserUserId(userId);
        if (listings.isEmpty()) {
            log.warn("No listings found for user: {}", userId);
            throw new ListingNotFoundException("No listings found for user: " + userId);
        }

        log.info("Retrieved {} listings for user: {}", listings.size(), userId);
        return listings.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Override
    public ListingDTO getListingById(Long listingId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> {
                    log.warn("Listing not found with ID: {}", listingId);
                    return new ListingNotFoundException("Listing not found with ID: " + listingId);
                });

        log.info("Retrieved listing with ID: {}", listingId);
        return listingDtoConverter.toListingDTO(listing);
    }

    @Override
    public List<ListingDTO> getAllListings() {
        try {
            List<Listing> listings = listingRepository.findAll();
            if (listings.isEmpty()) {
                log.warn("No listings found");
                throw new ListingNotFoundException("No listings found");
            }
            log.info("Retrieved {} listings", listings.size());
            return listings.stream().map(this::mapToDTO).collect(Collectors.toList());
        } catch (Exception ex) {
            log.error("Exception occurred while retrieving all listings: {}", ex.getMessage());
            throw new InternalServerException("Error occurred while retrieving all listings: " + ex.getMessage());
        }
    }

    @Override
    public List<ListingDTO> getFilteredListings(ListingFilterDTO filterDTO) {
        try {
            List<Listing> listings = listingRepository.findByFilter(
                    filterDTO.getCategoryId(),
                    filterDTO.getBrand(),
                    filterDTO.getModel(),
                    filterDTO.getMinYear(),
                    filterDTO.getMaxYear(),
                    filterDTO.getMinPrice(),
                    filterDTO.getMaxPrice(),
                    filterDTO.getLocation(),
                    filterDTO.getSearchText()
            );

            log.info("Retrieved {} listings with filters: {}", listings.size(), filterDTO);
            return listings.stream().map(this::mapToDTO).collect(Collectors.toList());
        } catch (Exception ex) {
            log.error("Exception occurred while filtering listings: {}", ex.getMessage());
            throw new InternalServerException("Error occurred while filtering listings: " + ex.getMessage());
        }
    }

    @Override
    @Transactional
    public ListingDTO uploadPhotoToListing(UUID userId, Long listingId, String photoUrl) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> {
                    log.warn("Listing not found with ID: {}", listingId);
                    return new ListingNotFoundException("Listing not found with ID: " + listingId);
                });

        if (!listing.getUser().getUserId().equals(userId)) {
            log.warn("User {} is not authorized to upload photo to listing {}", userId, listingId);
            throw new ListingNotFoundException("User is not authorized to upload photo to this listing");
        }

        if (!URL_PATTERN.matcher(photoUrl).matches()) {
            log.warn("Invalid photo URL provided for listing {}: {}", listingId, photoUrl);
            throw new PhotoUploadException("Invalid photo URL: Must be HTTP/HTTPS and end with .png, .jpg, .jpeg, or .gif");
        }

        try {
            List<String> photos = listing.getPhotos();
            if (photos.contains(photoUrl)) {
                log.warn("Photo URL already exists in listing {}: {}", listingId, photoUrl);
                throw new PhotoUploadException("Photo URL already exists: " + photoUrl);
            }
            photos.add(photoUrl);
            listing.setPhotos(photos);
            Listing updatedListing = listingRepository.save(listing);
            log.info("Photo URL added to listing {} for user: {}", listingId, userId);
            return listingDtoConverter.toListingDTO(updatedListing);
        } catch (Exception ex) {
            log.error("Exception occurred while adding photo URL to listing {}: {}", listingId, ex.getMessage());
            throw new PhotoUploadException("Error occurred while adding photo URL: " + ex.getMessage());
        }
    }

    @Override
    @Transactional
    public ListingDTO deletePhotoFromListing(UUID userId, Long listingId, String photoUrl) {
        UserMetadata user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", userId);
                    return new UserNotFoundException("User not found with ID: " + userId);
                });

        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> {
                    log.warn("Listing not found with ID: {}", listingId);
                    return new ListingNotFoundException("Listing not found with ID: " + listingId);
                });

        if (!listing.getUser().getUserId().equals(userId)) {
            log.warn("User {} is not authorized to delete photo from listing {}", userId, listingId);
            throw new ListingNotFoundException("User is not authorized to delete photo from this listing");
        }

        try {
            List<String> photos = listing.getPhotos();
            if (!photos.remove(photoUrl)) {
                log.warn("Photo URL not found in listing {}: {}", listingId, photoUrl);
                throw new PhotoNotFoundException("Photo URL not found: " + photoUrl);
            }
            listing.setPhotos(photos);
            Listing updatedListing = listingRepository.save(listing);
            log.info("Photo URL deleted from listing {} for user: {}", listingId, userId);
            return listingDtoConverter.toListingDTO(updatedListing);
        } catch (Exception ex) {
            log.error("Exception occurred while deleting photo URL from listing {}: {}", listingId, ex.getMessage());
            throw new PhotoNotFoundException("Error occurred while deleting photo URL: " + ex.getMessage());
        }
    }

    @Override
    public List<String> getListingPhotos(Long listingId) {
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> {
                    log.warn("Listing not found with ID: {}", listingId);
                    return new ListingNotFoundException("Listing not found with ID: " + listingId);
                });

        log.info("Retrieved photos for listing: {}", listingId);
        return listing.getPhotos();
    }

    private ListingDTO mapToDTO(Listing listing) {
        ListingDTO dto = new ListingDTO();
        dto.setListingId(listing.getListingId());
        dto.setUserId(listing.getUser().getUserId().toString());
        dto.setCategoryId(listing.getCategory().getCategoryId());
        dto.setTitle(listing.getTitle());
        dto.setDescription(listing.getDescription());
        dto.setPrice(listing.getPrice());
        dto.setBrand(listing.getBrand());
        dto.setModel(listing.getModel());
        dto.setYear(listing.getYear());
        dto.setMileage(listing.getMileage());
        dto.setLocation(listing.getLocation());
        dto.setPhotos(listing.getPhotos());
        return dto;
    }
}