
import React, { useState } from 'react';
import { Book } from '../types';
import { CheckCircleIcon, DownloadIcon, TrashIcon, HeartIcon, SparklesIcon, StarIcon } from './Icons';
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
}

const BookCard: React.FC<BookCardProps> = ({ 
    book, onSelect, onRead, isPurchased, 
    isFavorited, onToggleFavorite,
    isOffline, onDownload, onDeleteOffline, showOfflineControls = false 
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
    
    const isOnSale = book.salePrice && book.saleStartDate && book.saleEndDate && 
                     new Date() >= new Date(book.saleStartDate) && 
                     new Date() <= new Date(book.saleEndDate);

    return (
    <div 
      className="group cursor-pointer select-none flex flex-col gap-3 p-3 rounded-2xl transition-all duration-300 hover:-translate-y-1 bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-lg hover:shadow-xl" 
      onClick={() => onSelect(book)}
    >
      {/* Cover Image Container */}
      <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-md shadow-black/10 dark:shadow-black/40 border border-white/10 dark:border-white/5">
          <img 
            src={book.coverUrl} 
            alt={book.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          />
          
          {/* Overlays that are always visible or context dependent */}
          {book.isFeatured && (
            <div className="absolute top-2 left-2 z-10 bg-yellow-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1 border border-white/20">
              <SparklesIcon className="h-3 w-3" />
              <span>{t('isFeatured')}</span>
            </div>
          )}

          {/* Favorite Button - Top Right */}
          <div className="absolute top-2 right-2 z-10">
              <button 
                onClick={handleFavoriteClick} 
                className={`bg-black/30 backdrop-blur-md rounded-full p-1.5 transition-colors shadow-sm hover:bg-black/50 border border-white/10 ${isFavorited ? 'text-red-500' : 'text-white/70 hover:text-red-500'}`}
              >
                  <HeartIcon className="h-4 w-4" isFilled={isFavorited} />
              </button>
          </div>

          {/* Purchased / Offline Controls - Bottom Right */}
          {isPurchased && (
            <div className="absolute bottom-2 right-2 flex items-center gap-2 z-10">
              <div className="bg-green-500/90 backdrop-blur-md text-white rounded-full p-1 shadow-md border border-white/20" title={t('youBought')}>
                <CheckCircleIcon className="h-3 w-3" />
              </div>
              {showOfflineControls && (
                isOffline ? (
                    <button onClick={handleDelete} disabled={isProcessing} className="bg-red-500/90 backdrop-blur-md text-white rounded-full p-1.5 hover:bg-red-600 transition-colors disabled:opacity-50 shadow-md border border-white/20" title="Remover offline">
                        <TrashIcon className="h-3 w-3" />
                    </button>
                ) : (
                    <button onClick={handleDownload} disabled={isProcessing} className="bg-blue-500/90 backdrop-blur-md text-white rounded-full p-1.5 hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center shadow-md border border-white/20" title="Baixar para ler offline">
                        {isProcessing ? (
                            <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <DownloadIcon className="h-3 w-3" />
                        )}
                    </button>
                )
              )}
            </div>
          )}
      </div>

      {/* Book Info Below */}
      <div className="flex flex-col px-1">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-brand-blue dark:group-hover:text-indigo-400 transition-colors" title={book.title}>
            {book.title}
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-300 truncate mb-2 font-medium">{book.author.name}</p>
        
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 px-2 py-0.5 rounded-full text-[10px] backdrop-blur-sm">
                <StarIcon className="h-3 w-3 text-yellow-500 fill-current" />
                <span className="text-gray-700 dark:text-gray-300 font-bold">{book.rating.toFixed(1)}</span>
            </div>
            
            <div>
                 {isOnSale ? (
                     <div className="flex items-center gap-1.5">
                         <span className="text-gray-400 text-[10px] line-through">{formatPrice(book.price)}</span>
                         <span className="text-brand-red font-bold text-xs">{formatPrice(book.salePrice!)}</span>
                     </div>
                 ) : (
                    <span className="text-brand-blue dark:text-indigo-300 font-bold text-xs">{formatPrice(book.price)}</span>
                 )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
