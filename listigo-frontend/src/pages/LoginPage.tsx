
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoginRequest as LoginRequestType, AuthResponse } from '../types';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Alert from '../components/ui/Alert';
import { ROUTES } from '../constants';
import apiService from '../services/apiService';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginRequestType>({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.HOME); // Redirect if already logged in
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const authData = await apiService<AuthResponse, LoginRequestType>('POST', '/auth/login', formData);
      await login(authData); 
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-15rem)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-darkSurface p-10 rounded-xl shadow-2xl transition-colors duration-300">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-primary dark:text-blue-400">
            Hesabınıza giriş yapın
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
          <Input
            label="E-posta Adresi"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="ornek@mail.com"
          />
          <Input
            label="Şifre"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="Şifreniz"
          />
          <Button type="submit" isLoading={isLoading} className="w-full" variant="primary" size="lg">
            Giriş Yap
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-darkMutedText">
          Hesabınız yok mu?{' '}
          <Link to={ROUTES.REGISTER} className="font-medium text-secondary dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300">
            Kayıt Olun
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;