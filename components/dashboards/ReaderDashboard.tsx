
import React, { useMemo, useState, useEffect } from 'react';
import { User, Book, Purchase, PaymentMethod, Author, Notification, Chat } from '../../types';
import BookGrid from '../BookGrid';
import { useAppContext } from '../../contexts/AppContext';
import { PhoneIcon, CreditCardIcon, ChevronRightIcon, BellIcon, CheckCircleIcon, InformationCircleIcon, SparklesIcon, ChatBubbleIcon, BookOpenIcon, ClockIcon } from '../Icons';
import BecomeAuthorCTA from '../BecomeAuthorCTA';

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
  chats: Chat[];
  onOpenChat: (chatId: string) => void;
  onBecomeAuthor: () => void;
}

const ReaderDashboard: React.FC<ReaderDashboardProps> = ({ 
    user, purchasedBooks, allBooks, onReadBook, onSelectBook, allPurchases, favoritedBooks, 
    onToggleFavorite, favoritesPage, onFavoritesPageChange, libraryPage, 
    onLibraryPageChange, booksPerPage, paymentMethods, authors, onSelectAuthor,
    activeTab: initialTab, notifications, onMarkAsRead, chats, onOpenChat, onBecomeAuthor
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

  // Get the most recently accessed book (mock logic using first purchased book for demo if no history)
  const lastReadBook = useMemo(() => {
      // In a real app, you'd sort by 'lastReadDate'
      return purchasedBooks.length > 0 ? purchasedBooks[0] : null;
  }, [purchasedBooks]);

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

  // New recent notifications summary for overview
  const recentNotifications = useMemo(() => notifications.filter(n => !n.read).slice(0, 3), [notifications]);

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
        <button
            onClick={() => setActiveTab('messages')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'messages' ? 'bg-brand-blue text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        >
            Mensagens
        </button>
      </div>

      {activeTab === 'overview' && (
          <div className="space-y-12 animate-fade-in-down">
            {/* Reading Stats Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
                    <div className="relative z-10">
                        <p className="text-indigo-100 text-xs font-bold uppercase tracking-wide mb-1">Minha Biblioteca</p>
                        <p className="text-3xl font-bold">{purchasedBooks.length}</p>
                        <p className="text-indigo-100 text-xs mt-2">Livros adquiridos</p>
                    </div>
                    <BookOpenIcon className="absolute bottom-4 right-4 h-8 w-8 text-white/30" />
                </div>
                <div className="bg-white dark:bg-[#212121] border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-green-600 dark:text-green-400">
                            <CheckCircleIcon className="h-5 w-5" />
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Autores Seguidos</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white pl-1">{followedAuthors.length}</p>
                </div>
                <div className="bg-white dark:bg-[#212121] border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
                            <ClockIcon className="h-5 w-5" />
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Tempo de Leitura</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white pl-1">-- h -- min</p>
                    <p className="text-xs text-gray-400 pl-1 mt-1">Estimado</p>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Continue Reading Card (Left 2/3) */}
                <div className="lg:col-span-2">
                    {lastReadBook ? (
                        <div className="bg-white dark:bg-[#212121] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-6 items-center h-full">
                            <img src={lastReadBook.coverUrl} alt={lastReadBook.title} className="w-24 h-36 object-cover rounded-lg shadow-md" />
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1">Continue Lendo</h3>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{lastReadBook.title}</h2>
                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">de {lastReadBook.author.name}</p>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4 max-w-md mx-auto md:mx-0">
                                    <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                                </div>
                                <p className="text-xs text-gray-500 mb-4">45% concluído</p>
                                <button 
                                    onClick={() => onReadBook(lastReadBook)}
                                    className="px-6 py-2 bg-brand-blue text-white font-bold rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
                                >
                                    Continuar Leitura
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-[#212121] rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col justify-center items-center text-center">
                            <BookOpenIcon className="h-12 w-12 text-gray-300 mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Sua aventura começa aqui</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">Explore a biblioteca e comece a ler seu primeiro livro.</p>
                        </div>
                    )}
                </div>

                {/* Notifications Summary (Right 1/3) */}
                <div className="bg-white dark:bg-[#212121] rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <BellIcon className="h-5 w-5 text-orange-500" />
                            Novidades
                        </h3>
                        <button onClick={() => setActiveTab('notifications')} className="text-xs text-indigo-500 hover:underline font-semibold">{t('viewAll')}</button>
                    </div>
                    <div className="space-y-3">
                        {recentNotifications.length > 0 ? recentNotifications.map(n => (
                            <div key={n.id} className="flex gap-3 items-start p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer" onClick={() => setActiveTab('notifications')}>
                                <div className="mt-0.5">{getNotificationIcon(n.type)}</div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate">{n.title}</p>
                                    <p className="text-[10px] text-gray-500 line-clamp-2">{n.message}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-gray-500 text-center py-4">Nenhuma notificação recente.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Followed Authors Section */}
            <div>
                <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('authorsIFollow')}</h2>
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
            
            {favoriteBookDetails.length > 0 && (
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
            )}

            {purchasedBooks.length > 0 && (
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

            <div className="mt-12">
                <BecomeAuthorCTA onAction={onBecomeAuthor} />
            </div>
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

      {activeTab === 'messages' && (
          <div className="bg-white dark:bg-gray-800/50 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white p-6 border-b border-gray-100 dark:border-gray-700">Mensagens</h2>
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
                                          <p className="text-sm font-bold text-gray-900 dark:text-white">Conversa com Autor</p>
                                          <span className="text-xs text-gray-500">{new Date(chat.lastUpdated).toLocaleDateString()}</span>
                                      </div>
                                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{lastMsg ? lastMsg.content : 'Inicie a conversa...'}</p>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              ) : (
                  <div className="p-12 text-center">
                      <ChatBubbleIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">Você ainda não tem mensagens.</p>
                  </div>
              )}
          </div>
      )}
    </div>
  );
};

export default ReaderDashboard;
