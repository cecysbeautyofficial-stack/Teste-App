
import React, { useState, useMemo, useEffect } from 'react';
import { User, Book, Purchase, PaymentMethod, Author, Notification } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import { 
    HomeIcon, UsersIcon, BookOpenIcon, CurrencyDollarIcon, 
    ChartBarIcon, PencilIcon, TrashIcon, PlusIcon, SearchIcon, 
    SparklesIcon, XIcon, UploadIcon, DocumentTextIcon, EyeIcon,
    StarIcon, AnnotationIcon, BellIcon, CheckCircleIcon, InformationCircleIcon, TagIcon,
    ChartPieIcon, UserPlusIcon
} from '../Icons';
import { generateBookDescription, generateBookCover } from '../../services/geminiService';
import Pagination from '../Pagination';
import AccountSettingsModal from '../AccountSettingsModal';
import BookStatsModal from './BookStatsModal';
import SearchInput from '../SearchInput';

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
  onAddBook: (newBookData: Omit<Book, 'id' | 'author' | 'coverUrl' | 'rating' | 'sales' | 'readers' | 'publishDate'> & { coverImage?: File; bookFile?: File }, authorOverride?: Author) => void;
  categories: string[];
  authors: Author[];
  onAddCategory: (category: string) => void;
  onAddAuthor: (author: Author) => void;
  activeTab: string;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onReadBook: (book: Book) => void;
  onSelectBook: (book: Book) => void;
}

// Confirmation Modal
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

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-[#212121] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center space-x-4">
        <div className="bg-indigo-50 dark:bg-indigo-900/50 p-3 rounded-full border border-indigo-100 dark:border-indigo-800">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
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
}> = ({ title, formats, size, icon, file, onChange, accept, error, disabled }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        if (file && file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPreviewUrl(null);
        }
    }, [file]);

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
                            <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-200 rounded text-xs font-semibold capitalize">
                                    {user.role}
                                </span>
                                <span className="px-2 py-0.5 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded text-xs capitalize">
                                    {user.status}
                                </span>
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

