
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListingDTO } from '../types';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/apiService';
import ListingForm from '../components/listing/ListingForm';
import Alert from '../components/ui/Alert';
import { ROUTES } from '../constants';

const CreateListingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (listingData: ListingDTO) => {
    if (!user) {
      setError("İlan oluşturmak için giriş yapmalısınız.");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    const dataToSend: ListingDTO = {
      ...listingData,
      userId: user.userId, // Ensure userId is correctly set from authenticated user
    };

    try {
      const createdListing = await apiService<ListingDTO, ListingDTO>('POST', '/listings', dataToSend);
      // Backend might return the full DTO including ID and createdAt.
      // Assuming a simple creation doesn't require photo uploads in the same step as per ListingController
      // Photo upload is a separate endpoint POST /listings/{listingId}/photos
      // For simplicity, if photos are URLs, they are already in listingData.photos.
      // If actual file upload was intended, this flow would be different (upload files, get URLs, then save listing).
      
      // Since backend ListingService::createListing handles photos if they are URLs:
      navigate(`${ROUTES.LISTING_DETAILS}/${createdListing.listingId}`, {state: { message: "İlan başarıyla oluşturuldu!" }});

    } catch (err) {
      setError(err instanceof Error ? err.message : 'İlan oluşturulurken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
      // This should be caught by ProtectedRoute, but as a fallback:
      navigate(ROUTES.LOGIN);
      return null;
  }
  
  const initialData: ListingDTO = {
      userId: user.userId,
      categoryId: 0, // Will be updated when categories load in form
      title: '',
      price: 0,
      photos: [],
      // other fields can be undefined or have defaults
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mb-6" />}
      <ListingForm onSubmit={handleSubmit} isSubmitting={isSubmitting} initialData={initialData} />
    </div>
  );
};

export default CreateListingPage;
