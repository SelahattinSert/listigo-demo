import React from 'react';
import { Link } from 'react-router-dom';
import { ListingDTO } from '../../types';
import { ROUTES, DEFAULT_PLACEHOLDER_IMAGE } from '../../constants';
import { useFavorites } from '../../hooks/useFavorites'; 
import Button from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

interface ListingCardProps {
  listing: ListingDTO;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing }) => {
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { isAuthenticated } = useAuth();
  const imageUrl = listing.photos && listing.photos.length > 0 ? listing.photos[0] : DEFAULT_PLACEHOLDER_IMAGE;

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (!isAuthenticated || !listing.listingId) {
        return;
    }
    if (isFavorite(listing.listingId)) {
      removeFavorite(listing.listingId);
    } else {
      addFavorite(listing);
    }
  };

  if (!listing.listingId) return null; 

  return (
    <div className="bg-white dark:bg-darkCard rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl group">
      <Link to={`${ROUTES.LISTING_DETAILS}/${listing.listingId}`} className="block">
        <div className="relative">
          <img 
            src={imageUrl} 
            alt={listing.title} 
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => (e.currentTarget.src = DEFAULT_PLACEHOLDER_IMAGE)}
          />
          <Button 
            onClick={handleFavoriteToggle}
            variant='ghost'
            className={`absolute top-2 right-2 bg-white bg-opacity-70 hover:bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-70 dark:hover:bg-opacity-90 p-2 rounded-full z-10 ${!isAuthenticated ? 'cursor-not-allowed' : ''}`}
            aria-label={isAuthenticated && isFavorite(listing.listingId) ? "Favorilerden kaldır" : "Favorilere ekle"}
            disabled={!isAuthenticated}
            title={!isAuthenticated ? "Favorilere eklemek için giriş yapın" : (isAuthenticated && isFavorite(listing.listingId) ? "Favorilerden kaldır" : "Favorilere ekle")}
          >
            <i className={`fas fa-heart text-xl ${
              isAuthenticated && isFavorite(listing.listingId) 
                ? 'text-red-500' 
                : 'text-gray-400 hover:text-red-400 dark:text-gray-500 dark:hover:text-red-400'
            } ${!isAuthenticated ? 'opacity-50' : ''}`}></i>
          </Button>
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-primary dark:text-blue-400 truncate group-hover:text-blue-700 dark:group-hover:text-blue-300">{listing.title}</h3>
          <p className="text-sm text-gray-600 dark:text-darkMutedText truncate">{listing.location || 'Konum belirtilmemiş'}</p>
          <p className="text-xl font-bold text-secondary dark:text-emerald-400 mt-2">
            {listing.price ? `${listing.price.toLocaleString('tr-TR')} TL` : 'Fiyat Belirtilmemiş'}
          </p>
          {listing.brand && listing.model && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{listing.brand} - {listing.model} ({listing.year})</p>
          )}
        </div>
      </Link>
    </div>
  );
};

export default ListingCard;