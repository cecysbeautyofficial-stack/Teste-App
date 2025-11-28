
import React, { useState, useMemo, useEffect } from 'react';
import { User, Book, Purchase, PaymentMethod, Author, Notification, Chat, NewsArticle } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import { 
    HomeIcon, UsersIcon, BookOpenIcon, CurrencyDollarIcon, 
    ChartBarIcon, PencilIcon, TrashIcon, PlusIcon, SearchIcon, 
    SparklesIcon, XIcon, UploadIcon, DocumentTextIcon, EyeIcon,
    StarIcon, AnnotationIcon, BellIcon, CheckCircleIcon, InformationCircleIcon, TagIcon,
    ChartPieIcon, UserPlusIcon, GlobeIcon, ChatBubbleIcon, ClockIcon, WhatsAppIcon, NewspaperIcon, HeadphonesIcon,
    DownloadIcon
} from '../Icons';
import { generateBookDescription, generateBookCover } from '../../services/geminiService';
import Pagination from '../Pagination';
import AccountSettingsModal from '../AccountSettingsModal';
import BookStatsModal from './BookStatsModal';
import SearchInput from '../SearchInput';
import * as pdfjsLib from 'pdfjs-dist';

const pdfjs = (pdfjsLib as any).default || pdfjsLib;
if (pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
}

interface AdminDashboardProps {
  user: User;
  allUsers: User[];
  allBooks: Book[];
  allPurchases: Purchase[];
  onUpdateUser: (userId: string, updatedData: Partial<User> & { avatarFile?: File; newPassword?: string }) => void;
  onDeleteUser: (userId: string) => void;
  onUpdateBook: (bookId: string, updatedData: Partial<Book>) => void;
  onDeleteBook: (bookId: string) => void;
  paymentMethods: PaymentMethod[];
  onUpdatePaymentMethod: (methodId: string, updatedData: Partial<PaymentMethod>) => void;
  onDeletePaymentMethod: (methodId: string) => void;
  onAddPaymentMethod: (newMethodData: Omit<PaymentMethod, 'id'>) => void;
  onAddBook: (newBookData: Omit<Book, 'id' | 'author' | 'coverUrl' | 'rating' | 'sales' | 'readers' | 'publishDate'> & { coverImage?: File; bookFile?: File; audioFile?: File }, authorOverride?: Author) => void;
  categories: string[];
  authors: Author[];
  onAddCategory: (category: string) => void;
  onAddAuthor: (author: Author) => void;
  activeTab: string;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onReadBook: (book: Book) => void;
  onSelectBook: (book: Book) => void;
  chats: Chat[];
  onOpenChat: (chatId: string) => void;
  news: NewsArticle[];
  onAddNews: (news: Omit<NewsArticle, 'id' | 'date' | 'authorId'> & { imageFile?: File }) => void;
  onUpdateNews: (id: string, news: Partial<NewsArticle> & { imageFile?: File }) => void;
  onDeleteNews: (id: string) => void;
  onAddUser: (userData: Omit<User, 'id' | 'status'> & { status: 'active' | 'pending' | 'blocked' }) => void;
  onAddNotification?: (notification: Omit<Notification, 'id' | 'date' | 'read'>) => void;
}

const AnalyticsGraph: React.FC<{ data: number[], labels: string[] }> = ({ data, labels }) => {
    const max = Math.max(...data, 1);
    return (
        <div className="w-full h-48 flex items-end justify-between gap-2 sm:gap-4 mt-4 px-2">
            {data.map((value, idx) => (
                <div key={idx} className="flex flex-col items-center flex-1 h-full justify-end group relative">
                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 dark:bg-white text-white dark:text-black text-xs font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap z-10">
                        {value.toLocaleString()}
                    </div>
                    <div 
                        className="w-full max-w-[30px] sm:max-w-[50px] bg-indigo-500 hover:bg-indigo-400 transition-all duration-500 rounded-t-sm"
                        style={{ height: `${(value / max) * 80}%` }} 
                    ></div>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 mt-2">{labels[idx]}</span>
                </div>
            ))}
        </div>
    )
}

