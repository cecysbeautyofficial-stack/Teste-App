
import React, { useRef, useEffect, useState } from 'react';
import { Notification, View } from '../types';
import { BellIcon, CheckCircleIcon, InformationCircleIcon, XIcon, ShoppingCartIcon, SparklesIcon, MailIcon } from './Icons';
import { useAppContext } from '../contexts/AppContext';

interface NotificationDropdownProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNavigate: (view: View, relatedId?: string) => void;
  onViewEmail?: (html: string) => void;
  triggerClass?: string;
  hideBadge?: boolean;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ 
    notifications, onMarkAsRead, onMarkAllAsRead, onNavigate, onViewEmail, triggerClass, hideBadge = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t, language } = useAppContext();

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: Notification) => {
      if (!notification.read) {
          onMarkAsRead(notification.id);
      }
      if (notification.linkTo) {
          onNavigate(notification.linkTo, notification.relatedId);
          setIsOpen(false);
      }
  };
  
  const getIcon = (type: Notification['type']) => {
      switch(type) {
          case 'success': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
          case 'alert': return <SparklesIcon className="h-5 w-5 text-red-500" />; 
          case 'warning': return <InformationCircleIcon className="h-5 w-5 text-yellow-500" />;
          case 'info': default: return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      }
  };

  const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays <= 1) {
          return date.toLocaleTimeString(language === 'pt' ? 'pt-BR' : 'en-US', { hour: '2-digit', minute: '2-digit' });
      }
      return date.toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={triggerClass || "p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-white/20 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors relative backdrop-blur-sm"}
      >
        <BellIcon className="h-5 w-5 md:h-6 md:w-6" />
        {!hideBadge && unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white dark:ring-black animate-pulse shadow-md">
                {unreadCount > 9 ? '9+' : unreadCount}
            </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-[90vw] sm:w-96 max-w-[calc(100vw-2rem)] bg-white/80 dark:bg-black/80 backdrop-blur-2xl rounded-xl shadow-2xl ring-1 ring-black ring-opacity-5 z-50 border border-white/40 dark:border-white/10 overflow-hidden left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-0 animate-fade-in-down">
            <div className="px-4 py-3 border-b border-gray-200/50 dark:border-white/10 flex justify-between items-center bg-white/20 dark:bg-white/5">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">{t('notifications')}</h3>
                {unreadCount > 0 && (
                    <button 
                        onClick={onMarkAllAsRead} 
                        className="text-xs text-brand-blue dark:text-indigo-400 hover:underline font-semibold"
                    >
                        {t('markAllRead')}
                    </button>
                )}
            </div>
            
            <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {notifications.length > 0 ? (
                    <div className="divide-y divide-gray-100/50 dark:divide-white/5">
                        {notifications.map(notification => (
                            <div 
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`px-4 py-3 hover:bg-white/50 dark:hover:bg-white/10 transition-colors cursor-pointer flex gap-3 ${!notification.read ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-l-4 border-indigo-500' : 'border-l-4 border-transparent'}`}
                            >
                                <div className="mt-1 flex-shrink-0">
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className={`text-sm font-semibold truncate pr-2 ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                            {notification.title}
                                        </p>
                                        <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                                            {formatDate(notification.date)}
                                        </span>
                                    </div>
                                    <p className={`text-xs leading-relaxed mb-2 ${!notification.read ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {notification.message}
                                    </p>
                                    {notification.emailHtml && onViewEmail && (
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onViewEmail(notification.emailHtml!);
                                                setIsOpen(false);
                                                if (!notification.read) onMarkAsRead(notification.id);
                                            }}
                                            className="flex items-center gap-1 text-[10px] font-bold text-brand-blue dark:text-indigo-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                                        >
                                            <MailIcon className="h-3 w-3" />
                                            Ver Email
                                        </button>
                                    )}
                                </div>
                                {!notification.read && (
                                    <div className="flex items-center self-center">
                                        <div className="w-2 h-2 bg-brand-red rounded-full shadow-sm"></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-8 text-center">
                        <div className="bg-gray-100/50 dark:bg-white/5 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                            <BellIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('noNotifications')}</p>
                    </div>
                )}
            </div>
            
            <div className="bg-gray-50/30 dark:bg-white/5 px-4 py-2 text-center border-t border-gray-200/50 dark:border-white/10">
                 <button 
                    onClick={() => {
                        onNavigate('dashboard', 'notifications');
                        setIsOpen(false);
                    }} 
                    className="text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-brand-blue dark:hover:text-white"
                >
                    {t('viewAll')}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
