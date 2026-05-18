

import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: Array<{ value: string | number; label: string }>;
  containerClassName?: string;
  placeholder?: string;
}

const Select: React.FC<SelectProps> = ({ label, id, error, options, className = '', containerClassName = '', placeholder, children, ...props }) => {
  const defaultId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : Math.random().toString(36).substring(7));
  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label htmlFor={defaultId} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <select
        id={defaultId}
        className={`w-full px-3 py-2 border ${error ? 'border-danger' : 'border-gray-300 dark:border-gray-600'} rounded-md shadow-sm focus:outline-none focus:ring-2 ${error ? 'focus:ring-danger' : 'focus:ring-primary-light'} focus:border-transparent transition duration-150 ease-in-out bg-white text-gray-900 ${className}`}
        {...props}
      >
        {placeholder && <option value="" className="text-gray-500">{placeholder}</option>}
        {options ? options.map((option, index) => (
          <option key={`${option.value}-${index}`} value={option.value}>
            {option.label}
          </option>
        )) : children}
      </select>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
};

export default Select;