import React, { useState } from 'react';
import { Book } from '../types';
import { CheckCircleIcon, DownloadIcon, TrashIcon, HeartIcon, SparklesIcon, StarIcon, HeadphonesIcon, BookOpenIcon, ShoppingCartIcon } from './Icons';
import { useAppContext } from '../contexts/AppContext';

interface BookCardProps {
  book: Book;
  onSelect: (book: Book) => void;
  onRead: (book: Book) => void;
  isPurchased: boolean;
  isFavorited: boolean;
  onToggleFavorite: (bookId: string) => void;
  isOffline?: boolean;
  onDownload?: (book: Book) => Promise<void>;
  onDeleteOffline?: (bookId: string) => Promise<void>;
  showOfflineControls?: boolean;
  layout?: 'grid' | 'list';
}

const BookCard: React.FC<BookCardProps> = ({ 
    book, onSelect, onRead, isPurchased, 
    isFavorited, onToggleFavorite,
    isOffline, onDownload, onDeleteOffline, showOfflineControls = false,
    layout = 'grid'
}) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const { t, formatPrice } = useAppContext();

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDownload) {
            setIsProcessing(true);
            await onDownload(book);
            setIsProcessing(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDeleteOffline) {
            setIsProcessing(true);
            await onDeleteOffline(book.id);
            setIsProcessing(false);
        }
    };

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onToggleFavorite(book.id);
    };

    const handleActionClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isPurchased) {
            onRead(book);
        } else {
            onSelect(book); // In list view, usually opens details to buy, or could trigger buy directly
        }
    };
    
    const isOnSale = book.salePrice && book.saleStartDate && book.saleEndDate && 
                     new Date() >= new Date(book.saleStartDate) && 
                     new Date() <= new Date(book.saleEndDate);

    const isAudiobook = !!book.audioUrl;

    // --- LIST LAYOUT OPTIMIZED ---
    if (layout === 'list') {
        return (
            <div 
                className="group relative flex flex-row gap-4 sm:gap-6 p-4 rounded-2xl transition-all duration-300 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-800 hover:border-brand-blue/50 dark:hover:border-indigo-500/50 hover:shadow-lg hover:bg-gray-50 dark:hover:bg-[#252525] cursor-pointer w-full overflow-hidden"
                onClick={() => onSelect(book)}
            >
                {/* Left: Image */}
                <div className="relative w-24 sm:w-32 md:w-40 shrink-0 aspect-[2/3] rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-white/10">
                    <img 
                        src={book.coverUrl} 
                        alt={book.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                    {/* Badges on Image */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {book.isFeatured && (
                            <div className="bg-yellow-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md flex items-center gap-1">
                                <SparklesIcon className="h-3 w-3" />
                            </div>
                        )}
                        {isOnSale && (
                            <div className="bg-red-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md">
                                -{Math.round(((book.price - book.salePrice!) / book.price) * 100)}%
                            </div>
                        )}
                    </div>
                    {isAudiobook && (
                        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-white p-1 rounded-full">
                            <HeadphonesIcon className="h-3 w-3" />
                        </div>
                    )}
                </div>

                {/* Right: Content */}
                <div className="flex-1 flex flex-col py-1 min-w-0">
                    {/* Header: Category & Heart */}
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded-md">
                            {book.category}
                        </span>
                        <button 
                            onClick={handleFavoriteClick} 
                            className={`p-1.5 rounded-full transition-colors ${isFavorited ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-white/10'}`}
                        >
                            <HeartIcon className="h-5 w-5" isFilled={isFavorited} />
                        </button>
                    </div>

                    {/* Title & Author */}
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-brand-blue dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
                        {book.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">
                        {book.author.name}
                    </p>

                    {/* Rating & Meta */}
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-1.5 py-0.5 rounded text-xs font-bold text-yellow-600 dark:text-yellow-400">
                            <StarIcon className="h-3 w-3 fill-current" />
                            <span>{book.rating.toFixed(1)}</span>
                        </div>
                        <div className="hidden sm:block w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                        <span className="hidden sm:block text-xs text-gray-500 dark:text-gray-500">
                            {isAudiobook ? book.duration : `${book.pages} páginas`}
                        </span>
                    </div>

                    {/* Description (Visible on larger screens) */}
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 hidden sm:block">
                        {book.description}
                    </p>

                    {/* Footer: Price & Action */}
                    <div className="mt-auto flex items-end justify-between gap-4">
                        <div className="flex flex-col">
                            {isPurchased ? (
                                <span className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md">
                                    Comprado
                                </span>
                            ) : isOnSale ? (
                                <>
                                    <span className="text-xs text-gray-400 line-through">{formatPrice(book.price)}</span>
                                    <span className="text-xl font-bold text-brand-red">{formatPrice(book.salePrice!)}</span>
                                </>
                            ) : (
                                <span className="text-xl font-bold text-gray-900 dark:text-white">{formatPrice(book.price)}</span>
                            )}
                        </div>

                        <button 
                            onClick={handleActionClick}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm active:scale-95 ${
                                isPurchased 
                                ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50' 
                                : 'bg-gray-900 text-white hover:bg-brand-blue dark:bg-white dark:text-black dark:hover:bg-gray-200'
                            }`}
                        >
                            {isPurchased ? (
                                <>
                                    {isAudiobook ? <HeadphonesIcon className="h-4 w-4" /> : <BookOpenIcon className="h-4 w-4" />}
                                    <span className="hidden sm:inline">{isAudiobook ? 'Ouvir' : 'Ler'}</span>
                                </>
                            ) : (
                                <>
                                    <ShoppingCartIcon className="h-4 w-4" />
                                    <span>Comprar</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- GRID LAYOUT (Original/Updated) ---
    return (
    <div 
      className="group cursor-pointer flex flex-col gap-3 w-full" 
      onClick={() => onSelect(book)}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-lg bg-gray-800">
          <img 
            src={book.coverUrl} 
            alt={book.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          />
          
          {/* Overlays */}
          {book.isFeatured && (
                <div className="absolute top-2 left-2 z-10 bg-yellow-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                <SparklesIcon className="h-3 w-3" />
                <span>{t('isFeatured')}</span>
                </div>
          )}

          {/* Heart Icon */}
          <button 
            onClick={handleFavoriteClick} 
            className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition-all ${isFavorited ? 'bg-white/20 text-red-500' : 'bg-black/30 text-white/70 hover:text-white hover:bg-black/50'}`}
          >
              <HeartIcon className="h-4 w-4" isFilled={isFavorited} />
          </button>

          {/* Status Icon (Bottom Right) */}
          {isPurchased ? (
             <div className="absolute bottom-2 right-2 p-1.5 rounded-full bg-green-500 text-white shadow-lg">
                <CheckCircleIcon className="h-4 w-4" />
             </div>
          ) : (
             <div className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/40 backdrop-blur-md text-green-400 group-hover:bg-green-500 group-hover:text-white transition-all opacity-0 group-hover:opacity-100">
                 <ShoppingCartIcon className="h-4 w-4" /> 
             </div>
          )}
          
          {isAudiobook && (
             <div className="absolute bottom-2 left-2 p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white shadow-lg">
                <HeadphonesIcon className="h-4 w-4" />
             </div>
          )}
          
          {showOfflineControls && (
              <div className="absolute top-2 left-2 z-20">
                  {isProcessing ? (
                      <div className="p-1.5 bg-black/50 rounded-full"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div></div>
                  ) : isOffline ? (
                      <button onClick={handleDelete} className="p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-full shadow-lg"><TrashIcon className="h-4 w-4" /></button>
                  ) : (
                      <button onClick={handleDownload} className="p-1.5 bg-blue-500/80 hover:bg-blue-600 text-white rounded-full shadow-lg"><DownloadIcon className="h-4 w-4" /></button>
                  )}
              </div>
          )}
      </div>

      {/* Info */}
      <div className="space-y-1 px-1">
        <h3 className="font-bold text-gray-900 dark:text-white text-base line-clamp-1 group-hover:text-brand-blue dark:group-hover:text-indigo-400 transition-colors" title={book.title}>
            {book.title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{book.author.name}</p>
        
        <div className="flex items-center justify-between mt-1">
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs font-bold text-gray-600 dark:text-gray-300">
                <StarIcon className="h-3 w-3 text-yellow-500 fill-current" />
                <span>{book.rating.toFixed(1)}</span>
            </div>
            
            <div>
                 {isOnSale ? (
                     <div className="flex flex-col items-end leading-none">
                         <span className="text-[10px] text-gray-400 line-through">{formatPrice(book.price)}</span>
                         <span className="text-brand-red font-bold text-sm">{formatPrice(book.salePrice!)}</span>
                     </div>
                 ) : (
                    <span className="text-brand-blue dark:text-indigo-300 font-bold text-sm">{formatPrice(book.price)}</span>
                 )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;