const AdminAddBookModal: React.FC<{ 
    onClose: () => void; 
    onAddBook: (data: Omit<Book, 'id' | 'author' | 'coverUrl' | 'rating' | 'sales' | 'readers' | 'publishDate'> & { coverImage?: File; bookFile?: File }, authorOverride?: Author) => void; 
    categories: string[];
    authors: Author[];
}> = ({ onClose, onAddBook, categories, authors }) => {
    const { t } = useAppContext();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [pages, setPages] = useState('');
    const [language, setLanguage] = useState('Português');
    const [selectedAuthorId, setSelectedAuthorId] = useState('');
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [bookFile, setBookFile] = useState<File | null>(null);
    const [pdfError, setPdfError] = useState<string | null>(null);
    const [isGeneratingDesc, setIsGeneratingDesc] = useState(false);
    const [isGeneratingCover, setIsGeneratingCover] = useState(false);
    
    // Sales
    const [isOnSale, setIsOnSale] = useState(false);
    const [salePrice, setSalePrice] = useState('');
    const [saleStartDate, setSaleStartDate] = useState('');
    const [saleEndDate, setSaleEndDate] = useState('');

    const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) setCoverImage(e.target.files[0]);
    };

    const handleBookFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                setPdfError('O ficheiro deve ser um PDF.');
                setBookFile(null);
            } else {
                setPdfError(null);
                setBookFile(file);
            }
        }
    };

    const handleGenerateDescription = async () => {
        if (!title || !category || !selectedAuthorId) {
            alert("Preencha título, categoria e autor.");
            return;
        }
        const authorName = authors.find(a => a.id === selectedAuthorId)?.name || '';
        setIsGeneratingDesc(true);
        const generatedDesc = await generateBookDescription(title, authorName, category);
        setDescription(generatedDesc);
        setIsGeneratingDesc(false);
    };

    const handleGenerateCover = async () => {
        if (!title || !category || !selectedAuthorId) {
            alert("Preencha título, categoria e autor para gerar a capa.");
            return;
        }
        const authorName = authors.find(a => a.id === selectedAuthorId)?.name || '';
        setIsGeneratingCover(true);
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
        if (!bookFile || !coverImage || !title || !category || !price || !pages || !language || !selectedAuthorId) return;

        const newBookData = {
            title, description, category,
            price: parseFloat(price),
            pages: parseInt(pages),
            language,
            currency: 'MZN' as const,
            coverImage,
            bookFile: bookFile || undefined,
            salePrice: isOnSale && salePrice ? parseFloat(salePrice) : undefined,
            saleStartDate: isOnSale && saleStartDate ? saleStartDate : undefined,
            saleEndDate: isOnSale && saleEndDate ? saleEndDate : undefined,
        };

        const authorOverride = authors.find(a => a.id === selectedAuthorId);
        
        onAddBook(newBookData, authorOverride);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-[#212121] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl w-full max-w-2xl transform transition-all relative text-gray-900 dark:text-white" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">{t('addBook')} (Admin)</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="h-5 w-5 text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-gray-500 block mb-1">{t('bookTitle')}</label>
                             <input type="text" placeholder={t('bookTitle')} className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2" value={title} onChange={e => setTitle(e.target.value)} required />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 block mb-1">{t('author')}</label>
                            <select className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2" value={selectedAuthorId} onChange={e => setSelectedAuthorId(e.target.value)} required>
                                <option value="">{t('selectAuthor')}...</option>
                                {authors.map(author => <option key={author.id} value={author.id}>{author.name}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-gray-500 block mb-1">{t('category')}</label>
                            <select className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2" value={category} onChange={e => setCategory(e.target.value)} required>
                                <option value="">{t('category')}...</option>
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-gray-500 block mb-1">{t('priceMZN')}</label>
                            <input type="number" placeholder="1200.00" className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2" value={price} onChange={e => setPrice(e.target.value)} required />
                        </div>
                    </div>

                    <div className="relative">
                         <button type="button" onClick={handleGenerateDescription} disabled={isGeneratingDesc} className="absolute right-2 top-2 text-xs text-indigo-500 flex items-center gap-1">
                            <SparklesIcon className="h-3 w-3" /> {isGeneratingDesc ? t('generating') : t('generateWithAI')}
                         </button>
                        <textarea rows={3} placeholder={t('description')} className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2" value={description} onChange={e => setDescription(e.target.value)} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <input type="number" placeholder={t('numPages')} className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2" value={pages} onChange={e => setPages(e.target.value)} required />
                         <select className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2" value={language} onChange={e => setLanguage(e.target.value)}>
                            <option value="Português">Português</option>
                            <option value="English">English</option>
                        </select>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                         <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                                <TagIcon className="h-4 w-4" />
                                {t('saleSettings')}
                            </h3>
                            <div className="flex items-center">
                                 <input 
                                    type="checkbox" 
                                    id="isOnSale" 
                                    checked={isOnSale} 
                                    onChange={(e) => setIsOnSale(e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="isOnSale" className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                                     {t('putOnSale')}
                                </label>
                            </div>
                         </div>
                         
                         {isOnSale && (
                             <div className="grid grid-cols-3 gap-3 animate-fade-in-down">
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">{t('salePrice')}</label>
                                    <input type="number" className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1.5 text-sm text-gray-900 dark:text-white" value={salePrice} onChange={e => setSalePrice(e.target.value)} required={isOnSale} />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">{t('saleStartDate')}</label>
                                    <input type="date" className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1.5 text-sm text-gray-900 dark:text-white" value={saleStartDate} onChange={e => setSaleStartDate(e.target.value)} required={isOnSale} />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">{t('saleEndDate')}</label>
                                    <input type="date" className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1.5 text-sm text-gray-900 dark:text-white" value={saleEndDate} onChange={e => setSaleEndDate(e.target.value)} required={isOnSale} />
                                </div>
                             </div>
                         )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-medium text-gray-500">{t('bookCover')}</span>
                                <button 
                                    type="button" 
                                    onClick={handleGenerateCover}
                                    disabled={isGeneratingCover}
                                    className="text-xs text-indigo-500 hover:text-indigo-600 flex items-center gap-1 disabled:opacity-50"
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
                            <FileInput 
                                title={t('bookCover')} 
                                formats="JPEG, PNG" 
                                size="5MB" 
                                icon={<UploadIcon className="h-8 w-8"/>} 
                                file={coverImage} 
                                onChange={handleCoverImageChange} 
                                accept="image/*"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-500 mb-2">{t('bookFile')}</span>
                            <FileInput 
                                title={t('bookFile')} 
                                formats="PDF" 
                                size="50MB" 
                                icon={<DocumentTextIcon className="h-8 w-8"/>} 
                                file={bookFile} 
                                onChange={handleBookFileChange} 
                                accept="application/pdf"
                                error={pdfError}
                            />
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 text-center">
                                {t('flipbookHint')}
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded hover:bg-gray-100 dark:hover:bg-gray-700">{t('cancel')}</button>
                        <button type="submit" className="bg-brand-red text-white px-4 py-2 text-sm font-bold rounded hover:bg-red-600">{t('addBook')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditBookModal: React.FC<{ book: Book; onClose: () => void; onSave: (bookId: string, data: Partial<Book>) => void }> = ({ book, onClose, onSave }) => {
    const { t } = useAppContext();
    const [title, setTitle] = useState(book.title);
    const [description, setDescription] = useState(book.description);
    const [category, setCategory] = useState(book.category);
    const [price, setPrice] = useState(book.price.toString());
    const [pages, setPages] = useState(book.pages?.toString() || '');
    const [language, setLanguage] = useState(book.language || 'Português');
    const [status, setStatus] = useState(book.status || 'Draft');
    const [isFeatured, setIsFeatured] = useState(book.isFeatured || false);
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Sale fields
    const [isOnSale, setIsOnSale] = useState(!!book.salePrice);
    const [salePrice, setSalePrice] = useState(book.salePrice?.toString() || '');
    const [saleStartDate, setSaleStartDate] = useState(book.saleStartDate || '');
    const [saleEndDate, setSaleEndDate] = useState(book.saleEndDate || '');

    const handleGenerateDescription = async () => {
        if (!title || !category) {
            alert("Por favor, garanta que o título e a categoria estão definidos.");
            return;
        }
        setIsGenerating(true);
        const generatedDesc = await generateBookDescription(title, book.author.name, category);
        setDescription(generatedDesc);
        setIsGenerating(false);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedData: Partial<Book> = {
            title, description, category, 
            price: parseFloat(price), 
            pages: parseInt(pages), 
            language, 
            status: status as any,
            isFeatured,
            salePrice: isOnSale && salePrice ? parseFloat(salePrice) : undefined,
            saleStartDate: isOnSale && saleStartDate ? saleStartDate : undefined,
            saleEndDate: isOnSale && saleEndDate ? saleEndDate : undefined,
        };
        onSave(book.id, updatedData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-[#212121] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl w-full max-w-2xl transform transition-all relative text-gray-900 dark:text-white" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">{t('editBook')}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('updatePublicationDetails')}</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <XIcon className="h-5 w-5 text-gray-400" />
                    </button>
                </div>
                <form onSubmit={handleSave}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                         <div>
                            <label htmlFor="edit-title" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('bookTitle')}</label>
                            <input type="text" id="edit-title" className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white" value={title} onChange={e => setTitle(e.target.value)} required />
                        </div>
                        <div>
                           <div className="flex justify-between items-center mb-1">
                                <label htmlFor="edit-description" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('description')}</label>
                                <button
                                    type="button"
                                    onClick={handleGenerateDescription}
                                    disabled={isGenerating || !title || !category}
                                    className="flex items-center gap-1 text-xs font-semibold text-indigo-500 dark:text-indigo-400 hover:text-indigo-400 dark:hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isGenerating ? (
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <SparklesIcon className="h-4 w-4" />
                                    )}
                                    <span>{isGenerating ? t('generating') : t('regenerateWithAI')}</span>
                                </button>
                            </div>
                            <textarea id="edit-description" rows={3} className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white" value={description} onChange={e => setDescription(e.target.value)}></textarea>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="edit-category" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('category')}</label>
                                <select id="edit-category" className="w-full mt-1 bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none text-gray-900 dark:text-white" value={category} onChange={e => setCategory(e.target.value)} required >
                                    <option value={category}>{category}</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="edit-price" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('priceMZN')}</label>
                                <input type="number" id="edit-price" className="w-full mt-1 bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white" value={price} onChange={e => setPrice(e.target.value)} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('numPages')}</label>
                                <input type="number" className="w-full mt-1 bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2" value={pages} onChange={e => setPages(e.target.value)} required />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('language')}</label>
                                <select className="w-full mt-1 bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2" value={language} onChange={e => setLanguage(e.target.value)}>
                                    <option value="Português">Português</option>
                                    <option value="English">English</option>
                                </select>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                             <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                                    <TagIcon className="h-4 w-4" />
                                    {t('saleSettings')}
                                </h3>
                                <div className="flex items-center">
                                     <input 
                                        type="checkbox" 
                                        id="isOnSale" 
                                        checked={isOnSale} 
                                        onChange={(e) => setIsOnSale(e.target.checked)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="isOnSale" className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                                         {t('putOnSale')}
                                    </label>
                                </div>
                             </div>
                             
                             {isOnSale && (
                                 <div className="grid grid-cols-3 gap-3 animate-fade-in-down">
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">{t('salePrice')}</label>
                                        <input type="number" className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1.5 text-sm text-gray-900 dark:text-white" value={salePrice} onChange={e => setSalePrice(e.target.value)} required={isOnSale} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">{t('saleStartDate')}</label>
                                        <input type="date" className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1.5 text-sm text-gray-900 dark:text-white" value={saleStartDate} onChange={e => setSaleStartDate(e.target.value)} required={isOnSale} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">{t('saleEndDate')}</label>
                                        <input type="date" className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-2 py-1.5 text-sm text-gray-900 dark:text-white" value={saleEndDate} onChange={e => setSaleEndDate(e.target.value)} required={isOnSale} />
                                    </div>
                                 </div>
                             )}
                        </div>

                        <div className="flex items-center gap-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                            <div className="flex-1">
                                <label htmlFor="edit-status" className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('status')}</label>
                                <select id="edit-status" className="w-full mt-1 bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none text-gray-900 dark:text-white" value={status} onChange={e => setStatus(e.target.value as any)} required >
                                    <option value="Published">{t('published')}</option>
                                    <option value="Draft">{t('draft')}</option>
                                    <option value="Pending Approval">{t('pendingApproval')}</option>
                                </select>
                            </div>
                            <div className="flex items-center pt-6">
                                <input 
                                    type="checkbox" 
                                    id="isFeatured" 
                                    checked={isFeatured} 
                                    onChange={(e) => setIsFeatured(e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="isFeatured" className="ml-2 block text-sm text-gray-900 dark:text-white">
                                    {t('highlightBook')}
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 dark:bg-[#2a2a2a] border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 rounded-b-2xl">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300">{t('cancel')}</button>
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 text-sm font-semibold rounded-lg transition-colors">{t('saveChanges')}</button>
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
    activeTab: initialTab, notifications, onMarkAsRead, onReadBook, onSelectBook
}) => {
    const { t, formatPrice, language } = useAppContext();
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'pending_authors' | 'books' | 'financials' | 'notifications'>(initialTab as any);
    const [confirmDelete, setConfirmDelete] = useState<{ type: 'user' | 'book' | 'paymentMethod'; id: string; name: string } | null>(null);

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
    const [financialSearchQuery, setFinancialSearchQuery] = useState('');

    // Modal States
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editingBook, setEditingBook] = useState<Book | null>(null);
    const [viewingStatsFor, setViewingStatsFor] = useState<Book | null>(null);
    const [isAddingBook, setIsAddingBook] = useState(false);
    const [viewingUserDetails, setViewingUserDetails] = useState<User | null>(null);

    // Derived Data
    const filteredUsers = useMemo(() => {
        return allUsers.filter(u => 
            u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
            u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
        );
    }, [allUsers, userSearchQuery]);

    const userSuggestions = useMemo(() => {
        return allUsers.map(u => u.name).concat(allUsers.map(u => u.email));
    }, [allUsers]);

    const paginatedUsers = useMemo(() => {
        return filteredUsers.slice((userPage - 1) * ITEMS_PER_PAGE, userPage * ITEMS_PER_PAGE);
    }, [filteredUsers, userPage]);
    const totalUserPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

    const filteredBooks = useMemo(() => {
        return allBooks.filter(b => 
            b.title.toLowerCase().includes(bookSearchQuery.toLowerCase()) ||
            b.author.name.toLowerCase().includes(bookSearchQuery.toLowerCase())
        );
    }, [allBooks, bookSearchQuery]);

    const bookSuggestions = useMemo(() => {
        const titles = allBooks.map(b => b.title);
        const authorNames = authors.map(a => a.name);
        return Array.from(new Set([...titles, ...authorNames]));
    }, [allBooks, authors]);

    const paginatedBooks = useMemo(() => {
        return filteredBooks.slice((bookPage - 1) * ITEMS_PER_PAGE, bookPage * ITEMS_PER_PAGE);
    }, [filteredBooks, bookPage]);
    const totalBookPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);

    const financials = useMemo(() => {
      const authorsInSys = allUsers.filter(u => u.role === 'author');
      
      const data = authorsInSys.map(author => {
          const authorBooks = allBooks.filter(b => b.author.name === author.name);
          const bookIds = new Set(authorBooks.map(b => b.id));
          const authorSales = allPurchases.filter(p => bookIds.has(p.bookId));
          
          const totalSales = authorSales.reduce((acc, curr) => acc + curr.amount, 0);
          const commission = totalSales * 0.8; // 80% commission for author
          const platformRevenue = totalSales * 0.2; // 20% revenue for platform

          return {
              author,
              totalSales,
              commission,
              platformRevenue,
              bookCount: authorBooks.length
          };
      });

      if (financialSearchQuery) {
          const query = financialSearchQuery.toLowerCase();
          return data.filter(item => item.author.name.toLowerCase().includes(query));
      }

      return data.sort((a, b) => b.totalSales - a.totalSales);
    }, [allUsers, allBooks, allPurchases, financialSearchQuery]);

    const authorSuggestions = useMemo(() => {
        return authors.map(a => a.name);
    }, [authors]);


    const stats = useMemo(() => {
        const totalRevenue = allPurchases.reduce((acc, curr) => acc + curr.amount, 0);
        return {
            totalUsers: allUsers.length,
            totalBooks: allBooks.length,
            totalRevenue: totalRevenue
        }
    }, [allUsers, allBooks, allPurchases]);

    const allReviews = useMemo(() => {
        return allBooks.flatMap(book => 
            (book.reviews || []).map(review => ({ 
                ...review, 
                bookTitle: book.title, 
                bookCover: book.coverUrl,
                book: book 
            }))
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
    }, [allBooks]);

    const handleDeleteBookClick = (book: Book) => {
        setConfirmDelete({ type: 'book', id: book.id, name: book.title });
    };

    const handleDeleteUserClick = (userToDelete: User) => {
        setConfirmDelete({ type: 'user', id: userToDelete.id, name: userToDelete.name });
    };

    const handleConfirmDelete = () => {
        if (!confirmDelete) return;
        if (confirmDelete.type === 'book') {
            onDeleteBook(confirmDelete.id);
        } else if (confirmDelete.type === 'user') {
            onDeleteUser(confirmDelete.id);
        }
        setConfirmDelete(null);
    };

    const getNotificationIcon = (type: Notification['type']) => {
        switch(type) {
            case 'success': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            case 'alert': return <SparklesIcon className="h-5 w-5 text-red-500" />; 
            case 'warning': return <InformationCircleIcon className="h-5 w-5 text-yellow-500" />;
            case 'info': default: return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
        }
    };

    const pendingAuthors = useMemo(() => {
        return allUsers.filter(u => u.role === 'author' && u.status === 'pending');
    }, [allUsers]);

    const renderPendingAuthors = () => (
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('pendingApprovalAuthors')}</h2>
            
            {pendingAuthors.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingAuthors.map(author => (
                        <div key={author.id} className="bg-white dark:bg-[#212121] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col">
                            <div className="p-6 flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <img src={author.avatarUrl || `https://i.pravatar.cc/150?u=${author.id}`} className="w-14 h-14 rounded-full object-cover border-2 border-gray-100 dark:border-gray-600" />
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{author.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{author.email}</p>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200 mt-1">
                                            {t('pendingApproval')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            {author.authorOnboardingData && (
                                <div className="px-6 pb-4 text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                    <p><strong className="text-gray-900 dark:text-white">Exp:</strong> {t(author.authorOnboardingData.experienceLevel as any)}</p>
                                    <p><strong className="text-gray-900 dark:text-white">Genre:</strong> {t(author.authorOnboardingData.primaryGenre as any)}</p>
                                </div>
                            )}

                            <div className="bg-gray-50 dark:bg-[#2a2a2a] p-4 border-t border-gray-100 dark:border-gray-700 flex gap-3 mt-auto">
                                <button 
                                    onClick={() => setViewingUserDetails(author)} 
                                    className="flex-1 py-2 rounded-lg bg-white dark:bg-[#3e3e3e] border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-medium text-sm hover:bg-gray-50 dark:hover:bg-[#4e4e4e] transition-colors"
                                >
                                    {t('viewDetails')}
                                </button>
                                <button 
                                    onClick={() => onUpdateUser(author.id, { status: 'active' })} 
                                    className="flex-1 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-sm transition-colors shadow-sm"
                                >
                                    {t('approve')}
                                </button>
                                <button 
                                    onClick={() => handleDeleteUserClick(author)} 
                                    className="p-2 rounded-lg border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    title={t('reject')}
                                >
                                    <XIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white dark:bg-[#212121] rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <CheckCircleIcon className="h-8 w-8 text-green-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Tudo limpo!</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Não há autores pendentes de aprovação no momento.</p>
                </div>
            )}
        </div>
    );

    const renderOverview = () => (
        <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <StatCard title={t('totalUsers')} value={stats.totalUsers.toLocaleString()} icon={<UsersIcon className="h-6 w-6 text-blue-500"/>} />
                <StatCard title={t('booksOnPlatform')} value={stats.totalBooks.toLocaleString()} icon={<BookOpenIcon className="h-6 w-6 text-indigo-500"/>} />
                <StatCard title={t('totalRevenue')} value={formatPrice(stats.totalRevenue)} icon={<CurrencyDollarIcon className="h-6 w-6 text-green-500"/>} />
            </div>

            <div className="bg-white dark:bg-[#212121] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">{t('recentReviews')}</h3>
                {allReviews.length > 0 ? (
                    <div className="space-y-4">
                         {allReviews.map((review) => (
                            <div key={review.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0">
                                <img 
                                    src={review.bookCover} 
                                    alt={review.bookTitle} 
                                    className="w-10 h-14 object-cover rounded shadow-sm flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity" 
                                    onClick={() => onSelectBook(review.book)}
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                             <h4 
                                                className="font-semibold text-sm text-gray-900 dark:text-white cursor-pointer hover:text-indigo-500 transition-colors"
                                                onClick={() => onSelectBook(review.book)}
                                             >
                                                {review.bookTitle}
                                             </h4>
                                             <span className="text-xs text-gray-500 dark:text-gray-400">by {review.userName}</span>
                                        </div>
                                        <div className="flex text-yellow-400 text-xs">
                                            {[...Array(5)].map((_, i) => (
                                                <StarIcon key={i} className={`h-3 w-3 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm italic mt-1 line-clamp-2">"{review.comment}"</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{t('noReviewsYet')}</p>
                )}
            </div>
        </div>
    );

    const renderUsers = () => (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('manageUsers')}</h2>
                <div className="relative w-64 z-10">
                    <SearchInput 
                        value={userSearchQuery}
                        onChange={setUserSearchQuery}
                        onSearch={setUserSearchQuery}
                        suggestions={userSuggestions}
                        historyKey="admin_users"
                        placeholder={t('searchUsers')}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-[#212121] rounded-lg shadow-md overflow-x-auto border border-gray-200 dark:border-gray-800">
                 <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                    <thead className="bg-gray-50 dark:bg-[#2a2a2a]">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('user')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('role')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('status')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-[#212121] divide-y divide-gray-200 dark:divide-gray-800">
                        {paginatedUsers.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-8 w-8">
                                            <img className="h-8 w-8 rounded-full" src={u.avatarUrl || `https://i.pravatar.cc/150?u=${u.id}`} alt="" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                                {u.name}
                                                {u.status === 'pending' && u.role === 'author' && (
                                                    <button onClick={() => setViewingUserDetails(u)} className="text-gray-400 hover:text-blue-500 transition-colors" title={t('viewDetails')}>
                                                        <EyeIcon className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">{u.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 capitalize">{u.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                     <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                        u.status === 'active' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                                        u.status === 'pending' ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300' :
                                        'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                                    }`}>
                                        {u.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={() => setEditingUser(u)} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300">{t('edit')}</button>
                                    {u.status !== 'blocked' ? (
                                        <button onClick={() => onUpdateUser(u.id, { status: 'blocked' })} className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300">{t('block')}</button>
                                    ) : (
                                         <button onClick={() => onUpdateUser(u.id, { status: 'active' })} className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300">{t('activate')}</button>
                                    )}
                                    {u.id !== user.id && (
                                        <button onClick={() => handleDeleteUserClick(u)} className="text-gray-500 hover:text-red-500 transition-colors" title={t('delete')}>
                                            <TrashIcon className="h-4 w-4"/>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <Pagination currentPage={userPage} totalPages={totalUserPages} onPageChange={setUserPage} />
        </div>
    );

     const renderBooks = () => (
      <div>
                 <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('manageBooks')}</h2>
                    {/* Book Search */}
                    <div className="flex items-center gap-4 w-full sm:w-auto z-10">
                        <div className="relative flex-grow sm:w-64">
                             <SearchInput 
                                value={bookSearchQuery}
                                onChange={setBookSearchQuery}
                                onSearch={setBookSearchQuery}
                                suggestions={bookSuggestions}
                                historyKey="admin_books"
                                placeholder={t('searchBooksAdmin')}
                            />
                        </div>
                         <button 
                            onClick={() => setIsAddingBook(true)}
                            className="bg-brand-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 text-sm shadow-md flex-shrink-0"
                        >
                            <PlusIcon className="h-4 w-4"/>
                            <span>{t('addBook')}</span>
                        </button>
                    </div>
                 </div>
                 
                 <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                    {filteredBooks.length > 0 ? t('showingResults', {
                        start: (bookPage - 1) * ITEMS_PER_PAGE + 1,
                        end: Math.min(bookPage * ITEMS_PER_PAGE, filteredBooks.length),
                        total: filteredBooks.length
                    }) : ''}
                 </div>

                 <div className="bg-white dark:bg-[#212121] rounded-lg shadow-md overflow-x-auto border border-gray-200 dark:border-gray-800">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead className="bg-gray-50 dark:bg-[#2a2a2a]">
                             <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('bookTitle')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('author')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('published')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('status')}</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-[#212121] divide-y divide-gray-200 dark:divide-gray-800">
                            {paginatedBooks.length > 0 ? paginatedBooks.map(b => ( 
                                <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-[#2a2a2a] group transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white cursor-pointer" onClick={() => onSelectBook(b)}>
                                        <div className="flex items-center gap-3">
                                            <img src={b.coverUrl} alt={b.title} className="w-8 h-12 object-cover rounded shadow-sm" />
                                            <div>
                                                {b.title}
                                                {b.isFeatured && (
                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                        <SparklesIcon className="h-3 w-3 mr-1"/>
                                                        {t('isFeatured')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <div className="flex flex-col">
                                            <span>{b.author.name}</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-600 group-hover:text-gray-700 dark:group-hover:text-gray-500 transition-colors">
                                                {/* Try to find author details in user list if possible, or standard author details */}
                                                {allUsers.find(u => u.name === b.author.name)?.email || 'Email não disponível'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {b.publishDate ? new Date(b.publishDate).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US') : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            b.status === 'Published' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                                            b.status === 'Pending Approval' ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300' :
                                            'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                        }`}>
                                            {t(b.status?.replace(' ', '') as any) || b.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                         <button onClick={() => onReadBook(b)} className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400" title={t('read')}>
                                            <EyeIcon className="h-4 w-4"/>
                                         </button>
                                         <button onClick={() => setViewingStatsFor(b)} className="text-brand-blue dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300" title="Ver Estatísticas"><ChartBarIcon className="h-4 w-4"/></button>
                                         <button onClick={() => setEditingBook(b)} className="text-brand-blue dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300" title="Editar Livro"><PencilIcon className="h-4 w-4"/></button>
                                         <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteBookClick(b);
                                            }} 
                                            className="text-red-600 dark:text-red-500 hover:text-red-500 dark:hover:text-red-400" 
                                            title="Apagar Livro"
                                        >
                                            <TrashIcon className="h-4 w-4"/>
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500 text-sm">
                                        {bookSearchQuery 
                                            ? `${t('noResultsFound')} "${bookSearchQuery}".`
                                            : "Nenhum livro encontrado."
                                        }
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <Pagination currentPage={bookPage} totalPages={totalBookPages} onPageChange={setBookPage} />
            </div>
  );

    const renderFinancials = () => (
      <div className="mb-12">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                     <CurrencyDollarIcon className="h-6 w-6 text-green-500 dark:text-green-400" />
                     {t('financialReports')}
                 </h2>
                 {/* Financial Search */}
                 <div className="relative w-full sm:w-64 z-10">
                     <SearchInput 
                        value={financialSearchQuery}
                        onChange={setFinancialSearchQuery}
                        onSearch={setFinancialSearchQuery}
                        suggestions={authorSuggestions}
                        historyKey="admin_financials"
                        placeholder={t('searchAuthors')}
                    />
                 </div>
             </div>
             <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto border border-gray-200 dark:border-gray-700">
                 <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                     <thead className="bg-gray-50 dark:bg-gray-700/50">
                         <tr>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('author')}</th>
                             <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('paymentDetails')}</th>
                             <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('totalSales')}</th>
                             <th className="px-6 py-3 text-right text-xs font-medium text-green-600 dark:text-green-400 uppercase tracking-wider">{t('authorCommission')}</th>
                             <th className="px-6 py-3 text-right text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wider">{t('platformRevenue')}</th>
                         </tr>
                     </thead>
                     <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                         {financials.length > 0 ? financials.map((item, idx) => (
                             <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                 <td className="px-6 py-4 whitespace-nowrap">
                                     <div className="text-sm font-bold text-gray-900 dark:text-white">{item.author.name}</div>
                                     <div className="text-xs text-gray-500 dark:text-gray-400">{item.bookCount} {t('books').toLowerCase()}</div>
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                     {item.author.whatsapp ? (
                                         <div className="flex items-center gap-1">
                                             <span>{item.author.preferredPaymentMethod || 'N/A'}</span>
                                             <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded">{item.author.whatsapp}</span>
                                         </div>
                                     ) : 'N/A'}
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 dark:text-white">
                                     {formatPrice(item.totalSales)}
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-green-600 dark:text-green-400">
                                     {formatPrice(item.commission)}
                                 </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-blue-600 dark:text-blue-400">
                                     {formatPrice(item.platformRevenue)}
                                 </td>
                             </tr>
                         )) : (
                             <tr>
                                 <td colSpan={5} className="px-6 py-4 text-center text-gray-500 text-sm">
                                     {financialSearchQuery ? `${t('noResultsFound')} "${financialSearchQuery}"` : "Nenhuma venda registrada."}
                                 </td>
                             </tr>
                         )}
                     </tbody>
                 </table>
             </div>
         </div>
    );

    return (
        <div className="flex flex-col md:flex-row min-h-screen pb-20 md:pb-0 relative">
             <ConfirmationModal 
                isOpen={!!confirmDelete}
                onClose={() => setConfirmDelete(null)}
                onConfirm={handleConfirmDelete}
                title={`${t('delete')} ${t(confirmDelete?.type || 'item')}`}
                message={t('confirmDeleteGeneral', { type: t(confirmDelete?.type || 'item'), name: confirmDelete?.name })}
             />

             {/* Sidebar */}
             <aside className="w-full md:w-64 bg-white dark:bg-[#1e1e1e] md:min-h-screen border-r border-gray-200 dark:border-gray-800 md:sticky md:top-[88px] md:h-[calc(100vh-88px)] md:self-start p-4 z-10">
                <div className="flex md:flex-col overflow-x-auto md:overflow-visible gap-2 md:gap-0 pb-2 md:pb-0 scrollbar-hide">
                    {[
                        { id: 'overview', icon: HomeIcon, label: t('overview') },
                        { id: 'pending_authors', icon: UserPlusIcon, label: t('pendingApprovalAuthors') },
                        { id: 'users', icon: UsersIcon, label: t('manageUsers') },
                        { id: 'books', icon: BookOpenIcon, label: t('manageBooks') },
                        { id: 'financials', icon: CurrencyDollarIcon, label: t('financialReports') },
                        { id: 'notifications', icon: BellIcon, label: t('notifications') },
                    ].map(item => (
                         <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`group w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg mb-1 relative ${activeTab === item.id ? 'bg-indigo-50 dark:bg-indigo-900/40 text-brand-blue dark:text-indigo-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#3e3e3e]'}`}
                        >
                            <item.icon className="h-5 w-5" />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            </aside>

             {/* Main Content */}
             <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'users' && renderUsers()}
                {activeTab === 'pending_authors' && renderPendingAuthors()}
                {activeTab === 'books' && renderBooks()}
                {activeTab === 'financials' && renderFinancials()}
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
             </main>

             {editingUser && (
                 <AccountSettingsModal 
                    user={editingUser} 
                    onClose={() => setEditingUser(null)} 
                    onSave={(data) => {
                        onUpdateUser(editingUser.id, data);
                        setEditingUser(null);
                    }}
                    isAdminEditing={true}
                    paymentMethods={paymentMethods}
                 />
             )}
             
             {viewingUserDetails && (
                 <UserDetailsModal 
                    user={viewingUserDetails}
                    onClose={() => setViewingUserDetails(null)}
                 />
             )}

             {viewingStatsFor && (
                 <BookStatsModal 
                    book={viewingStatsFor}
                    onClose={() => setViewingStatsFor(null)}
                    allUsers={allUsers}
                    allPurchases={allPurchases}
                    salesData={[]} // Mock data handling needed or passed via props if available
                 />
             )}

             {isAddingBook && (
                 <AdminAddBookModal 
                    onClose={() => setIsAddingBook(false)}
                    onAddBook={onAddBook}
                    categories={categories}
                    authors={authors}
                 />
             )}
             
             {editingBook && (
                 <EditBookModal 
                    book={editingBook} 
                    onClose={() => setEditingBook(null)} 
                    onSave={onUpdateBook} 
                 />
             )}
        </div>
    );
};

export default AdminDashboard;
