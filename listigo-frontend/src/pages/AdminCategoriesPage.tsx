
import React, { useState, useEffect, useCallback } from 'react';
import { CategoryDTO } from '../types';
import apiService from '../services/apiService';
import Spinner from '../components/ui/Spinner';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import CategoryForm from '../components/admin/CategoryForm';

const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryDTO | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService<CategoryDTO[]>('GET', '/categories');
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kategoriler yüklenirken bir hata oluştu.');
      if ((err as Error).message.toLowerCase().includes("no categories found")) {
        setCategories([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenModal = (category?: CategoryDTO) => {
    setEditingCategory(category || null);
    setIsModalOpen(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSubmitCategory = async (categoryData: CategoryDTO) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    try {
      if (editingCategory && editingCategory.categoryId) { 
        await apiService<CategoryDTO, CategoryDTO>('PUT', `/categories/${editingCategory.categoryId}`, categoryData);
        setSuccessMessage('Kategori başarıyla güncellendi.');
      } else { 
        await apiService<CategoryDTO, CategoryDTO>('POST', '/categories', categoryData);
        setSuccessMessage('Kategori başarıyla oluşturuldu.');
      }
      fetchCategories(); 
      handleCloseModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kategori işlenirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (categoryId: number | null) => {
    if (!categoryId || !window.confirm("Bu kategoriyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) return;
    
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true); 
    try {
      await apiService<void>('DELETE', `/categories/${categoryId}`);
      setSuccessMessage('Kategori başarıyla silindi.');
      fetchCategories(); 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kategori silinirken bir hata oluştu. İlişkili ilanları olabilir.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-darkText">Kategori Yönetimi</h1>
        <Button onClick={() => handleOpenModal()} variant="primary">
          <i className="fas fa-plus mr-2"></i> Yeni Kategori Ekle
        </Button>
      </div>

      {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage(null)} className="mb-4" />}
      {error && <Alert type="error" message={error} onClose={() => setError(null)} className="mb-4" />}

      {isLoading && categories.length === 0 ? (
        <div className="flex justify-center py-10"><Spinner size="lg" /></div>
      ) : categories.length > 0 ? (
        <div className="bg-white dark:bg-darkSurface shadow-md rounded-lg overflow-hidden transition-colors duration-300">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-darkCard">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kategori Adı</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">İşlemler</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-darkSurface divide-y divide-gray-200 dark:divide-gray-700">
              {categories.map(category => (
                <tr key={category.categoryId} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-darkText">{category.categoryId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-darkMutedText">{category.categoryName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenModal(category)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                      <i className="fas fa-edit mr-1"></i> Düzenle
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteCategory(category.categoryId)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">
                      <i className="fas fa-trash mr-1"></i> Sil
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !error && <p className="text-center text-gray-600 dark:text-darkMutedText py-10">Henüz kategori bulunmamaktadır.</p>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori Oluştur'}
      >
        <CategoryForm
          initialData={editingCategory}
          onSubmit={handleSubmitCategory}
          isSubmitting={isSubmitting}
          onCancel={handleCloseModal}
        />
      </Modal>
    </div>
  );
};

export default AdminCategoriesPage;