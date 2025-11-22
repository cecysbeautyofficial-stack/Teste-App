
import React, { useState, useRef } from 'react';
import { User, PaymentMethod } from '../types';
import { XIcon, SparklesIcon } from './Icons';
import { useAppContext } from '../contexts/AppContext';

interface AccountSettingsModalProps {
  user: User;
  onClose: () => void;
  onSave: (updatedData: Partial<User> & { avatarFile?: File; newPassword?: string }) => void;
  isAdminEditing?: boolean;
  paymentMethods: PaymentMethod[];
  onBecomeAuthor?: () => void; // New prop
}

const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({ user, onClose, onSave, paymentMethods, isAdminEditing = false, onBecomeAuthor }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.avatarUrl || null);
  const [preferredPaymentMethod, setPreferredPaymentMethod] = useState(user.preferredPaymentMethod || (Array.isArray(paymentMethods) && paymentMethods.length > 0 ? paymentMethods[0].name : ''));
  const [notificationsEnabled, setNotificationsEnabled] = useState(user.notificationsEnabled || false);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(user.emailNotificationsEnabled || false);
  const [role, setRole] = useState(user.role);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useAppContext();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
        alert(t('passwordMismatch'));
        return;
    }

    onSave({ 
        name, 
        email, 
        avatarFile: avatarFile || undefined,
        preferredPaymentMethod,
        notificationsEnabled,
        emailNotificationsEnabled,
        ...(isAdminEditing && { role }),
        ...(newPassword ? { newPassword } : {})
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#212121] border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl w-full max-w-md transform transition-all relative text-gray-900 dark:text-white max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white z-10">
          <XIcon className="h-6 w-6" />
        </button>
        <div className="p-8">
            <h2 className="text-2xl font-bold text-center mb-6">{isAdminEditing ? 'Edit User' : t('accountSettings')}</h2>
            
            <div className="flex flex-col items-center mb-6">
                <img src={avatarPreview || `https://i.pravatar.cc/150?u=${user.id}`} alt="Profile" className="w-24 h-24 rounded-full object-cover mb-4 border-2 border-gray-200 dark:border-gray-700" />
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                    {t('changePhoto')}
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label htmlFor="name-settings" className="block text-sm font-medium text-gray-700 dark:text-gray-400">{t('fullName')}</label>
                    <input 
                        type="text" 
                        id="name-settings"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white transition-colors"
                        required 
                    />
                </div>
                <div>
                    <label htmlFor="email-settings" className="block text-sm font-medium text-gray-700 dark:text-gray-400">{t('email')}</label>
                    <input 
                        type="email" 
                        id="email-settings"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white transition-colors"
                        required
                    />
                </div>
                
                {isAdminEditing && (
                    <div>
                        <label htmlFor="role-settings" className="block text-sm font-medium text-gray-700 dark:text-gray-400">Role</label>
                        <select
                            id="role-settings"
                            value={role}
                            onChange={(e) => setRole(e.target.value as 'reader' | 'author' | 'admin')}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white transition-colors"
                        >
                            <option value="reader">Reader</option>
                            <option value="author">Author</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                )}

                <div>
                    <label htmlFor="payment-method-settings" className="block text-sm font-medium text-gray-700 dark:text-gray-400">{t('paymentMethod')}</label>
                    <select
                        id="payment-method-settings"
                        value={preferredPaymentMethod}
                        onChange={(e) => setPreferredPaymentMethod(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white transition-colors"
                    >
                        {Array.isArray(paymentMethods) && paymentMethods.map((method) => (
                            <option key={method.id} value={method.name}>{method.name}</option>
                        ))}
                    </select>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                     <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">{t('changePassword')}</h3>
                     <div className="space-y-3">
                        <div>
                            <label htmlFor="new-password" className="block text-xs font-medium text-gray-600 dark:text-gray-400">{t('newPassword')}</label>
                            <input 
                                type="password" 
                                id="new-password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white transition-colors"
                            />
                        </div>
                        <div>
                            <label htmlFor="confirm-password" className="block text-xs font-medium text-gray-600 dark:text-gray-400">{t('confirmPassword')}</label>
                            <input 
                                type="password" 
                                id="confirm-password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white transition-colors"
                            />
                        </div>
                     </div>
                </div>

                <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('enableNotifications')}</span>
                        <button
                            type="button"
                            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                            className={`${notificationsEnabled ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900`}
                            role="switch"
                            aria-checked={notificationsEnabled}
                        >
                            <span
                                className={`${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                            />
                        </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('enableEmailNotifications')}</span>
                        <button
                            type="button"
                            onClick={() => setEmailNotificationsEnabled(!emailNotificationsEnabled)}
                            className={`${emailNotificationsEnabled ? 'bg-indigo-500' : 'bg-gray-300 dark:bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900`}
                            role="switch"
                            aria-checked={emailNotificationsEnabled}
                        >
                            <span
                                className={`${emailNotificationsEnabled ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                            />
                        </button>
                    </div>
                </div>

                {!isAdminEditing && user.role === 'reader' && onBecomeAuthor && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                         <button 
                            type="button"
                            onClick={() => {
                                onClose();
                                onBecomeAuthor();
                            }}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
                        >
                            <SparklesIcon className="h-5 w-5" />
                            {t('becomeAuthor')}
                        </button>
                        <p className="text-xs text-center text-gray-500 mt-2">{t('becomeAuthorDesc')}</p>
                    </div>
                )}
                
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors !mt-6">
                    {t('saveChanges')}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsModal;
