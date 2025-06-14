
import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants';
import Button from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-15rem)] text-center px-4">
      <i className="fas fa-exclamation-triangle text-8xl text-amber-500 mb-8"></i>
      <h1 className="text-5xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-2xl text-gray-600 mb-8">Sayfa Bulunamadı</p>
      <p className="text-lg text-gray-500 mb-8">
        Aradığınız sayfa mevcut değil, taşınmış veya silinmiş olabilir.
      </p>
      <Button onClick={() => window.history.back()} variant="ghost" className="mr-4 border border-gray-300">
        <i className="fas fa-arrow-left mr-2"></i> Geri Dön
      </Button>
      <Link to={ROUTES.HOME}>
        <Button variant="primary">
            <i className="fas fa-home mr-2"></i> Anasayfaya Dön
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
