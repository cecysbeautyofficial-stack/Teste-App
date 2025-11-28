
import React, { useState, useMemo, useEffect } from 'react';
import { Author, Book, User } from '../types';
import { ArrowLeftIcon, UserPlusIcon, TwitterIcon, InstagramIcon, LinkIcon, CheckCircleIcon, SearchIcon, StarIcon, ChatBubbleIcon } from './Icons';
import BookCard from './BookCard';
import { useAppContext } from '../contexts/AppContext';
import UserControls from './UserControls';
import Pagination from './Pagination';
import SearchInput from './SearchInput';
import BecomeAuthorCTA from './BecomeAuthorCTA';

interface AuthorProfileProps {
  author: Author;
  booksByAuthor: Book[];
  onBack: () => void;
  onSelectBook: (book: Book) => void;
  onReadBook: (book: Book) => void;
  purchasedBooks: Set<string>;
  favoritedBooks: Set<string>;
  onToggleFavorite: (bookId: string) => void;
  isFollowing: boolean;
  onToggleFollow: (authorId: string) => void;
  currentUser: User | null;
  onLogin: () => void;
  onRegister: () => void;
  onLogout: () => void;
  onNavigateToDashboard: () => void;
  onNavigateSettings: () => void;
  onOpenChat: () => void;
  onBecomeAuthor: () => void;
}

