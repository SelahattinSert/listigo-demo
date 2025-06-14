
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES, ROLES } from '../../constants';
import Button from '../ui/Button';
import { useTheme } from '../../contexts/ThemeContext'; // Import useTheme

const Navbar: React.FC = () => {
  const { isAuthenticated, user, roles, logout } = useAuth();
  const { theme, toggleTheme } = useTheme(); // Use theme context
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
    setIsMobileMenuOpen(false);
  };

  const isAdmin = roles?.includes(ROLES.ADMIN);

  const navLinks = (
    <>
      <Link to={ROUTES.HOME} className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>Anasayfa</Link>
      {isAuthenticated && (
        <>
          <Link to={ROUTES.CREATE_LISTING} className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>İlan Ver</Link>
          <Link to={ROUTES.MESSAGES} className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>Mesajlarım</Link>
          {isAdmin && (
            <Link to={ROUTES.ADMIN_CATEGORIES} className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium" onClick={() => setIsMobileMenuOpen(false)}>Admin Panel</Link>
          )}
        </>
      )}
    </>
  );

  return (
    <nav className="bg-white dark:bg-darkSurface shadow-md sticky top-0 z-40 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to={ROUTES.HOME} className="text-2xl font-bold text-primary dark:text-blue-400">
              Listigo
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-1">
            {navLinks}
            <Button onClick={toggleTheme} variant="ghost" size="sm" className="px-2" aria-label={theme === 'dark' ? 'Açık tema' : 'Karanlık tema'}>
              <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-lg text-gray-700 dark:text-gray-300`}></i>
            </Button>
            {isAuthenticated ? (
              <div className="flex items-center space-x-3 ml-2">
                <Link to={ROUTES.PROFILE} className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium">
                  {user?.name || 'Profil'}
                </Link>
                <Button onClick={handleLogout} variant="secondary" size="sm">Çıkış Yap</Button>
              </div>
            ) : (
              <div className="space-x-2 ml-2">
                <Button onClick={() => navigate(ROUTES.LOGIN)} variant="ghost" size="sm">Giriş Yap</Button>
                <Button onClick={() => navigate(ROUTES.REGISTER)} variant="primary" size="sm">Kayıt Ol</Button>
              </div>
            )}
          </div>
          <div className="md:hidden flex items-center">
             <Button onClick={toggleTheme} variant="ghost" size="sm" className="px-2 mr-2" aria-label={theme === 'dark' ? 'Açık tema' : 'Karanlık tema'}>
              <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'} text-lg text-gray-700 dark:text-gray-300`}></i>
            </Button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              aria-expanded={isMobileMenuOpen}
            >
              <span className="sr-only">Menüyü aç</span>
              {isMobileMenuOpen ? (
                <i className="fas fa-times h-6 w-6"></i>
              ) : (
                <i className="fas fa-bars h-6 w-6"></i>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-darkSurface transition-colors duration-300">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col items-center">
            {navLinks}
            {isAuthenticated ? (
              <>
                <Link to={ROUTES.PROFILE} className="block text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-blue-400 px-3 py-2 rounded-md text-base font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                  {user?.name || 'Profil'}
                </Link>
                <Button onClick={handleLogout} variant="secondary" size="sm" className="w-full mt-2">Çıkış Yap</Button>
              </>
            ) : (
              <div className="w-full mt-2 space-y-2">
                <Button onClick={() => { navigate(ROUTES.LOGIN); setIsMobileMenuOpen(false); }} variant="ghost" size="sm" className="w-full">Giriş Yap</Button>
                <Button onClick={() => { navigate(ROUTES.REGISTER); setIsMobileMenuOpen(false); }} variant="primary" size="sm" className="w-full">Kayıt Ol</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;