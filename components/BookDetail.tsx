import React, { useState, useMemo } from 'react';
import { Book, Author, User, Review } from '../types';
import { XIcon, StarIcon, InformationCircleIcon, ChevronRightIcon, DocumentTextIcon, HeartIcon, SparklesIcon, UserCircleIcon, PencilIcon, HeadphonesIcon, ClockIcon } from './Icons';
import SimpleBookCard from './SimpleBookCard';
import { useAppContext } from '../contexts/AppContext';
import UserControls from './UserControls';
import FeedbackModal from './FeedbackModal';

interface BookDetailProps {
  book: Book;
  allBooks: Book[];
  onBack: () => void;
  onPreview: () => void;
  onBuyNow: (book: Book) => void;
  onRead: () => void;
  isPurchased: boolean;
  onBookSelect: (book: Book) => void;
  onSelectAuthor: (author: Author) => void;
  purchasedBooks: Set<string>;
  isFavorited: boolean;
  onToggleFavorite: (bookId: string) => void;
  currentUser: User | null;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
  onNavigateToDashboard: () => void;
  onNavigateSettings: () => void;
}

const BookCarousel: React.FC<{title: string, books: Book[], onBookSelect: (book: Book) => void, onBuyNow: (book: Book) => void, purchasedBooks: Set<string>}> = ({ title, books, onBookSelect, onBuyNow, purchasedBooks }) => (
    <div className="mt-12">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
            <ChevronRightIcon className="h-6 w-6 text-gray-400" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {books.map(b => <SimpleBookCard key={b.id} book={b} onClick={onBookSelect} onBuyNow={onBuyNow} purchasedBooks={purchasedBooks} />)}
        </div>
    </div>
);