const AuthorProfile: React.FC<AuthorProfileProps> = ({ 
    author, booksByAuthor, onBack, onSelectBook, onReadBook, purchasedBooks, 
    favoritedBooks, onToggleFavorite, isFollowing, onToggleFollow,
    currentUser, onLogin, onRegister, onLogout, onNavigateToDashboard, onNavigateSettings, onOpenChat, onBecomeAuthor
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const { t } = useAppContext();
  const BOOKS_PER_PAGE = 10;

  const filteredBooks = useMemo(() => {
    if (!searchQuery) {
      return booksByAuthor;
    }
    return booksByAuthor.filter(book =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [booksByAuthor, searchQuery]);

  const bookSuggestions = useMemo(() => {
      return booksByAuthor.map(b => b.title);
  }, [booksByAuthor]);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const totalBooks = booksByAuthor.length;
  const totalReaders = booksByAuthor.reduce((acc, book) => acc + (book.readers || 0), 0);
  const avgRating = totalBooks > 0 
    ? (booksByAuthor.reduce((acc, book) => acc + book.rating, 0) / totalBooks).toFixed(1) 
    : 'N/A';

  const totalPages = Math.ceil(filteredBooks.length / BOOKS_PER_PAGE);
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * BOOKS_PER_PAGE,
    currentPage * BOOKS_PER_PAGE
  );

  return (
    <div className="fixed inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-2xl z-50 overflow-y-auto text-gray-900 dark:text-white animate-slide-up transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/60 dark:bg-black/40 backdrop-blur-xl border-b border-white/20 dark:border-white/10 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-16 flex justify-between items-center py-4">
            <button onClick={onBack} className="bg-white/50 dark:bg-white/10 rounded-full p-2 hover:bg-white/80 dark:hover:bg-white/20 transition-colors backdrop-blur-sm">
              <ArrowLeftIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
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

      <div className="max-w-[1600px] mx-auto">
        <div className="px-4 md:px-8 lg:px-16 py-8 pb-24">
            {/* Author Info Container */}
            <div className="flex flex-col items-center text-center mt-8 max-w-4xl mx-auto">
            {/* Photo */}
            <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 rounded-full transform scale-110"></div>
                <img 
                    src={author.photoUrl} 
                    alt={author.name} 
                    className="w-32 h-32 sm:w-48 sm:h-48 object-cover rounded-full shadow-2xl shadow-indigo-500/30 border-4 border-white/50 dark:border-white/10 relative z-10" 
                />
                {isFollowing && (
                    <div className="absolute bottom-2 right-2 z-20 bg-indigo-600 rounded-full p-2 border-4 border-white dark:border-[#0f0f0f] shadow-lg">
                        <CheckCircleIcon className="h-6 w-6 text-white" />
                    </div>
                )}
            </div>
            
            {/* Name */}
            <div className="mt-8">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight">{author.name}</h1>
            </div>

            {/* Bio */}
            <div className="mt-6 max-w-2xl px-4">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base sm:text-lg">
                {author.bio}
                </p>
            </div>

            {/* Author Stats - Glass Display */}
            <div className="flex justify-center items-center gap-4 sm:gap-8 mt-10 bg-white/30 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 sm:p-8 w-full max-w-lg border border-white/30 dark:border-white/10 shadow-xl">
                <div className="flex-1">
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{totalBooks}</p>
                    <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-bold mt-1">{t('books')}</p>
                </div>
                <div className="w-px h-10 sm:h-12 bg-gray-300/50 dark:bg-white/10"></div>
                <div className="flex-1">
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{totalReaders.toLocaleString()}</p>
                    <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-bold mt-1">{t('readers')}</p>
                </div>
                <div className="w-px h-10 sm:h-12 bg-gray-300/50 dark:bg-white/10"></div>
                <div className="flex-1">
                    <div className="flex items-center justify-center gap-1">
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{avgRating}</p>
                        <StarIcon className="h-5 w-5 text-yellow-500 fill-current pb-1" />
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide font-bold mt-1">{t('rating')}</p>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-wrap justify-center items-center gap-4">
                <button
                onClick={() => onToggleFollow(author.id)}
                className={`font-bold py-3 px-8 rounded-full flex items-center gap-2 transition-all duration-200 active:scale-95 shadow-lg ${
                    isFollowing 
                    ? 'bg-white/50 dark:bg-white/10 border-2 border-indigo-600 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 backdrop-blur-sm' 
                    : 'bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200'
                }`}
                >
                {isFollowing ? t('following') : t('follow')}
                </button>
                <button
                    onClick={onOpenChat}
                    className="font-bold py-3 px-8 rounded-full flex items-center gap-2 transition-all duration-200 active:scale-95 shadow-lg bg-brand-blue text-white hover:bg-blue-800 border-2 border-transparent"
                >
                    <ChatBubbleIcon className="h-5 w-5" />
                    <span>Mensagem</span>
                </button>
            </div>
            
            {/* Socials */}
            {(author.website || author.socials) && (
                <div className="mt-8 flex items-center justify-center gap-6 text-gray-500 dark:text-gray-400">
                    {author.socials?.twitter && (
                        <a href={author.socials.twitter} target="_blank" rel="noopener noreferrer" className="bg-white/50 dark:bg-white/5 p-3 rounded-full hover:bg-white dark:hover:bg-white/20 hover:text-blue-400 hover:scale-110 transition-all shadow-sm backdrop-blur-sm" title="Twitter/X">
                            <TwitterIcon className="h-5 w-5" />
                        </a>
                    )}
                    {author.socials?.instagram && (
                        <a href={author.socials.instagram} target="_blank" rel="noopener noreferrer" className="bg-white/50 dark:bg-white/5 p-3 rounded-full hover:bg-white dark:hover:bg-white/20 hover:text-pink-500 hover:scale-110 transition-all shadow-sm backdrop-blur-sm" title="Instagram">
                            <InstagramIcon className="h-5 w-5" />
                        </a>
                    )}
                    {author.website && (
                        <a href={author.website} target="_blank" rel="noopener noreferrer" className="bg-white/50 dark:bg-white/5 p-3 rounded-full hover:bg-white dark:hover:bg-white/20 hover:text-gray-900 dark:hover:text-white hover:scale-110 transition-all shadow-sm backdrop-blur-sm" title="Website">
                            <LinkIcon className="h-5 w-5" />
                        </a>
                    )}
                </div>
            )}
            </div>

            {/* Books by Author */}
            <div className="mt-16 border-t border-gray-200/50 dark:border-white/10 pt-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{t('booksBy')} {author.name}</h3>
                <div className="relative w-full sm:w-auto z-10">
                 <SearchInput 
                    value={searchQuery}
                    onChange={setSearchQuery}
                    onSearch={setSearchQuery}
                    suggestions={bookSuggestions}
                    historyKey={`author_profile_${author.id}`}
                    placeholder={t('searchBooks')}
                    className="w-full sm:w-64"
                 />
                </div>
            </div>
            {paginatedBooks.length > 0 ? (
                <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {paginatedBooks.map(book => (
                    <BookCard 
                        key={book.id} 
                        book={book} 
                        onSelect={onSelectBook}
                        onRead={onReadBook}
                        isPurchased={purchasedBooks.has(book.id)}
                        isFavorited={favoritedBooks.has(book.id)}
                        onToggleFavorite={onToggleFavorite}
                    />
                    ))}
                </div>
                {totalPages > 1 && (
                    <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    />
                )}
                </>
            ) : (
                <div className="text-center py-16 bg-white/30 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/5">
                <p className="text-gray-500 dark:text-gray-400 text-lg">{t('noResultsFound')} "{searchQuery}".</p>
                </div>
            )}
            </div>

            <div className="mt-16">
                <BecomeAuthorCTA onAction={onBecomeAuthor} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default AuthorProfile;
