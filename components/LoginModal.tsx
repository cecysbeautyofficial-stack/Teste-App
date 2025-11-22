

import React, { useState } from 'react';
import { User } from '../types';
import { XIcon, GoogleIcon } from './Icons';
import { useAppContext } from '../contexts/AppContext';
import Logo from './Logo';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (user: User) => void;
  onSwitchToRegister: () => void;
  onForgotPassword: () => void;
  users: User[];
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin, onSwitchToRegister, onForgotPassword, users }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { t } = useAppContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const foundUser = users.find(
      user => user.email.toLowerCase() === email.toLowerCase()
    );

    if (foundUser) {
      // Check against stored password or default to '123456' for legacy mock users without a password field set
      const isValidPassword = foundUser.password ? foundUser.password === password : password === '123456';
      
      if (isValidPassword) {
        onLogin(foundUser);
      } else {
        setError(t('invalidCredentials'));
      }
    } else {
      setError(t('invalidCredentials'));
    }
  };

  const handleGoogleLogin = () => {
    // Simulate Google Login
    const googleUser: User = {
        id: 'google-user-123',
        name: 'Google User',
        email: 'user@gmail.com',
        role: 'reader',
        status: 'active',
        avatarUrl: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
        notificationsEnabled: true,
        emailNotificationsEnabled: true,
        preferredPaymentMethod: 'M-Pesa',
        password: 'google-auth-user'
    };
    
    // Check if user already exists in the passed `users` array to persist role/data if simulating persistence
    const existingUser = users.find(u => u.email === googleUser.email);
    
    onLogin(existingUser || googleUser);
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
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-100 text-gray-800 font-semibold py-3 px-4 rounded-lg border border-gray-300 dark:border-gray-200 hover:bg-gray-50 transition-colors mb-6"
            >
                <GoogleIcon className="h-5 w-5" />
                {t('continueWithGoogle')}
            </button>

            <div className="relative flex py-2 items-center mb-6">
                <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 dark:text-gray-500 text-sm">{t('or')}</span>
                <div className="flex-grow border-t border-gray-300 dark:border-gray-700"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-400">{t('email')}</label>
                    <input 
                        type="email" 
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white transition-colors"
                        placeholder="seu@email.com"
                        required 
                    />
                </div>
                <div>
                    <label htmlFor="password"className="block text-sm font-medium text-gray-700 dark:text-gray-400">{t('password')}</label>
                    <input 
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white transition-colors"
                        placeholder="••••••••"
                        required
                    />
                </div>
                
                <div className="flex items-center justify-between !mt-2">
                    <div className="flex items-center">
                        <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-800" />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 dark:text-gray-400">{t('rememberMe')}</label>
                    </div>
                    <div className="text-sm">
                        <button type="button" onClick={onForgotPassword} className="font-semibold text-brand-blue dark:text-indigo-400 hover:underline">{t('forgotPassword')}</button>
                    </div>
                </div>

                {error && (
                    <p className="text-sm text-red-500 text-center">{error}</p>
                )}

                <button type="submit" className="w-full bg-brand-red hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors !mt-6">
                    {t('login')}
                </button>
            </form>

            <div className="mt-4 p-3 bg-gray-50 dark:bg-[#121212] rounded-md text-xs text-gray-600 dark:text-gray-400 space-y-1 border border-gray-200 dark:border-gray-700">
              <h4 className="font-bold mb-1 text-gray-900 dark:text-white">Contas de Teste:</h4>
              <p><strong>Admin:</strong> <code className="bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded">admin@leiaaqui.com</code></p>
              <p><strong>Autor:</strong> <code className="bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded">author@leiaaqui.com</code></p>
              <p><strong>Leitor:</strong> <code className="bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded">reader@leiaaqui.com</code></p>
              <p className="mt-1"><strong>Senha para todos:</strong> <code className="bg-gray-200 dark:bg-gray-800 px-1 py-0.5 rounded">123456</code></p>
            </div>
            
            <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                {t('dontHaveAccount')}{' '}
                <button onClick={onSwitchToRegister} className="font-semibold text-brand-blue dark:text-indigo-400 hover:underline">
                    {t('registerHere')}
                </button>
            </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
