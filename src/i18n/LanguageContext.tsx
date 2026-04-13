import React, { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { translations, Language } from './translations';
import { useSiteContent } from '@/hooks/useSiteContent';

type Translations = typeof translations.pt;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

function deepMerge(base: unknown, override: unknown): unknown {
  if (override === null || override === undefined) return base;
  if (typeof base !== 'object' || base === null) return override !== '' ? override : base;
  if (Array.isArray(base)) {
    if (!Array.isArray(override) || override.length === 0) return base;
    return base.map((item, i) =>
      i < (override as unknown[]).length ? deepMerge(item, (override as unknown[])[i]) : item
    );
  }
  const result = { ...(base as Record<string, unknown>) };
  for (const key of Object.keys(override as Record<string, unknown>)) {
    const val = (override as Record<string, unknown>)[key];
    if (val !== '' && val !== null && val !== undefined) {
      result[key] = deepMerge(result[key], val);
    }
  }
  return result;
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('pt');

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    document.documentElement.lang = lang;
  }, []);

  const { data: contentMap } = useSiteContent(language);

  const t = useMemo(() => {
    const base = translations[language] as Translations;
    if (!contentMap || contentMap.size === 0) return base;

    let merged = { ...base } as Record<string, unknown>;
    for (const [section, value] of contentMap.entries()) {
      if (merged[section] !== undefined) {
        merged[section] = deepMerge(merged[section], value);
      }
    }
    return merged as Translations;
  }, [language, contentMap]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
