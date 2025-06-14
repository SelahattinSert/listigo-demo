
import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string | null;
  containerClassName?: string;
}

const Textarea: React.FC<TextareaProps> = ({ 
  label, 
  error, 
  containerClassName = '', 
  className = '', 
  ...props 
}) => {
  const baseTextareaClasses = "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";
  const errorTextareaClasses = "border-red-500 focus:ring-red-500 focus:border-red-500";

  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <textarea
        className={`${baseTextareaClasses} ${error ? errorTextareaClasses : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default Textarea;