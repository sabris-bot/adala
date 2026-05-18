
import React, { useEffect, useRef } from 'react';
import { XIcon } from '../../constants';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  footer?: React.ReactNode;
  hideHeader?: boolean;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md', footer, hideHeader = false, className = '' }) => {
  const modalContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = ''; // Restore background scroll
    };
  }, [isOpen, onClose]);
  
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
      onClose();
    }
  };


  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl md:max-w-2xl lg:max-w-4xl', // Extended XL
    full: 'max-w-full h-full md:max-w-6xl', // Max width for full to not be too wide on large screens
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-60 p-4 backdrop-blur-sm"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={modalContentRef}
        className={`bg-white rounded-xl shadow-2xl transform transition-all w-full ${sizeClasses[size]} m-4 flex flex-col max-h-[calc(100vh-3rem)] ${className}`} // Increased max-h
      >
        {((title || onClose) && !hideHeader) && (
          <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200">
            {title && <h3 id="modal-title" className="text-lg font-semibold text-primary-dark">{title}</h3>}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-light rounded-full p-1"
              aria-label="إغلاق النافذة"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="p-4 sm:p-6 overflow-y-auto flex-grow">
          {children}
        </div>
        {footer && (
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex justify-end space-x-3 space-x-reverse">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
