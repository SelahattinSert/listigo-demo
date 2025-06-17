
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
      navigate(`${ROUTES.LISTING_DETAILS}/${createdListing.listingId}`, {state: { message: "İlan başarıyla oluşturuldu!" }});

    } catch (err) {
      setError(err instanceof Error ? err.message : 'İlan oluşturulurken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
      navigate(ROUTES.LOGIN);
      return null;
  }
  
  const initialData: ListingDTO = {
      userId: user.userId,
      categoryId: 0,
      title: '',
      price: 0,
      photos: [],
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mb-6" />}
      <ListingForm onSubmit={handleSubmit} isSubmitting={isSubmitting} initialData={initialData} />
    </div>
  );
};

export default CreateListingPage;
