

import React from 'react';
import { MenuIcon, XIcon, ArrowUturnLeftIcon } from '../../constants'; 
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  // toggleDarkMode?: () => void; // Placeholder for dark mode toggle
  // isDarkMode?: boolean;      // Placeholder for dark mode state
}

// Simple SearchIcon if not available in constants
const LocalSearchIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons MagnifyingGlassIcon
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);
const BellIcon = (props: React.SVGProps<SVGSVGElement>) => ( // Heroicons BellIcon Outline
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
  </svg>
);


const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <header className="bg-neutral-card dark:bg-dm-card shadow-md p-3 sm:p-4 flex items-center justify-between print:hidden border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar} 
          className="text-neutral-text dark:text-dm-text hover:text-primary dark:hover:text-accent-dark focus:outline-none md:hidden p-1.5 rounded-md hover:bg-neutral-bg dark:hover:bg-dm-background"
          aria-label={isSidebarOpen ? "إغلاق القائمة الجانبية" : "فتح القائمة الجانبية"}
        >
          {isSidebarOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
        
        {/* Back Button - Added Here */}
        <button
          onClick={handleGoBack}
          className="text-neutral-text dark:text-dm-text hover:text-primary dark:hover:text-accent-dark focus:outline-none p-1.5 rounded-md hover:bg-neutral-bg dark:hover:bg-dm-background ms-2"
          aria-label="الرجوع للخلف"
        >
          <ArrowUturnLeftIcon className="w-5 h-5" />
        </button>

        {/* System Name - hidden on mobile, shown on md+ */}
        <h1 className="text-xl font-marhey font-bold text-primary dark:text-primary-light ms-3 hidden md:block">
          عدالة
        </h1>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3 space-x-reverse">
        {/* Search Bar */}
        <div className="relative">
          <span className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
             <LocalSearchIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </span>
          <input
            type="text"
            placeholder="بحث شامل..."
            aria-label="مربع البحث العام"
            className="w-full sm:w-56 md:w-64 lg:w-72 ps-10 pe-3 py-2 border border-gray-300 dark:border-secondary-dark rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-primary dark:focus:border-accent 
                       transition duration-150 ease-in-out text-sm shadow-sm hover:border-gray-400 dark:hover:border-secondary
                       bg-neutral-bg dark:bg-dm-background text-neutral-text dark:text-dm-text placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        {/* Notifications Icon */}
        <button 
          className="text-neutral-text dark:text-dm-text hover:text-primary dark:hover:text-accent-dark focus:outline-none p-2 rounded-full hover:bg-neutral-bg dark:hover:bg-dm-background transition-colors" 
          aria-label="الإشعارات"
        >
          <BellIcon className="w-5 h-5" />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button 
            className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-card dark:focus:ring-offset-dm-card focus:ring-primary dark:focus:ring-accent hover:opacity-90"
            aria-label="خيارات المستخدم"
          >
            <img
              className="h-8 w-8 rounded-full object-cover border-2 border-gray-200 dark:border-secondary-dark hover:border-primary dark:hover:border-accent transition-colors"
              src="https://picsum.photos/seed/user123/100/100" // Placeholder user image
              alt="صورة المستخدم"
            />
          </button>
          {/* Dropdown content would go here */}
        </div>
      </div>
    </header>
  );
};

export default Header;