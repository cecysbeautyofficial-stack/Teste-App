
import React from 'react';
import { View } from '../types';
import { HomeIcon, LibraryIcon, StoreIcon, SearchIcon } from './Icons';
import { useAppContext } from '../contexts/AppContext';

interface BottomNavProps {
  activeView: View;
  setView: (view: View) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setView }) => {
  const { t } = useAppContext();
  const navItems = [
    { name: 'home', label: t('home'), icon: HomeIcon },
    { name: 'library', label: t('library'), icon: LibraryIcon },
    { name: 'book_store', label: t('bookStore'), icon: StoreIcon },
    { name: 'search', label: t('search'), icon: SearchIcon },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 pointer-events-none z-40">
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-sm h-16 bg-white/60 dark:bg-black/50 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-full flex items-center justify-around shadow-2xl pointer-events-auto ring-1 ring-white/20 dark:ring-white/5">
        {navItems.map(item => {
          const isActive = activeView === item.name;
          return (
            <button
              key={item.name}
              onClick={() => setView(item.name as View)}
              className={`flex flex-col items-center justify-center text-[10px] w-16 transition-all duration-300 ${
                isActive 
                ? 'text-brand-blue dark:text-indigo-400 scale-110 font-bold' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <item.icon className={`h-6 w-6 mb-0.5 ${isActive ? 'stroke-2 drop-shadow-sm' : 'stroke-1'}`} isActive={isActive} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
