
import React from 'react';
import { User, Notification, View } from '../types';
import Logo from './Logo';
import UserControls from './UserControls';

interface HeaderProps {
    currentUser: User | null;
    onLogin: () => void;
    onRegister: () => void;
    onLogout: () => void;
    onNavigateToDashboard: () => void;
    onNavigateHome: () => void;
    onNavigateSettings: () => void;
    // Notifications
    notifications?: Notification[];
    onMarkAsRead?: (id: string) => void;
    onMarkAllAsRead?: () => void;
    onNavigate?: (view: View, relatedId?: string) => void;
    onViewEmail?: (html: string) => void;
}

const Header: React.FC<HeaderProps> = ({ 
    currentUser, 
    onLogin, 
    onRegister, 
    onLogout, 
    onNavigateToDashboard, 
    onNavigateHome,
    onNavigateSettings,
    notifications, onMarkAsRead, onMarkAllAsRead, onNavigate, onViewEmail
}) => {
  return (
    <header className="sticky top-0 z-50 transition-colors duration-300 border-b border-white/30 dark:border-white/10 bg-white/40 dark:bg-black/40 backdrop-blur-xl shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-16">
        <div className="flex items-center justify-between h-20">
          <button onClick={onNavigateHome} className="flex-shrink-0 hover:opacity-80 transition-opacity outline-none">
            <Logo />
          </button>
          
          <UserControls 
            currentUser={currentUser}
            onLogin={onLogin}
            onRegister={onRegister}
            onLogout={onLogout}
            onNavigateToDashboard={onNavigateToDashboard}
            onNavigateSettings={onNavigateSettings}
            notifications={notifications}
            onMarkAsRead={onMarkAsRead}
            onMarkAllAsRead={onMarkAllAsRead}
            onNavigate={onNavigate}
            onViewEmail={onViewEmail}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
