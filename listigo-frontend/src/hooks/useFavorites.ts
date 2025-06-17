import { useState, useEffect, useCallback } from 'react';
import { FavoriteListing, ListingDTO } from '../types';
import { LOCAL_STORAGE_KEYS, DEFAULT_PLACEHOLDER_IMAGE } from '../constants';
import { useAuth } from './useAuth';

export const useFavorites = () => {
  const { user, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteListing[]>([]);

  const getFavoritesKey = useCallback((): string | null => {
    if (user && user.userId) {
      return `${LOCAL_STORAGE_KEYS.FAVORITES}_${user.userId}`;
    }
    return null;
  }, [user]);

  useEffect(() => {
    const userFavoritesKey = getFavoritesKey();
    if (isAuthenticated && userFavoritesKey) {
      const storedFavorites = localStorage.getItem(userFavoritesKey);
      if (storedFavorites) {
        try {
          setFavorites(JSON.parse(storedFavorites));
        } catch (e) {
          console.error("Failed to parse favorites from localStorage:", e);
          setFavorites([]);
        }
      } else {
        setFavorites([]);
      }
    } else {
      setFavorites([]);
    }
  }, [user, isAuthenticated, getFavoritesKey]);

  const addFavorite = useCallback((listing: ListingDTO) => {
    if (!isAuthenticated || !user || !listing.listingId) return; 

    const userFavoritesKey = getFavoritesKey();
    if (!userFavoritesKey) return;

    const newFavorite: FavoriteListing = {
      id: listing.listingId,
      title: listing.title,
      price: listing.price,
      imageUrl: listing.photos && listing.photos.length > 0 ? listing.photos[0] : DEFAULT_PLACEHOLDER_IMAGE,
    };

    setFavorites(prevFavorites => {
      if (prevFavorites.some(fav => fav.id === newFavorite.id)) {
        return prevFavorites;
      }
      const updatedFavorites = [...prevFavorites, newFavorite];
      localStorage.setItem(userFavoritesKey, JSON.stringify(updatedFavorites));
      return updatedFavorites;
    });
  }, [isAuthenticated, user, getFavoritesKey]);

  const removeFavorite = useCallback((listingId: number) => {
    if (!isAuthenticated || !user) return; 

    const userFavoritesKey = getFavoritesKey();
    if (!userFavoritesKey) return;

    setFavorites(prevFavorites => {
      const updatedFavorites = prevFavorites.filter(fav => fav.id !== listingId);
      localStorage.setItem(userFavoritesKey, JSON.stringify(updatedFavorites));
      return updatedFavorites;
    });
  }, [isAuthenticated, user, getFavoritesKey]);

  const isFavorite = useCallback((listingId: number): boolean => {
    if (!isAuthenticated) return false;
    return favorites.some(fav => fav.id === listingId);
  }, [isAuthenticated, favorites]);

  return { favorites, addFavorite, removeFavorite, isFavorite };
};
