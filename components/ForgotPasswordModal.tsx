
import React, { useState } from 'react';
import { XIcon, MailIcon, CheckCircleIcon } from './Icons';
import { useAppContext } from '../contexts/AppContext';
import { User } from '../types';
import { supabase } from '../services/supabaseClient';

interface ForgotPasswordModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
  users: User[];
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose, onSwitchToLogin, users }) => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useAppContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Check if it's a mock user first to simulate success
    const mockUser = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (mockUser) {
        setTimeout(() => {
            setIsSent(true);
            setIsLoading(false);
        }, 1000);
        return;
    }

    try {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin,
        });

        if (resetError) {
            console.error("Reset password error:", resetError);
            // If rate limited or other specific error, show it
            if (resetError.message.includes("Rate limit")) {
                 throw new Error("Muitas tentativas. Tente novamente mais tarde.");
            }
            // Otherwise, proceed as if successful to prevent email enumeration (security best practice), 
            // or throw error for debugging if status is 5xx
            if (resetError.status && resetError.status >= 500) {
                throw new Error("Erro no servidor. Tente novamente.");
            }
        }
        
        setIsSent(true);
    } catch (err: any) {
        setError(err.message || "Erro ao enviar email de recuperação.");
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
            {isSent ? (
                 <div className="text-center animate-fade-in-down">
                    <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">{t('recoveryEmailSent')}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">{t('recoveryEmailSentDesc')}</p>
                    <button 
                        onClick={onSwitchToLogin}
                        className="w-full bg-brand-blue dark:bg-indigo-600 hover:bg-brand-blue/90 dark:hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                    >
                        {t('backToLogin')}
                    </button>
                 </div>
            ) : (
                <>
                    <h2 className="text-2xl font-bold text-center mb-4">{t('recoverPassword')}</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">{t('enterEmailRecover')}</p>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email-recover" className="block text-sm font-medium text-gray-700 dark:text-gray-400">{t('email')}</label>
                            <div className="relative mt-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MailIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input 
                                    type="email" 
                                    id="email-recover"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-[#121212] text-gray-900 dark:text-white transition-colors"
                                    placeholder="seu@email.com"
                                    required 
                                />
                            </div>
                        </div>

                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

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
                            ) : t('sendRecoveryLink')}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm">
                        <button onClick={onSwitchToLogin} className="font-semibold text-brand-blue dark:text-indigo-400 hover:underline">
                            {t('backToLogin')}
                        </button>
                    </p>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
