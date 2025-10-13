
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  isLoading = false,
  className = '',
  ...props
}) => {
  const baseStyles = "font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-dm-background transition-all duration-150 ease-in-out inline-flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md";

  // Updated variants for "Modern Justice" theme
  const variantStyles = {
    primary: 'bg-primary text-white hover:bg-primary-dark focus:ring-primary-light',
    secondary: 'bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary-light dark:bg-secondary-dark dark:hover:bg-secondary',
    accent: 'bg-accent-DEFAULT text-neutral-text hover:bg-accent-dark focus:ring-accent-dark', // Amber/Gold accent
    danger: 'bg-danger text-white hover:bg-red-700 focus:ring-red-400',
    outline: 'border border-primary text-primary hover:bg-primary/10 dark:hover:bg-primary-dark/30 focus:ring-primary-light',
    ghost: 'text-primary hover:bg-primary/10 dark:hover:bg-primary-dark/30 focus:ring-primary-light dark:text-primary-light dark:hover:text-accent-dark',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-2.5 text-base', // Slightly adjusted padding for lg
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ms-1 me-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {leftIcon && !isLoading && <span className="me-2">{leftIcon}</span>}
      {children}
      {rightIcon && !isLoading && <span className="ms-2">{rightIcon}</span>}
    </button>
  );
};

export default Button;