import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from '../data/locales/en.json';
import arTranslation from '../data/locales/ar.json';

// Initialize i18next with base translations of Arabic and English
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation.translation || enTranslation },
      ar: { translation: arTranslation.translation || arTranslation },
    },
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'cookie', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage'],
    }
  });

// --- SMART LOCALIZATION & TRANSLATION ENGINE ---

export interface QAReport {
  scannedKeysCount: number;
  missingKeys: Array<{ key: string; language: 'ar' | 'en'; type: 'missing' | 'empty' }>;
  potentialUntranslated: Array<{ key: string; arValue: string; enValue: string; reason: string }>;
  duplicateTranslations: Array<{ value: string; keys: string[]; language: 'ar' | 'en' }>;
  structuralWarnings: Array<{ key: string; arValue: string; enValue: string; warning: string }>;
  integrityPercentage: number;
}

export const localizationEngine = {
  /**
   * Loads custom overrides from LocalStorage and applies them immediately to the active i18n instance.
   */
  loadCustomOverrides: () => {
    try {
      const saved = localStorage.getItem('custom_translations_override');
      if (saved) {
        const { ar, en } = JSON.parse(saved);
        if (ar && Object.keys(ar).length > 0) {
          i18n.addResourceBundle('ar', 'translation', ar, true, true);
        }
        if (en && Object.keys(en).length > 0) {
          i18n.addResourceBundle('en', 'translation', en, true, true);
        }
      }
    } catch (e) {
      console.error('Failed to apply custom translations override:', e);
    }
  },

  /**
   * Retrieves all translation overrides saved in LocalStorage.
   */
  getCustomOverrides: (lng: 'ar' | 'en'): Record<string, string> => {
    try {
      const saved = localStorage.getItem('custom_translations_override');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed[lng] || {};
      }
    } catch (e) {
      console.error(`Failed to load overrides for language: ${lng}`, e);
    }
    return {};
  },

  /**
   * Gets the static base translations loaded from JSON files.
   */
  getBaseTranslations: (lng: 'ar' | 'en'): Record<string, string> => {
    const defaultData = lng === 'en' ? enTranslation : arTranslation;
    return (defaultData.translation || defaultData) as Record<string, string>;
  },

  /**
   * Merges base translations with active custom overrides.
   */
  getCombinedTranslations: (lng: 'ar' | 'en'): Record<string, string> => {
    const base = localizationEngine.getBaseTranslations(lng);
    const overrides = localizationEngine.getCustomOverrides(lng);
    return { ...base, ...overrides };
  },

  /**
   * Saves a customized override for a specific translation key.
   */
  saveCustomOverride: (lng: 'ar' | 'en', key: string, value: string) => {
    try {
      const saved = localStorage.getItem('custom_translations_override');
      const parsed = saved ? JSON.parse(saved) : { ar: {}, en: {} };
      
      if (!parsed[lng]) parsed[lng] = {};
      parsed[lng][key] = value;
      
      localStorage.setItem('custom_translations_override', JSON.stringify(parsed));
      
      // Inject directly into active instance
      i18n.addResourceBundle(lng, 'translation', { [key]: value }, true, true);
      
      // Notify components by dispatching a custom event
      window.dispatchEvent(new CustomEvent('translations_updated', { detail: { lng, key, value } }));
    } catch (e) {
      console.error(`Failed to save custom override for key "${key}" in "${lng}":`, e);
      throw e;
    }
  },

  /**
   * Deletes a custom translation override, reverting the key to its original fallback.
   */
  deleteCustomOverride: (lng: 'ar' | 'en', key: string) => {
    try {
      const saved = localStorage.getItem('custom_translations_override');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed[lng] && key in parsed[lng]) {
          delete parsed[lng][key];
          localStorage.setItem('custom_translations_override', JSON.stringify(parsed));
          
          // Reset resource bundle to base + remaining overrides
          const baseBundle = localizationEngine.getBaseTranslations(lng);
          const remainingOverrides = parsed[lng] || {};
          const reloadedBundle = { ...baseBundle, ...remainingOverrides };
          
          i18n.addResourceBundle(lng, 'translation', reloadedBundle, true, true);
          
          // Notify components
          window.dispatchEvent(new CustomEvent('translations_updated', { detail: { lng, key, isDeleted: true } }));
        }
      }
    } catch (e) {
      console.error(`Failed to delete custom override for key "${key}" in "${lng}":`, e);
      throw e;
    }
  },

  /**
   * Imports a bulk list of custom translations (overrides) for a language.
   */
  importTranslations: (lng: 'ar' | 'en', data: Record<string, string>) => {
    try {
      const saved = localStorage.getItem('custom_translations_override');
      const parsed = saved ? JSON.parse(saved) : { ar: {}, en: {} };
      
      parsed[lng] = { ...(parsed[lng] || {}), ...data };
      
      localStorage.setItem('custom_translations_override', JSON.stringify(parsed));
      i18n.addResourceBundle(lng, 'translation', parsed[lng], true, true);
      
      window.dispatchEvent(new CustomEvent('translations_updated', { detail: { lng, bulk: true } }));
    } catch (e) {
      console.error(`Failed to bulk import translations for ${lng}:`, e);
      throw e;
    }
  },

  /**
   * Runs an advanced, intelligent translation QA scan verifying both languages.
   */
  runLocalizationQA: (): QAReport => {
    const arCombined = localizationEngine.getCombinedTranslations('ar');
    const enCombined = localizationEngine.getCombinedTranslations('en');
    
    const arKeys = Object.keys(arCombined);
    const enKeys = Object.keys(enCombined);
    const allKeys = Array.from(new Set([...arKeys, ...enKeys]));
    
    const missingKeys: QAReport['missingKeys'] = [];
    const potentialUntranslated: QAReport['potentialUntranslated'] = [];
    const structuralWarnings: QAReport['structuralWarnings'] = [];
    
    // Reverse indices to find duplicate values
    const arValueToKeys: Record<string, string[]> = {};
    const enValueToKeys: Record<string, string[]> = {};

    allKeys.forEach((key) => {
      const arVal = arCombined[key];
      const enVal = enCombined[key];
      
      // 1. Check Missing/Empty (QA criteria)
      if (!arVal) {
        missingKeys.push({ key, language: 'ar', type: 'missing' });
      } else if (arVal.trim() === '') {
        missingKeys.push({ key, language: 'ar', type: 'empty' });
      }
      
      if (!enVal) {
        missingKeys.push({ key, language: 'en', type: 'missing' });
      } else if (enVal.trim() === '') {
        missingKeys.push({ key, language: 'en', type: 'empty' });
      }

      if (arVal && enVal) {
        // 2. Check Untranslated text (identically the same across EN & AR, which shouldn't happen for translation)
        if (arVal.trim() === enVal.trim() && arVal.length > 1) {
          potentialUntranslated.push({
            key,
            arValue: arVal,
            enValue: enVal,
            reason: 'النص متطابق في اللغتين العربية والإنجليزية (قد يعكس فقداناً للترجمة)'
          });
        }
        
        // 3. Check English files that contain Arabic letters (except for legal references specifically)
        const arabicRegex = /[\u0600-\u06FF]/;
        if (arabicRegex.test(enVal) && !key.toLowerCase().includes('reference') && !key.toLowerCase().includes('author')) {
          potentialUntranslated.push({
            key,
            arValue: arVal,
            enValue: enVal,
            reason: 'الملف الإنجليزي يحتوي على أحرف عربية غير معربة'
          });
        }
        
        // 4. Inter-linguistic structure checking (Interpolation placeholder validation)
        const arInterpolations = arVal.match(/\{[^}]+\}/g) || [];
        const enInterpolations = enVal.match(/\{[^}]+\}/g) || [];
        if (arInterpolations.length !== enInterpolations.length) {
          structuralWarnings.push({
            key,
            arValue: arVal,
            enValue: enVal,
            warning: `عدم تطابق في حكايات المحتوى الديناميكي (أقواس {}) في العربية تبلغ ${arInterpolations.length} والإنجليزية تبلغ ${enInterpolations.length}`
          });
        }

        // Aggregate duplicates
        if (!arValueToKeys[arVal]) arValueToKeys[arVal] = [];
        arValueToKeys[arVal].push(key);
        
        if (!enValueToKeys[enVal]) enValueToKeys[enVal] = [];
        enValueToKeys[enVal].push(key);
      }
    });

    // Extract duplicate definitions (where different keys share the same translation)
    const duplicateTranslations: QAReport['duplicateTranslations'] = [];
    Object.entries(arValueToKeys).forEach(([value, keys]) => {
      if (keys.length > 1) {
        duplicateTranslations.push({ value, keys, language: 'ar' });
      }
    });
    Object.entries(enValueToKeys).forEach(([value, keys]) => {
      if (keys.length > 1) {
        duplicateTranslations.push({ value, keys, language: 'en' });
      }
    });

    // Calculate score
    const totalChecks = allKeys.length * 2;
    const failuresCount = missingKeys.length + potentialUntranslated.length + structuralWarnings.length;
    const integrityPercentage = Math.round(Math.max(0, Math.min(100, ((totalChecks - failuresCount) / totalChecks) * 100)));

    return {
      scannedKeysCount: allKeys.length,
      missingKeys,
      potentialUntranslated,
      duplicateTranslations,
      structuralWarnings,
      integrityPercentage
    };
  }
};

// Initialize custom overrides right away
localizationEngine.loadCustomOverrides();

export default i18n;

