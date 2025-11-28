
import React, { useState } from 'react';
import { User } from '../types';
import { XIcon, MailIcon, SparklesIcon, EyeIcon, EyeOffIcon, GoogleIcon } from './Icons';
import { useAppContext } from '../contexts/AppContext';
import Logo from './Logo';
import { supabase } from '../services/supabaseClient';

interface RegisterModalProps {
  onClose: () => void;
  onRegister: (user: Omit<User, 'id' | 'status'>, isAuthorFlow?: boolean) => void;
  onSwitchToLogin: () => void;
  initialIsAuthor?: boolean;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ onClose, onRegister, onSwitchToLogin, initialIsAuthor = false }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('Moçambique');
  const [whatsapp, setWhatsapp] = useState(''); 
  const [isAuthor, setIsAuthor] = useState(initialIsAuthor);
  const [emailPreferences, setEmailPreferences] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { t } = useAppContext();

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    setError('');
    try {
        // O login com Google serve tanto para login quanto para cadastro
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
    } catch (err: any) {
        console.error("Google sign up error:", err);
        setError(err.message || "Erro ao iniciar cadastro com Google.");
        setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password !== confirmPassword) {
        setError(t('passwordMismatch'));
        setIsLoading(false);
        return;
    }

    const finalName = username;

    try {
        // Create auth user in Supabase
        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: finalName,
                    whatsapp,
                    country,
                    role: isAuthor ? 'author' : 'reader',
                    status: isAuthor ? 'pending' : 'active',
                }
            }
        });

        if (signUpError) throw signUpError;

        if (isAuthor) {
             onRegister({
                email,
                password,
                name: finalName,
                role: 'author',
                whatsapp,
                country,
                emailNotificationsEnabled: emailPreferences
            }, true);
        } else {
            if (data.user) {
                setShowConfirmation(true);
            }
        }

    } catch (err: any) {
        console.error("Registration error:", err);
        setError(err.message || "Erro ao criar conta.");
    } finally {
        setIsLoading(false);
    }
  };

  if (showConfirmation) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[1000] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-[#212121] border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl w-full max-w-md p-8 relative text-gray-900 dark:text-white" onClick={e => e.stopPropagation()}>
                <div className="flex flex-col items-center text-center animate-fade-in-down">
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-4 rounded-full mb-6">
                        <MailIcon className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{t('confirmEmailTitle')}</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-8 text-sm leading-relaxed">
                        {t('confirmEmailMessage', { email: email })}
                    </p>
                    <button 
                        onClick={onSwitchToLogin}
                        className="w-full bg-brand-blue dark:bg-indigo-600 hover:bg-brand-blue/90 dark:hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                    >
                        {t('goToLogin')}
                    </button>
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[1000] p-4 overflow-y-auto" onClick={onClose}>
      <div 
        className="w-full max-w-6xl bg-white dark:bg-[#0d1117] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[700px] relative" 
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white z-20 bg-white/10 backdrop-blur-md rounded-full p-2 transition-colors">
            <XIcon className="h-6 w-6" />
        </button>

        {/* Left Side - Visual (Dark/Cosmic) */}
        <div className="w-full md:w-5/12 bg-black relative overflow-hidden flex flex-col justify-between p-8 md:p-12">
            {/* Background Effect */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#050505] to-black"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
            
            <div className="relative z-10">
                <Logo className="justify-start scale-110 origin-left mb-8 filter brightness-0 invert" />
                
                <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight tracking-tight mb-6">
                    Crie sua <br/>
                    conta gratuita
                </h2>
                
                <p className="text-gray-400 text-lg font-medium max-w-xs leading-relaxed">
                    Explore o universo literário. Publique suas histórias e conecte-se com leitores de todo o mundo.
                </p>
            </div>

            {/* 3D Elements Simulation (Bottom) */}
            <div className="relative z-10 mt-12 h-48 w-full flex items-end justify-center gap-4 perspective-1000">
                 {/* Floating Element 1 */}
                 <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl shadow-[0_10px_30px_rgba(124,58,237,0.5)] flex items-center justify-center transform -rotate-12 translate-y-4 animate-pulse">
                    <span className="text-4xl filter drop-shadow-md">📚</span>
                 </div>
                 {/* Floating Element 2 */}
                 <div className="w-20 h-20 bg-gradient-to-tr from-blue-500 to-cyan-400 rounded-full shadow-[0_10px_30px_rgba(6,182,212,0.5)] flex items-center justify-center transform translate-y-[-20px] animate-bounce duration-[3000ms]">
                    <span className="text-4xl filter drop-shadow-md">🚀</span>
                 </div>
                 {/* Floating Element 3 */}
                 <div className="w-16 h-16 bg-gradient-to-bl from-pink-500 to-rose-500 rounded-xl shadow-[0_10px_30px_rgba(244,63,94,0.5)] flex items-center justify-center transform rotate-12 translate-y-8">
                    <span className="text-3xl filter drop-shadow-md">✍️</span>
                 </div>
            </div>
        </div>

        {/* Right Side - Form (White/Clean) */}
        <div className="w-full md:w-7/12 bg-white dark:bg-[#0d1117] p-8 md:p-12 lg:px-20 flex flex-col justify-center overflow-y-auto">
            <div className="max-w-md mx-auto w-full">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Cadastre-se no Leia Aqui</h3>

                <button
                    type="button"
                    onClick={handleGoogleSignUp}
                    className="w-full mb-6 flex items-center justify-center gap-3 bg-white dark:bg-white/5 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 transition-colors"
                >
                    <GoogleIcon className="h-5 w-5" />
                    {t('signUpWithGoogle')}
                </button>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white dark:bg-[#0d1117] text-gray-500">
                            {t('or')}
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email<span className="text-red-500">*</span></label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white dark:bg-[#0d1117] border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="ex: alice@exemplo.com"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha<span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white dark:bg-[#0d1117] border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 pr-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="8+ caracteres"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none transition-transform duration-200 hover:scale-110 active:scale-95"
                                >
                                    {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar Senha<span className="text-red-500">*</span></label>
                            <div className="relative">
                                <input 
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-white dark:bg-[#0d1117] border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 pr-10 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    placeholder="Repita a senha"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none transition-transform duration-200 hover:scale-110 active:scale-95"
                                >
                                    {showConfirmPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome de Usuário<span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-white dark:bg-[#0d1117] border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="Seu nome único"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">Apenas caracteres alfanuméricos e hífens.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">País/Região<span className="text-red-500">*</span></label>
                        <select 
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full bg-white dark:bg-[#0d1117] border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none"
                        >
                            <option value="Moçambique">Moçambique</option>
                            <option value="Angola">Angola</option>
                            <option value="Portugal">Portugal</option>
                            <option value="Brasil">Brasil</option>
                            <option value="Cabo Verde">Cabo Verde</option>
                            <option value="Outro">Outro</option>
                        </select>
                    </div>

                    <div className="pt-2 bg-gray-50 dark:bg-[#161b22] p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative flex items-center mt-0.5">
                                <input 
                                    type="checkbox" 
                                    checked={isAuthor} 
                                    onChange={(e) => setIsAuthor(e.target.checked)}
                                    className="peer h-5 w-5 cursor-pointer transition-all appearance-none rounded shadow hover:shadow-md border border-gray-300 checked:bg-brand-blue checked:border-brand-blue dark:border-gray-600 bg-white accent-brand-blue" 
                                />
                                <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                                    </svg>
                                </span>
                            </div>
                            <div>
                                <span className="block text-sm font-bold text-gray-900 dark:text-white group-hover:text-brand-blue transition-colors">
                                    {t('registerAsAuthor')}
                                </span>
                                <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Marque se você pretende publicar e vender seus livros.
                                </span>
                            </div>
                        </label>
                    </div>

                    <div>
                        <label className="flex items-center gap-3 cursor-pointer">
                             <input 
                                type="checkbox" 
                                checked={emailPreferences} 
                                onChange={(e) => setEmailPreferences(e.target.checked)}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 accent-brand-blue"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                Receber atualizações ocasionais de produtos e anúncios
                            </span>
                        </label>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm rounded-md border border-red-100 dark:border-red-800">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-[#238636] hover:bg-[#2ea043] text-white font-bold py-3 px-4 rounded-lg transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {isLoading ? 'Criando conta...' : 'Criar conta'}
                    </button>
                </form>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-6 text-center leading-relaxed">
                    Ao criar uma conta, você concorda com os <a href="#" className="text-blue-500 hover:underline">Termos de Serviço</a>. Para mais informações sobre privacidade, veja a <a href="#" className="text-blue-500 hover:underline">Declaração de Privacidade</a>.
                </p>
                
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-900 dark:text-white">
                        Já tem uma conta? <button onClick={onSwitchToLogin} className="text-blue-500 hover:underline font-medium">Entrar →</button>
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
