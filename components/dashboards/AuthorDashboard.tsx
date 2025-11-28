
import React, { useState, useMemo, useEffect } from 'react';
import { User, Book, Purchase, PaymentMethod, Author, Notification, Chat } from '../../types';
import { useAppContext } from '../../contexts/AppContext';
import { 
    HomeIcon, ChartBarIcon, BookOpenIcon, PlusIcon, 
    UploadIcon, DocumentTextIcon, XIcon, SparklesIcon,
    CurrencyDollarIcon, UsersIcon, PencilIcon, TrashIcon,
    CheckCircleIcon, SearchIcon, StarIcon, AnnotationIcon,
    BellIcon, InformationCircleIcon, TagIcon, EyeIcon, ChatBubbleIcon, WhatsAppIcon,
    HeadphonesIcon, ClockIcon
} from '../Icons';
import { generateBookDescription, generateBookCover } from '../../services/geminiService';
import Pagination from '../Pagination';
import SearchInput from '../SearchInput';
import BecomeAuthorCTA from '../BecomeAuthorCTA';
import * as pdfjsLib from 'pdfjs-dist';

const pdfjs = (pdfjsLib as any).default || pdfjsLib;
if (pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
}

interface AuthorDashboardProps {
  user: User;
  authorBooks: Book[];
  allUsers: User[];
  allPurchases: Purchase[];
  onReadBook: (book: Book) => void;
  onDeleteBook: (bookId: string) => void;
  onUpdateBook: (bookId: string, updatedData: Partial<Book>) => void;
  onAddBook: (newBookData: Omit<Book, 'id' | 'author' | 'coverUrl' | 'rating' | 'sales' | 'readers' | 'publishDate'> & { coverImage?: File; bookFile?: File; audioFile?: File }, authorOverride?: Author) => void;
  paymentMethods: PaymentMethod[];
  categories: string[];
  activeTab: string;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  chats: Chat[];
  onOpenChat: (chatId: string) => void;
}

// ... (Keep base64ToFile, FileInput, StatCard, AnalyticsGraph, AuthorAddBookModal definitions exactly as they are) ...
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

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-[#212121] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center space-x-4 transition-shadow hover:shadow-md">
        <div className="bg-indigo-50 dark:bg-indigo-900/50 p-3 rounded-full border border-indigo-100 dark:border-indigo-800">
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

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
                        className="w-full max-w-[40px] sm:max-w-[60px] bg-green-600 hover:bg-green-500 transition-all duration-500 rounded-t-sm"
                        style={{ height: `${(value / max) * 85}%` }} 
                    ></div>
                    <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-3">{labels[idx]}</span>
                </div>
            ))}
        </div>
    )
}

