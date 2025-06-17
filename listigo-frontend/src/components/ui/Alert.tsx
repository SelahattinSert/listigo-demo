
import React from 'react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string | React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose, className = '' }) => {
  const baseStyles = 'p-4 rounded-md flex items-start';
  const typeStyles = {
    success: 'bg-green-100 border border-green-400 text-green-700 dark:bg-green-800 dark:border-green-600 dark:text-green-100',
    error: 'bg-red-100 border border-red-400 text-red-700 dark:bg-red-800 dark:border-red-600 dark:text-red-100',
    warning: 'bg-yellow-100 border border-yellow-400 text-yellow-700 dark:bg-yellow-700 dark:border-yellow-500 dark:text-yellow-100',
    info: 'bg-blue-100 border border-blue-400 text-blue-700 dark:bg-blue-800 dark:border-blue-600 dark:text-blue-100',
  };

  const icons = {
    success: <i className="fas fa-check-circle mr-3 text-lg"></i>,
    error: <i className="fas fa-times-circle mr-3 text-lg"></i>,
    warning: <i className="fas fa-exclamation-triangle mr-3 text-lg"></i>,
    info: <i className="fas fa-info-circle mr-3 text-lg"></i>,
  };

  return (
    <div className={`${baseStyles} ${typeStyles[type]} ${className}`} role="alert">
      {icons[type]}
      <div className="flex-grow">{message}</div>
      {onClose && (
        <button onClick={onClose} className="ml-4 -mt-1 -mr-1 text-current opacity-70 hover:opacity-100">
          <i className="fas fa-times"></i>
        </button>
      )}
    </div>
  );
};

export default Alert;