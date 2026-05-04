
import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
  headerClassName?: string;
  actions?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, icon, children, className = '', titleClassName = '', headerClassName = '', actions, ...props }) => {
  return (
    <div className={`bg-neutral-card dark:bg-dm-card shadow-card hover:shadow-card-hover rounded-lg overflow-hidden transition-shadow duration-300 ${className}`} {...props}>
      {(title || actions || icon) && (
        <div className={`p-4 sm:p-5 border-b border-gray-200 dark:border-secondary-dark/50 flex justify-between items-center ${headerClassName}`}>
          <div className="flex items-center gap-3">
            {icon && <div className="p-2 bg-primary/5 rounded-lg">{icon}</div>}
            {title && <h3 className={`text-lg font-semibold text-primary-dark dark:text-primary-light ${titleClassName}`}>{title}</h3>}
          </div>
          {actions && <div className="flex space-x-2 space-x-reverse">{actions}</div>}
        </div>
      )}
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
