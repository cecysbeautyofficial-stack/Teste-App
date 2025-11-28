
import React, { useState, useEffect } from 'react';
import { NewsArticle, User, Comment } from '../types';
import { ArrowLeftIcon, ClockIcon, HashtagIcon, ChatBubbleIcon, ShieldCheckIcon, PaperAirplaneIcon } from './Icons';
import { useAppContext } from '../contexts/AppContext';

interface NewsDetailProps {
    news: NewsArticle;
    onBack: () => void;
    currentUser: User | null;
    onAddComment: (newsId: string, content: string) => void;
    onLogin: () => void;
}

const NewsDetail: React.FC<NewsDetailProps> = ({ news, onBack, currentUser, onAddComment, onLogin }) => {
    const { t } = useAppContext();
    const [commentContent, setCommentContent] = useState('');
    const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, answer: 0 });
    const [captchaInput, setCaptchaInput] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        generateCaptcha();
    }, []);

    const generateCaptcha = () => {
        const num1 = Math.floor(Math.random() * 10);
        const num2 = Math.floor(Math.random() * 10);
        setCaptcha({ num1, num2, answer: num1 + num2 });
        setCaptchaInput('');
    };

    const handleSubmitComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentContent.trim()) return;

        if (parseInt(captchaInput) !== captcha.answer) {
            setError('Resposta do anti-spam incorreta. Tente novamente.');
            generateCaptcha();
            return;
        }

        onAddComment(news.id, commentContent);
        setCommentContent('');
        setError('');
        generateCaptcha();
    };

    return (
        <div className="fixed inset-0 bg-white/95 dark:bg-black/95 backdrop-blur-xl z-50 overflow-y-auto text-gray-900 dark:text-white animate-slide-up">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-gray-200/50 dark:border-white/10">
                <div className="max-w-[1000px] mx-auto px-4 py-4 flex items-center justify-between">
                    <button onClick={onBack} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-brand-blue dark:hover:text-white transition-colors">
                        <ArrowLeftIcon className="h-5 w-5" />
                        <span className="font-medium">Voltar</span>
                    </button>
                </div>
            </div>

            <div className="max-w-[800px] mx-auto px-4 py-8 pb-24">
                <img 
                    src={news.imageUrl} 
                    alt={news.title} 
                    className="w-full h-[300px] sm:h-[400px] object-cover rounded-2xl shadow-xl mb-8"
                />
                
                <div className="flex items-center gap-4 mb-6 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/10 px-3 py-1 rounded-full">
                        <ClockIcon className="h-4 w-4" />
                        <span>{new Date(news.date).toLocaleDateString()}</span>
                    </div>
                    <span>•</span>
                    <span>Por Admin</span>
                </div>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
                    {news.title}
                </h1>

                <div className="prose prose-lg dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {news.description}
                </div>

                <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8">
                    <h3 className="text-sm font-bold uppercase text-gray-500 dark:text-gray-400 mb-4">Tópicos Relacionados</h3>
                    <div className="flex flex-wrap gap-2">
                        {news.hashtags.map(tag => (
                            <span key={tag} className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium text-sm">
                                <HashtagIcon className="h-3 w-3" />
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Comments Section */}
                <div className="mt-16 pt-10 border-t border-gray-200 dark:border-gray-800">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
                        <ChatBubbleIcon className="h-6 w-6" />
                        Comentários <span className="text-gray-500 text-lg">({news.comments?.length || 0})</span>
                    </h3>

                    {/* Comment List */}
                    <div className="space-y-8 mb-12">
                        {news.comments && news.comments.length > 0 ? (
                            news.comments.map((comment) => (
                                <div key={comment.id} className="flex gap-4 animate-fade-in-down">
                                    <img 
                                        src={comment.userAvatar || `https://i.pravatar.cc/150?u=${comment.userId}`} 
                                        alt={comment.userName} 
                                        className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-gray-200 dark:border-gray-700"
                                    />
                                    <div className="flex-1">
                                        <div className="bg-gray-50 dark:bg-[#1a1a1a] rounded-2xl rounded-tl-none p-4 border border-gray-100 dark:border-gray-800">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-sm text-gray-900 dark:text-white">{comment.userName}</h4>
                                                <span className="text-xs text-gray-500">{new Date(comment.date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-gray-700 dark:text-gray-300 text-sm">{comment.content}</p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 italic text-center py-8 bg-gray-50/50 dark:bg-white/5 rounded-lg">Seja o primeiro a comentar!</p>
                        )}
                    </div>

                    {/* Add Comment Form */}
                    {currentUser ? (
                        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-4">Deixe seu comentário</h4>
                            <form onSubmit={handleSubmitComment} className="space-y-4">
                                <textarea
                                    rows={3}
                                    className="w-full bg-gray-50 dark:bg-black/20 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white resize-none"
                                    placeholder="Escreva sua opinião..."
                                    value={commentContent}
                                    onChange={(e) => setCommentContent(e.target.value)}
                                    required
                                />
                                
                                {/* Anti-Spam Challenge */}
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800/30">
                                    <div className="flex items-center gap-2 text-sm font-medium text-indigo-800 dark:text-indigo-200">
                                        <ShieldCheckIcon className="h-5 w-5" />
                                        <span>Anti-Spam: Quanto é {captcha.num1} + {captcha.num2}?</span>
                                    </div>
                                    <input 
                                        type="number" 
                                        className="w-20 bg-white dark:bg-black/40 border border-indigo-200 dark:border-indigo-700 rounded px-2 py-1 text-center font-bold"
                                        value={captchaInput}
                                        onChange={(e) => setCaptchaInput(e.target.value)}
                                        required
                                    />
                                </div>

                                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                                <div className="flex justify-end">
                                    <button 
                                        type="submit" 
                                        className="bg-brand-blue hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-full transition-colors flex items-center gap-2 shadow-lg"
                                        disabled={!commentContent.trim() || !captchaInput}
                                    >
                                        <span>Publicar</span>
                                        <PaperAirplaneIcon className="h-4 w-4 transform rotate-90" />
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="text-center py-8 bg-gray-50 dark:bg-[#1a1a1a] rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                            <p className="text-gray-600 dark:text-gray-400 mb-4">Faça login para participar da discussão.</p>
                            <button onClick={onLogin} className="text-brand-blue font-bold hover:underline">Entrar na minha conta</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NewsDetail;
