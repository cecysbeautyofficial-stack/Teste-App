
import React, { useRef, useState, useEffect } from 'react';
import { User, Notification, View } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { SunIcon, MoonIcon, ChartBarIcon, CogIcon, LogoutIcon, SearchIcon } from './Icons';
import LanguageSelector from './LanguageSelector';
import NotificationDropdown from './NotificationDropdown';

interface UserControlsProps {
    currentUser: User | null;
    onLogin: () => void;
    onRegister: () => void;
    onLogout: () => void;
    onNavigateToDashboard: () => void;
    onNavigateSettings: () => void;
    // Notification props
    notifications?: Notification[];
    onMarkAsRead?: (id: string) => void;
    onMarkAllAsRead?: () => void;
    onNavigate?: (view: View, relatedId?: string) => void;
    onViewEmail?: (html: string) => void;
}

const UserControls: React.FC<UserControlsProps> = ({ 
    currentUser, onLogin, onRegister, onLogout, onNavigateToDashboard, onNavigateSettings,
    notifications = [], onMarkAsRead = () => {}, onMarkAllAsRead = () => {}, onNavigate = (_v: View, _id?: string) => {}, onViewEmail
}) => {
    const { t, theme, toggleTheme } = useAppContext();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
            setIsUserMenuOpen(false);
          }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
      }, []);

    return (
        <div className="flex items-center gap-2 sm:gap-4">
             <button 
                onClick={() => onNavigate('search')}
                className="p-1.5 sm:p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-white/20 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors backdrop-blur-sm"
                title={t('search')}
            >
                <SearchIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

             <button 
                onClick={toggleTheme} 
                className="p-1.5 sm:p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-white/20 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors backdrop-blur-sm"
                title={t('toggleTheme')}
            >
                {theme === 'dark' ? <SunIcon className="h-5 w-5 sm:h-6 sm:w-6" /> : <MoonIcon className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
            
            <LanguageSelector />

            {currentUser && (
                <NotificationDropdown 
                    notifications={notifications}
                    onMarkAsRead={onMarkAsRead}
                    onMarkAllAsRead={onMarkAllAsRead}
                    onNavigate={onNavigate}
                    onViewEmail={onViewEmail}
                    triggerClass="p-1.5 sm:p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-white/20 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors relative backdrop-blur-sm"
                />
            )}

            {currentUser ? (
                <div className="relative" ref={userMenuRef}>
                    <button onClick={() => setIsUserMenuOpen(prev => !prev)} className="flex items-center gap-2 focus:outline-none ml-1">
                        <img src={currentUser.avatarUrl || `https://i.pravatar.cc/150?u=${currentUser.id}`} alt={currentUser.name} className="h-8 w-8 sm:h-10 sm:w-10 rounded-full border-2 border-white/50 dark:border-white/10 object-cover shadow-sm" />
                    </button>
                     {isUserMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white/80 dark:bg-black/80 backdrop-blur-2xl rounded-xl shadow-2xl py-1 z-50 border border-white/40 dark:border-white/10 animate-fade-in-down">
                            <div className="px-4 py-3 border-b border-gray-200/50 dark:border-white/10">
                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{currentUser.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{currentUser.email}</p>
                            </div>
                            <button 
                                onClick={() => {
                                    onNavigateToDashboard();
                                    setIsUserMenuOpen(false);
                                }} 
                                className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                            >
                                <ChartBarIcon className="h-4 w-4" />
                                {t('dashboard')}
                            </button>
                            <button 
                                onClick={() => {
                                    onNavigateSettings();
                                    setIsUserMenuOpen(false);
                                }} 
                                className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-white/50 dark:hover:bg-white/10 transition-colors"
                            >
                                <CogIcon className="h-4 w-4" />
                                {t('accountSettings')}
                            </button>
                            <div className="border-t border-gray-200/50 dark:border-white/10 my-1"></div>
                            <button 
                                onClick={() => {
                                    onLogout();
                                    setIsUserMenuOpen(false);
                                }} 
                                className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-white/50 dark:hover:bg-white/10 transition-colors font-medium"
                            >
                                <LogoutIcon className="h-4 w-4" />
                                {t('signOut')}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <div className="hidden sm:flex items-center gap-6">
                        <button onClick={onLogin} className="font-semibold text-brand-blue dark:text-gray-300 hover:text-brand-red dark:hover:text-indigo-400 transition-colors">
                            {t('login')}
                        </button>
                        <button 
                            onClick={onRegister}
                            className="bg-brand-red hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full transition-colors text-sm shadow-lg shadow-red-500/20"
                        >
                            {t('registerHere')}
                        </button>
                    </div>
                    {/* Mobile Login Button */}
                    <div className="sm:hidden ml-1">
                        <button 
                            onClick={onLogin} 
                            className="font-bold text-xs bg-brand-red/90 hover:bg-brand-red text-white px-4 py-2 rounded-full shadow-md transition-colors"
                        >
                        {t('login')}
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
export default UserControls;
