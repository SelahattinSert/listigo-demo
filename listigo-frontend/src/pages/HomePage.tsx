
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import { ListingDTO, CategoryDTO, ListingFilterDTO } from '../types';
import ListingCard from '../components/listing/ListingCard';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants';

const HomePage: React.FC = () => {
  const [listings, setListings] = useState<ListingDTO[]>([]);
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<ListingFilterDTO>({
    searchText: '',
    categoryId: undefined,
    brand: '',
    model: '',
    minPrice: undefined,
    maxPrice: undefined,
    location: '',
    minYear: undefined,
    maxYear: undefined
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchListings = useCallback(async (currentFilters: ListingFilterDTO) => {
    setIsLoading(true);
    setError(null);
    try {
      const activeFilters: Partial<ListingFilterDTO> = {};
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (activeFilters as any)[key] = value;
        }
      });

      let fetchedListings: ListingDTO[];
      if (Object.keys(activeFilters).length > 0) {
        fetchedListings = await apiService<ListingDTO[], ListingFilterDTO>('POST', '/listings/filter', activeFilters as ListingFilterDTO);
      } else {
        fetchedListings = await apiService<ListingDTO[]>('GET', '/listings/all');
      }
      setListings(fetchedListings);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'İlanlar yüklenirken bir hata oluştu.';
      if (errorMessage.toLowerCase().includes("not found") || errorMessage.includes("404") || errorMessage.toLowerCase().includes("no listings found")) {
        setListings([]);
        setError(null); 
      } else {
        setError(errorMessage);
        setListings([]); 
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings(filters);
  }, [fetchListings, filters]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const fetchedCategories = await apiService<CategoryDTO[]>('GET', '/categories');
        setCategories(fetchedCategories);
      } catch (err) {
        console.error("Kategoriler yüklenirken hata:", err);
         if ((err as Error).message.toLowerCase().includes("no categories found") || (err as Error).message.includes("404")) {
            setCategories([]); 
        }
      }
    };
    fetchCategories();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value === '' || value === null ? undefined : (['categoryId', 'minPrice', 'maxPrice', 'minYear', 'maxYear'].includes(name) ? Number(value) : value)
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      searchText: '',
      categoryId: undefined,
      brand: '',
      model: '',
      minPrice: undefined,
      maxPrice: undefined,
      location: '',
      minYear: undefined,
      maxYear: undefined
    });
  };

  const categoryOptions = [
    { value: '', label: 'Tüm Kategoriler' },
    ...categories.map(cat => ({ value: (cat.categoryId as number).toString(), label: cat.categoryName }))
  ];

  return (
    <div className="space-y-8">
      <div className="text-center py-8 bg-gradient-to-r from-primary to-secondary text-white rounded-lg shadow-xl dark:from-blue-600 dark:to-emerald-600">
        <h1 className="text-4xl font-bold">Hayalindeki Aracı Bul!</h1>
        <p className="mt-2 text-lg">Binlerce ilan arasından sana en uygun olanı keşfet.</p>
        <Button 
          variant="ghost" 
          className="mt-6 bg-white text-primary hover:bg-gray-100 dark:bg-gray-100 dark:text-primary dark:hover:bg-gray-200 px-8 py-3 text-lg mx-auto" // Adjusted dark mode for button
          onClick={() => isAuthenticated ? navigate(ROUTES.CREATE_LISTING) : navigate(ROUTES.LOGIN)}
        >
          Hemen İlan Ver
        </Button>
      </div>

      <div className="bg-white dark:bg-darkSurface p-6 rounded-lg shadow-md transition-colors duration-300">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
          <Input
            name="searchText"
            placeholder="İlanlarda ara (başlık, açıklama...)"
            value={filters.searchText || ''}
            onChange={handleFilterChange}
            containerClassName="flex-grow mb-0 w-full sm:w-auto"
            className="h-12 text-base"
          />
          <Button 
            onClick={() => setShowFilters(!showFilters)} 
            variant="ghost" 
            className="border border-gray-300 dark:border-gray-600 dark:text-darkMutedText dark:hover:bg-gray-700 w-full sm:w-auto flex-shrink-0 px-4 py-2.5 h-12"
          >
            {showFilters ? 'Filtreleri Gizle' : 'Filtreleri Göster'} 
            <i className={`fas ${showFilters ? 'fa-chevron-up' : 'fa-chevron-down'} ml-2`}></i>
          </Button>
        </div>

        {showFilters && (
          <div className="mb-4 pt-4 border-t dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-1">
              <Select name="categoryId" label="Kategori" value={filters.categoryId?.toString() || ''} onChange={handleFilterChange} options={categoryOptions} placeholder="Tüm Kategoriler" containerClassName="mb-3"/>
              <Input name="brand" label="Marka" value={filters.brand || ''} onChange={handleFilterChange} placeholder="örn: Ford" containerClassName="mb-3"/>
              <Input name="model" label="Model" value={filters.model || ''} onChange={handleFilterChange} placeholder="örn: Focus" containerClassName="mb-3"/>
              <Input name="location" label="Konum" value={filters.location || ''} onChange={handleFilterChange} placeholder="örn: İstanbul" containerClassName="mb-3"/>
              <Input name="minPrice" label="Min Fiyat (TL)" type="number" value={String(filters.minPrice === undefined ? '' : filters.minPrice)} onChange={handleFilterChange} containerClassName="mb-3"/>
              <Input name="maxPrice" label="Max Fiyat (TL)" type="number" value={String(filters.maxPrice === undefined ? '' : filters.maxPrice)} onChange={handleFilterChange} containerClassName="mb-3"/>
              <Input name="minYear" label="Min Yıl" type="number" value={String(filters.minYear === undefined ? '' : filters.minYear)} onChange={handleFilterChange} placeholder="örn: 2010" containerClassName="mb-3"/>
              <Input name="maxYear" label="Max Yıl" type="number" value={String(filters.maxYear === undefined ? '' : filters.maxYear)} onChange={handleFilterChange} placeholder="örn: 2023" containerClassName="mb-3"/>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={handleClearFilters} variant="ghost" className="border border-gray-300 dark:border-gray-600 dark:text-darkMutedText dark:hover:bg-gray-700">
                Filtreleri Temizle
              </Button>
            </div>
          </div>
        )}
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Spinner size="lg" />
        </div>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map(listing => (
            <ListingCard key={listing.listingId} listing={listing} />
          ))}
        </div>
      ) : (
        !error && <p className="text-center text-gray-600 dark:text-darkMutedText py-10 text-xl">Filtrelerinize uygun ilan bulunamadı.</p>
      )}
    </div>
  );
};

export default HomePage;