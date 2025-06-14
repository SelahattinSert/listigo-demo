package com.yasar.listigo.demo.converter;

import com.yasar.listigo.demo.dto.ListingDTO;
import com.yasar.listigo.demo.entity.Listing;
import org.springframework.stereotype.Component;

@Component
public class ListingDtoConverter {

    public ListingDTO toListingDTO(Listing listing) {
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