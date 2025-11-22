
import React, { useState } from 'react';
import { Book } from '../types';
import { StarIcon } from './Icons';
import { useAppContext } from '../contexts/AppContext';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  onSubmit: (rating: number, comment: string) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose, book, onSubmit }) => {
  const { t } = useAppContext();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (rating > 0) {
        onSubmit(rating, comment);
        onClose();
        setRating(0);
        setComment('');
    }
  };

  const getRatingLabel = (r: number) => {
      switch(r) {
          case 1: return t('terrible');
          case 2: return t('bad');
          case 3: return t('okay');
          case 4: return t('good');
          case 5: return t('awesome');
          default: return '';
      }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#212121] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all relative text-gray-900 dark:text-white overflow-hidden" onClick={e => e.stopPropagation()}>
        
        {/* Header Design */}
        <div className="bg-blue-100 dark:bg-indigo-900/30 p-8 flex flex-col md:flex-row items-center gap-6">
             <div className="flex-1">
                 <h2 className="text-xl md:text-2xl font-bold text-brand-blue dark:text-white mb-1">{t('tellUsWhatYouThink')}</h2>
                 <p className="text-lg md:text-xl font-serif italic text-gray-700 dark:text-gray-300">
                     {book.title} <br/>
                     <span className="text-base not-italic text-gray-500 dark:text-gray-400">by {book.author.name}</span>
                 </p>
             </div>
             <img src={book.coverUrl} alt={book.title} className="w-24 h-36 object-cover rounded shadow-lg -rotate-6 border-2 border-white dark:border-gray-700" />
        </div>

        <div className="p-8 text-center">
            <h3 className="text-lg font-semibold mb-6">{t('howWouldYouRateIt')}</h3>
            
            <div className="flex justify-center gap-4 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                        className="focus:outline-none transform transition-transform hover:scale-110"
                    >
                        <StarIcon 
                            className={`h-10 w-10 ${(hoverRating || rating) >= star ? 'text-blue-500 fill-current' : 'text-gray-300 dark:text-gray-600'}`}
                            isFilled={(hoverRating || rating) >= star}
                        />
                    </button>
                ))}
            </div>
            <p className="h-6 text-sm font-medium text-blue-600 dark:text-blue-400 mb-6 transition-opacity">
                {getRatingLabel(hoverRating || rating)}
            </p>

            <textarea
                className="w-full bg-gray-50 dark:bg-[#181818] border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6 resize-none"
                rows={3}
                placeholder={t('yourComment')}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
            ></textarea>

            <div className="flex flex-col gap-3">
                <button 
                    onClick={handleSubmit}
                    disabled={rating === 0}
                    className="w-full bg-gray-400 hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-600 dark:hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md"
                >
                    {t('submitFeedback')}
                </button>
                <button onClick={onClose} className="text-gray-500 dark:text-gray-400 text-sm hover:underline">
                    {t('skip')}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
