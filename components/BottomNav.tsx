
import React from 'react';
import { View } from '../types';
import { HomeIcon, LibraryIcon, StoreIcon, NewspaperIcon, UsersIcon, HeadphonesIcon } from './Icons';
import { useAppContext } from '../contexts/AppContext';

interface BottomNavProps {
  activeView: View;
  setView: (view: View) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setView }) => {
  const { t } = useAppContext();
  const navItems = [
    { name: 'home', label: t('home'), icon: HomeIcon },
    { name: 'book_store', label: t('bookStore'), icon: StoreIcon },
    { name: 'audiobooks', label: t('audiobooks'), icon: HeadphonesIcon },
    { name: 'authors', label: t('authors'), icon: UsersIcon },
    { name: 'blog', label: t('news'), icon: NewspaperIcon },
    { name: 'library', label: t('library'), icon: LibraryIcon },
  ];

  return (
    <>
      {/* Mobile Bottom Bar (Fixed, Full Width) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 dark:bg-[#0f0f0f]/90 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 z-50 flex justify-around items-center px-2 pb-safe">
        {navItems.map(item => {
          const isActive = activeView === item.name;
          return (
            <button
              key={item.name}
              onClick={() => setView(item.name as View)}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
                isActive 
                ? 'text-brand-blue dark:text-indigo-400' 
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
              }`}
            >
              <item.icon className={`h-6 w-6 mb-1 ${isActive ? 'fill-current' : 'stroke-current'}`} isActive={isActive} />
              <span className="text-[10px] font-medium truncate max-w-[60px]">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Desktop Bottom Pill (Floating) */}
      <div className="hidden md:block fixed bottom-0 left-0 right-0 h-24 pointer-events-none z-40">
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md h-16 bg-white/60 dark:bg-black/50 backdrop-blur-2xl border border-white/40 dark:border-white/10 rounded-full flex items-center justify-around shadow-2xl pointer-events-auto ring-1 ring-white/20 dark:ring-white/5 px-1">
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
                <span className="truncate w-full text-center">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default BottomNav;
