
import React, { useRef, useState, useEffect } from 'react';
import { MenuIcon, XIcon, ArrowUturnLeftIcon } from '../../constants'; 
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '../ui/Logo';
import NotificationDropdown from './NotificationDropdown';
import { notificationService } from '../../services/notificationService';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((notifications) => {
        setUnreadCount(notifications.filter(n => !n.isRead).length);
    });
    return unsubscribe;
  }, []);

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <header className="bg-white dark:bg-dm-card shadow-sm h-16 sm:h-20 flex items-center justify-between px-4 sm:px-6 print:hidden border-b border-gray-100 dark:border-gray-800 transition-all duration-300 z-30">
      {/* Right Section: Brand & Navigation */}
      <div className="flex items-center gap-3 sm:gap-4 lg:w-max min-w-0">
        <button
          onClick={handleGoBack}
          className="p-2 sm:p-2.5 rounded-xl text-gray-500 dark:text-dm-text hover:bg-gray-50 dark:hover:bg-dm-background hover:text-primary transition-all flex-shrink-0 border border-transparent hover:border-gray-100"
          title={t('go_back', { defaultValue: "الرجوع للخلف" })}
        >
          <ArrowUturnLeftIcon className="w-5 h-5 rtl:rotate-180" />
        </button>

        <div className="flex items-center gap-4 ps-2 border-s border-gray-100 dark:border-gray-800">
          <Logo 
            iconClassName="w-8 h-8 text-accent" 
            variant="dark"
            hideText={true}
          />
        </div>

        <button 
          onClick={toggleSidebar}
          className="md:hidden p-2 rounded-xl text-gray-500 dark:text-dm-text hover:bg-gray-50 flex-shrink-0 border border-gray-100"
        >
          {isSidebarOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </div>

      {/* Middle Section: Global Search - Refined */}
      <div className="flex-1 max-w-lg mx-6 hidden sm:block">
        <div className="relative group">
          <button 
            type="button"
            onClick={() => searchInputRef.current?.focus()}
            className="absolute inset-y-0 start-0 flex items-center ps-4 text-gray-400 group-focus-within:text-primary transition-colors hover:text-gray-600 dark:hover:text-dm-text"
          >
             <LocalSearchIcon className="w-4 h-4" />
          </button>
          <input
            ref={searchInputRef}
            type="text"
            placeholder={t('search_placeholder', { defaultValue: "ابحث في النظام..." })}
            className="w-full ps-11 pe-12 py-2.5 bg-gray-50 dark:bg-dm-background border border-gray-100 dark:border-gray-700 rounded-2xl 
                       text-sm text-gray-700 dark:text-dm-text placeholder-gray-400
                       focus:ring-4 focus:ring-primary/5 focus:border-primary/20 transition-all text-right font-medium"
          />
          <div className="absolute inset-y-0 end-3 flex items-center">
             <div className="px-1.5 py-0.5 bg-white dark:bg-dm-card border border-gray-100 dark:border-gray-800 rounded-md shadow-sm">
                <span className="text-[9px] font-black text-gray-300 font-mono tracking-tighter">⌘K</span>
             </div>
          </div>
        </div>
      </div>

      {/* Left Section: User & Alert - Organized */}
      <div className="flex items-center gap-3 sm:gap-5 justify-end">
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-dm-background rounded-full border border-gray-100 dark:border-gray-800">
           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
           <span className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
             Online
           </span>
        </div>

        <div className="relative">
            <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-2 rounded-xl text-gray-500 dark:text-dm-text hover:bg-gray-50 relative group transition-all"
            >
                <BellIcon className="w-5 h-5 group-hover:text-primary" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[8px] font-black px-1 rounded-full border border-white dark:border-dm-card shadow-sm animate-bounce min-w-[14px]">
                        {unreadCount > 9 ? '+9' : unreadCount}
                    </span>
                )}
            </button>
            {isNotificationOpen && (
                <NotificationDropdown onClose={() => setIsNotificationOpen(false)} />
            )}
        </div>

        <div className="ms-1">
          <div className="p-0.5 rounded-2xl border-2 border-transparent hover:border-primary/30 transition-all shadow-sm bg-gray-50 group cursor-pointer">
            <img
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-[14px] object-cover border border-white"
              src="https://picsum.photos/seed/sabri/100/100"
              alt="Sabri Shatta"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
