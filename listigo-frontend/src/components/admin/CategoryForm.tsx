
import React, { useState, useEffect } from 'react';
import { CategoryDTO } from '../../types';
import Input from '../ui/Input';
import Button from '../ui/Button';

interface CategoryFormProps {
  initialData?: CategoryDTO | null;
  onSubmit: (categoryData: CategoryDTO) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ initialData, onSubmit, isSubmitting, onCancel }) => {
  const [categoryName, setCategoryName] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setCategoryName(initialData.categoryName);
    } else {
      setCategoryName(''); 
    }
    setError(null);
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      setError("Kategori adı boş olamaz.");
      return;
    }
    if (categoryName.trim().length < 3 || categoryName.trim().length > 100) {
      setError("Kategori adı 3 ile 100 karakter arasında olmalıdır.");
      return;
    }
    setError(null);
    await onSubmit({ 
      categoryId: initialData ? initialData.categoryId : null, 
      categoryName 
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Kategori Adı"
        name="categoryName"
        value={categoryName}
        onChange={(e) => setCategoryName(e.target.value)}
        error={error}
        required
        maxLength={100}
      />
      <div className="flex justify-end space-x-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting} className="dark:text-darkMutedText dark:hover:bg-gray-700">
          İptal
        </Button>
        <Button type="submit" isLoading={isSubmitting} variant="primary">
          {initialData ? 'Güncelle' : 'Oluştur'}
        </Button>
      </div>
    </form>
  );
};

export default CategoryForm;