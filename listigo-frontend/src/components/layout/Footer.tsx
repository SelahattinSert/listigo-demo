
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 dark:bg-gray-900">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} Listigo. Tüm hakları saklıdır.</p>
      </div>
    </footer>
  );
};

export default Footer;