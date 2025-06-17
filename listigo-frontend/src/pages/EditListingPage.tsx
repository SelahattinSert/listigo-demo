
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ListingDTO } from '../types';
import { useAuth } from '../hooks/useAuth';
import apiService from '../services/apiService';
import ListingForm from '../components/listing/ListingForm';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import { ROUTES } from '../constants';

const EditListingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<ListingDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchListing = useCallback(async () => {
    if (!id) {
        setError("İlan ID'si bulunamadı.");
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    try {
      const data = await apiService<ListingDTO>('GET', `/listings/${id}`);
      if (user && data.userId !== user.userId) {
        setError("Bu ilanı düzenleme yetkiniz yok.");
        navigate(ROUTES.HOME); // Redirect if not owner
        return;
      }
      setListing(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İlan yüklenirken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  }, [id, user, navigate]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  const handleSubmit = async (listingData: ListingDTO) => {
    if (!user || !listing || !id) {
      setError("Güncelleme için gerekli bilgiler eksik.");
      return;
    }
    setIsSubmitting(true);
    setError(null);

    const dataToSend: ListingDTO = {
      ...listingData,
      userId: user.userId, // Ensure userId is correctly set
      listingId: parseInt(id), // Ensure listingId is included
    };

    try {
      await apiService<ListingDTO, ListingDTO>('PUT', `/listings/${id}`, dataToSend);
      navigate(`${ROUTES.LISTING_DETAILS}/${id}`, {state: { message: "İlan başarıyla güncellendi!" }});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İlan güncellenirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Spinner size="lg" /></div>;
  }

  if (error && !listing) {
    return <div className="max-w-3xl mx-auto py-8 px-4"><Alert type="error" message={error} /></div>;
  }
  
  if (!listing) {
    return <div className="max-w-3xl mx-auto py-8 px-4"><Alert type="error" message="İlan bulunamadı." /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mb-6" />}
      <ListingForm 
        initialData={listing} 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting} 
        submitButtonText="İlanı Güncelle"
      />
    </div>
  );
};

export default EditListingPage;
