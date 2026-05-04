
import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NAVIGATION_ITEMS, XIcon, ChevronDownIcon } from '../../constants'; 
import { NavItem } from '../../types';
import Logo from '../ui/Logo';

interface SidebarNavItemProps {
  item: NavItem;
  isSubmenuOpen: boolean;
  toggleSubmenu: () => void;
  closeMobileSidebar?: () => void;
}

const SidebarNavItem: React.FC<SidebarNavItemProps> = ({ item, isSubmenuOpen, toggleSubmenu, closeMobileSidebar }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const isActiveParent = item.children 
    ? item.children.some(child => location.pathname.startsWith(child.path)) || (location.pathname === item.path || location.pathname.startsWith(item.path + "/"))
    : location.pathname === item.path;
  
  const handleNavLinkClick = () => {
    if (closeMobileSidebar && (!item.children || item.children.length === 0)) { 
      closeMobileSidebar();
    }
  };

  const handleParentItemClick = () => {
    if (item.children && item.children.length > 0) {
      toggleSubmenu();
    } else if (closeMobileSidebar) {
       closeMobileSidebar(); 
    }
  };

  if (item.children && item.children.length > 0) {
    return (
      <div className="py-0.5">
        <button
          onClick={handleParentItemClick}
          className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-md transition-colors duration-150 ease-in-out
                     ${isActiveParent 
                       ? 'bg-accent-dark text-white shadow-md hover:bg-accent-dark/90 dark:bg-accent-dark dark:hover:bg-accent-dark/90' 
                       : 'text-slate-100 hover:bg-primary-dark hover:text-white dark:text-slate-200 dark:hover:bg-primary-dark/70 dark:hover:text-slate-100'
                     }`}
           aria-expanded={isSubmenuOpen}
        >
          <div className="flex items-center">
            <item.icon className="w-5 h-5 me-3 flex-shrink-0" aria-hidden="true" />
            <span className="truncate font-medium">{item.translationKey ? t(item.translationKey) : item.name}</span>
          </div>
          <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isSubmenuOpen ? 'rotate-180' : ''}`} aria-hidden="true"/>
        </button>
        {isSubmenuOpen && (
          <ul className="mt-1 ps-5 border-s-2 border-primary-light/50 dark:border-primary-light/40">
            {item.children.map(child => (
              <li key={child.name} className="py-0.5">
                <NavLink
                  to={child.path}
                  onClick={handleNavLinkClick}
                  className={({ isActive }) =>
                    `flex items-center ps-3 pe-2 py-2 text-xs rounded-md transition-colors duration-150 ease-in-out
                     ${isActive
                       ? 'bg-accent text-primary-dark shadow-sm hover:bg-accent/90 dark:bg-accent dark:text-neutral-card'
                       : 'text-slate-200 hover:bg-primary-dark/80 hover:text-white dark:text-slate-300 dark:hover:bg-primary-dark/60 dark:hover:text-slate-100'
                     }`
                  }
                >
                  <child.icon className="w-3.5 h-3.5 me-2 flex-shrink-0" aria-hidden="true"/>
                  <span className="truncate font-normal">{child.translationKey ? t(child.translationKey) : child.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      onClick={handleNavLinkClick}
      className={({ isActive }) =>
        `flex items-center px-3 py-2.5 text-sm rounded-md transition-colors duration-150 ease-in-out my-0.5
         ${isActive
           ? 'bg-accent-dark text-white shadow-lg hover:bg-accent-dark/90 dark:bg-accent-dark dark:hover:bg-accent-dark/90'
           : 'text-slate-100 hover:bg-primary-dark hover:text-white dark:text-slate-200 dark:hover:bg-primary-dark/70 dark:hover:text-slate-100'
         }`
      }
    >
      <item.icon className="w-5 h-5 me-3 flex-shrink-0" aria-hidden="true"/>
      <span className="truncate font-medium">{item.translationKey ? t(item.translationKey) : item.name}</span>
    </NavLink>
  );
};

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void; 
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { t } = useTranslation();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const location = useLocation();

  useEffect(() => {
    const activeParent = NAVIGATION_ITEMS.find(item => 
      item.children && item.children.some(child => location.pathname.startsWith(child.path))
    );
    if (activeParent) {
      setOpenSubmenus(prev => ({ ...prev, [activeParent.name]: true }));
    }
  }, [location.pathname]);

  const handleToggleSubmenu = (itemName: string) => {
    setOpenSubmenus(prev => ({ ...prev, [itemName]: !prev[itemName] }));
  };
  
  const closeMobileSidebarIfNeeded = () => {
    if (isOpen && window.innerWidth < 768) { 
      toggleSidebar();
    }
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-20 bg-black/70 backdrop-blur-sm md:hidden" onClick={toggleSidebar} aria-hidden="true"></div>}
      
      <aside
        className={`fixed inset-y-0 start-0 z-30 flex flex-col h-full bg-primary text-white dark:bg-dm-background dark:text-dm-text w-64 p-4 shadow-xl
                    transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 
                    transition-transform duration-300 ease-in-out print:hidden overflow-y-auto scrollbar-thin scrollbar-thumb-primary-light/70 dark:scrollbar-thumb-secondary-dark hover:scrollbar-thumb-primary-light dark:hover:scrollbar-thumb-secondary`}
        aria-label={t('sidebar_label', { defaultValue: 'القائمة الجانبية الرئيسية' })}
      >
        <div className="flex items-center justify-between mb-6 pt-1 px-1">
          <NavLink to="/dashboard" className="hover:opacity-90 transition-opacity">
            <Logo />
          </NavLink>
          <button onClick={toggleSidebar} className="text-slate-200 hover:text-white md:hidden" aria-label={t('close_menu', { defaultValue: 'إغلاق القائمة' })}>
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 space-y-1">
          {NAVIGATION_ITEMS.map((item) => (
            <React.Fragment key={item.name}>
                {item.sectionHeader && (
                    <div className="px-3 mt-4 mb-2 text-xs font-semibold text-primary-light/70 dark:text-gray-400 uppercase tracking-wider border-b border-primary-light/20 dark:border-gray-700/50 pb-1">
                        {item.sectionTranslationKey ? t(item.sectionTranslationKey) : item.sectionHeader}
                    </div>
                )}
                <SidebarNavItem 
                  item={item}
                  isSubmenuOpen={!!openSubmenus[item.name]}
                  toggleSubmenu={() => handleToggleSubmenu(item.name)}
                  closeMobileSidebar={closeMobileSidebarIfNeeded}
                />
            </React.Fragment>
          ))}
        </nav>
        <div className="mt-auto pt-4 text-center text-xs text-slate-300 dark:text-slate-400 border-t border-primary-light/30 dark:border-secondary-dark/50">
          &copy; {new Date().getFullYear()} {t('adala_modern', { defaultValue: 'عدالة الحديثة' })}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;