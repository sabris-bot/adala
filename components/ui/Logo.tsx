
import React from 'react';
import { ScaleIcon } from '../../constants';

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  showText?: boolean;
  hideText?: boolean;
  variant?: 'light' | 'dark' | 'auto';
  showOfficeName?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  className = "flex items-center", 
  iconClassName = "w-9 h-9 text-accent-DEFAULT me-2.5", 
  textClassName = "flex flex-col",
  showText = true,
  hideText = false,
  variant = 'light',
  showOfficeName = false
}) => {
  const arabicColor = variant === 'light' ? 'text-white' : 'text-primary dark:text-primary-light';
  const englishColor = variant === 'light' ? 'text-accent-light' : 'text-accent-dark dark:text-accent';

  const shouldShowText = showText && !hideText;

  return (
    <div className={className}>
      <ScaleIcon className={iconClassName} />
      {shouldShowText && (
        <div className={textClassName}>
          <span className={`${textClassName.includes('flex-row') ? 'text-xl' : 'text-xl sm:text-2xl'} font-marhey font-bold ${arabicColor} leading-none whitespace-nowrap`}>
            {showOfficeName ? 'مكتب صبري شطا للمحاماة' : 'عدالة'}
          </span>
          <span className={`${textClassName.includes('flex-row') ? 'text-[8px]' : 'text-[9px]'} font-sans font-black tracking-[0.2em] ${englishColor} uppercase leading-none ${textClassName.includes('flex-row') ? 'mt-0' : 'mt-1'} whitespace-nowrap opacity-80`}>
            {showOfficeName ? 'Sabri Shatta Law Firm' : 'ADALA'}
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;
