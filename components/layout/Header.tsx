
import React from 'react';
import { MenuIcon, XIcon, ArrowUturnLeftIcon, PrinterIcon, OFFICE_NAME } from '../../constants'; 
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '../ui/Logo';
import { useJurisdiction } from '../JurisdictionContext';

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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { selectedJurisdiction, setJurisdiction, availableJurisdictions } = useJurisdiction();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <header className="bg-neutral-card dark:bg-dm-card shadow-md p-3 sm:p-4 flex items-center justify-between print:hidden border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar} 
          className="text-neutral-text dark:text-dm-text hover:text-primary dark:hover:text-accent-dark focus:outline-none md:hidden p-1.5 rounded-md hover:bg-neutral-bg dark:hover:bg-dm-background"
          aria-label={isSidebarOpen ? t('close_sidebar', { defaultValue: "إغلاق القائمة الجانبية" }) : t('open_sidebar', { defaultValue: "فتح القائمة الجانبية" })}
        >
          {isSidebarOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
        
        {/* Back Button */}
        <button
          onClick={handleGoBack}
          className="text-neutral-text dark:text-dm-text hover:text-primary dark:hover:text-accent-dark focus:outline-none p-1.5 rounded-md hover:bg-neutral-bg dark:hover:bg-dm-background ms-2"
          aria-label={t('go_back', { defaultValue: "الرجوع للخلف" })}
        >
          <ArrowUturnLeftIcon className="w-5 h-5" />
        </button>

        {/* System Name - hidden on mobile, shown on md+ */}
        <div className="ms-3 hidden md:flex flex-col border-r border-gray-200 dark:border-gray-700 pr-3 mr-3">
          <Logo 
            iconClassName="hidden" 
            textClassName="flex flex-row items-center gap-2"
            variant="dark"
          />
          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 mt-0.5 truncate max-w-[200px]" title={OFFICE_NAME}>
            {OFFICE_NAME}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-3 space-x-reverse">
        {/* Search Bar */}
        <div className="relative">
          <span className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
             <LocalSearchIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </span>
          <input
            type="text"
            placeholder={t('search', { defaultValue: "بحث شامل..." })}
            aria-label={t('search_label', { defaultValue: "مربع البحث العام" })}
            className="w-full sm:w-56 md:w-64 lg:w-72 ps-10 pe-3 py-2 border border-gray-300 dark:border-secondary-dark rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-accent focus:border-primary dark:focus:border-accent 
                       transition duration-150 ease-in-out text-sm shadow-sm hover:border-gray-400 dark:hover:border-secondary
                       bg-neutral-bg dark:bg-dm-background text-neutral-text dark:text-dm-text placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>

        {/* Jurisdiction Selector */}
        <div className="relative group">
          <button 
            className="flex items-center gap-1 text-neutral-text dark:text-dm-text hover:text-primary dark:hover:text-accent-dark focus:outline-none p-2 rounded-lg hover:bg-neutral-bg dark:hover:bg-dm-background transition-colors text-xl"
            title={selectedJurisdiction.name}
          >
            {selectedJurisdiction.flag}
          </button>
          
          <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-dm-card border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden hidden group-hover:block animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="py-2">
              <div className="px-4 py-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {t('select_jurisdiction', { defaultValue: 'اختيار الدولة (النظام القانوني)' })}
              </div>
              {availableJurisdictions.map((j) => (
                <button
                  key={j.code}
                  onClick={() => setJurisdiction(j.code)}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-right text-sm hover:bg-gray-50 dark:hover:bg-dm-background transition-colors ${selectedJurisdiction.code === j.code ? 'bg-primary/5 text-primary font-bold' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  <span className="text-lg">{j.flag}</span>
                  <span className="flex-1">{j.name}</span>
                  {selectedJurisdiction.code === j.code && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Print Button - GLOBAL */}
        <button
          onClick={handlePrint}
          className="text-neutral-text dark:text-dm-text hover:text-primary dark:hover:text-accent-dark focus:outline-none p-2 rounded-full hover:bg-neutral-bg dark:hover:bg-dm-background transition-colors"
          title={t('print', { defaultValue: "طباعة الصفحة الحالية / حفظ كـ PDF" })}
          aria-label={t('print_label', { defaultValue: "طباعة" })}
        >
          <PrinterIcon className="w-5 h-5" />
        </button>

        {/* Notifications Icon */}
        <button 
          className="text-neutral-text dark:text-dm-text hover:text-primary dark:hover:text-accent-dark focus:outline-none p-2 rounded-full hover:bg-neutral-bg dark:hover:bg-dm-background transition-colors" 
          aria-label={t('notifications', { defaultValue: "الإشعارات" })}
        >
          <BellIcon className="w-5 h-5" />
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button 
            className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-card dark:focus:ring-offset-dm-card focus:ring-primary dark:focus:ring-accent hover:opacity-90"
            aria-label={t('user_options', { defaultValue: "خيارات المستخدم" })}
          >
            <img
              className="h-8 w-8 rounded-full object-cover border-2 border-gray-200 dark:border-secondary-dark hover:border-primary dark:hover:border-accent transition-colors"
              src="https://picsum.photos/seed/user123/100/100" // Placeholder user image
              alt={t('user_image', { defaultValue: "صورة المستخدم" })}
            />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