const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
  const { t } = useAppContext();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[150] p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#212121] border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl w-full max-w-md transform transition-all relative text-gray-900 dark:text-white" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
          <p className="text-gray-600 dark:text-gray-300">{message}</p>
        </div>
        <div className="px-6 py-4 bg-gray-50 dark:bg-[#1c1c1c] flex justify-end items-center gap-3 rounded-b-lg border-t border-gray-100 dark:border-gray-700">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
            {t('cancel')}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            {t('delete')}
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; trend?: string; onClick?: () => void }> = ({ title, value, icon, trend, onClick }) => (
    <div 
        onClick={onClick}
        className={`bg-white dark:bg-[#212121] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex items-center justify-between relative overflow-hidden group hover:border-indigo-500/50 transition-all ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
    >
        <div className="flex items-center space-x-4 z-10">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400">
                {icon}
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            </div>
        </div>
        {trend && (
             <div className="text-xs font-bold text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                 {trend}
             </div>
        )}
    </div>
);

const base64ToFile = (base64String: string, filename: string): File => {
    const arr = base64String.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
};

const FileInput: React.FC<{
    title: string;
    formats: string;
    size: string;
    icon: React.ReactNode;
    file: File | null;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    accept: string;
    error?: string | null;
    disabled?: boolean;
    previewImage?: string; // Added prop for existing image
}> = ({ title, formats, size, icon, file, onChange, accept, error, disabled, previewImage }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(previewImage || null);

    useEffect(() => {
        if (file && file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else if (!file && previewImage) {
            setPreviewUrl(previewImage);
        } else if (!file && !previewImage) {
            setPreviewUrl(null);
        }
    }, [file, previewImage]);

    return (
        <div className={`relative border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all overflow-hidden ${error ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
            {previewUrl ? (
                <div className="absolute inset-0 z-0">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover opacity-50 group-hover:opacity-40 transition-opacity" />
                    <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center">
                         <PencilIcon className="text-white h-8 w-8 mb-2 opacity-80" />
                         <span className="text-white font-bold text-sm shadow-black drop-shadow-md">Change Image</span>
                    </div>
                </div>
            ) : null}
            
            <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center relative z-10">
                {!previewUrl && <div className="text-gray-400 mb-3">{icon}</div>}
                <span className={`text-sm font-medium mb-1 ${previewUrl ? 'text-white drop-shadow-md' : 'text-gray-900 dark:text-white'}`}>{file ? file.name : title}</span>
                {!previewUrl && (
                    <>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mb-4">Click to upload</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-wider">{formats} • MAX. {size}</span>
                    </>
                )}
                <input type="file" className="hidden" accept={accept} onChange={onChange} disabled={disabled} />
            </label>
            {error && <p className="text-xs text-red-500 mt-2 relative z-10 bg-white/80 dark:bg-black/80 px-2 rounded">{error}</p>}
        </div>
    );
}

const UserDetailsModal: React.FC<{ user: User; onClose: () => void }> = ({ user, onClose }) => {
    const { t } = useAppContext();
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[120] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-[#212121] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl w-full max-w-2xl transform transition-all relative text-gray-900 dark:text-white" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">{t('applicationDetails')}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="h-5 w-5 text-gray-400" /></button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4 mb-2 bg-gray-50 dark:bg-[#2a2a2a] p-4 rounded-xl">
                        <img src={user.avatarUrl || `https://i.pravatar.cc/150?u=${user.id}`} className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-[#3e3e3e]" />
                        <div>
                            <h3 className="text-lg font-bold">{user.name}</h3>
                            <p className="text-sm text-gray-500">{user.email}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-200 rounded text-xs font-semibold capitalize">
                                    {user.role}
                                </span>
                                <span className="px-2 py-0.5 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded text-xs capitalize">
                                    {user.status}
                                </span>
                                {user.country && (
                                    <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200 rounded text-xs">
                                        <GlobeIcon className="h-3 w-3" />
                                        {user.country}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="text-md font-bold mb-3 text-gray-900 dark:text-white flex items-center gap-2">
                            <SparklesIcon className="h-5 w-5 text-indigo-500" />
                            Dados do Questionário
                        </h4>
                        {user.authorOnboardingData ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-lg border border-gray-100 dark:border-[#3e3e3e]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">🌱</span>
                                        <p className="text-xs font-bold text-gray-500 uppercase">{t('onboardingExpTitle')}</p>
                                    </div>
                                    <p className="font-medium pl-7">{t(user.authorOnboardingData.experienceLevel as any)}</p>
                                </div>
                                <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-lg border border-gray-100 dark:border-[#3e3e3e]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">📚</span>
                                        <p className="text-xs font-bold text-gray-500 uppercase">{t('onboardingGenreTitle')}</p>
                                    </div>
                                    <p className="font-medium pl-7">{t(user.authorOnboardingData.primaryGenre as any)}</p>
                                </div>
                                 <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-lg border border-gray-100 dark:border-[#3e3e3e]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">🎯</span>
                                        <p className="text-xs font-bold text-gray-500 uppercase">{t('onboardingGoalTitle')}</p>
                                    </div>
                                    <p className="font-medium pl-7">{t(user.authorOnboardingData.writingGoal as any)}</p>
                                </div>
                                 <div className="bg-white dark:bg-[#1a1a1a] p-4 rounded-lg border border-gray-100 dark:border-[#3e3e3e]">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-lg">🚀</span>
                                        <p className="text-xs font-bold text-gray-500 uppercase">{t('onboardingStatusTitle')}</p>
                                    </div>
                                    <p className="font-medium pl-7">{t(user.authorOnboardingData.publishingStatus as any)}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 dark:bg-[#2a2a2a] p-6 rounded-lg text-center">
                                <p className="text-sm text-gray-500 italic">Nenhum detalhe adicional disponível.</p>
                            </div>
                        )}
                    </div>
                </div>
                 <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-white">{t('cancel')}</button>
                </div>
            </div>
        </div>
    );
}

const AdminAddUserModal: React.FC<{
    onClose: () => void;
    onAddUser: (data: Omit<User, 'id' | 'status'> & { status: 'active' | 'pending' | 'blocked' }) => void;
}> = ({ onClose, onAddUser }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'reader' | 'author' | 'admin'>('reader');
    const [status, setStatus] = useState<'active' | 'pending' | 'blocked'>('active');
    const [whatsapp, setWhatsapp] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddUser({ name, email, role, status, whatsapp });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-[#212121] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl w-full max-w-lg transform transition-all relative text-gray-900 dark:text-white" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">Adicionar Usuário</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="h-5 w-5 text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Nome</label>
                        <input type="text" className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Email</label>
                        <input type="email" className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Função</label>
                        <select className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2" value={role} onChange={e => setRole(e.target.value as any)}>
                            <option value="reader">Leitor</option>
                            <option value="author">Autor</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Status</label>
                        <select className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2" value={status} onChange={e => setStatus(e.target.value as any)}>
                            <option value="active">Ativo</option>
                            <option value="pending">Pendente</option>
                            <option value="blocked">Bloqueado</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">WhatsApp (Opcional)</label>
                        <input type="tel" className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700">Cancelar</button>
                        <button type="submit" className="bg-brand-blue text-white px-4 py-2 text-sm font-bold rounded hover:bg-blue-700">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminAddNewsModal: React.FC<{
    onClose: () => void;
    onAddNews: (news: Omit<NewsArticle, 'id' | 'date' | 'authorId'> & { imageFile?: File }) => void;
    onUpdateNews?: (id: string, news: Partial<NewsArticle> & { imageFile?: File }) => void;
    news?: NewsArticle;
}> = ({ onClose, onAddNews, onUpdateNews, news }) => {
    const { t } = useAppContext();
    const [title, setTitle] = useState(news?.title || '');
    const [description, setDescription] = useState(news?.description || '');
    const [hashtags, setHashtags] = useState(news?.hashtags.join(', ') || '');
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description) {
            alert("Preencha título e descrição.");
            return;
        }

        const tags = hashtags.split(',').map(tag => tag.trim().replace(/^#/, '')).filter(tag => tag.length > 0);

        if (news && onUpdateNews) {
            onUpdateNews(news.id, {
                title,
                description,
                hashtags: tags,
                imageFile: imageFile || undefined
            });
        } else {
            if (!imageFile) {
                alert("Adicione uma imagem.");
                return;
            }
            onAddNews({
                title,
                description,
                hashtags: tags,
                imageUrl: '', 
                imageFile
            });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-[#212121] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl w-full max-w-xl transform transition-all relative text-gray-900 dark:text-white" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">{news ? 'Editar Notícia' : 'Adicionar Notícia'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="h-5 w-5 text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Título da Notícia</label>
                        <input type="text" className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2" value={title} onChange={e => setTitle(e.target.value)} required />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Descrição</label>
                        <textarea rows={5} className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2" value={description} onChange={e => setDescription(e.target.value)} required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Imagem de Destaque</label>
                        <FileInput 
                            title="Upload Imagem" 
                            formats="JPEG, PNG" 
                            size="5MB" 
                            icon={<UploadIcon className="h-8 w-8"/>} 
                            file={imageFile} 
                            onChange={handleImageChange} 
                            accept="image/*" 
                            previewImage={news?.imageUrl}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400 mb-1">Hashtags (separadas por vírgula)</label>
                        <input type="text" placeholder="ex: novidade, tecnologia, update" className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2" value={hashtags} onChange={e => setHashtags(e.target.value)} />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700">{t('cancel')}</button>
                        <button type="submit" className="bg-brand-red text-white px-4 py-2 text-sm font-bold rounded hover:bg-red-600">{news ? 'Salvar Alterações' : 'Publicar Notícia'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const AdminAddBookModal: React.FC<{ 
    onClose: () => void; 
    onAddBook: (data: Omit<Book, 'id' | 'author' | 'coverUrl' | 'rating' | 'sales' | 'readers' | 'publishDate'> & { coverImage?: File; bookFile?: File; audioFile?: File }, authorOverride?: Author) => void; 
    onUpdateBook?: (bookId: string, updatedData: Partial<Book>) => void;
    categories: string[];
    authors: Author[];
    book?: Book;
}> = ({ onClose, onAddBook, onUpdateBook, categories, authors, book }) => {
    const { t } = useAppContext();
    const [bookType, setBookType] = useState<'pdf' | 'audio'>((book?.audioUrl) ? 'audio' : 'pdf');
    const [title, setTitle] = useState(book?.title || '');
    const [description, setDescription] = useState(book?.description || '');
    const [category, setCategory] = useState(book?.category || '');
    const [price, setPrice] = useState(book?.price ? String(book.price) : '');
    const [pages, setPages] = useState(book?.pages || 0);
    const [duration, setDuration] = useState(book?.duration || '');
    const [language, setLanguage] = useState(book?.language || 'Português');
    const [isbn, setIsbn] = useState(book?.isbn || '');
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [bookFile, setBookFile] = useState<File | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [selectedAuthorId, setSelectedAuthorId] = useState(book?.author.id || '');
    const [fileError, setFileError] = useState<string | null>(null);
    const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
    const [isGeneratingCover, setIsGeneratingCover] = useState(false);

    const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setCoverImage(e.target.files[0]);
    };

    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    };

    const handleBookFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (bookType === 'pdf') {
            if (file.type !== 'application/pdf') {
                setFileError('O ficheiro deve ser um PDF.');
                setBookFile(null);
                return;
            }
            setFileError(null);
            setBookFile(file);
            
            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
                setPages(pdf.numPages);
            } catch (error) {
                console.error("Error counting PDF pages", error);
                setPages(0);
            }

        } else {
            const validTypes = ['audio/mpeg', 'audio/wav', 'audio/x-m4a', 'audio/mp4'];
            if (!validTypes.includes(file.type) && !file.name.endsWith('.mp3')) {
                 setFileError('Formato de áudio inválido (MP3, WAV, M4A).');
                 setAudioFile(null);
                 return;
            }
            setFileError(null);
            setAudioFile(file);

            const audio = new Audio(URL.createObjectURL(file));
            audio.onloadedmetadata = () => {
                setDuration(formatDuration(audio.duration));
            };
        }
    };

    const handleGenerateDescription = async () => {
        if (!title || !category || !selectedAuthorId) return;
        setIsGeneratingDesc(true);
        const author = authors.find(a => a.id === selectedAuthorId);
        const generatedDesc = await generateBookDescription(title, author?.name || '', category);
        setDescription(generatedDesc);
        setIsGeneratingDesc(false);
    };

    const handleGenerateCover = async () => {
        if (!title || !category || !selectedAuthorId) {
            alert("Preencha título, categoria e autor para gerar a capa.");
            return;
        }
        setIsGeneratingCover(true);
        const author = authors.find(a => a.id === selectedAuthorId);
        const authorName = author?.name || '';
        const base64Image = await generateBookCover(title, authorName, category, description);
        if (base64Image) {
            const file = base64ToFile(base64Image, `cover_${title.replace(/\s+/g, '_')}_ai.png`);
            setCoverImage(file);
        } else {
            alert("Não foi possível gerar a capa. Tente novamente.");
        }
        setIsGeneratingCover(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!book && (!coverImage || !title || !category || !price || !selectedAuthorId)) return;
        if (!book && bookType === 'pdf' && !bookFile) return;
        if (!book && bookType === 'audio' && !audioFile) return;

        if (book && onUpdateBook) {
            onUpdateBook(book.id, {
                title, description, category,
                price: parseFloat(price),
                pages: bookType === 'pdf' ? pages : undefined,
                duration: bookType === 'audio' ? duration : undefined,
                language,
                isbn: isbn || undefined
            });
        } else {
            const author = authors.find(a => a.id === selectedAuthorId);
            onAddBook({
                title, description, category,
                price: parseFloat(price),
                pages: bookType === 'pdf' ? pages : undefined,
                duration: bookType === 'audio' ? duration : undefined,
                language,
                isbn: isbn || undefined,
                currency: 'MZN',
                coverImage,
                bookFile: bookType === 'pdf' ? (bookFile || undefined) : undefined,
                audioFile: bookType === 'audio' ? (audioFile || undefined) : undefined,
            }, author);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-[#212121] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl w-full max-w-2xl transform transition-all relative text-gray-900 dark:text-white" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">{book ? 'Editar Livro' : t('addBook')}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="h-5 w-5 text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <input type="text" placeholder={t('bookTitle')} className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2" value={title} onChange={e => setTitle(e.target.value)} required />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <select className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2" value={category} onChange={e => setCategory(e.target.value)} required>
                            <option value="">{t('category')}...</option>
                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        <select className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2" value={selectedAuthorId} onChange={e => setSelectedAuthorId(e.target.value)} required disabled={!!book}>
                            <option value="">{t('author')}...</option>
                            {authors.map(author => <option key={author.id} value={author.id}>{author.name}</option>)}
                        </select>
                    </div>

                    <div className="relative">
                         <button type="button" onClick={handleGenerateDescription} disabled={isGeneratingDesc} className="absolute right-2 top-2 text-xs text-indigo-500 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full">
                            <SparklesIcon className="h-3 w-3" /> {isGeneratingDesc ? t('generating') : t('generateWithAI')}
                         </button>
                        <textarea rows={3} placeholder={t('description')} className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2" value={description} onChange={e => setDescription(e.target.value)} required />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <input type="number" placeholder={t('priceMZN')} className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2" value={price} onChange={e => setPrice(e.target.value)} required />
                         <select className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2" value={language} onChange={e => setLanguage(e.target.value)}>
                            <option value="Português">Português</option>
                            <option value="English">English</option>
                        </select>
                        <input 
                            type="text" 
                            placeholder="ISBN (Opcional)" 
                            className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2" 
                            value={isbn} 
                            onChange={e => setIsbn(e.target.value)} 
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-500">{t('bookCover')}</span>
                                <button 
                                    type="button" 
                                    onClick={handleGenerateCover}
                                    disabled={isGeneratingCover}
                                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1 disabled:opacity-50 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full transition-colors"
                                >
                                    {isGeneratingCover ? (
                                        <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <SparklesIcon className="h-3 w-3" />
                                    )}
                                    <span>{t('generateWithAI')}</span>
                                </button>
                            </div>
                            <FileInput title={t('bookCover')} formats="JPEG, PNG" size="5MB" icon={<UploadIcon className="h-8 w-8"/>} file={coverImage} onChange={handleCoverImageChange} accept="image/*" previewImage={book?.coverUrl} />
                        </div>
                        <div className="flex flex-col">
                            {!book && (
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-full p-0.5">
                                        <button
                                            type="button"
                                            onClick={() => { setBookType('pdf'); setAudioFile(null); }}
                                            className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${bookType === 'pdf' ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                                        >
                                            E-Book (PDF)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => { setBookType('audio'); setBookFile(null); }}
                                            className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${bookType === 'audio' ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-900'}`}
                                        >
                                            Audiobook
                                        </button>
                                    </div>
                                    {bookType === 'pdf' && pages > 0 && <span className="text-xs text-green-500 font-medium flex items-center gap-1"><DocumentTextIcon className="h-3 w-3"/> {pages} págs</span>}
                                    {bookType === 'audio' && duration && <span className="text-xs text-green-500 font-medium flex items-center gap-1"><ClockIcon className="h-3 w-3"/> {duration}</span>}
                                </div>
                            )}
                            {!book && (
                                <FileInput 
                                    title={bookType === 'pdf' ? t('bookFile') : 'Ficheiro de Áudio'} 
                                    formats={bookType === 'pdf' ? "PDF" : "MP3, WAV, M4A"} 
                                    size="50MB" 
                                    icon={bookType === 'pdf' ? <DocumentTextIcon className="h-8 w-8"/> : <HeadphonesIcon className="h-8 w-8"/>} 
                                    file={bookType === 'pdf' ? bookFile : audioFile} 
                                    onChange={handleBookFileChange} 
                                    accept={bookType === 'pdf' ? "application/pdf" : "audio/*"}
                                    error={fileError}
                                />
                            )}
                            {book && (
                                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center mt-4">
                                    <p className="text-sm text-gray-500">Arquivos não podem ser alterados na edição rápida.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700">{t('cancel')}</button>
                        <button type="submit" className="bg-brand-red text-white px-4 py-2 text-sm font-bold rounded hover:bg-red-600">{book ? t('saveChanges') : t('addBook')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    user, allUsers, allBooks, allPurchases, onUpdateUser, onDeleteUser, 
    onUpdateBook, onDeleteBook, paymentMethods, onUpdatePaymentMethod, 
    onDeletePaymentMethod, onAddPaymentMethod, onAddBook, categories,
    authors, onAddCategory, onAddAuthor,
    activeTab: initialTab, notifications, onMarkAsRead, onReadBook, onSelectBook, chats, onOpenChat,
    news, onAddNews, onUpdateNews, onDeleteNews, onAddUser, onAddNotification
}) => {
    const { t, formatPrice, language } = useAppContext();
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'pending_authors' | 'books' | 'financials' | 'notifications' | 'chats' | 'news'>(initialTab as any);
    const [confirmDelete, setConfirmDelete] = useState<{ type: 'user' | 'book' | 'paymentMethod' | 'news'; id: string; name: string } | null>(null);

    useEffect(() => {
        if (initialTab) setActiveTab(initialTab as any);
    }, [initialTab]);

    // Pagination States
    const [userPage, setUserPage] = useState(1);
    const [bookPage, setBookPage] = useState(1);
    const ITEMS_PER_PAGE = 8;

    // Search States
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [bookSearchQuery, setBookSearchQuery] = useState('');

    // Modal States
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [viewingStatsFor, setViewingStatsFor] = useState<Book | null>(null);
    const [isAddingBook, setIsAddingBook] = useState(false);
    const [isAddingNews, setIsAddingNews] = useState(false);
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [viewingUserDetails, setViewingUserDetails] = useState<User | null>(null);
    const [editingBook, setEditingBook] = useState<Book | null>(null);
    const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);

    // Derived Data
    const filteredUsers = useMemo(() => {
        return allUsers.filter(u => 
            u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
            u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
        );
    }, [allUsers, userSearchQuery]);

    const userSuggestions = useMemo(() => {
        return allUsers.map(u => u.name);
    }, [allUsers]);

    const filteredBooks = useMemo(() => {
        return allBooks.filter(b => b.title.toLowerCase().includes(bookSearchQuery.toLowerCase()));
    }, [allBooks, bookSearchQuery]);

    const bookSuggestions = useMemo(() => {
        return allBooks.map(b => b.title);
    }, [allBooks]);

    const paginatedUsers = useMemo(() => {
        return filteredUsers.slice((userPage - 1) * ITEMS_PER_PAGE, userPage * ITEMS_PER_PAGE);
    }, [filteredUsers, userPage]);

    const paginatedBooks = useMemo(() => {
        return filteredBooks.slice((bookPage - 1) * ITEMS_PER_PAGE, bookPage * ITEMS_PER_PAGE);
    }, [filteredBooks, bookPage]);

    const totalUserPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const totalBookPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);

    const pendingAuthors = useMemo(() => allUsers.filter(u => u.role === 'author' && u.status === 'pending'), [allUsers]);
    const pendingBooks = useMemo(() => allBooks.filter(b => b.status === 'Pending Approval'), [allBooks]);
    const recentUsers = useMemo(() => [...allUsers].sort((a, b) => (b.joinedDate ? new Date(b.joinedDate).getTime() : 0) - (a.joinedDate ? new Date(a.joinedDate).getTime() : 0)).slice(0, 5), [allUsers]);

    const stats = useMemo(() => {
        const totalRevenue = allPurchases.reduce((acc, p) => acc + p.amount, 0);
        return {
            users: allUsers.length,
            books: allBooks.length,
            revenue: totalRevenue,
            pendingAuthors: pendingAuthors.length,
            pendingBooks: pendingBooks.length
        };
    }, [allUsers, allBooks, allPurchases, pendingAuthors, pendingBooks]);

    const revenueData = useMemo(() => {
        // Mock data generator for graph
        return Array.from({ length: 7 }, () => Math.floor(Math.random() * 5000) + 1000);
    }, []);

    const last7DaysLabels = useMemo(() => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d.toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', { month: 'short', day: 'numeric' }));
        }
        return days;
    }, [language]);

    // New summary data for Overview
    const recentChats = useMemo(() => chats.slice(0, 5), [chats]); 
    
    const categoryStats = useMemo(() => {
        const stats: Record<string, number> = {};
        allBooks.forEach(b => {
            stats[b.category] = (stats[b.category] || 0) + 1;
        });
        return Object.entries(stats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5); // Top 5 categories
    }, [allBooks]);

    // Financials Tab State
    const [withdrawals, setWithdrawals] = useState([
        { id: 'w1', authorName: 'Beto Autor', amount: 4500, date: '2024-07-25', status: 'Pendente', authorId: 'author-user-01' },
        { id: 'w2', authorName: 'David Platt', amount: 12000, date: '2024-07-20', status: 'Pago', authorId: '2' },
        { id: 'w3', authorName: 'J.R.R. Tolkien', amount: 8900, date: '2024-07-18', status: 'Pago', authorId: '5' },
    ]);

    const salesReport = useMemo(() => {
        return allPurchases.map(p => {
            const book = allBooks.find(b => b.id === p.bookId);
            const user = allUsers.find(u => u.id === p.userId);
            return {
                ...p,
                bookTitle: book?.title || 'Unknown Book',
                buyerName: user?.name || 'Unknown User',
                authorName: book?.author.name || 'Unknown Author',
                commission: p.amount * 0.7, // 70% to author
                platformFee: p.amount * 0.3
            };
        }).sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
    }, [allPurchases, allBooks, allUsers]);

    const getNotificationIcon = (type: Notification['type']) => {
        switch(type) {
            case 'success': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            case 'alert': return <SparklesIcon className="h-5 w-5 text-red-500" />; 
            case 'warning': return <InformationCircleIcon className="h-5 w-5 text-yellow-500" />;
            case 'info': default: return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
        }
    };

    const openWhatsApp = (phoneNumber: string | undefined) => {
        if (!phoneNumber) return;
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        window.open(`https://wa.me/${cleanPhone}`, '_blank');
    };

    const handleProcessPayment = (id: string, authorName: string, amount: number) => {
        setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: 'Pago' } : w));
        
        // Find user to notify (assuming we can find by name or if we had IDs in mock)
        // Here we try to find by name since mock doesn't fully link withdrawals to user IDs strictly
        const authorUser = allUsers.find(u => u.name === authorName);
        if (authorUser && onAddNotification) {
            onAddNotification({
                userId: authorUser.id,
                title: 'Pagamento Processado',
                message: `Seu saque de ${formatPrice(amount)} foi processado com sucesso.`,
                type: 'success',
                linkTo: 'dashboard'
            });
        }
        // Fallback notification simulation if function not available
        alert(`Pagamento de ${formatPrice(amount)} para ${authorName} processado.`);
    };

    const handleExportCSV = () => {
        const headers = ['Data', 'Livro', 'Comprador', 'Valor', 'Comissão Autor', 'Taxa Plataforma'];
        const rows = salesReport.map(sale => [
            new Date(sale.purchaseDate).toLocaleDateString(),
            sale.bookTitle,
            sale.buyerName,
            sale.amount.toFixed(2),
            sale.commission.toFixed(2),
            sale.platformFee.toFixed(2)
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'relatorio_vendas.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen pb-20 md:pb-0 relative">
            {confirmDelete && (
                <ConfirmationModal
                    isOpen={!!confirmDelete}
                    onClose={() => setConfirmDelete(null)}
                    onConfirm={() => {
                        if (confirmDelete.type === 'user') onDeleteUser(confirmDelete.id);
                        else if (confirmDelete.type === 'book') onDeleteBook(confirmDelete.id);
                        else if (confirmDelete.type === 'paymentMethod') onDeletePaymentMethod(confirmDelete.id);
                        else if (confirmDelete.type === 'news') onDeleteNews(confirmDelete.id);
                    }}
                    title={t('delete')}
                    message={t('confirmDeleteGeneral', { type: confirmDelete.type === 'user' ? t('user') : confirmDelete.type === 'book' ? t('book') : confirmDelete.type === 'news' ? 'notícia' : t('paymentMethod'), name: confirmDelete.name })}
                />
            )}
            {editingUser && <AccountSettingsModal user={editingUser} onClose={() => setEditingUser(null)} onSave={(data) => { onUpdateUser(editingUser.id, data); setEditingUser(null); }} isAdminEditing paymentMethods={paymentMethods} />}
            {isAddingBook && <AdminAddBookModal onClose={() => setIsAddingBook(false)} onAddBook={onAddBook} categories={categories} authors={authors} />}
            {editingBook && <AdminAddBookModal onClose={() => setEditingBook(null)} onAddBook={onAddBook} onUpdateBook={onUpdateBook} categories={categories} authors={authors} book={editingBook} />}
            {isAddingNews && <AdminAddNewsModal onClose={() => setIsAddingNews(false)} onAddNews={onAddNews} />}
            {editingNews && <AdminAddNewsModal onClose={() => setEditingNews(null)} onAddNews={onAddNews} onUpdateNews={onUpdateNews} news={editingNews} />}
            {isAddingUser && <AdminAddUserModal onClose={() => setIsAddingUser(false)} onAddUser={onAddUser} />}
            {viewingStatsFor && <BookStatsModal book={viewingStatsFor} onClose={() => setViewingStatsFor(null)} allUsers={allUsers} allPurchases={allPurchases} salesData={[]} />}
            {viewingUserDetails && <UserDetailsModal user={viewingUserDetails} onClose={() => setViewingUserDetails(null)} />}

            <aside className="w-full md:w-64 bg-white dark:bg-[#1e1e1e] md:min-h-screen border-r border-gray-200 dark:border-gray-800 md:sticky md:top-[88px] md:h-[calc(100vh-88px)] md:self-start p-4 z-10">
                <div className="flex md:flex-col overflow-x-auto md:overflow-visible gap-2 md:gap-0 pb-2 md:pb-0 scrollbar-hide">
                    {['overview', 'users', 'pending_authors', 'books', 'news', 'financials', 'notifications', 'chats'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`group w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg mb-1 relative whitespace-nowrap ${activeTab === tab ? 'bg-indigo-50 dark:bg-indigo-900/40 text-brand-blue dark:text-indigo-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#3e3e3e]'}`}
                        >
                            {tab === 'overview' && <HomeIcon className="h-5 w-5" />}
                            {tab === 'users' && <UsersIcon className="h-5 w-5" />}
                            {tab === 'pending_authors' && <UserPlusIcon className="h-5 w-5" />}
                            {tab === 'books' && <BookOpenIcon className="h-5 w-5" />}
                            {tab === 'news' && <NewspaperIcon className="h-5 w-5" />}
                            {tab === 'financials' && <CurrencyDollarIcon className="h-5 w-5" />}
                            {tab === 'notifications' && <BellIcon className="h-5 w-5" />}
                            {tab === 'chats' && <ChatBubbleIcon className="h-5 w-5" />}
                            <span>{t(tab as any) || tab.charAt(0).toUpperCase() + tab.slice(1).replace('_', ' ')}</span>
                        </button>
                    ))}
                </div>
            </aside>

            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-fade-in-down">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard title={t('totalUsers')} value={stats.users.toLocaleString()} icon={<UsersIcon className="h-6 w-6"/>} trend="+12%" onClick={() => setActiveTab('users')} />
                            <StatCard title={t('booksOnPlatform')} value={stats.books.toLocaleString()} icon={<BookOpenIcon className="h-6 w-6"/>} trend="+5%" onClick={() => setActiveTab('books')} />
                            <StatCard title={t('totalRevenue')} value={formatPrice(stats.revenue)} icon={<CurrencyDollarIcon className="h-6 w-6"/>} trend="+8%" onClick={() => setActiveTab('financials')} />
                            <StatCard title={t('pendingApproval')} value={`${stats.pendingAuthors + stats.pendingBooks}`} icon={<UserPlusIcon className="h-6 w-6"/>} onClick={() => setActiveTab('pending_authors')} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Revenue Graph - Expanded for "Financials" Summary */}
                            <div className="lg:col-span-2 bg-white dark:bg-[#212121] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-2">
                                        <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
                                        <h3 className="font-bold text-gray-900 dark:text-white">{t('revenue')} (7 Dias)</h3>
                                    </div>
                                    <span className="text-sm text-green-500 font-medium bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded">+4.5%</span>
                                </div>
                                <AnalyticsGraph data={revenueData} labels={last7DaysLabels} />
                            </div>

                            {/* Combined Pending Actions - "Action Center" */}
                            <div className="bg-white dark:bg-[#212121] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <BellIcon className="h-5 w-5 text-orange-500" />
                                        Ações Pendentes
                                    </h3>
                                    {(stats.pendingAuthors > 0 || stats.pendingBooks > 0) && (
                                        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                                            {stats.pendingAuthors + stats.pendingBooks} Novos
                                        </span>
                                    )}
                                </div>
                                
                                <div className="flex-1 overflow-y-auto max-h-64 space-y-3 custom-scrollbar">
                                    {pendingAuthors.length === 0 && pendingBooks.length === 0 && (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400 py-8">
                                            <CheckCircleIcon className="h-10 w-10 text-green-500 mb-2 opacity-50" />
                                            <p className="text-sm">Tudo em dia!</p>
                                        </div>
                                    )}
                                    
                                    {pendingAuthors.map(u => (
                                        <div key={u.id} className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-orange-200 dark:bg-orange-800 rounded-full flex items-center justify-center text-orange-700 dark:text-orange-200 font-bold text-xs">
                                                    A
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">Novo Autor</p>
                                                    <p className="text-xs text-gray-500 truncate">{u.name}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setActiveTab('pending_authors')} className="text-xs font-bold text-indigo-600 hover:underline">Revisar</button>
                                        </div>
                                    ))}

                                    {pendingBooks.map(b => (
                                        <div key={b.id} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-200 font-bold text-xs">
                                                    L
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">Novo Livro</p>
                                                    <p className="text-xs text-gray-500 truncate">{b.title}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setActiveTab('books')} className="text-xs font-bold text-indigo-600 hover:underline">Revisar</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Secondary Stats Grid - New Summary Elements */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            
                            {/* Recent Users */}
                            <div className="bg-white dark:bg-[#212121] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <UsersIcon className="h-5 w-5 text-indigo-500" />
                                        Usuários Recentes
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    {recentUsers.map(u => (
                                        <div key={u.id} onClick={() => setViewingUserDetails(u)} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] rounded-lg transition-colors cursor-pointer">
                                            <img src={u.avatarUrl || `https://i.pravatar.cc/150?u=${u.id}`} className="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-gray-600" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{u.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{u.email}</p>
                                            </div>
                                            <div className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                {u.role}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Content/Category Distribution (Books Summary) */}
                            <div className="bg-white dark:bg-[#212121] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <ChartPieIcon className="h-5 w-5 text-purple-500" />
                                        Distribuição
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    {categoryStats.map(([category, count], idx) => (
                                        <div key={category} className="relative">
                                            <div className="flex justify-between text-sm mb-1">
                                                <span className="text-gray-700 dark:text-gray-300">{category}</span>
                                                <span className="font-bold text-gray-900 dark:text-white">{count}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                <div 
                                                    className={`h-2 rounded-full ${['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500'][idx % 5]}`} 
                                                    style={{ width: `${(count / allBooks.length) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                    {categoryStats.length === 0 && <p className="text-gray-500 text-sm text-center py-4">Sem livros.</p>}
                                </div>
                            </div>

                            {/* Recent Chats (Chats Summary) */}
                            <div className="bg-white dark:bg-[#212121] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <ChatBubbleIcon className="h-5 w-5 text-teal-500" />
                                        Suporte Recente
                                    </h3>
                                    <button onClick={() => setActiveTab('chats')} className="text-xs text-indigo-500 hover:underline font-semibold">{t('viewAll')}</button>
                                </div>
                                <div className="space-y-3">
                                    {recentChats.map(chat => (
                                        <div key={chat.id} onClick={() => onOpenChat(chat.id)} className="p-3 bg-gray-50 dark:bg-[#2a2a2a] rounded-lg border border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#333]">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-xs font-bold text-gray-900 dark:text-white">Chat #{chat.id.slice(-4)}</span>
                                                <span className="text-[10px] text-gray-400">{new Date(chat.lastUpdated).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                                {chat.messages[chat.messages.length - 1]?.content || 'Nova conversa'}
                                            </p>
                                        </div>
                                    ))}
                                    {recentChats.length === 0 && <p className="text-gray-500 text-sm text-center py-4">Nenhum chat ativo.</p>}
                                </div>
                            </div>

                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('manageUsers')}</h2>
                            <div className="flex gap-4 w-full sm:w-auto">
                                <SearchInput value={userSearchQuery} onChange={setUserSearchQuery} suggestions={userSuggestions} historyKey="admin_users" placeholder={t('searchUsers')} className="w-full sm:w-64" />
                                <button onClick={() => setIsAddingUser(true)} className="bg-brand-blue text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 text-sm whitespace-nowrap shadow-md hover:bg-blue-700 transition-colors"><PlusIcon className="h-4 w-4"/>Adicionar Usuário</button>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#212121] rounded-lg shadow overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-[#2a2a2a]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('name')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('email')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('role')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('status')}</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-[#212121] divide-y divide-gray-200 dark:divide-gray-700">
                                    {paginatedUsers.map(u => (
                                        <tr key={u.id} onClick={() => setViewingUserDetails(u)} className="hover:bg-gray-50 dark:hover:bg-[#2a2a2a] cursor-pointer">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{u.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{u.email}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">{u.role}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {u.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2" onClick={e => e.stopPropagation()}>
                                                {u.whatsapp && (
                                                    <button onClick={() => openWhatsApp(u.whatsapp)} className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300" title="WhatsApp">
                                                        <WhatsAppIcon className="h-4 w-4"/>
                                                    </button>
                                                )}
                                                <button onClick={() => setEditingUser(u)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"><PencilIcon className="h-4 w-4"/></button>
                                                <button onClick={() => setConfirmDelete({ type: 'user', id: u.id, name: u.name })} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"><TrashIcon className="h-4 w-4"/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination currentPage={userPage} totalPages={totalUserPages} onPageChange={setUserPage} />
                    </div>
                )}

                {activeTab === 'pending_authors' && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('pendingApprovalAuthors')}</h2>
                        <div className="grid gap-6">
                            {pendingAuthors.map(authorUser => (
                                <div key={authorUser.id} className="bg-white dark:bg-[#212121] p-6 rounded-lg shadow flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <img src={authorUser.avatarUrl || `https://i.pravatar.cc/150?u=${authorUser.id}`} className="w-12 h-12 rounded-full object-cover" />
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{authorUser.name}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{authorUser.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {authorUser.whatsapp && (
                                            <button onClick={() => openWhatsApp(authorUser.whatsapp)} className="px-4 py-2 bg-green-500 text-white rounded text-sm font-medium hover:bg-green-600 flex items-center gap-1">
                                                <WhatsAppIcon className="h-4 w-4" />
                                                WhatsApp
                                            </button>
                                        )}
                                        <button onClick={() => setViewingUserDetails(authorUser)} className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600">{t('viewDetails')}</button>
                                        <button onClick={() => onUpdateUser(authorUser.id, { status: 'active' })} className="px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700">{t('approve')}</button>
                                        <button onClick={() => onDeleteUser(authorUser.id)} className="px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700">{t('reject')}</button>
                                    </div>
                                </div>
                            ))}
                            {pendingAuthors.length === 0 && <p className="text-gray-500">{t('noNotifications')}</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'books' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('manageBooks')}</h2>
                            <div className="flex gap-4">
                                <SearchInput value={bookSearchQuery} onChange={setBookSearchQuery} suggestions={bookSuggestions} historyKey="admin_books" placeholder={t('searchBooks')} className="w-64" />
                                <button onClick={() => setIsAddingBook(true)} className="bg-brand-red text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 text-sm"><PlusIcon className="h-4 w-4"/>{t('addBook')}</button>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-[#212121] rounded-lg shadow overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-[#2a2a2a]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('bookTitle')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('author')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('category')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('status')}</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-[#212121] divide-y divide-gray-200 dark:divide-gray-700">
                                    {paginatedBooks.map(b => (
                                        <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-[#2a2a2a]">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white flex items-center gap-3">
                                                <img src={b.coverUrl} className="w-8 h-12 object-cover rounded" />
                                                {b.title}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{b.author.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{b.category}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${b.status === 'Published' ? 'bg-green-100 text-green-800' : b.status === 'Pending Approval' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>
                                                    {b.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                {b.status === 'Pending Approval' && (
                                                    <button onClick={() => onUpdateBook(b.id, { status: 'Published' })} className="text-green-600 hover:text-green-900" title={t('approve')}><CheckCircleIcon className="h-4 w-4"/></button>
                                                )}
                                                <button onClick={() => setViewingStatsFor(b)} className="text-blue-600 hover:text-blue-900" title="Stats"><ChartBarIcon className="h-4 w-4"/></button>
                                                <button onClick={() => setEditingBook(b)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400" title={t('editBook')}><PencilIcon className="h-4 w-4"/></button>
                                                <button onClick={() => setConfirmDelete({ type: 'book', id: b.id, name: b.title })} className="text-red-600 hover:text-red-900"><TrashIcon className="h-4 w-4"/></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination currentPage={bookPage} totalPages={totalBookPages} onPageChange={setBookPage} />
                    </div>
                )}

                {activeTab === 'news' && (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gerenciar Blog de Notícias</h2>
                            <button onClick={() => setIsAddingNews(true)} className="bg-brand-blue text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 text-sm"><PlusIcon className="h-4 w-4"/>Adicionar Notícia</button>
                        </div>
                        <div className="bg-white dark:bg-[#212121] rounded-lg shadow overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-[#2a2a2a]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Título</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Data</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Hashtags</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-[#212121] divide-y divide-gray-200 dark:divide-gray-700">
                                    {news.map(n => (
                                        <tr key={n.id} className="hover:bg-gray-50 dark:hover:bg-[#2a2a2a]">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white flex items-center gap-3">
                                                <img src={n.imageUrl} className="w-10 h-10 object-cover rounded" />
                                                {n.title}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(n.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                {n.hashtags.join(', ')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <button onClick={() => setEditingNews(n)} className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400"><PencilIcon className="h-4 w-4"/></button>
                                                <button onClick={() => setConfirmDelete({ type: 'news', id: n.id, name: n.title })} className="text-red-600 hover:text-red-900"><TrashIcon className="h-4 w-4"/></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {news.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">Nenhuma notícia cadastrada.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'financials' && (
                    <div className="space-y-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('financialReports')}</h2>
                        
                        {/* Financial Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="bg-white dark:bg-[#212121] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600">
                                        <CurrencyDollarIcon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('totalSales')}</h3>
                                </div>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatPrice(stats.revenue)}</p>
                            </div>
                            <div className="bg-white dark:bg-[#212121] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600">
                                        <UsersIcon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Comissões a Pagar</h3>
                                </div>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatPrice(stats.revenue * 0.7)}</p>
                                <p className="text-xs text-gray-500 mt-1">70% do total de vendas</p>
                            </div>
                            <div className="bg-white dark:bg-[#212121] p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                                        <ChartBarIcon className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('platformRevenue')}</h3>
                                </div>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatPrice(stats.revenue * 0.3)}</p>
                                <p className="text-xs text-gray-500 mt-1">30% de comissão</p>
                            </div>
                        </div>

                        {/* Sales Report Table */}
                        <div className="bg-white dark:bg-[#212121] rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#2a2a2a] flex justify-between items-center">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Relatório de Vendas</h3>
                                <button 
                                    onClick={handleExportCSV}
                                    className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline"
                                >
                                    <DownloadIcon className="h-3 w-3" /> Exportar CSV
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-[#2a2a2a]">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Data</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Livro</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Comprador</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Valor</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Comissão Autor (70%)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-[#212121] divide-y divide-gray-200 dark:divide-gray-700">
                                        {salesReport.map((sale, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-[#2a2a2a]">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(sale.purchaseDate).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{sale.bookTitle}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{sale.buyerName}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">{formatPrice(sale.amount)}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{formatPrice(sale.commission)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Withdrawal Requests */}
                        <div className="bg-white dark:bg-[#212121] rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#2a2a2a]">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pedidos de Saque</h3>
                                <p className="text-xs text-gray-500 mt-1">Autores podem solicitar saque 1 mês após a venda.</p>
                            </div>
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-[#2a2a2a]">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Autor</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Valor Solicitado</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Data do Pedido</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-[#212121] divide-y divide-gray-200 dark:divide-gray-700">
                                    {withdrawals.map((req) => (
                                        <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-[#2a2a2a]">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{req.authorName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">{formatPrice(req.amount)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{new Date(req.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    req.status === 'Pago' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {req.status === 'Pendente' && (
                                                    <button 
                                                        onClick={() => handleProcessPayment(req.id, req.authorName, req.amount)}
                                                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold"
                                                    >
                                                        Processar Pagamento
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="bg-white dark:bg-[#212121] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
                         <h2 className="text-xl font-bold text-gray-900 dark:text-white p-6 border-b border-gray-100 dark:border-gray-700">{t('notifications')}</h2>
                        {notifications.length > 0 ? (
                             <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                {notifications.map(notification => (
                                    <div 
                                        key={notification.id} 
                                        className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex gap-4 ${!notification.read ? 'bg-indigo-50/40 dark:bg-indigo-900/10' : ''}`}
                                        onClick={() => !notification.read && onMarkAsRead(notification.id)}
                                    >
                                         <div className="mt-1 flex-shrink-0">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className={`text-base font-semibold ${!notification.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>
                                                    {notification.title}
                                                </p>
                                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                                    {new Date(notification.date).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className={`text-sm leading-relaxed ${!notification.read ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500 dark:text-gray-400'}`}>
                                                {notification.message}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        ) : (
                             <div className="p-12 text-center">
                                <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                    <BellIcon className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('noNotifications')}</h3>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'chats' && (
                    <div className="bg-white dark:bg-[#212121] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white p-6 border-b border-gray-100 dark:border-gray-700">Monitoramento de Chats</h2>
                        {chats.length > 0 ? (
                            <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                                {chats.map(chat => {
                                    const lastMsg = chat.messages[chat.messages.length - 1];
                                    return (
                                        <div 
                                            key={chat.id} 
                                            className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex gap-4 cursor-pointer"
                                            onClick={() => onOpenChat(chat.id)}
                                        >
                                            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full">
                                                <ChatBubbleIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">Chat ID: {chat.id}</p>
                                                    <span className="text-xs text-gray-500">{new Date(chat.lastUpdated).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{lastMsg ? lastMsg.content : 'Sem mensagens'}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <ChatBubbleIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">Nenhum chat ativo.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
