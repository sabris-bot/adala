
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

const Input: React.FC<InputProps> = ({ label, id, error, className = '', containerClassName = '', ...props }) => {
  const defaultId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : Math.random().toString(36).substring(7));
  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label htmlFor={defaultId} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={defaultId}
        className={`w-full px-3 py-2 border ${error ? 'border-danger' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 ${error ? 'focus:ring-danger' : 'focus:ring-primary-light'} focus:border-transparent transition duration-150 ease-in-out ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
};

export default Input;
