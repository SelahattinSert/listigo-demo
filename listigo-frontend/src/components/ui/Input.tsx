
import React, { useState } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  containerClassName?: string;
  validate?: (value: string) => boolean | string; // Returns true if valid, or error message string
  onValidation?: (isValid: boolean) => void;
}

const Input: React.FC<InputProps> = ({
  label,
  error: propError,
  containerClassName = '',
  validate,
  onValidation,
  className = '',
  type = 'text',
  ...props
}) => {
  const [internalError, setInternalError] = useState<string | null>(null);
  const displayError = propError || internalError;

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (validate) {
      const validationResult = validate(event.target.value);
      if (validationResult === true) {
        setInternalError(null);
        if (onValidation) onValidation(true);
      } else if (typeof validationResult === 'string') {
        setInternalError(validationResult);
        if (onValidation) onValidation(false);
      }
    }
    if (props.onBlur) {
      props.onBlur(event);
    }
  };
  
  const baseInputClasses = "mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm";
  const errorInputClasses = "border-red-500 focus:ring-red-500 focus:border-red-500";

  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label htmlFor={props.id || props.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`${baseInputClasses} ${displayError ? errorInputClasses : ''} ${className}`}
        onBlur={handleBlur}
        {...props}
      />
      {displayError && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{displayError}</p>}
    </div>
  );
};

export default Input;