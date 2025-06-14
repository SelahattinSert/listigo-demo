
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { ListingDTO, UserMetadata } from '../types';
import apiService from '../services/apiService';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { ROUTES, DEFAULT_PLACEHOLDER_IMAGE } from '../constants';
import { useFavorites } from '../hooks/useFavorites';

const ListingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [listing, setListing] = useState<ListingDTO | null>(null);
  // const [listingOwner, setListingOwner] = useState<UserMetadata | null>(null); // Not fully used yet
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageMessage, setPageMessage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    if (location.state?.message) {
      setPageMessage(location.state.message);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const fetchListingDetails = useCallback(async () => {
    if (!id) {
      setError("İlan ID'si bulunamadı.");
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService<ListingDTO>('GET', `/listings/${id}`);
      setListing(data);
      // Owner details can be fetched if needed, currently simplified
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İlan yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchListingDetails();
  }, [fetchListingDetails]);

  const handleFavoriteToggle = () => {
    if (!listing || !listing.listingId) return;
    if (isFavorite(listing.listingId)) {
      removeFavorite(listing.listingId);
    } else {
      addFavorite(listing);
    }
  };
  
  const nextImage = () => {
    if (listing && listing.photos.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % listing.photos.length);
    }
  };

  const prevImage = () => {
    if (listing && listing.photos.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + listing.photos.length) % listing.photos.length);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Spinner size="lg" /></div>;
  }
  if (error) {
    return <div className="container mx-auto py-8 px-4"><Alert type="error" message={error} /></div>;
  }
  if (!listing) {
    return <div className="container mx-auto py-8 px-4"><Alert type="warning" message="İlan bulunamadı." /></div>;
  }

  const isOwner = user && listing.userId === user.userId;
  const mainImageUrl = listing.photos && listing.photos.length > 0 ? listing.photos[currentImageIndex] : DEFAULT_PLACEHOLDER_IMAGE;

  return (
    <div className="container mx-auto py-8 px-4">
      {pageMessage && <Alert type="success" message={pageMessage} onClose={() => setPageMessage(null)} className="mb-6"/>}
      <div className="bg-white dark:bg-darkSurface shadow-xl rounded-lg overflow-hidden transition-colors duration-300">
        <div className="md:flex">
          {/* Image Gallery */}
          <div className="md:w-1/2 p-4">
            <div className="relative">
                <img 
                    src={mainImageUrl} 
                    alt={listing.title} 
                    className="w-full h-96 object-contain rounded-lg shadow-md bg-gray-100 dark:bg-gray-700"
                    onError={(e) => (e.currentTarget.src = DEFAULT_PLACEHOLDER_IMAGE)}
                />
                {listing.photos && listing.photos.length > 1 && (
                    <>
                        <Button onClick={prevImage} variant="ghost" className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full dark:bg-gray-900 dark:bg-opacity-50 dark:hover:bg-opacity-75">
                            <i className="fas fa-chevron-left"></i>
                        </Button>
                        <Button onClick={nextImage} variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-30 hover:bg-opacity-50 text-white p-2 rounded-full dark:bg-gray-900 dark:bg-opacity-50 dark:hover:bg-opacity-75">
                            <i className="fas fa-chevron-right"></i>
                        </Button>
                    </>
                )}
            </div>
            {listing.photos && listing.photos.length > 1 && (
                <div className="flex space-x-2 mt-4 overflow-x-auto p-2">
                    {listing.photos.map((photo, index) => (
                        <img
                            key={index}
                            src={photo}
                            alt={`${listing.title} - thumbnail ${index + 1}`}
                            className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${index === currentImageIndex ? 'border-primary dark:border-blue-400' : 'border-transparent dark:border-gray-600'}`}
                            onClick={() => setCurrentImageIndex(index)}
                            onError={(e) => (e.currentTarget.src = DEFAULT_PLACEHOLDER_IMAGE)}
                        />
                    ))}
                </div>
            )}
          </div>

          {/* Listing Info */}
          <div className="md:w-1/2 p-6 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-darkText mb-2">{listing.title}</h1>
            <p className="text-2xl font-semibold text-secondary dark:text-emerald-400 mb-4">
                {listing.price ? `${listing.price.toLocaleString('tr-TR')} TL` : 'Fiyat Belirtilmemiş'}
            </p>
            
            <div className="mb-6 space-y-3 text-gray-700 dark:text-darkMutedText">
                {listing.location && <p><i className="fas fa-map-marker-alt w-5 mr-2 text-primary dark:text-blue-400"></i>Konum: {listing.location}</p>}
                {listing.brand && <p><i className="fas fa-tag w-5 mr-2 text-primary dark:text-blue-400"></i>Marka: {listing.brand}</p>}
                {listing.model && <p><i className="fas fa-car w-5 mr-2 text-primary dark:text-blue-400"></i>Model: {listing.model}</p>}
                {listing.year && <p><i className="fas fa-calendar-alt w-5 mr-2 text-primary dark:text-blue-400"></i>Yıl: {listing.year}</p>}
                {listing.mileage !== undefined && <p><i className="fas fa-tachometer-alt w-5 mr-2 text-primary dark:text-blue-400"></i>Kilometre: {listing.mileage.toLocaleString('tr-TR')} km</p>}
                {listing.createdAt && <p><i className="fas fa-clock w-5 mr-2 text-primary dark:text-blue-400"></i>Yayın Tarihi: {new Date(listing.createdAt).toLocaleDateString('tr-TR')}</p>}
            </div>

            {listing.description && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-darkText mb-2">Açıklama</h2>
                <p className="text-gray-600 dark:text-darkMutedText whitespace-pre-line">{listing.description}</p>
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              {isAuthenticated && !isOwner && listing.listingId && (
                <Button 
                  onClick={() => navigate(`${ROUTES.MESSAGES}/${listing.listingId}`)} 
                  variant="primary" 
                  size="lg"
                  className="flex-grow"
                >
                  <i className="fas fa-comments mr-2"></i> Satıcıya Mesaj Gönder
                </Button>
              )}
              {isOwner && listing.listingId &&(
                <Button 
                  onClick={() => navigate(`${ROUTES.EDIT_LISTING}/${listing.listingId}`)} 
                  variant="secondary" 
                  size="lg"
                  className="flex-grow"
                >
                  <i className="fas fa-edit mr-2"></i> İlanı Düzenle
                </Button>
              )}
              {isAuthenticated && listing.listingId && (
                  <Button 
                    onClick={handleFavoriteToggle} 
                    variant={isFavorite(listing.listingId) ? "danger" : "ghost"}
                    size="lg"
                    className={`border ${isFavorite(listing.listingId) ? 'border-red-500 dark:border-red-700' : 'border-gray-300 dark:border-gray-600 dark:text-darkMutedText dark:hover:bg-gray-700'} flex-grow`}
                  >
                    <i className={`fas fa-heart mr-2 ${isFavorite(listing.listingId) ? 'text-white' : 'text-red-500 dark:text-red-400'}`}></i> 
                    {isFavorite(listing.listingId) ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
                  </Button>
              )}
            </div>
            {!isAuthenticated && (
                 <p className="mt-6 text-sm text-center text-gray-500 dark:text-darkMutedText">
                    Satıcıyla iletişime geçmek veya ilanı favorilerinize eklemek için lütfen <Link to={ROUTES.LOGIN} className="text-primary dark:text-blue-400 hover:underline">giriş yapın</Link>.
                </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailsPage;