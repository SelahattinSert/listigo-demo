
import React, { useState, useEffect } from 'react';
import { ListingDTO, CategoryDTO } from '../../types';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Button from '../ui/Button';
import apiService from '../../services/apiService';
import { isValidUrl } from '../../utils/validators';
import { DEFAULT_PLACEHOLDER_IMAGE } from '../../constants';

interface ListingFormProps {
  initialData?: ListingDTO;
  onSubmit: (listingData: ListingDTO) => Promise<void>;
  isSubmitting: boolean;
  submitButtonText?: string;
}

const ListingForm: React.FC<ListingFormProps> = ({ 
  initialData, 
  onSubmit, 
  isSubmitting,
  submitButtonText = "İlanı Yayınla" 
}) => {
  const [formData, setFormData] = useState<ListingDTO>(
    initialData || {
      userId: '', 
      categoryId: 0,
      title: '',
      description: '',
      price: 0,
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      mileage: 0,
      location: '',
      photos: [],
    }
  );
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof ListingDTO, string>>>({});
  const [photoUrlInput, setPhotoUrlInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await apiService<CategoryDTO[]>('GET', '/categories');
        setCategories(fetchedCategories);
        if (fetchedCategories.length > 0 && !initialData?.categoryId) {
          setFormData(prev => ({ ...prev, categoryId: fetchedCategories[0].categoryId as number }));
        }
      } catch (error) {
        console.error("Kategoriler yüklenirken hata oluştu:", error);
        setErrors(prev => ({ ...prev, categoryId: "Kategoriler yüklenemedi." }));
      }
    };
    fetchCategories();
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'year' || name === 'mileage' || name === 'categoryId' ? Number(value) : value,
    }));
    if (errors[name as keyof ListingDTO]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAddPhotoUrl = () => {
    if (photoUrlInput.trim() === '') {
      setErrors(prev => ({ ...prev, photos: "Fotoğraf URL'si boş olamaz."}));
      return;
    }
    if (!isValidUrl(photoUrlInput) || !/\.(jpeg|jpg|gif|png)$/i.test(photoUrlInput)) {
        setErrors(prev => ({...prev, photos: "Geçerli bir resim URL'si girin (http/https ile başlamalı ve .png, .jpg, .jpeg, or .gif ile bitmeli)."}));
        return;
    }
    setFormData(prev => ({ ...prev, photos: [...prev.photos, photoUrlInput] }));
    setPhotoUrlInput('');
    setErrors(prev => ({ ...prev, photos: undefined }));
  };

  const handleRemovePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ListingDTO, string>> = {};
    if (!formData.title.trim()) newErrors.title = "Başlık boş olamaz.";
    if (formData.title.length < 3 || formData.title.length > 100) newErrors.title = "Başlık 3-100 karakter arasında olmalıdır.";
    if (!formData.categoryId || formData.categoryId === 0) newErrors.categoryId = "Kategori seçilmelidir.";
    if (formData.price < 0) newErrors.price = "Fiyat negatif olamaz.";
    if (formData.year && (formData.year < 1886 || formData.year > new Date().getFullYear() + 1)) newErrors.year = `Yıl 1886 ile ${new Date().getFullYear() + 1} arasında olmalıdır.`;
    if (formData.mileage && formData.mileage < 0) newErrors.mileage = "Kilometre negatif olamaz.";
    if (formData.photos.length === 0) newErrors.photos = "En az bir fotoğraf eklemelisiniz.";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSubmit(formData);
  };

  const categoryOptions = categories.map(cat => ({ value: cat.categoryId as number, label: cat.categoryName }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-darkSurface p-8 rounded-lg shadow-md transition-colors duration-300">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-darkText mb-6">{initialData ? 'İlanı Düzenle' : 'Yeni İlan Oluştur'}</h2>
      
      <Input name="title" label="Başlık*" value={formData.title} onChange={handleChange} error={errors.title} maxLength={100} required />
      <Select name="categoryId" label="Kategori*" value={formData.categoryId} onChange={handleChange} options={categoryOptions} error={errors.categoryId} required />
      <Textarea name="description" label="Açıklama" value={formData.description || ''} onChange={handleChange} error={errors.description} rows={4} maxLength={1000} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input name="price" label="Fiyat (TL)*" type="number" value={String(formData.price)} onChange={handleChange} error={errors.price} min="0" step="0.01" required />
        <Input name="location" label="Konum" value={formData.location || ''} onChange={handleChange} error={errors.location} maxLength={100}/>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input name="brand" label="Marka" value={formData.brand || ''} onChange={handleChange} error={errors.brand} maxLength={50}/>
        <Input name="model" label="Model" value={formData.model || ''} onChange={handleChange} error={errors.model} maxLength={50}/>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input name="year" label="Yıl" type="number" value={String(formData.year || '')} onChange={handleChange} error={errors.year} />
        <Input name="mileage" label="Kilometre" type="number" value={String(formData.mileage || '')} onChange={handleChange} error={errors.mileage} min="0" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fotoğraflar*</label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <Input 
            name="photoUrlInput"
            type="url" 
            value={photoUrlInput} 
            onChange={(e) => setPhotoUrlInput(e.target.value)} 
            placeholder="https://example.com/image.png"
            containerClassName="flex-grow mb-0"
            className="rounded-r-none"
            error={errors.photos}
          />
          <Button type="button" onClick={handleAddPhotoUrl} className="rounded-l-none" variant="secondary">Ekle</Button>
        </div>
        {errors.photos && !photoUrlInput && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.photos}</p>}

        {formData.photos.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {formData.photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img 
                    src={photo} 
                    alt={`Listing photo ${index + 1}`} 
                    className="w-full h-32 object-cover rounded-md border border-gray-200 dark:border-gray-700"
                    onError={(e) => (e.currentTarget.src = DEFAULT_PLACEHOLDER_IMAGE)}
                />
                <Button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Fotoğrafı kaldır"
                >
                  <i className="fas fa-times"></i>
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Button type="submit" isLoading={isSubmitting} className="w-full" size="lg">
        {submitButtonText}
      </Button>
    </form>
  );
};

export default ListingForm;