const AuthorAddBookModal: React.FC<{ 
    onClose: () => void; 
    onAddBook: (data: Omit<Book, 'id' | 'author' | 'coverUrl' | 'rating' | 'sales' | 'readers' | 'publishDate'> & { coverImage?: File; bookFile?: File; audioFile?: File }) => void; 
    categories: string[];
    authorName: string;
}> = ({ onClose, onAddBook, categories, authorName }) => {
    const { t } = useAppContext();
    const [bookType, setBookType] = useState<'pdf' | 'audio'>('pdf');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [price, setPrice] = useState('');
    const [pages, setPages] = useState(0);
    const [duration, setDuration] = useState('');
    const [language, setLanguage] = useState('Português');
    const [coverImage, setCoverImage] = useState<File | null>(null);
    const [bookFile, setBookFile] = useState<File | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
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
            
            // Detect Pages
            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
                setPages(pdf.numPages);
            } catch (error) {
                console.error("Error counting PDF pages", error);
                setPages(0);
            }

        } else {
            // Audio
            const validTypes = ['audio/mpeg', 'audio/wav', 'audio/x-m4a', 'audio/mp4'];
            if (!validTypes.includes(file.type) && !file.name.endsWith('.mp3')) {
                 setFileError('Formato de áudio inválido (MP3, WAV, M4A).');
                 setAudioFile(null);
                 return;
            }
            setFileError(null);
            setAudioFile(file);

            // Detect Duration
            const audio = new Audio(URL.createObjectURL(file));
            audio.onloadedmetadata = () => {
                setDuration(formatDuration(audio.duration));
            };
        }
    };

    const handleGenerateDescription = async () => {
        if (!title || !category) {
            alert("Preencha título e categoria.");
            return;
        }
        setIsGeneratingDesc(true);
        const generatedDesc = await generateBookDescription(title, authorName, category);
        setDescription(generatedDesc);
        setIsGeneratingDesc(false);
    };

    const handleGenerateCover = async () => {
        if (!title || !category) {
            alert("Preencha título e categoria para gerar a capa.");
            return;
        }
        setIsGeneratingCover(true);
        // Use the current description to add context to the cover generation
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
        if (!coverImage || !title || !category || !price || !language) return;
        if (bookType === 'pdf' && !bookFile) return;
        if (bookType === 'audio' && !audioFile) return;

        const newBookData = {
            title, description, category,
            price: parseFloat(price),
            pages: bookType === 'pdf' ? pages : undefined,
            duration: bookType === 'audio' ? duration : undefined,
            language,
            currency: 'MZN' as const,
            coverImage,
            bookFile: bookType === 'pdf' ? (bookFile || undefined) : undefined,
            audioFile: bookType === 'audio' ? (audioFile || undefined) : undefined,
            salePrice: isOnSale && salePrice ? parseFloat(salePrice) : undefined,
            saleStartDate: isOnSale && saleStartDate ? saleStartDate : undefined,
            saleEndDate: isOnSale && saleEndDate ? saleEndDate : undefined,
        };

        onAddBook(newBookData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" onClick={onClose}>
            <div className="bg-white dark:bg-[#212121] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl w-full max-w-2xl transform transition-all relative text-gray-900 dark:text-white" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold">{t('addBook')}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="h-5 w-5 text-gray-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <input type="text" placeholder={t('bookTitle')} className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2" value={title} onChange={e => setTitle(e.target.value)} required />
                    
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
                         <button type="button" onClick={handleGenerateDescription} disabled={isGeneratingDesc} className="absolute right-2 top-2 text-xs text-indigo-500 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full">
                            <SparklesIcon className="h-3 w-3" /> {isGeneratingDesc ? t('generating') : t('generateWithAI')}
                         </button>
                        <textarea rows={3} placeholder={t('description')} className="w-full bg-gray-50 dark:bg-[#121212] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2" value={description} onChange={e => setDescription(e.target.value)} required />
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
                            {bookType === 'pdf' && (
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 text-center">
                                    {t('flipbookHint')}
                                </p>
                            )}
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

const AuthorDashboard: React.FC<AuthorDashboardProps> = ({ 
    user, authorBooks, allUsers, allPurchases, onReadBook, onDeleteBook, onUpdateBook, onAddBook, paymentMethods, categories,
    activeTab: initialTab, notifications, onMarkAsRead, chats, onOpenChat
}) => {
    const { t, formatPrice, language } = useAppContext();
    const [activeTab, setActiveTab] = useState<'overview' | 'books' | 'reviews' | 'notifications' | 'messages'>(initialTab as any);
    const [isAddingBook, setIsAddingBook] = useState(false);
    const [bookPage, setBookPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    const ITEMS_PER_PAGE = 8;

    useEffect(() => {
        if (initialTab) setActiveTab(initialTab as any);
    }, [initialTab]);

    const stats = useMemo(() => {
        const sales = allPurchases.filter(p => authorBooks.some(b => b.id === p.bookId));
        const totalSales = sales.reduce((acc, curr) => acc + curr.amount, 0);
        const totalReaders = authorBooks.reduce((acc, b) => acc + (b.readers || 0), 0);
        const totalBooksSold = sales.length;
        return { totalSales, totalReaders, totalBooksSold };
    }, [allPurchases, authorBooks]);

    // Mock sales data for graph
    const salesData = useMemo(() => {
        const total = stats.totalBooksSold * 10; // Mock scale
        const base = Math.floor(total / 30); 
        return Array.from({ length: 7 }, () => Math.max(0, base + Math.floor(Math.random() * 5) - 2));
    }, [stats]);

     const last7DaysLabels = useMemo(() => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d.toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', { month: 'short', day: 'numeric' }));
        }
        return days;
      }, [language]);
      
    const bookSuggestions = useMemo(() => {
        return authorBooks.map(b => b.title);
    }, [authorBooks]);

    const filteredBooks = useMemo(() => {
        if (!searchQuery) return authorBooks;
        return authorBooks.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [authorBooks, searchQuery]);

    const paginatedBooks = useMemo(() => {
        return filteredBooks.slice((bookPage - 1) * ITEMS_PER_PAGE, bookPage * ITEMS_PER_PAGE);
    }, [filteredBooks, bookPage]);
    const totalBookPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);

    // Collect all reviews for author's books
    const authorReviews = useMemo(() => {
        return authorBooks.flatMap(book => 
            (book.reviews || []).map(review => ({ ...review, bookTitle: book.title, bookCover: book.coverUrl }))
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [authorBooks]);

    const topBooks = useMemo(() => {
        return [...authorBooks].sort((a, b) => (b.sales || 0) - (a.sales || 0)).slice(0, 3);
    }, [authorBooks]);

    const recentMessages = useMemo(() => chats.slice(0, 3), [chats]); 

    const getNotificationIcon = (type: Notification['type']) => {
        switch(type) {
            case 'success': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            case 'alert': return <SparklesIcon className="h-5 w-5 text-red-500" />; 
            case 'warning': return <InformationCircleIcon className="h-5 w-5 text-yellow-500" />;
            case 'info': default: return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
        }
    };

    const contactAdmin = () => {
        window.open('https://wa.me/258846584761', '_blank');
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen pb-20 md:pb-0 relative">
            {isAddingBook && <AuthorAddBookModal onClose={() => setIsAddingBook(false)} onAddBook={onAddBook} categories={categories} authorName={user.name} />}
            
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-white dark:bg-[#1e1e1e] md:min-h-screen border-r border-gray-200 dark:border-gray-800 md:sticky md:top-[88px] md:h-[calc(100vh-88px)] md:self-start p-4 z-10">
                <div className="flex md:flex-col overflow-x-auto md:overflow-visible gap-2 md:gap-0 pb-2 md:pb-0 scrollbar-hide">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`group w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg mb-1 relative ${activeTab === 'overview' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-brand-blue dark:text-indigo-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#3e3e3e]'}`}
                    >
                        <HomeIcon className="h-5 w-5" />
                        <span>{t('overview')}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('books')}
                        className={`group w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg mb-1 relative ${activeTab === 'books' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-brand-blue dark:text-indigo-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#3e3e3e]'}`}
                    >
                        <BookOpenIcon className="h-5 w-5" />
                        <span>{t('myBooks')}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`group w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg mb-1 relative ${activeTab === 'reviews' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-brand-blue dark:text-indigo-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#3e3e3e]'}`}
                    >
                        <AnnotationIcon className="h-5 w-5" />
                        <span>{t('reviews')}</span>
                    </button>
                     <button
                        onClick={() => setActiveTab('notifications')}
                        className={`group w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg mb-1 relative ${activeTab === 'notifications' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-brand-blue dark:text-indigo-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#3e3e3e]'}`}
                    >
                        <BellIcon className="h-5 w-5" />
                        <span>{t('notifications')}</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('messages')}
                        className={`group w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg mb-1 relative ${activeTab === 'messages' ? 'bg-indigo-50 dark:bg-indigo-900/40 text-brand-blue dark:text-indigo-400 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#3e3e3e]'}`}
                    >
                        <ChatBubbleIcon className="h-5 w-5" />
                        <span>Mensagens</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                {activeTab === 'overview' && (
                    <div className="space-y-8 animate-fade-in-down">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <StatCard title={t('salesCount')} value={stats.totalBooksSold.toLocaleString()} icon={<ChartBarIcon className="h-6 w-6 text-blue-500"/>} />
                            <StatCard title={t('readersCount')} value={stats.totalReaders.toLocaleString()} icon={<UsersIcon className="h-6 w-6 text-green-500"/>} />
                            <StatCard title={t('revenue')} value={formatPrice(stats.totalSales * 0.7)} icon={<CurrencyDollarIcon className="h-6 w-6 text-yellow-500"/>} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 bg-white dark:bg-[#212121] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('salesAnalytics')}</h2>
                                <AnalyticsGraph data={salesData} labels={last7DaysLabels} />
                            </div>

                            <div className="bg-white dark:bg-[#212121] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Livros Mais Vendidos</h3>
                                <div className="space-y-4">
                                    {topBooks.map(book => (
                                        <div key={book.id} className="flex items-center gap-3">
                                            <img src={book.coverUrl} alt={book.title} className="w-10 h-14 object-cover rounded shadow-sm" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{book.title}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{book.sales} vendas</p>
                                            </div>
                                            <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/20 px-2 py-1 rounded">#{topBooks.indexOf(book) + 1}</span>
                                        </div>
                                    ))}
                                    {topBooks.length === 0 && <p className="text-xs text-gray-500">Nenhum dado de vendas ainda.</p>}
                                </div>
                            </div>
                        </div>

                        {/* Recent Reviews and Messages Split */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Recent Reviews Snippet */}
                            <div className="bg-white dark:bg-[#212121] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-900 dark:text-white">{t('recentReviews')}</h3>
                                    <button onClick={() => setActiveTab('reviews')} className="text-xs text-indigo-500 hover:underline font-semibold">{t('viewAll')}</button>
                                </div>
                                <div className="space-y-4">
                                    {authorReviews.slice(0, 3).map(review => (
                                        <div key={review.id} className="p-3 bg-gray-50 dark:bg-[#2a2a2a] rounded-lg border border-gray-100 dark:border-gray-800">
                                            <div className="flex items-center gap-2 mb-1">
                                                <div className="flex text-yellow-400">
                                                    {[...Array(5)].map((_, i) => (
                                                        <StarIcon key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(review.date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-xs text-gray-700 dark:text-gray-300 italic mb-2 line-clamp-2">"{review.comment}"</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-gray-900 dark:text-white">- {review.userName}</span>
                                                <span className="text-[10px] text-gray-500 truncate">em {review.bookTitle}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {authorReviews.length === 0 && <p className="text-sm text-gray-500 text-center py-4">{t('noReviewsYet')}</p>}
                                </div>
                            </div>

                            {/* Recent Messages Snippet */}
                            <div className="bg-white dark:bg-[#212121] border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-gray-900 dark:text-white">Mensagens Recentes</h3>
                                    <button onClick={() => setActiveTab('messages')} className="text-xs text-indigo-500 hover:underline font-semibold">{t('viewAll')}</button>
                                </div>
                                <div className="space-y-3">
                                    {recentMessages.map(chat => (
                                        <div key={chat.id} className="p-3 bg-gray-50 dark:bg-[#2a2a2a] rounded-lg border border-gray-100 dark:border-gray-800 flex items-start gap-3">
                                            <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-full flex-shrink-0">
                                                <ChatBubbleIcon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs font-bold text-gray-900 dark:text-white">Leitor</span>
                                                    <span className="text-[10px] text-gray-400">{new Date(chat.lastUpdated).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                                    {chat.messages[chat.messages.length - 1]?.content || 'Nova conversa iniciada'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    {recentMessages.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Nenhuma mensagem.</p>}
                                </div>
                            </div>
                        </div>

                        <div className="mt-12">
                            <BecomeAuthorCTA onAction={() => setIsAddingBook(true)} />
                        </div>
                    </div>
                )}

                {activeTab === 'books' && (
                    <div>
                        {/* ... (Rest of the 'books' tab content remains exactly the same) ... */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('myBooks')}</h2>
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                                <div className="relative flex-grow sm:w-64 z-10">
                                    <SearchInput 
                                        value={searchQuery}
                                        onChange={setSearchQuery}
                                        onSearch={setSearchQuery}
                                        suggestions={bookSuggestions}
                                        historyKey="author_books"
                                        placeholder={t('searchBooks')}
                                    />
                                </div>
                                <button 
                                    onClick={() => setIsAddingBook(true)}
                                    className="bg-brand-red hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2 text-sm shadow-md flex-shrink-0"
                                >
                                    <PlusIcon className="h-4 w-4"/>
                                    <span>{t('addNewBook')}</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#212121] rounded-lg shadow-md overflow-x-auto border border-gray-200 dark:border-gray-800">
                             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                                <thead className="bg-gray-50 dark:bg-[#2a2a2a]">
                                     <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('bookTitle')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('category')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('status')}</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('readers')}</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-[#212121] divide-y divide-gray-200 dark:divide-gray-800">
                                    {paginatedBooks.length > 0 ? paginatedBooks.map(b => (
                                        <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white flex items-center gap-3">
                                                <img src={b.coverUrl} className="w-8 h-12 object-cover rounded" />
                                                {b.title}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{b.category}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    b.status === 'Published' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' :
                                                    b.status === 'Pending Approval' ? 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300' :
                                                    'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                }`}>
                                                    {t(b.status?.replace(' ', '') as any) || b.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{b.readers || 0}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                                <button onClick={() => onReadBook(b)} className="text-gray-500 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400" title={t('read')}>
                                                    <EyeIcon className="h-4 w-4"/>
                                                </button>
                                                <button className="text-brand-blue dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300" title={t('editDetails')}>
                                                    <PencilIcon className="h-4 w-4"/>
                                                </button>
                                                <button onClick={() => onDeleteBook(b.id)} className="text-red-600 dark:text-red-500 hover:text-red-500 dark:hover:text-red-400" title={t('deleteBook')}>
                                                    <TrashIcon className="h-4 w-4"/>
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500 text-sm">
                                                Não tem livros cadastrados.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <Pagination currentPage={bookPage} totalPages={totalBookPages} onPageChange={setBookPage} />
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="space-y-6">
                        {/* ... (Rest of the 'reviews' tab content remains exactly the same) ... */}
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('reviews')}</h2>
                        {authorReviews.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {authorReviews.map((review) => (
                                    <div key={review.id} className="bg-white dark:bg-[#212121] p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
                                        <div className="flex items-center gap-3 mb-4">
                                            <img src={review.bookCover} alt={review.bookTitle} className="w-10 h-14 object-cover rounded shadow-sm" />
                                            <div>
                                                <h4 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-1">{review.bookTitle}</h4>
                                                <div className="flex text-yellow-400 text-xs">
                                                    {[...Array(5)].map((_, i) => (
                                                        <StarIcon key={i} className={`h-3 w-3 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-300 text-sm italic mb-4">"{review.comment}"</p>
                                        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-3">
                                            <span className="font-medium">{review.userName}</span>
                                            <span>{new Date(review.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <div className="text-center py-12 bg-white dark:bg-[#212121] rounded-lg border border-gray-200 dark:border-gray-800">
                                <AnnotationIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">{t('noReviewsYet')}</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'notifications' && (
                    <div className="bg-white dark:bg-[#212121] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
                         {/* ... (Rest of the 'notifications' tab content remains exactly the same) ... */}
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

                {activeTab === 'messages' && (
                    <div className="bg-white dark:bg-[#212121] rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
                        {/* ... (Rest of the 'messages' tab content remains exactly the same) ... */}
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <span>Mensagens</span>
                        </h2>
                        
                        {/* Contact Admin via WhatsApp Card */}
                        <div className="p-6 bg-green-50 dark:bg-green-900/10 m-6 rounded-xl border border-green-200 dark:border-green-900/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-green-500 p-3 rounded-full text-white shadow-lg shadow-green-500/30">
                                    <WhatsAppIcon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">Precisa de suporte imediato?</h3>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">Fale diretamente com o administrador via WhatsApp.</p>
                                </div>
                            </div>
                            <button 
                                onClick={contactAdmin}
                                className="w-full sm:w-auto px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-full shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
                            >
                                <span>Falar com Admin</span>
                                <WhatsAppIcon className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-700"></div>

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
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">Leitor</p>
                                                    <span className="text-xs text-gray-500">{new Date(chat.lastUpdated).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{lastMsg ? lastMsg.content : 'Nova conversa iniciada'}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <ChatBubbleIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 dark:text-gray-400">Nenhuma mensagem recebida de leitores.</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AuthorDashboard;
