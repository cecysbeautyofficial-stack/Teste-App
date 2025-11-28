
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { XIcon, EyeIcon, EyeOffIcon, GoogleIcon } from './Icons';
import { useAppContext } from '../contexts/AppContext';
import Logo from './Logo';
import { supabase } from '../services/supabaseClient';

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
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { t, showToast } = useAppContext();

  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          redirectTo: window.location.origin
        },
      });
      if (error) throw error;
      // O redirecionamento acontecerá automaticamente, então não precisamos setar loading false aqui
    } catch (err: any) {
      console.error("Google login error:", err);
      setError(err.message || "Erro ao iniciar login com Google.");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const trimmedEmail = email.trim();

    // Handle Remember Me logic
    if (rememberMe) {
      localStorage.setItem('rememberedEmail', trimmedEmail);
    } else {
      localStorage.removeItem('rememberedEmail');
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (data.user) {
        const userData: User = {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name || 'User',
            role: data.user.user_metadata?.role || 'reader',
            status: 'active',
            avatarUrl: data.user.user_metadata?.avatarUrl,
            whatsapp: data.user.user_metadata?.whatsapp,
            notificationsEnabled: true,
            emailNotificationsEnabled: true
        };
        onLogin(userData);
        showToast(t('loginSuccess'), 'success');
      }
    } catch (err: any) {
      // Fallback to check mock users for development/testing credentials if Supabase login fails
      const mockUser = users.find(u => u.email.toLowerCase() === trimmedEmail.toLowerCase() && u.password === password);
      if (mockUser) {
           onLogin(mockUser);
           showToast(t('loginSuccess'), 'success');
           setIsLoading(false);
           return;
      }

      console.error("Login error:", err);
      setError(t('invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[1000] p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#212121] border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl w-full max-w-sm transform transition-all relative text-gray-900 dark:text-white" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
          <XIcon className="h-6 w-6" />
        </button>
        <div className="p-6 sm:p-8">
            <div className="flex justify-center mb-6">
              <Logo />
            </div>
            
            <h2 className="text-2xl font-bold text-center mb-6">{t('loginToYourAccount')}</h2>

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
                <div className="relative">
                    <label htmlFor="password"className="block text-sm font-medium text-gray-700 dark:text-gray-400">{t('password')}</label>
                    <div className="relative mt-1">
                        <input 
                            type={showPassword ? "text" : "password"}
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white transition-colors"
                            placeholder="••••••••"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none transition-transform duration-200 hover:scale-110 active:scale-95"
                            title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                        >
                            {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
                
                <div className="flex items-center justify-between !mt-2">
                    <div className="flex items-center">
                        <input 
                            id="remember-me" 
                            name="remember-me" 
                            type="checkbox" 
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded accent-indigo-600 cursor-pointer"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none">{t('rememberMe')}</label>
                    </div>
                    <div className="text-sm">
                        <button type="button" onClick={onForgotPassword} className="font-semibold text-brand-blue dark:text-indigo-400 hover:underline">{t('forgotPassword')}</button>
                    </div>
                </div>

                {error && (
                    <p className="text-sm text-red-500 text-center">{error}</p>
                )}

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full bg-brand-red hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition-colors !mt-6 flex justify-center items-center"
                >
                    {isLoading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : t('login')}
                </button>
            </form>

            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-[#212121] text-gray-500">
                            {t('or')}
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full mt-4 flex items-center justify-center gap-3 bg-white dark:bg-white/5 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                >
                    <GoogleIcon className="h-5 w-5" />
                    {t('continueWithGoogle')}
                </button>
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
