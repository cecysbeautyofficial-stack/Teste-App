
import React from 'react';
import { Book } from '../types';
import { StarIcon, CheckCircleIcon, InformationCircleIcon } from './Icons';
import { useAppContext } from '../contexts/AppContext';
import Logo from './Logo';

interface HeroBannerProps {
  book: Book;
  onBuyNow: (book: Book) => void;
  onRead: (book: Book) => void;
  onMoreInfo: (book: Book) => void;
  isPurchased: boolean;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ book, onBuyNow, onRead, onMoreInfo, isPurchased }) => {
  const { t, formatPrice } = useAppContext();

  // Standard button classes
  const btnBase = "px-6 py-3 rounded-lg font-bold text-base transition-all transform active:scale-95 flex items-center gap-2 shadow-md";
  const btnPrimary = "bg-brand-red hover:bg-red-700 text-white shadow-red-500/30 hover:shadow-red-500/50";
  const btnSuccess = "bg-green-600 hover:bg-green-700 text-white shadow-green-500/30 hover:shadow-green-500/50";
  const btnSecondary = "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700";

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-2xl mb-12 group shadow-2xl">
      {/* Background Layer */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
        style={{ backgroundImage: `url(${book.coverUrl})` }}
      />
      {/* Blur & Gradient Overlay */}
      <div className="absolute inset-0 backdrop-blur-xl bg-white/30 dark:bg-black/60" />
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent dark:from-[#0f0f0f] dark:via-[#0f0f0f]/80 dark:to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-[#0f0f0f] dark:via-[#0f0f0f]/90 dark:to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex items-center h-full px-6 md:px-12 lg:px-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center w-full">
            {/* Text Content */}
            <div className="md:col-span-7 lg:col-span-6 space-y-6">
                <div className="flex items-center gap-4 mb-4">
                     <Logo />
                </div>
                <div className="flex items-center gap-2">
                    <span className="bg-brand-red text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-red-500/30">
                        {t('featuredCollection')}
                    </span>
                    <span className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                        <StarIcon className="h-4 w-4 fill-current" />
                        {book.rating.toFixed(1)}
                    </span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight line-clamp-2">
                    {book.title}
                </h1>
                
                <div className="flex items-center gap-2 text-lg md:text-xl text-gray-600 dark:text-gray-300 font-medium">
                    <span>{book.author.name}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                    <span>{book.category}</span>
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg line-clamp-3 max-w-2xl leading-relaxed">
                    {book.description}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-4">
                    {isPurchased ? (
                        <button 
                            onClick={() => onRead(book)}
                            className={`${btnBase} ${btnSuccess}`}
                        >
                            <CheckCircleIcon className="h-5 w-5" />
                            {t('read')}
                        </button>
                    ) : (
                        <button 
                            onClick={() => onBuyNow(book)}
                            className={`${btnBase} ${btnPrimary}`}
                        >
                            <span>{t('buyNow')}</span>
                            <span className="bg-white/20 px-2 py-0.5 rounded text-sm ml-1">
                                {formatPrice(book.salePrice || book.price)}
                            </span>
                        </button>
                    )}
                    <button 
                        onClick={() => onMoreInfo(book)}
                        className={`${btnBase} ${btnSecondary}`}
                    >
                        <InformationCircleIcon className="h-5 w-5" />
                        {t('viewDetails')}
                    </button>
                </div>
            </div>

            {/* Cover Image (Desktop) */}
            <div className="hidden md:block md:col-span-5 lg:col-span-6 relative">
                <div className="relative w-[300px] lg:w-[380px] mx-auto transform rotate-6 transition-transform duration-500 hover:rotate-0 hover:scale-105">
                     {/* Book Spine Effect */}
                     <div className="absolute left-0 top-0 bottom-0 w-4 bg-white/10 z-20 rounded-l-lg backdrop-blur-sm"></div>
                     <img 
                        src={book.coverUrl} 
                        alt={book.title} 
                        className="w-full h-auto rounded-lg shadow-[0_35px_60px_-15px_rgba(0,0,0,0.5)] object-cover aspect-[2/3] border-t border-r border-white/10" 
                    />
                     {book.isFeatured && (
                        <div className="absolute -top-6 -right-6 bg-yellow-400 text-black font-bold w-24 h-24 rounded-full flex items-center justify-center transform rotate-12 shadow-lg z-30 border-4 border-white dark:border-[#0f0f0f]">
                            <span className="text-center text-xs leading-tight">BEST<br/>SELLER</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
