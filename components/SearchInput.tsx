
import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, XIcon, ClockIcon } from './Icons';
import { useAppContext } from '../contexts/AppContext';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  suggestions?: string[];
  historyKey: string;
  placeholder: string;
  className?: string;
  autoFocus?: boolean;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onSearch,
  suggestions = [],
  historyKey,
  placeholder,
  className = '',
  autoFocus = false,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { t } = useAppContext();

  useEffect(() => {
    const savedHistory = localStorage.getItem(`search_history_${historyKey}`);
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse search history", e);
      }
    }
  }, [historyKey]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocus = () => {
    setShowDropdown(true);
  };

  const saveToHistory = (term: string) => {
    if (!term.trim()) return;
    const newHistory = [term, ...history.filter(h => h !== term)].slice(0, 5); // Keep last 5
    setHistory(newHistory);
    localStorage.setItem(`search_history_${historyKey}`, JSON.stringify(newHistory));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveToHistory(value);
      setShowDropdown(false);
      if (onSearch) onSearch(value);
    }
  };

  const handleSuggestionClick = (term: string) => {
    onChange(term);
    saveToHistory(term);
    setShowDropdown(false);
    if (onSearch) onSearch(term);
  };

  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory([]);
    localStorage.removeItem(`search_history_${historyKey}`);
  };

  const filteredSuggestions = value
    ? suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase())).slice(0, 8)
    : [];

  const showHistory = !value && history.length > 0;
  const showSuggestions = value && filteredSuggestions.length > 0;

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
        </div>
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full bg-white/40 dark:bg-black/20 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-gray-900 dark:text-white shadow-sm placeholder-gray-500 dark:placeholder-gray-400 transition-all focus:bg-white/60 dark:focus:bg-black/40 hover:bg-white/50 dark:hover:bg-black/30"
          autoFocus={autoFocus}
        />
        {value && (
            <button 
                onClick={() => {
                    onChange('');
                    // Keep focus if desired, or let it blur
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
                <XIcon className="h-4 w-4" />
            </button>
        )}
      </div>

      {showDropdown && (showHistory || showSuggestions) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/80 dark:bg-black/80 border border-white/40 dark:border-white/10 backdrop-blur-2xl rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in-down">
          {showHistory && (
            <div>
              <div className="flex justify-between items-center px-4 py-2 bg-white/20 dark:bg-white/5 border-b border-gray-100/50 dark:border-white/10">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('searchHistory')}</span>
                <button onClick={handleClearHistory} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                  {t('clearHistory')}
                </button>
              </div>
              <ul>
                {history.map((term, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handleSuggestionClick(term)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-white/10 flex items-center gap-3 transition-colors"
                    >
                      <ClockIcon className="h-4 w-4 text-gray-400" />
                      {term}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {showSuggestions && (
            <div>
               {!showHistory && (
                  <div className="px-4 py-2 bg-white/20 dark:bg-white/5 border-b border-gray-100/50 dark:border-white/10">
                     <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t('suggestions')}</span>
                  </div>
               )}
              <ul>
                {filteredSuggestions.map((suggestion, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-white/10 flex items-center gap-3 transition-colors"
                    >
                      <SearchIcon className="h-4 w-4 text-gray-400" />
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchInput;
