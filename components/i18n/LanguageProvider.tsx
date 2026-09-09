import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import i18n from '../../services/i18n';

type Language = 'ar' | 'en';
type Direction = 'rtl' | 'ltr';

interface LanguageContextType {
  language: Language;
  direction: Direction;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultValue?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>((i18n.language as Language) || 'ar');
  const [direction, setDirection] = useState<Direction>(language === 'ar' ? 'rtl' : 'ltr');

  const t = useCallback((key: string, defaultValue?: string): string => {
    return i18n.t(key, defaultValue || key) as string;
  }, []);

  // Sync state with i18n instance immediately
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      const currentLng = lng as Language;
      setLanguageState(currentLng);
      const dir = currentLng === 'ar' ? 'rtl' : 'ltr';
      setDirection(dir);

      // Update document-level direction and language
      document.documentElement.setAttribute('dir', dir);
      document.documentElement.setAttribute('lang', currentLng);

      // Apply tailored layout and typography optimization classes
      if (currentLng === 'ar') {
        document.documentElement.classList.add('lang-ar');
        document.documentElement.classList.remove('lang-en');
        // Custom font tuning for premium Arabic reading (wider line-height representation)
        document.body.style.lineHeight = '1.8';
      } else {
        document.documentElement.classList.add('lang-en');
        document.documentElement.classList.remove('lang-ar');
        // English standard presentation balance
        document.body.style.lineHeight = '1.6';
      }
    };

    i18n.on('languageChanged', handleLanguageChange);
    // Initialize current settings
    handleLanguageChange(i18n.language || 'ar');

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const changeLanguage = (lang: Language) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
    
    // Explicitly update profile_preferences inside localstorage for system sync
    try {
      const savedPrefs = localStorage.getItem('profile_preferences');
      const parsed = savedPrefs ? JSON.parse(savedPrefs) : {};
      parsed.lang = lang;
      localStorage.setItem('profile_preferences', JSON.stringify(parsed));
    } catch (e) {
      console.error('Failed to update synced preferences', e);
    }

    // Instantly fire translation update trigger
    window.dispatchEvent(new CustomEvent('language_changed_manually', { detail: { lang } }));
  };

  const toggleLanguage = () => {
    const nextLang = language === 'ar' ? 'en' : 'ar';
    changeLanguage(nextLang);
  };

  return (
    <LanguageContext.Provider value={{
      language,
      direction,
      toggleLanguage,
      setLanguage: changeLanguage,
      t: (key: string, defaultValue?: string) => t(key, defaultValue || key)
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
