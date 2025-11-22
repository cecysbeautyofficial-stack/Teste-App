

import React from 'react';
import { Book } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { CheckCircleIcon } from './Icons';

interface SimpleBookCardProps {
  book: Book;
  onClick: (book: Book) => void;
  onBuyNow: (book: Book) => void;
  purchasedBooks: Set<string>;
}

const SimpleBookCard: React.FC<SimpleBookCardProps> = ({ book, onClick, onBuyNow, purchasedBooks }) => {
  const { t, formatPrice } = useAppContext();
  const isPurchased = purchasedBooks.has(book.id);
  
  return (
    <div className="space-y-1">
      <div 
        className="w-full aspect-[2/3] rounded-lg relative group overflow-hidden cursor-pointer shadow-lg"
        onClick={() => onClick(book)}
      >
        <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
      </div>
      <div className="p-2">
        <h4 
          className="text-white text-sm truncate font-semibold cursor-pointer"
          onClick={() => onClick(book)}
        >
          {book.title}
        </h4>
        <p className="text-xs text-gray-400 truncate">{book.author.name}</p>
        <div className="flex justify-between items-center mt-2">
            <p className="text-sm font-bold text-white">{formatPrice(book.price)}</p>
             {isPurchased ? (
                <div className="flex items-center justify-center h-8 px-3 rounded-full bg-green-600/20 text-green-400 text-xs font-semibold">
                    <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                    <span>{t('read')}</span>
                </div>
            ) : (
                <button
                    onClick={(e) => { e.stopPropagation(); onBuyNow(book); }}
                    className="flex items-center justify-center h-8 px-3 rounded-full bg-indigo-500 text-white hover:bg-indigo-600 transition-colors duration-200 text-xs font-semibold"
                    aria-label={t('buyNow')}
                >
                    {t('buy')}
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default SimpleBookCard;