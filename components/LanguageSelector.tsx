
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext, Language } from '../contexts/AppContext';
import { GlobeIcon, CheckCircleIcon } from './Icons';

const LanguageSelector: React.FC = () => {
    const { language, setLanguage, t } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLanguageChange = (lang: Language) => {
        setLanguage(lang);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-white/20 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors backdrop-blur-sm"
                aria-label="Change language or currency"
            >
                <GlobeIcon className="h-6 w-6" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white/80 dark:bg-black/80 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-xl shadow-2xl z-50 animate-fade-in-down">
                    <div className="p-3 border-b border-gray-200/50 dark:border-white/10">
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">{t('languageSelector')}</p>
                    </div>
                    <ul className="py-1">
                        <li>
                            <button
                                onClick={() => handleLanguageChange('pt')}
                                className="w-full flex justify-between items-center px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                            >
                                <span>Português</span>
                                {language === 'pt' && <CheckCircleIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => handleLanguageChange('en')}
                                className="w-full flex justify-between items-center px-4 py-2 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                            >
                                <span>English</span>
                                {language === 'en' && <CheckCircleIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default LanguageSelector;
