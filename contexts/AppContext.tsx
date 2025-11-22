
import React, { createContext, useState, useCallback, useContext, ReactNode, useEffect } from 'react';
import { translations, TranslationKey } from '../translations';

export type Language = 'pt' | 'en';
export type Currency = 'MZN';
export type Theme = 'light' | 'dark';

type Replacements = { [key: string]: string | number };

interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
}

interface AppContextType {
  language: Language;
  currency: Currency;
  theme: Theme;
  setLanguage: (lang: Language) => void;
  toggleTheme: () => void;
  t: (key: TranslationKey, replacements?: Replacements) => string;
  formatPrice: (priceInMzn: number) => string;
  toast: ToastMessage | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('pt');
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem('livroflix-theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
            return savedTheme;
        }
    }
    return 'dark'; 
  });
  const [toast, setToast] = useState<ToastMessage | null>(null);
  
  const currency: Currency = 'MZN';

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
    localStorage.setItem('livroflix-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const t = useCallback((key: TranslationKey, replacements?: Replacements): string => {
    const translationSet = translations[language] || translations.en;
    let text = translationSet[key] || String(key);

    if (replacements) {
        Object.keys(replacements).forEach(rKey => {
            text = text.replace(`{${rKey}}`, String(replacements[rKey]));
        });
    }

    return text;
  }, [language]);

  const formatPrice = useCallback((priceInMzn: number): string => {
    if (priceInMzn === 0) {
        return t('freeBooks').split(' ')[0]; // Returns "Gratuitos" or "Free"
    }
    return `${priceInMzn.toFixed(2).replace('.', ',')} MTn`;
  }, [t]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
        setToast(prev => prev ? { ...prev, visible: false } : null);
        setTimeout(() => setToast(null), 300); // Allow animation to finish
    }, 3000);
  }, []);

  const value = { language, currency, theme, setLanguage, toggleTheme, t, formatPrice, toast, showToast };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
