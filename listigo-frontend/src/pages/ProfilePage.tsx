
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ListingDTO, UserDto, ChangePasswordForm as ChangePasswordFormType, FavoriteListing, UserMetadata } from '../types';
import apiService from '../services/apiService';
import EditProfileForm from '../components/profile/EditProfileForm';
import ChangePasswordForm from '../components/profile/ChangePasswordForm';
import ListingCard from '../components/listing/ListingCard';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import { useFavorites } from '../hooks/useFavorites';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants';

type ProfileTab = 'info' | 'myListings' | 'favorites' | 'changePassword';

const ProfilePage: React.FC = () => {
  const { user, updateUserContext, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<ProfileTab>('info');
  const [myListings, setMyListings] = useState<ListingDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { favorites } = useFavorites();
  const navigate = useNavigate();

  const [resetPasswordFormKey, setResetPasswordFormKey] = useState(0);

  const fetchMyListings = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService<ListingDTO[]>('GET', '/listings/my-listings');
      setMyListings(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'İlanlarınız yüklenirken bir hata oluştu.';
      if (errorMessage.toLowerCase().includes("not found") || errorMessage.includes("404") || errorMessage.toLowerCase().includes("no listings found")) {
        setMyListings([]); 
        setError(null); 
      } else {
        setError(errorMessage);
        setMyListings([]); 
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'myListings') {
      fetchMyListings();
    }
  }, [activeTab, fetchMyListings]);

  const handleUpdateProfile = async (userData: UserDto) => {
    if (!user) return;
    setIsSubmitting(true);
    setSuccessMessage(null);
    setError(null);
    try {
      const profileUpdateData: UserDto = {
        email: user.email, 
        name: userData.name,
        phone: userData.phone,
      };
      const updatedUserResponse = await apiService<UserDto, UserDto>('PUT', '/auth/users/profile', profileUpdateData);
      const fullUpdatedUser: UserMetadata = { ...user, name: updatedUserResponse.name, phone: updatedUserResponse.phone, email: updatedUserResponse.email };
      updateUserContext(fullUpdatedUser);
      setSuccessMessage('Profil başarıyla güncellendi!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profil güncellenirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (data: ChangePasswordFormType) => {
    setIsSubmitting(true);
    setSuccessMessage(null);
    setError(null);

    if (data.newPassword !== data.confirmNewPassword) {
        setError("Yeni şifreler eşleşmiyor.");
        setIsSubmitting(false);
        return;
    }
    try {
      await apiService<void, ChangePasswordFormType>(
        'PUT', 
        '/auth/users/profile/change-password', 
        data 
      );
      setSuccessMessage('Şifre başarıyla değiştirildi!');
      setResetPasswordFormKey(prevKey => prevKey + 1); 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Şifre değiştirilirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteListing = async (listingId?: number) => {
    if (!listingId || !user) return;
    if (window.confirm("Bu ilanı silmek istediğinizden emin misiniz?")) {
      setIsLoading(true);
      try {
        await apiService<void>('DELETE', `/listings/${listingId}`);
        setMyListings(prev => prev.filter(l => l.listingId !== listingId));
        setSuccessMessage("İlan başarıyla silindi.");
      } catch (err) {
        setError(err instanceof Error ? err.message : "İlan silinirken bir hata oluştu.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!user) {
    return (
      <div className="text-center py-10">
        <Spinner />
        <p className="mt-4 text-gray-600 dark:text-darkMutedText">Profil bilgileri yükleniyor...</p>
      </div>
    );
  }
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return <EditProfileForm currentUser={user} onUpdateProfile={handleUpdateProfile} isSubmitting={isSubmitting} />;
      case 'myListings':
        if (isLoading) return <div className="flex justify-center py-10"><Spinner /></div>;
        if (myListings.length === 0 && !error) return <p className="text-gray-600 dark:text-darkMutedText text-center py-5">Henüz yayınlanmış bir ilanınız bulunmamaktadır.</p>;
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {myListings.map(listing => (
              <div key={listing.listingId} className="relative group">
                <ListingCard listing={listing} />
                <div className="absolute bottom-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <Button 
                        size="sm" 
                        variant="secondary" 
                        onClick={() => navigate(`${ROUTES.EDIT_LISTING}/${listing.listingId}`)}
                        className="bg-secondary hover:bg-emerald-700 text-white shadow-md"
                    >
                        <i className="fas fa-edit mr-1"></i> Düzenle
                    </Button>
                    <Button 
                        size="sm" 
                        variant="danger" 
                        onClick={() => handleDeleteListing(listing.listingId)}
                        className="bg-red-600 hover:bg-red-700 text-white shadow-md"
                    >
                        <i className="fas fa-trash mr-1"></i> Sil
                    </Button>
                </div>
              </div>
            ))}
          </div>
        );
      case 'favorites':
        if (favorites.length === 0) return <p className="text-gray-600 dark:text-darkMutedText text-center py-5">Henüz favori ilanınız bulunmamaktadır.</p>;
        const favoriteListingsForCard: ListingDTO[] = favorites.map(fav => ({
            listingId: fav.id,
            title: fav.title,
            price: fav.price,
            photos: fav.imageUrl ? [fav.imageUrl] : [],
            userId: user.userId, 
            categoryId: 0, 
        }));
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteListingsForCard.map(listing => (
              <ListingCard key={listing.listingId} listing={listing} />
            ))}
          </div>
        );
      case 'changePassword':
        return <ChangePasswordForm key={resetPasswordFormKey} onSubmit={handleChangePassword} isSubmitting={isSubmitting} />;
      default:
        return null;
    }
  };

  const TabButton: React.FC<{tabId: ProfileTab, label: string, icon: string}> = ({tabId, label, icon}) => (
    <button
        onClick={() => { setActiveTab(tabId); setError(null); setSuccessMessage(null); }}
        className={`flex items-center space-x-2 px-4 py-3 font-medium text-sm rounded-lg transition-colors duration-150 w-full text-left
                    ${activeTab === tabId 
                        ? 'bg-primary text-white shadow-md' 
                        : 'text-gray-600 dark:text-darkMutedText hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-blue-400'
                    }`}
    >
        <i className={`fas ${icon} w-5 text-center`}></i>
        <span>{label}</span>
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-darkText mb-8">Profilim</h1>
      
      {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} className="mb-4" />}
      {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mb-4" />}

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-1/4 space-y-2">
            <TabButton tabId="info" label="Profil Bilgileri" icon="fa-user-edit" />
            <TabButton tabId="myListings" label="İlanlarım" icon="fa-list-alt" />
            <TabButton tabId="favorites" label="Favori İlanlarım" icon="fa-heart" />
            <TabButton tabId="changePassword" label="Şifre Değiştir" icon="fa-key" />
        </aside>

        <section className="md:w-3/4 bg-white dark:bg-darkSurface p-6 sm:p-8 rounded-lg shadow-lg transition-colors duration-300">
          {renderTabContent()}
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;