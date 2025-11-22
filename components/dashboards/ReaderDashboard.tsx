
import React, { useMemo, useState, useEffect } from 'react';
import { User, Book, Purchase, PaymentMethod, Author, Notification } from '../../types';
import BookGrid from '../BookGrid';
import { useAppContext } from '../../contexts/AppContext';
import { PhoneIcon, CreditCardIcon, ChevronRightIcon, BellIcon, CheckCircleIcon, InformationCircleIcon, SparklesIcon } from '../Icons';

interface ReaderDashboardProps {
  user: User;
  purchasedBooks: Book[];
  allBooks: Book[];
  onReadBook: (book: Book) => void;
  onSelectBook: (book: Book) => void;
  allPurchases: Purchase[];
  favoritedBooks: Set<string>;
  onToggleFavorite: (bookId: string) => void;
  favoritesPage: number;
  onFavoritesPageChange: (page: number) => void;
  libraryPage: number;
  onLibraryPageChange: (page: number) => void;
  booksPerPage: number;
  paymentMethods: PaymentMethod[];
  authors: Author[];
  onSelectAuthor: (author: Author) => void;
  activeTab: string;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
}

const ReaderDashboard: React.FC<ReaderDashboardProps> = ({ 
    user, purchasedBooks, allBooks, onReadBook, onSelectBook, allPurchases, favoritedBooks, 
    onToggleFavorite, favoritesPage, onFavoritesPageChange, libraryPage, 
    onLibraryPageChange, booksPerPage, paymentMethods, authors, onSelectAuthor,
    activeTab: initialTab, notifications, onMarkAsRead
}) => {
  const { t, formatPrice, language } = useAppContext();
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
  }, [initialTab]);

  const purchasedBookSet = useMemo(() => new Set(purchasedBooks.map(b => b.id)), [purchasedBooks]);

  const favoriteBookDetails = useMemo(() => {
      if (!allBooks || !favoritedBooks) return [];
      return allBooks.filter(book => favoritedBooks.has(book.id));
  }, [allBooks, favoritedBooks]);

  const followedAuthors = useMemo(() => {
      if (!user.following || user.following.length === 0) return [];
      return authors.filter(author => user.following?.includes(author.id));
  }, [user.following, authors]);

  const booksFromFollowedAuthors = useMemo(() => {
      if (!user.following || user.following.length === 0) return [];
      return allBooks.filter(book => user.following?.includes(book.author.id));
  }, [user.following, allBooks]);

  const recommendedBooks = useMemo(() => {
    if (!allBooks) return [];
    
    const purchasedBookIds = new Set(purchasedBooks.map(b => b.id));
    const purchasedCategories = new Set(purchasedBooks.map(b => b.category));
    
    if (purchasedCategories.size === 0) {
        return allBooks
            .sort((a, b) => (b.sales || 0) - (a.sales || 0))
            .filter(b => !purchasedBookIds.has(b.id))
            .slice(0, 10);
    }

    const recommendations = allBooks.filter(book => 
        purchasedCategories.has(book.category) && 
        !purchasedBookIds.has(book.id)
    );

    return recommendations.sort(() => 0.5 - Math.random()).slice(0, 10);
  }, [purchasedBooks, allBooks]);

  const userPurchaseHistory = useMemo(() => {
    if (!allPurchases || !allBooks) return [];

    return allPurchases
      .filter(p => p.userId === user.id)
      .map(p => {
        const book = allBooks.find(b => b.id === p.bookId);
        return { ...p, book };
      })
      .filter((p): p is typeof p & { book: Book } => !!p.book)
      .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
  }, [allPurchases, allBooks, user.id]);

    const totalFavoritesPages = Math.ceil(favoriteBookDetails.length / booksPerPage);
    const paginatedFavorites = favoriteBookDetails.slice(
        (favoritesPage - 1) * booksPerPage,
        favoritesPage * booksPerPage
    );

    const totalLibraryPages = Math.ceil(purchasedBooks.length / booksPerPage);
    const paginatedLibrary = purchasedBooks.slice(
        (libraryPage - 1) * booksPerPage,
        libraryPage * booksPerPage
    );
  
  const getPaymentMethodIcon = (methodName: string) => {
    const method = paymentMethods.find(p => p.name === methodName);
    if (!method) return null;

    switch(method.icon){
        case 'phone':
          const isMpesa = method.name.toLowerCase().includes('mpesa');
          return <PhoneIcon className={`h-4 w-4 ${isMpesa ? 'text-red-500' : 'text-green-500'}`}/>;
        case 'card':
          return <CreditCardIcon className="h-4 w-4 text-blue-500"/>;
        case 'generic':
        default:
          return <CreditCardIcon className="h-4 w-4 text-gray-400"/>;
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
      switch(type) {
          case 'success': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
          case 'alert': return <SparklesIcon className="h-5 w-5 text-red-500" />; 
          case 'warning': return <InformationCircleIcon className="h-5 w-5 text-yellow-500" />;
          case 'info': default: return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
      }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Bem-vindo(a) de volta, <span className="text-indigo-600 dark:text-indigo-400">{user.name}!</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Continue de onde parou ou encontre sua próxima grande leitura.
        </p>
      </div>

      <div className="flex space-x-2 bg-white dark:bg-gray-800 p-1 rounded-lg w-fit border border-gray-200 dark:border-gray-700 shadow-sm">
        <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'overview' ? 'bg-brand-blue text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        >
            {t('overview')}
        </button>
        <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'notifications' ? 'bg-brand-blue text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        >
            {t('notifications')}
        </button>
      </div>

      {activeTab === 'overview' && (
          <div className="space-y-12">
            {/* Followed Authors Section */}
            <div>
                <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{t('authorsIFollow')}</h2>
                {followedAuthors.length > 0 && <ChevronRightIcon className="h-6 w-6 text-gray-400" />}
                </div>
                {followedAuthors.length > 0 ? (
                <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                    {followedAuthors.map(author => (
                    <button 
                        key={author.id} 
                        onClick={() => onSelectAuthor(author)}
                        className="flex flex-col items-center min-w-[100px] group"
                    >
                        <img 
                        src={author.photoUrl} 
                        alt={author.name} 
                        className="w-20 h-20 rounded-full object-cover border-2 border-transparent group-hover:border-indigo-500 transition-all" 
                        />
                        <span className="mt-2 text-sm text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white text-center truncate w-full">
                        {author.name}
                        </span>
                    </button>
                    ))}
                </div>
                ) : (
                <div className="text-center py-8 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-gray-500 dark:text-gray-400">{t('noFollowedAuthors')}</p>
                </div>
                )}
            </div>

            {/* Books from Followed Authors */}
            {followedAuthors.length > 0 && (
                <div>
                    {booksFromFollowedAuthors.length > 0 ? (
                        <BookGrid
                        title={t('booksFromAuthorsYouFollow')}
                        books={booksFromFollowedAuthors.slice(0, 6)} // Limit to 6 for dashboard view
                        onSelectBook={onSelectBook}
                        onReadBook={onReadBook}
                        purchasedBooks={purchasedBookSet}
                        favoritedBooks={favoritedBooks}
                        onToggleFavorite={onToggleFavorite}
                        />
                    ) : (
                        <div className="text-center py-8 bg-white dark:bg-gray-800/50 rounded-lg mt-4 border border-gray-200 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400">{t('noBooksFromFollowedAuthors')}</p>
                        </div>
                    )}
                </div>
            )}
            
            {favoriteBookDetails.length > 0 ? (
                <BookGrid
                title={t('favorites')}
                books={paginatedFavorites}
                onSelectBook={onSelectBook}
                onReadBook={onReadBook}
                purchasedBooks={purchasedBookSet}
                favoritedBooks={favoritedBooks}
                onToggleFavorite={onToggleFavorite}
                currentPage={favoritesPage}
                totalPages={totalFavoritesPages}
                onPageChange={onFavoritesPageChange}
                />
            ) : (
                <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('favorites')}</h2>
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('noFavoritesMessage')}</h2>
                </div>
                </div>
            )}

            {purchasedBooks.length > 0 ? (
                <BookGrid
                title="Minha Biblioteca"
                books={paginatedLibrary}
                onSelectBook={onSelectBook}
                onReadBook={onReadBook}
                purchasedBooks={purchasedBookSet}
                favoritedBooks={favoritedBooks}
                onToggleFavorite={onToggleFavorite}
                currentPage={libraryPage}
                totalPages={totalLibraryPages}
                onPageChange={onLibraryPageChange}
                />
            ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Sua biblioteca está vazia.</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Parece que você ainda não comprou nenhum livro. Explore a loja para começar sua coleção!
                    </p>
                </div>
            )}

            {userPurchaseHistory.length > 0 && (
                <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">{t('purchaseHistory')}</h2>
                <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700/50">
                    {userPurchaseHistory.map(({ book, purchaseDate, paymentMethod, amount }) => (
                        <li key={`${book.id}-${purchaseDate}`} className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
                        <img src={book.coverUrl} alt={book.title} className="w-16 h-24 object-cover rounded-md flex-shrink-0 shadow-sm" />
                        <div className="flex-grow">
                            <h3 className="font-bold text-gray-900 dark:text-white">{book.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{book.author.name}</p>
                            <div className="text-xs text-gray-500 mt-1">
                            <span>{t('purchaseDate')}: {new Date(purchaseDate).toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US')}</span>
                            </div>
                        </div>
                        <div className="flex-shrink-0 text-left sm:text-right w-full sm:w-auto mt-2 sm:mt-0">
                            <p className="font-bold text-gray-900 dark:text-white">{formatPrice(amount)}</p>
                            <div className="flex items-center sm:justify-end gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {getPaymentMethodIcon(paymentMethod)}
                            <span>{paymentMethod}</span>
                            </div>
                        </div>
                        </li>
                    ))}
                    </ul>
                </div>
                </div>
            )}

            {recommendedBooks.length > 0 && (
                <BookGrid
                title="Recomendados para Você"
                books={recommendedBooks}
                onSelectBook={onSelectBook}
                onReadBook={onReadBook}
                purchasedBooks={purchasedBookSet}
                favoritedBooks={favoritedBooks}
                onToggleFavorite={onToggleFavorite}
                />
            )}
          </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
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
    </div>
  );
};

export default ReaderDashboard;
