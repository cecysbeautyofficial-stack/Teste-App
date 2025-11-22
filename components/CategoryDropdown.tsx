
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from './Icons';
import { useAppContext } from '../contexts/AppContext';

interface CategoryDropdownProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({ categories, selectedCategory, onSelectCategory }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { t } = useAppContext();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (category: string | null) => {
        onSelectCategory(category);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-white/40 dark:bg-black/30 text-gray-700 dark:text-white border border-white/40 dark:border-white/10 rounded-full px-5 py-2.5 text-sm font-bold flex items-center space-x-2 hover:bg-white/60 dark:hover:bg-black/50 transition-colors shadow-sm backdrop-blur-md"
            >
                <span>{selectedCategory || t('sections')}</span>
                <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white/80 dark:bg-black/80 border border-white/40 dark:border-white/10 backdrop-blur-2xl rounded-xl shadow-2xl z-50 animate-fade-in-down overflow-hidden">
                    <div className="px-4 py-2 bg-white/20 dark:bg-white/5 border-b border-gray-100/50 dark:border-white/10">
                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('categories')}</span>
                    </div>
                    <ul className="py-1 max-h-64 overflow-y-auto custom-scrollbar">
                        <li>
                            <button
                                onClick={() => handleSelect(null)}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-white/50 dark:hover:bg-white/10 transition-colors ${!selectedCategory ? 'font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20' : 'text-gray-700 dark:text-gray-200'}`}
                            >
                                {t('allCategories')}
                            </button>
                        </li>
                        {categories.map(category => (
                            <li key={category}>
                                <button
                                    onClick={() => handleSelect(category)}
                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-white/50 dark:hover:bg-white/10 transition-colors ${selectedCategory === category ? 'font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20' : 'text-gray-700 dark:text-gray-200'}`}
                                >
                                    {category}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <style>{`
                @keyframes fade-in-down {
                    0% {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    100% {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-down {
                    animation: fade-in-down 0.2s ease-out forwards;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(156, 163, 175, 0.5);
                    border-radius: 20px;
                }
            `}</style>
        </div>
    );
};

export default CategoryDropdown;
