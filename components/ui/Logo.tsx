
import React from 'react';
import { ScaleIcon } from '../../constants';

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
  variant?: 'light' | 'dark' | 'auto';
}

const Logo: React.FC<LogoProps> = ({ 
  className = "flex items-center", 
  iconClassName = "w-9 h-9 text-accent-DEFAULT me-2.5", 
  textClassName = "flex flex-col",
  showText = true,
  variant = 'light'
}) => {
  const arabicColor = variant === 'light' ? 'text-white' : 'text-primary dark:text-primary-light';
  const englishColor = variant === 'light' ? 'text-accent-light' : 'text-accent-dark dark:text-accent';

  return (
    <div className={className}>
      <ScaleIcon className={iconClassName} />
      {showText && (
        <div className={textClassName}>
          <span className={`${textClassName.includes('flex-row') ? 'text-xl' : 'text-2xl'} font-marhey font-bold ${arabicColor} leading-none`}>
            عدالة
          </span>
          <span className={`${textClassName.includes('flex-row') ? 'text-[10px]' : 'text-[10px]'} font-sans font-bold tracking-[0.2em] ${englishColor} uppercase leading-none ${textClassName.includes('flex-row') ? 'mt-0' : 'mt-1'}`}>
            ADALA
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
