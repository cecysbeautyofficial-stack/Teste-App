

import React, { useState } from 'react';
import { User } from '../types';
import { XIcon, GoogleIcon } from './Icons';
import { useAppContext } from '../contexts/AppContext';
import Logo from './Logo';

interface RegisterModalProps {
  onClose: () => void;
  onRegister: (user: Omit<User, 'id' | 'status'>, isAuthorFlow?: boolean) => void;
  onSwitchToLogin: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ onClose, onRegister, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isAuthor, setIsAuthor] = useState(false);
  const { t } = useAppContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: Omit<User, 'id' | 'status'> = {
      name,
      email,
      password,
      whatsapp,
      role: isAuthor ? 'author' : 'reader',
    };
    
    // If it's an author, we pass a flag so App.tsx knows to open the onboarding modal
    onRegister(newUser, isAuthor);
  };

  const handleGoogleRegister = () => {
    const newUser: Omit<User, 'id' | 'status'> = {
      name: 'Google User',
      email: 'user@gmail.com',
      password: 'google-auth-user',
      whatsapp: '',
      role: isAuthor ? 'author' : 'reader',
      avatarUrl: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
    };
    onRegister(newUser, isAuthor);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#212121] border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl w-full max-w-sm transform transition-all relative text-gray-900 dark:text-white" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white">
          <XIcon className="h-6 w-6" />
        </button>
        <div className="p-6 sm:p-8">
            <div className="flex justify-center mb-6">
              <Logo />
            </div>
            
            <button 
                onClick={handleGoogleRegister}
                className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-100 text-gray-800 font-semibold py-3 px-4 rounded-lg border border-gray-300 dark:border-gray-200 hover:bg-gray-50 transition-colors mb-6"
            >
                <GoogleIcon className="h-5 w-5" />
                {t('signUpWithGoogle')}
            </button>

            <div className="relative flex py-2 items-center mb-6">
                <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 dark:text-gray-500 text-sm">{t('or')}</span>
                <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name-reg" className="block text-sm font-medium text-gray-700 dark:text-gray-400">{t('fullName')}</label>
                    <input 
                        type="text" 
                        id="name-reg"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white transition-colors"
                        placeholder={t('yourName')}
                        required 
                    />
                </div>
                <div>
                    <label htmlFor="whatsapp-reg" className="block text-sm font-medium text-gray-700 dark:text-gray-400">{t('whatsapp')}</label>
                    <input 
                        type="tel" 
                        id="whatsapp-reg"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white transition-colors"
                        placeholder="84 123 4567"
                        required 
                    />
                </div>
                 <div>
                    <label htmlFor="email-reg" className="block text-sm font-medium text-gray-700 dark:text-gray-400">{t('email')}</label>
                    <input 
                        type="email" 
                        id="email-reg"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white transition-colors"
                        placeholder="seu@email.com"
                        required 
                    />
                </div>
                <div>
                    <label htmlFor="password-reg" className="block text-sm font-medium text-gray-700 dark:text-gray-400">{t('password')}</label>
                    <input 
                        type="password"
                        id="password-reg"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white transition-colors"
                        placeholder={t('createAStrongPassword')}
                        required
                    />
                </div>
                <div className="flex items-center">
                    <input
                        id="is-author"
                        name="is-author"
                        type="checkbox"
                        checked={isAuthor}
                        onChange={(e) => setIsAuthor(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800"
                    />
                    <label htmlFor="is-author" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        {t('registerAsAuthor')}
                    </label>
                </div>
                <button type="submit" className="w-full bg-brand-red hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors !mt-6">
                    {t('createAccount')}
                </button>
            </form>
            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                {t('alreadyHaveAccount')}{' '}
                <button onClick={onSwitchToLogin} className="font-semibold text-brand-blue dark:text-indigo-400 hover:underline">
                    {t('loginHere')}
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