const BookDetail: React.FC<BookDetailProps> = ({ 
    book, allBooks, onBack, onPreview, onBuyNow, onRead, isPurchased, onBookSelect, 
    onSelectAuthor, purchasedBooks, isFavorited, onToggleFavorite,
    currentUser, onLogin, onRegister, onLogout, onNavigateToDashboard, onNavigateSettings
}) => {
    const { t, language, formatPrice } = useAppContext();
    const [localReviews, setLocalReviews] = useState<Review[]>(book.reviews || []);
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

    const moreByAuthor = allBooks.filter(b => b.author.name === book.author.name && b.id !== book.id).slice(0, 12);
    const customersAlsoBought = allBooks.filter(b => b.category === book.category && b.id !== book.id).slice(0, 12);
    const moreLikeThis = allBooks.filter(b => b.category === book.category && b.id !== book.id).slice(0, 12);
    
    const relatedAuthors = useMemo(() => {
        const authorsInCategory = allBooks
            .filter(b => b.category === book.category && b.author.id !== book.author.id)
            .map(b => b.author);
        
        const uniqueAuthors = Array.from(new Set(authorsInCategory.map(a => a.id)))
            .map(id => authorsInCategory.find(a => a.id === id)!)
            .slice(0, 10);
            
        return uniqueAuthors;
    }, [allBooks, book]);

    const formatPublishDate = (dateString?: string) => {
        if (!dateString) return '2023';
        const date = new Date(dateString);
        const locale = language === 'pt' ? 'pt-BR' : 'en-US';
        return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
    };

    const handlePrimaryAction = () => {
        if (isPurchased) {
            onRead();
        } else {
            onBuyNow(book);
        }
    };
    
    const handleSubmitReview = (rating: number, comment: string) => {
        if (!currentUser) return;

        const newReview: Review = {
            id: `r-${Date.now()}`,
            userId: currentUser.id,
            userName: currentUser.name,
            rating: rating,
            comment: comment,
            date: new Date().toISOString()
        };

        setLocalReviews(prev => [newReview, ...prev]);
    };

    const isOnSale = book.salePrice && book.saleStartDate && book.saleEndDate && 
                     new Date() >= new Date(book.saleStartDate) && 
                     new Date() <= new Date(book.saleEndDate);

    const isAudiobook = !!book.audioUrl;

  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-2xl z-50 overflow-y-auto text-gray-900 dark:text-white animate-slide-up transition-colors duration-300">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/60 dark:bg-black/40 backdrop-blur-xl border-b border-white/20 dark:border-white/10 shadow-sm">
            <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-16 flex justify-between items-center py-4">
                <button onClick={onBack} className="bg-white/50 dark:bg-white/10 rounded-full p-2 hover:bg-white/80 dark:hover:bg-white/20 transition-colors backdrop-blur-sm">
                    <XIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                </button>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => onToggleFavorite(book.id)}
                        className={`bg-white/50 dark:bg-white/10 rounded-full p-2 transition-colors backdrop-blur-sm ${isFavorited ? 'text-red-500' : 'text-gray-600 dark:text-gray-300 hover:text-red-500'}`}
                        title={isFavorited ? t('removeFromFavorites') : t('addToFavorites')}
                    >
                        <HeartIcon className="h-6 w-6" isFilled={isFavorited} />
                    </button>
                    <UserControls 
                        currentUser={currentUser}
                        onLogin={onLogin}
                        onRegister={onRegister}
                        onLogout={onLogout}
                        onNavigateToDashboard={onNavigateToDashboard}
                        onNavigateSettings={onNavigateSettings}
                    />
                </div>
            </div>
        </div>
        
        <div className="max-w-[1600px] mx-auto">
            <div className="px-4 md:px-8 lg:px-16 py-8">
                <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start">
                    {/* Left: Cover */}
                    <div className="flex-shrink-0 relative">
                        {book.isFeatured && (
                            <div className="absolute top-0 left-0 z-10 -translate-x-2 -translate-y-2 bg-yellow-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 border-2 border-white dark:border-[#0f0f0f]">
                                <SparklesIcon className="h-3 w-3" />
                                <span>{t('isFeatured')}</span>
                            </div>
                        )}
                        {isAudiobook && (
                            <div className="absolute top-0 right-0 z-10 translate-x-2 -translate-y-2 bg-black/80 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1 border-2 border-white dark:border-[#0f0f0f]">
                                <HeadphonesIcon className="h-3 w-3" />
                                <span>Audio</span>
                            </div>
                        )}
                        <img 
                            src={book.coverUrl} 
                            alt={book.title} 
                            className="w-48 sm:w-64 md:w-80 h-auto object-cover rounded-2xl shadow-2xl shadow-indigo-500/20 dark:shadow-indigo-900/30 border border-white/20" 
                        />
                    </div>

                    {/* Right: Details */}
                    <div className="flex-1 text-center md:text-left w-full">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-brand-blue dark:text-white leading-tight">{book.title}</h1>
                        
                        <button onClick={() => onSelectAuthor(book.author)} className="text-lg text-gray-600 dark:text-gray-300 mt-2 hover:text-brand-blue dark:hover:text-white group inline-flex items-center transition-colors font-medium">
                            <span>{book.author.name}</span>
                            <ChevronRightIcon className="h-5 w-5 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </button>
                        
                        <div className="flex items-center justify-center md:justify-start space-x-2 text-sm text-gray-500 dark:text-gray-400 mt-3">
                            <div className="flex items-center bg-yellow-400/10 px-2 py-0.5 rounded-full">
                                <StarIcon className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="ml-1 font-bold text-yellow-600 dark:text-yellow-400">{book.rating.toFixed(1)}</span>
                            </div>
                            <span>({ (book.sales || 25) + (book.readers || 12) })</span>
                            <span className="text-gray-400 dark:text-gray-600">•</span>
                            <span className="bg-gray-100 dark:bg-white/10 px-2 py-0.5 rounded-full text-xs font-medium">{book.category}</span>
                            {isAudiobook && (
                                <>
                                    <span className="text-gray-400 dark:text-gray-600">•</span>
                                    <span className="flex items-center gap-1 font-medium"><ClockIcon className="h-3 w-3" /> {book.duration}</span>
                                </>
                            )}
                        </div>

                        {/* Action Box */}
                        <div className="mt-8 p-6 bg-white/40 dark:bg-white/5 backdrop-blur-md border border-white/40 dark:border-white/10 rounded-2xl shadow-lg">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center space-x-2 text-gray-900 dark:text-white mb-1">
                                        <h3 className="font-bold">{t('book')}</h3>
                                        <InformationCircleIcon className="h-5 w-5 text-gray-400" />
                                    </div>
                                    {isOnSale ? (
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400 line-through text-sm">{formatPrice(book.price)}</span>
                                            <span className="text-2xl font-bold text-brand-red dark:text-red-400">{formatPrice(book.salePrice!)}</span>
                                            <span className="bg-red-100 dark:bg-red-900/30 text-brand-red dark:text-red-400 text-xs px-2 py-0.5 rounded font-semibold">{t('saleSettings')}</span>
                                        </div>
                                    ) : (
                                        <p className="text-2xl font-bold text-brand-blue dark:text-white">{formatPrice(book.price)}</p>
                                    )}
                                </div>
                                <div className="text-right text-xs text-gray-500 dark:text-gray-400 flex flex-col items-end">
                                    <span className="font-semibold">{book.language || t('portuguese')}</span>
                                    <span>{formatPublishDate(book.publishDate)}</span>
                                </div>
                            </div>
                            <div className="mt-6 border-t border-gray-200/50 dark:border-white/10 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button 
                                    onClick={onPreview}
                                    className="w-full bg-white/50 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 text-brand-blue dark:text-white rounded-xl py-3 font-bold transition-all flex items-center justify-center gap-2 backdrop-blur-sm border border-white/20"
                                >
                                    <DocumentTextIcon className="h-5 w-5" />
                                    {t('showPreview')}
                                </button>
                                <button 
                                    onClick={handlePrimaryAction}
                                    className="w-full bg-brand-red hover:bg-red-600 text-white rounded-xl py-3 font-bold transition-transform active:scale-95 flex-shrink-0 shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                                >
                                    {isPurchased ? (
                                        <>
                                            {isAudiobook ? <HeadphonesIcon className="h-5 w-5" /> : <DocumentTextIcon className="h-5 w-5" />}
                                            {isAudiobook ? 'Ouvir' : t('read')}
                                        </>
                                    ) : (
                                        t('buyNow')
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="mt-12 border-t border-gray-200/50 dark:border-white/10 pt-8">
                    <h3 className="text-xl font-bold text-brand-blue dark:text-white">{t('fromThePublisher')}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mt-4 leading-relaxed text-lg">
                        {isDescriptionExpanded ? book.description : `${book.description.substring(0, 300)}${book.description.length > 300 ? '...' : ''}`}
                        {book.description.length > 300 && (
                            <button 
                                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)} 
                                className="font-bold text-brand-blue dark:text-blue-400 ml-2 hover:underline focus:outline-none"
                            >
                                {isDescriptionExpanded ? t('less') : t('more')}
                            </button>
                        )}
                    </p>
                </div>
                
                 {/* Related Authors Carousel */}
                {relatedAuthors.length > 0 && (
                    <div className="mt-12 border-t border-gray-200/50 dark:border-white/10 pt-8">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-brand-blue dark:text-white">{t('relatedAuthors')}</h3>
                        </div>
                        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                            {relatedAuthors.map(author => (
                                <button 
                                    key={author.id}
                                    onClick={() => onSelectAuthor(author)}
                                    className="flex flex-col items-center min-w-[100px] group"
                                >
                                    <img 
                                        src={author.photoUrl} 
                                        alt={author.name} 
                                        className="w-20 h-20 rounded-full object-cover border-4 border-transparent group-hover:border-indigo-500/50 transition-all shadow-md" 
                                    />
                                    <span className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-300 group-hover:text-brand-blue dark:group-hover:text-white text-center truncate w-full transition-colors">
                                        {author.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Reviews Section */}
                <div className="mt-12 border-t border-gray-200/50 dark:border-white/10 pt-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-brand-blue dark:text-white">{t('reviews')}</h3>
                         {currentUser && (
                             <button 
                                onClick={() => setIsFeedbackModalOpen(true)}
                                className="flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-full transition-colors"
                            >
                                 <PencilIcon className="h-4 w-4" />
                                 {t('writeReview')}
                             </button>
                         )}
                    </div>
                    
                    {/* Reviews List */}
                    {localReviews.length > 0 ? (
                        <div className="space-y-6">
                            {localReviews.map((review) => (
                                <div key={review.id} className="bg-white/30 dark:bg-white/5 backdrop-blur-sm p-6 rounded-xl border border-white/20 dark:border-white/5 shadow-sm">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full p-2 shadow-inner">
                                                <UserCircleIcon className="h-6 w-6 text-gray-600 dark:text-gray-200" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white text-sm">{review.userName}</p>
                                                <div className="flex text-yellow-400 mt-0.5">
                                                    {[...Array(5)].map((_, i) => (
                                                        <StarIcon key={i} className={`h-3 w-3 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}`} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-black/5 dark:bg-white/10 px-2 py-1 rounded">
                                            {new Date(review.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="mt-4 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                                        {review.comment}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white/20 dark:bg-white/5 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400 italic mb-2">{t('noReviewsYet')}</p>
                            {!currentUser && (
                                <button onClick={onLogin} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline text-sm">
                                    {t('loginToReview')}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Carousels */}
                {moreByAuthor.length > 0 && 
                <BookCarousel title={`${t('moreBy')} ${book.author.name}`} books={moreByAuthor} onBookSelect={onBookSelect} onBuyNow={onBuyNow} purchasedBooks={purchasedBooks} />
                }
                <BookCarousel title={t('customersAlsoBought')} books={customersAlsoBought} onBookSelect={onBookSelect} onBuyNow={onBuyNow} purchasedBooks={purchasedBooks} />

                {moreLikeThis.length > 0 &&
                    <BookCarousel title={t('moreLikeThis')} books={moreLikeThis} onBookSelect={onBookSelect} onBuyNow={onBuyNow} purchasedBooks={purchasedBooks} />
                }

                {/* Details Section */}
                <div className="mt-12 border-t border-gray-200/50 dark:border-white/10 pt-8 space-y-4 text-sm pb-12">
                    <h3 className="font-bold text-xl mb-4 text-brand-blue dark:text-white">{t('information')}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-white/30 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/5">
                        <div className="flex flex-col">
                            <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold mb-1">{t('category')}</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{book.category}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold mb-1">{t('published')}</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{formatPublishDate(book.publishDate)}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold mb-1">{t('language')}</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{book.language || t('portuguese')}</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-bold mb-1">{isAudiobook ? 'Duração' : t('pages')}</span>
                            <span className="font-semibold text-gray-900 dark:text-white">{isAudiobook ? book.duration : (book.pages || 'N/A')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <FeedbackModal 
            isOpen={isFeedbackModalOpen}
            onClose={() => setIsFeedbackModalOpen(false)}
            book={book}
            onSubmit={handleSubmitReview}
        />
    </div>
  );
};

export default BookDetail;