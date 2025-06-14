
import { useState, useEffect, useCallback } from 'react';
import { FavoriteListing, ListingDTO } from '../types';
import { LOCAL_STORAGE_KEYS, DEFAULT_PLACEHOLDER_IMAGE } from '../constants';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteListing[]>([]);

  useEffect(() => {
    const storedFavorites = localStorage.getItem(LOCAL_STORAGE_KEYS.FAVORITES);
    if (storedFavorites) {
      setFavorites(JSON.parse(storedFavorites));
    }
  }, []);

  const addFavorite = useCallback((listing: ListingDTO) => {
    if (!listing.listingId) return;
    const newFavorite: FavoriteListing = {
      id: listing.listingId,
      title: listing.title,
      price: listing.price,
      imageUrl: listing.photos && listing.photos.length > 0 ? listing.photos[0] : DEFAULT_PLACEHOLDER_IMAGE,
    };
    setFavorites(prevFavorites => {
      if (prevFavorites.find(fav => fav.id === newFavorite.id)) {
        return prevFavorites; // Already a favorite
      }
      const updatedFavorites = [...prevFavorites, newFavorite];
      localStorage.setItem(LOCAL_STORAGE_KEYS.FAVORITES, JSON.stringify(updatedFavorites));
      return updatedFavorites;
    });
  }, []);

  const removeFavorite = useCallback((listingId: number) => {
    setFavorites(prevFavorites => {
      const updatedFavorites = prevFavorites.filter(fav => fav.id !== listingId);
      localStorage.setItem(LOCAL_STORAGE_KEYS.FAVORITES, JSON.stringify(updatedFavorites));
      return updatedFavorites;
    });
  }, []);

  const isFavorite = useCallback((listingId: number): boolean => {
    return favorites.some(fav => fav.id === listingId);
  }, [favorites]);

  return { favorites, addFavorite, removeFavorite, isFavorite };
};
