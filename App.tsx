// ... imports kept, only replacing components ...
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Book, User, Author, SortOrder, PaymentMethod, Notification, View, AuthorOnboardingData, Chat, NewsArticle } from './types';
import { books as initialBooks, mockRegisteredUsers, purchases, authors as initialAuthors, mockPaymentMethods, bookCategories as initialBookCategories, mockNotifications, mockChats, mockNews } from './constants';
import BookDetail from './components/BookDetail';
import CheckoutModal from './components/CheckoutModal';
import ReaderView from './components/ReaderView';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import BottomNav from './components/BottomNav';
import { HomeIcon, LibraryIcon, StoreIcon, SearchIcon, UserCircleIcon, ChevronRightIcon, ArrowLeftIcon, XIcon, ArrowRightIcon, SunIcon, MoonIcon, BellIcon, ChevronLeftIcon, FilterIcon, CheckCircleIcon, InformationCircleIcon, CogIcon, QuestionMarkCircleIcon, ShieldCheckIcon, ClockIcon, NewspaperIcon, HashtagIcon, ViewGridIcon, ViewListIcon, HeadphonesIcon, PhoneIcon, DownloadIcon, SparklesIcon, GlobeIcon, UsersIcon } from './components/Icons';
import BookCard from './components/BookCard';
import AuthorCard from './components/AuthorCard';
import FeaturedBookCard from './components/FeaturedBookCard';
import HeroBanner from './components/HeroBanner';
import { useAppContext } from './contexts/AppContext';
import LanguageSelector from './components/LanguageSelector';
import CategoryDropdown from './components/CategoryDropdown';
import { initDB, getOfflineBookIds, saveBookContent, deleteBookContent } from './utils/db';
import AuthorProfile from './components/AuthorProfile';
import Dashboard from './components/Dashboard';
import AccountSettingsModal from './components/AccountSettingsModal';
import Pagination from './components/Pagination';
import UserControls from './components/UserControls';
import BookGrid from './components/BookGrid';
import NotificationDropdown from './components/NotificationDropdown';
import SearchInput from './components/SearchInput';
import AuthorOnboardingModal from './components/AuthorOnboardingModal';
import Logo from './components/Logo';
import Header from './components/Header';
import EmailPreviewModal from './components/EmailPreviewModal';
import ChatModal from './components/ChatModal';
import NewsCard from './components/NewsCard';
import NewsDetail from './components/NewsDetail';
import { templates } from './utils/emailTemplates';
import { supabase } from './services/supabaseClient';
import BecomeAuthorCTA from './components/BecomeAuthorCTA';
import DashboardCTA from './components/DashboardCTA';

type AuthModal = 'login' | 'register' | 'forgot-password' | null;

const getInitialState = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    try {
      return JSON.parse(saved);
    } catch {
      // If parsing fails, it might be a raw string value stored previously.
      // Return it directly if T is compatible with string, otherwise return fallback.
      return saved as unknown as T;
    }
  } catch (e) {
    console.error(`Error loading ${key} from localStorage`, e);
    return fallback;
  }
};

const categoryIcons: Record<string, string> = {
    'Fantasia': '🧙‍♂️',
    'Ficção': '📖',
    'Mistério': '🕵️‍♀️',
    'Aventura': '🗺️',
    'Suspense': '😱',
    'Biografia': '👤',
    'História': '🏛️',
    'Romance': '❤️',
    'Não-Ficção': '💡',
};

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [previousView, setPreviousView] = useState<View>('home');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [selectedNews, setSelectedNews] = useState<NewsArticle | null>(null);
  
  // Persist Data States
  const [books, setBooks] = useState<Book[]>(() => getInitialState('livroflix_books', initialBooks));
  const [users, setUsers] = useState<User[]>(() => getInitialState('livroflix_users', mockRegisteredUsers));
  const [news, setNews] = useState<NewsArticle[]>(() => getInitialState('livroflix_news', mockNews));
  const [currentUser, setCurrentUser] = useState<User | null>(() => getInitialState('livroflix_current_user', null));

  const [purchasedBooks, setPurchasedBooks] = useState<Set<string>>(new Set(['1', '3', '5', '2', '7']));
  
  const [authModal, setAuthModal] = useState<AuthModal>(null);
  const [registerAsAuthorIntent, setRegisterAsAuthorIntent] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [recentlyViewedBooks, setRecentlyViewedBooks] = useState<Book[]>(() => getInitialState('livroflix_recent_books', []));
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [bookForCheckout, setBookForCheckout] = useState<Book | null>(null);

  const [favoritedBooks, setFavoritedBooks] = useState<Set<string>>(new Set());
  
  const [offlineBookIds, setOfflineBookIds] = useState<Set<string>>(new Set());
  const [isDBInitialized, setIsDBInitialized] = useState(false);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  const [isAuthorOnboardingOpen, setIsAuthorOnboardingOpen] = useState(false);
  const [pendingAuthorData, setPendingAuthorData] = useState<Partial<User> | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [emailPreviewContent, setEmailPreviewContent] = useState<string | null>(null);
  
  const [chats, setChats] = useState<Chat[]>(mockChats);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  
  const [categories, setCategories] = useState<string[]>(initialBookCategories);
  const [authorsList, setAuthorsList] = useState<Author[]>(initialAuthors);

  const [searchCategory, setSearchCategory] = useState<string | null>(() => getInitialState('livroflix_search_cat', null));
  const [selectedSearchAuthor, setSelectedSearchAuthor] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>(() => getInitialState('livroflix_sort_order', 'relevance'));

  const [storeFilterGenre, setStoreFilterGenre] = useState<string | null>(() => getInitialState('livroflix_store_genre', null));
  const [storeFilterPriceRange, setStoreFilterPriceRange] = useState<[string, string]>(['', '']); 
  const [storeFilterAuthor, setStoreFilterAuthor] = useState<string | null>(null);
  const [storeFilterDateRange, setStoreFilterDateRange] = useState<[string, string]>(['', '']);
  const [storeFilterFeatured, setStoreFilterFeatured] = useState(false);
  const [storeFilterOnSale, setStoreFilterOnSale] = useState(false);
  const [storeSort, setStoreSort] = useState<string>(() => getInitialState('livroflix_store_sort', 'relevance'));
  
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [storeViewMode, setStoreViewMode] = useState<'grid' | 'list'>('grid');

  const [collectionTitle, setCollectionTitle] = useState('');
  const [collectionBooks, setCollectionBooks] = useState<Book[]>([]);
  const [collectionPage, setCollectionPage] = useState(1);

  const [dashboardTab, setDashboardTab] = useState('overview');

  const [libraryPage, setLibraryPage] = useState(1);
  const [searchPage, setSearchPage] = useState(1);
  const [storePage, setStorePage] = useState(1);
  const [dashboardFavoritesPage, setDashboardFavoritesPage] = useState(1);
  const [dashboardLibraryPage, setDashboardLibraryPage] = useState(1);

  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);

  const { t, theme, toggleTheme, showToast, toast, formatPrice, setLanguage } = useAppContext();

  const BOOKS_PER_PAGE_GRID = 12;

  // --- Persistence Effects ---
  useEffect(() => { localStorage.setItem('livroflix_books', JSON.stringify(books)); }, [books]);
  useEffect(() => { localStorage.setItem('livroflix_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('livroflix_news', JSON.stringify(news)); }, [news]);
  useEffect(() => { localStorage.setItem('livroflix_recent_books', JSON.stringify(recentlyViewedBooks)); }, [recentlyViewedBooks]);
  useEffect(() => { 
      if (currentUser) {
          localStorage.setItem('livroflix_current_user', JSON.stringify(currentUser)); 
      } else {
          // Only remove if explicitly logged out, but handled in handleLogout.
          // Checking if currentUser is null on mount is handled by getInitialState.
      }
  }, [currentUser]);

  // Correctly stringify string values to prevent JSON.parse errors on load
  useEffect(() => { if (searchCategory) localStorage.setItem('livroflix_search_cat', JSON.stringify(searchCategory)); else localStorage.removeItem('livroflix_search_cat'); }, [searchCategory]);
  useEffect(() => { localStorage.setItem('livroflix_sort_order', JSON.stringify(sortOrder)); }, [sortOrder]);
  useEffect(() => { if (storeFilterGenre) localStorage.setItem('livroflix_store_genre', JSON.stringify(storeFilterGenre)); else localStorage.removeItem('livroflix_store_genre'); }, [storeFilterGenre]);
  useEffect(() => { localStorage.setItem('livroflix_store_sort', JSON.stringify(storeSort)); }, [storeSort]);

  useEffect(() => {
      const savedLang = localStorage.getItem('livroflix-lang');
      if (savedLang && (savedLang === 'pt' || savedLang === 'en')) {
          setLanguage(savedLang as any);
      }
  }, []);

  // --- Supabase Auth Listener ---
  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const user: User = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            role: session.user.user_metadata?.role || 'reader',
            status: 'active',
            avatarUrl: session.user.user_metadata?.avatarUrl,
            whatsapp: session.user.user_metadata?.whatsapp,
            notificationsEnabled: true,
            emailNotificationsEnabled: true
        };
        // If Supabase has a user, it takes priority over localStorage
        setCurrentUser(user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
         const user: User = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            role: session.user.user_metadata?.role || 'reader',
            status: 'active',
            avatarUrl: session.user.user_metadata?.avatarUrl,
            whatsapp: session.user.user_metadata?.whatsapp,
            notificationsEnabled: true,
            emailNotificationsEnabled: true
        };
        setCurrentUser(user);
      } 
      // NOTE: We do NOT set currentUser to null in the else block here.
      // Why? Because if we are using the Mock Login system (local storage), Supabase will report "no session",
      // and we don't want to wipe out the locally logged-in Mock User.
      // Logout is handled explicitly in handleLogout.
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- Fetch Books (Supabase + Local) ---
  useEffect(() => {
      const fetchBooks = async () => {
          try {
              // CORREÇÃO: Conectar com a tabela 'authors' em vez de 'profiles'
              // e buscar 'photo_url' em vez de 'avatar_url'
              const { data: booksData, error } = await supabase
                .from('books')
                .select(`*, author:authors (id, name, photo_url, bio)`);
              
              if (error) throw error;
              
              if (booksData && booksData.length > 0) {
                  // Only overwrite if we don't have local books (preserving local edits for this demo)
                  // In a real full-stack app, server data would win or merge.
                  const localBooks = localStorage.getItem('livroflix_books');
                  if (!localBooks) {
                      const formattedBooks: Book[] = booksData.map((b: any) => ({
                          id: b.id,
                          title: b.title,
                          author: { 
                              id: b.author?.id || 'unknown', 
                              name: b.author?.name || 'Unknown Author', 
                              // Ajuste para usar photo_url vindo da tabela authors
                              photoUrl: b.author?.photo_url || 'https://i.pravatar.cc/150', 
                              bio: b.author?.bio || '' 
                          },
                          coverUrl: b.cover_url, 
                          price: b.price, 
                          currency: b.currency || 'MZN', 
                          rating: b.rating || 0, 
                          category: b.category, 
                          description: b.description, 
                          status: b.status, 
                          sales: b.sales_count || 0, 
                          readers: b.readers_count || 0, 
                          publishDate: b.publish_date, 
                          pages: b.pages, 
                          language: b.language, 
                          isbn: b.isbn, 
                          salePrice: b.sale_price, 
                          saleStartDate: b.sale_start_date, 
                          saleEndDate: b.sale_end_date, 
                          isFeatured: b.is_featured, 
                          pdfUrl: b.pdf_url, 
                          audioUrl: b.audio_url, 
                          duration: b.duration, 
                          reviews: [] 
                      }));
                      setBooks(formattedBooks);
                  }
              } 
          } catch (e: any) { 
              console.warn("Supabase fetch notice (using local data):", e.message); 
          }
      };
      fetchBooks();
  }, []);

  useEffect(() => {
      if (!currentUser) return;
      const fetchPurchases = async () => {
          const { data, error } = await supabase.from('purchases').select('book_id').eq('user_id', currentUser.id);
          if (data) { setPurchasedBooks(prev => new Set([...prev, ...new Set(data.map((p: any) => p.book_id))])); }
      };
      fetchPurchases();
  }, [currentUser]);

  // ... (keeping visibility logic and filters) ...
  const publicBooks = useMemo(() => books.filter(b => b.status === 'Published'), [books]);
  const topSellers = useMemo(() => [...publicBooks].sort((a, b) => (b.sales || 0) - (a.sales || 0)), [publicBooks]);
  const freeBooks = useMemo(() => publicBooks.filter(b => b.price === 0), [publicBooks]);
  const paidBooks = useMemo(() => publicBooks.filter(b => b.price > 0).sort((a,b) => (b.rating || 0) - (a.rating || 0)), [publicBooks]);
  const featuredBooks = useMemo(() => publicBooks.filter(b => b.isFeatured), [publicBooks]);
  const onSaleBooks = useMemo(() => publicBooks.filter(b => { const now = new Date(); return b.salePrice && b.saleStartDate && b.saleEndDate && now >= new Date(b.saleStartDate) && now <= new Date(b.saleEndDate); }), [publicBooks]);
  const audiobooksList = useMemo(() => publicBooks.filter(b => !!b.audioUrl), [publicBooks]);
  const ebooksList = useMemo(() => publicBooks.filter(b => !!b.pdfUrl && !b.audioUrl), [publicBooks]);
  const allAuthorsNames = useMemo(() => [...new Set(publicBooks.map(b => b.author.name))].sort(), [publicBooks]);
  const allSearchSuggestions = useMemo(() => { return Array.from(new Set([...publicBooks.map(b => b.title), ...allAuthorsNames, ...categories])); }, [publicBooks, allAuthorsNames, categories]);
  const recommendedBooks = useMemo(() => {
    const historyBooks = [...recentlyViewedBooks, ...publicBooks.filter(b => purchasedBooks.has(b.id))];
    if (historyBooks.length === 0) return topSellers;
    const historyBookIds = new Set(historyBooks.map(b => b.id));
    const historyCategories = new Set(historyBooks.map(b => b.category));
    const recommendations = publicBooks.filter(book => historyCategories.has(book.category) && !historyBookIds.has(book.id));
    if (recommendations.length === 0) return topSellers.filter(b => !historyBookIds.has(b.id));
    return recommendations.sort(() => 0.5 - Math.random());
  }, [recentlyViewedBooks, purchasedBooks, publicBooks, topSellers]);

  const filteredStoreBooks = useMemo(() => {
      let results = [...publicBooks];
      if (storeFilterGenre) results = results.filter(b => b.category === storeFilterGenre);
      // ... existing filters ...
      const minPrice = storeFilterPriceRange[0] ? parseFloat(storeFilterPriceRange[0]) : 0;
      const maxPrice = storeFilterPriceRange[1] ? parseFloat(storeFilterPriceRange[1]) : Infinity;
      if (storeFilterPriceRange[0] || storeFilterPriceRange[1]) results = results.filter(b => { const price = b.salePrice || b.price; return price >= minPrice && price <= maxPrice; });
      if (storeFilterAuthor) results = results.filter(b => b.author.name === storeFilterAuthor);
      if (storeFilterDateRange[0] && storeFilterDateRange[1]) { const start = new Date(storeFilterDateRange[0]).getTime(); const end = new Date(storeFilterDateRange[1]).getTime(); results = results.filter(b => { const pubDate = new Date(b.publishDate || '').getTime(); return pubDate >= start && pubDate <= end; }); }
      if (storeFilterFeatured) results = results.filter(b => b.isFeatured);
      if (storeFilterOnSale) results = results.filter(b => { return b.salePrice && b.saleStartDate && b.saleEndDate && new Date() >= new Date(b.saleStartDate) && new Date() <= new Date(b.saleEndDate); });
      
      switch (storeSort) {
          case 'price_asc': results.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price)); break;
          case 'price_desc': results.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price)); break;
          case 'publicationDate_desc': results.sort((a, b) => new Date(b.publishDate || 0).getTime() - new Date(a.publishDate || 0).getTime()); break;
           case 'most_read': results.sort((a, b) => (b.readers || 0) - (a.readers || 0)); break;
           case 'recommended': results.sort((a, b) => b.rating - a.rating); break;
           case 'relevance': default: results.sort((a, b) => new Date(b.publishDate || 0).getTime() - new Date(a.publishDate || 0).getTime()); break;
      }
      return results;
  }, [publicBooks, storeFilterGenre, storeFilterPriceRange, storeFilterAuthor, storeFilterDateRange, storeFilterFeatured, storeFilterOnSale, storeSort]);

  useEffect(() => { initDB().then(async () => { const ids = await getOfflineBookIds(); setOfflineBookIds(new Set(ids)); setIsDBInitialized(true); }).catch(err => { console.error("Failed to initialize DB:", err); }); }, []);

  // ... (notifications logic) ...
  useEffect(() => {
      if (currentUser?.role === 'admin') {
          const pendingBooksCount = books.filter(b => b.status === 'Pending Approval').length;
          const hasPendingBookNotif = notifications.some(n => n.id === 'dynamic-pending-books');
          let newNotifs: Notification[] = [];
          if (pendingBooksCount > 0 && !hasPendingBookNotif) {
              newNotifs.push({ id: 'dynamic-pending-books', userId: currentUser.id, title: 'Pending Approvals', message: `${pendingBooksCount} book(s) awaiting approval.`, type: 'warning', date: new Date().toISOString(), read: false, linkTo: 'dashboard' });
          } else if (pendingBooksCount === 0 && hasPendingBookNotif) {
              setNotifications(prev => prev.filter(n => n.id !== 'dynamic-pending-books'));
          }
           if (newNotifs.length > 0) { setNotifications(prev => [...newNotifs, ...prev]); }
      }
  }, [books, currentUser]);

  useEffect(() => { setSearchPage(1); }, [searchQuery, searchCategory, selectedSearchAuthor, sortOrder]);
  useEffect(() => { setStorePage(1); }, [filteredStoreBooks]);

  // ... Handlers ... 
  const handleDownloadBook = useCallback(async (book: Book) => { if (!isDBInitialized) return; try { await saveBookContent(book); setOfflineBookIds(prev => new Set(prev).add(book.id)); } catch (error) { console.error("Failed to download book:", error); } }, [isDBInitialized]);
  const handleDeleteOfflineBook = useCallback(async (bookId: string) => { if (!isDBInitialized) return; try { await deleteBookContent(bookId); setOfflineBookIds(prev => { const newSet = new Set(prev); newSet.delete(bookId); return newSet; }); } catch (error) { console.error("Failed to delete book:", error); } }, [isDBInitialized]);
  const handleSelectBook = useCallback((book: Book) => { if (view !== 'detail') { setPreviousView(view); } setSelectedBook(book); setView('detail'); setRecentlyViewedBooks(prev => { const newHistory = [book, ...prev.filter(b => b.id !== book.id)]; return newHistory.slice(0, 10); }); }, [view]);
  const handleSelectAuthor = useCallback((author: Author) => { if (view !== 'author_profile') { setPreviousView(view); } setSelectedAuthor(author); setView('author_profile'); }, [view]);
  const handleSelectNews = useCallback((newsItem: NewsArticle) => { setSelectedNews(newsItem); if (view !== 'news_detail') setPreviousView(view); setView('news_detail'); }, [view]);
  const handleAddComment = useCallback((newsId: string, content: string) => { if (!currentUser) { setAuthModal('login'); return; } setNews(prevNews => prevNews.map(item => { if (item.id === newsId) { const newComment = { id: `c-${Date.now()}`, userId: currentUser.id, userName: currentUser.name, userAvatar: currentUser.avatarUrl, content: content, date: new Date().toISOString() }; if (selectedNews?.id === newsId) { setSelectedNews(prev => prev ? { ...prev, comments: [newComment, ...(prev.comments || [])] } : null); } return { ...item, comments: [newComment, ...(item.comments || [])] }; } return item; })); showToast('Comentário adicionado!', 'success'); }, [currentUser, selectedNews, showToast]);
  const handleCloseDetailView = useCallback(() => { setSelectedBook(null); setView(previousView); }, [previousView]);
  const handleCloseAuthorProfile = useCallback(() => { setSelectedAuthor(null); setView(previousView); }, [previousView]);
  const handleCloseReaderOrPreview = useCallback(() => { setView('detail'); }, []);
  const handleNavigateToDashboard = useCallback(() => { if (view !== 'dashboard') { setPreviousView(view); } setView('dashboard'); setDashboardTab('overview'); }, [view]);
  const handleNavigation = useCallback((viewName: View, relatedId?: string) => { if (viewName === 'detail' && relatedId) { const book = books.find(b => b.id === relatedId); if (book) handleSelectBook(book); } else if (viewName === 'author_profile' && relatedId) { const author = authorsList.find(a => a.id === relatedId); if (author) handleSelectAuthor(author); } else { if (viewName === 'dashboard') { if (relatedId) setDashboardTab(relatedId); else setDashboardTab('overview'); } if (view !== viewName) setPreviousView(view); setView(viewName); } }, [view, books, authorsList, handleSelectBook, handleSelectAuthor]);
  const handleBuyNow = useCallback((book: Book) => { if (!currentUser) { setAuthModal('login'); return; } setBookForCheckout(book); setIsCheckoutOpen(true); }, [currentUser]);
  const handleShowPreview = useCallback(() => { if (selectedBook) { setView('preview'); } }, [selectedBook]);
  const handleCloseCheckout = useCallback(() => { setIsCheckoutOpen(false); setBookForCheckout(null); }, []);
  const handlePaymentSuccess = useCallback(() => { if (bookForCheckout) { setPurchasedBooks(prev => { const newPurchases = new Set(prev); newPurchases.add(bookForCheckout.id); return newPurchases; }); const priceStr = formatPrice(bookForCheckout.salePrice || bookForCheckout.price); const emailHtml = templates.purchaseReceipt(currentUser?.name || 'Cliente', bookForCheckout.title, priceStr, `ORD-${Date.now()}`); if (currentUser?.notificationsEnabled) { const newNotification: Notification = { id: `notif-${Date.now()}`, userId: currentUser.id, title: t('paymentSuccessful'), message: `${t('youBought')} "${bookForCheckout.title}"`, type: 'success', date: new Date().toISOString(), read: false, linkTo: 'library', emailHtml: emailHtml }; setNotifications(prev => [newNotification, ...prev]); } setSelectedBook(bookForCheckout); setView('reader'); } setBookForCheckout(null); setIsCheckoutOpen(false); }, [bookForCheckout, currentUser, t, formatPrice]);
  const handleReadBook = useCallback((book: Book) => { setSelectedBook(book); setView('reader'); }, []);
  const handleSeeAll = useCallback((title: string, books: Book[]) => { setCollectionTitle(title); setCollectionBooks(books); setCollectionPage(1); if (view !== 'collection') { setPreviousView(view); } setView('collection'); }, [view]);
  
  // --- Auth Handlers ---
  const handleLogin = (user: User) => { 
      if (user.status === 'pending') { alert(t('accountPending')); return; } 
      if (user.status === 'blocked') { alert(t('accountBlocked')); return; } 
      
      setCurrentUser(user); 
      localStorage.setItem('livroflix_current_user', JSON.stringify(user)); // Persist Mock Login
      setAuthModal(null); 
  };

  const handleRegister = (user: Omit<User, 'id' | 'status'>, isAuthorFlow = false) => { 
      if (isAuthorFlow) { 
          setPendingAuthorData(user); 
          setAuthModal(null); 
          setIsAuthorOnboardingOpen(true); 
          return; 
      } 
      showToast(t('registeredSuccess'), 'success'); 
      setAuthModal(null); 
  };

  const handleLogout = async () => { 
      await supabase.auth.signOut(); 
      setCurrentUser(null); 
      localStorage.removeItem('livroflix_current_user'); // Clear persisted login
      setView('home'); 
      showToast(t('logoutSuccess'), 'info'); 
  };

  // ... (Rest of handlers) ...
  const handleAuthorOnboardingComplete = (onboardingData: AuthorOnboardingData) => { if (!pendingAuthorData) return; setIsAuthorOnboardingOpen(false); setPendingAuthorData(null); showToast(t('authorRegistrationPendingMessage'), 'success'); if (!currentUser) { setAuthModal('login'); } };
  const handleBecomeAuthor = () => { if (!currentUser) return; setPendingAuthorData(currentUser); setIsAuthorOnboardingOpen(true); };
  const handleBecomeAuthorClick = () => { if (currentUser) { if (currentUser.role === 'author') { showToast("Você já é um autor!", 'info'); } else { handleBecomeAuthor(); } } else { setRegisterAsAuthorIntent(true); setAuthModal('register'); } };
  const handleUpdateUser = useCallback((userId: string, updatedUserData: Partial<User> & { avatarFile?: File, newPassword?: string }) => { setUsers(prevUsers => { const userToUpdate = prevUsers.find(u => u.id === userId); if (!userToUpdate) return prevUsers; let updatedUser = { ...userToUpdate, ...updatedUserData }; if (updatedUserData.avatarFile) { const newAvatarUrl = URL.createObjectURL(updatedUserData.avatarFile); updatedUser = { ...updatedUser, avatarUrl: newAvatarUrl }; } delete (updatedUser as any).avatarFile; if (updatedUserData.newPassword) { updatedUser.password = updatedUserData.newPassword; } delete (updatedUser as any).newPassword; const isSelfUpdate = currentUser?.id === userId; if (isSelfUpdate) { setCurrentUser(updatedUser); showToast(t('profileUpdatedSuccess'), 'success'); } return prevUsers.map(u => u.id === userId ? updatedUser : u); }); setIsSettingsModalOpen(false); }, [currentUser, showToast, t]);
  const handleAddUser = useCallback((userData: Omit<User, 'id' | 'status'> & { status: 'active' | 'pending' | 'blocked' }) => { const newUser: User = { id: `user-${Date.now()}`, ...userData, notificationsEnabled: true, emailNotificationsEnabled: true, joinedDate: new Date().toISOString() }; setUsers(prev => [newUser, ...prev]); showToast('Usuário adicionado com sucesso!', 'success'); }, [showToast]);
  const handleDeleteUser = useCallback((userId: string) => { if (currentUser?.id === userId) { alert(t('cannotDeleteOwnAccount')); return; } setUsers(prev => prev.filter(u => u.id !== userId)); }, [currentUser, t]);
  const handleAddNews = useCallback((newsItem: Omit<NewsArticle, 'id' | 'date' | 'authorId'> & { imageFile?: File }) => { if (!currentUser || currentUser.role !== 'admin') return; const newArticle: NewsArticle = { id: `news-${Date.now()}`, title: newsItem.title, description: newsItem.description, imageUrl: newsItem.imageFile ? URL.createObjectURL(newsItem.imageFile) : 'https://picsum.photos/800/400', hashtags: newsItem.hashtags, date: new Date().toISOString(), authorId: currentUser.id, comments: [] }; setNews(prev => [newArticle, ...prev]); showToast('Notícia adicionada com sucesso!', 'success'); }, [currentUser, showToast]);
  const handleUpdateNews = useCallback((id: string, updatedNews: Partial<NewsArticle> & { imageFile?: File }) => { setNews(prev => prev.map(n => { if (n.id === id) { let imageUrl = n.imageUrl; if (updatedNews.imageFile) { imageUrl = URL.createObjectURL(updatedNews.imageFile); } const { imageFile, ...rest } = updatedNews; return { ...n, ...rest, imageUrl }; } return n; })); showToast('Notícia atualizada com sucesso!', 'success'); }, [showToast]);
  const handleDeleteNews = useCallback((id: string) => { setNews(prev => prev.filter(n => n.id !== id)); showToast('Notícia removida.', 'info'); }, [showToast]);
  const handleAddNotification = useCallback((notification: Omit<Notification, 'id' | 'date' | 'read'>) => { const newNotif: Notification = { id: `notif-${Date.now()}`, date: new Date().toISOString(), read: false, ...notification }; setNotifications(prev => [newNotif, ...prev]); }, []);
  const handleOpenChat = useCallback((recipientId: string) => { if (!currentUser) { setAuthModal('login'); return; } const existingChat = chats.find(chat => chat.participants.includes(currentUser.id) && chat.participants.includes(recipientId) ); if (existingChat) { setActiveChatId(existingChat.id); } else { const newChat: Chat = { id: `chat-${Date.now()}`, participants: [currentUser.id, recipientId], messages: [], lastUpdated: new Date().toISOString() }; setChats(prev => [...prev, newChat]); setActiveChatId(newChat.id); } }, [currentUser, chats]);
  const handleSendMessage = useCallback((chatId: string, content: string) => { if (!currentUser) return; const newMessage = { id: `msg-${Date.now()}`, senderId: currentUser.id, content: content, timestamp: new Date().toISOString() }; setChats(prevChats => prevChats.map(chat => { if (chat.id === chatId) { return { ...chat, messages: [...chat.messages, newMessage], lastUpdated: newMessage.timestamp }; } return chat; })); }, [currentUser]);
  const searchResults = useMemo(() => { if (searchQuery.trim() === '' && !searchCategory && !selectedSearchAuthor) { return []; } const lowercasedQuery = searchQuery.toLowerCase(); let results = publicBooks.filter(book => book.title.toLowerCase().includes(lowercasedQuery) || book.author.name.toLowerCase().includes(lowercasedQuery) ); if (searchCategory) results = results.filter(book => book.category === searchCategory); if (selectedSearchAuthor) results = results.filter(book => book.author.name === selectedSearchAuthor); switch (sortOrder) { case 'price_asc': results.sort((a, b) => a.price - b.price); break; case 'price_desc': results.sort((a, b) => b.price - a.price); break; case 'rating_desc': results.sort((a, b) => b.rating - a.rating); break; case 'publicationDate_desc': results.sort((a, b) => new Date(b.publishDate || 0).getTime() - new Date(a.publishDate || 0).getTime()); break; case 'publicationDate_asc': results.sort((a, b) => new Date(a.publishDate || 0).getTime() - new Date(b.publishDate || 0).getTime()); break; case 'relevance': default: results.sort((a, b) => { const aTitleMatch = a.title.toLowerCase().includes(lowercasedQuery); const bTitleMatch = b.title.toLowerCase().includes(lowercasedQuery); if (aTitleMatch && !bTitleMatch) return -1; if (!aTitleMatch && bTitleMatch) return 1; return 0; }); break; } return results; }, [searchQuery, searchCategory, selectedSearchAuthor, sortOrder, publicBooks]);
  const handleClearFilters = () => { setSearchCategory(null); setSelectedSearchAuthor(null); setSortOrder('relevance'); };
  const handleToggleFavorite = useCallback((bookId: string) => { if (!currentUser) { setAuthModal('login'); return; } setFavoritedBooks(prev => { const newSet = new Set(prev); if (newSet.has(bookId)) { newSet.delete(bookId); showToast(t('favoriteRemoved'), 'info'); } else { newSet.add(bookId); showToast(t('favoriteAdded'), 'success'); } return newSet; }); }, [currentUser, showToast, t]);
  const handleToggleFollow = useCallback((authorId: string) => { if (!currentUser) { setAuthModal('login'); return; } const isFollowing = currentUser.following?.includes(authorId) || false; let updatedFollowing: string[]; if (isFollowing) { updatedFollowing = currentUser.following?.filter(id => id !== authorId) || []; showToast(t('unfollowingAuthor'), 'info'); } else { updatedFollowing = [...(currentUser.following || []), authorId]; showToast(t('followingAuthor'), 'success'); } const updatedUser = { ...currentUser, following: updatedFollowing }; setCurrentUser(updatedUser); }, [currentUser, showToast, t]);
  const handleDeleteBook = useCallback((bookId: string) => { setBooks(prev => prev.filter(b => b.id !== bookId)); showToast(t('bookDeleted'), 'info'); }, [showToast, t]);
  const handleUpdateBook = useCallback((bookId: string, updatedData: Partial<Book>) => { setBooks(prev => prev.map(b => { if (b.id === bookId) { if (updatedData.status === 'Published' && b.status !== 'Published') { showToast(t('bookApproved'), 'success'); } else if (updatedData.status === 'Draft' && b.status === 'Pending Approval') { showToast(t('bookRejected'), 'info'); } return { ...b, ...updatedData }; } return b; })); }, [t, showToast]);
  
  // Adding a book updates local state, which triggers useEffect to save to localStorage
  const handleAddBook = useCallback((newBookData: Omit<Book, 'id' | 'author' | 'coverUrl' | 'rating' | 'sales' | 'readers' | 'publishDate'> & { coverImage?: File; bookFile?: File; audioFile?: File }, authorOverride?: Author) => { const authorToUse = authorOverride || authorsList.find(a => a.name === currentUser?.name); if (!authorToUse) return; const initialStatus = currentUser?.role === 'admin' ? 'Published' : 'Pending Approval'; const newBook: Book = { id: `book-${Date.now()}`, ...newBookData, author: authorToUse, coverUrl: newBookData.coverImage ? URL.createObjectURL(newBookData.coverImage) : 'https://picsum.photos/300/450', pdfUrl: newBookData.bookFile ? URL.createObjectURL(newBookData.bookFile) : undefined, audioUrl: newBookData.audioFile ? URL.createObjectURL(newBookData.audioFile) : undefined, duration: newBookData.duration, rating: 0, sales: 0, readers: 0, publishDate: new Date().toISOString().split('T')[0], status: initialStatus }; delete (newBook as any).coverImage; delete (newBook as any).bookFile; delete (newBook as any).audioFile; setBooks(prev => [newBook, ...prev]); showToast(t('bookAddedSuccess'), 'success'); }, [currentUser, authorsList, showToast, t]);
  
  const handleAddCategory = useCallback((newCategory: string) => { if (!categories.includes(newCategory)) { setCategories(prev => [...prev, newCategory].sort()); } }, [categories]);
  const handleAddAuthor = useCallback((newAuthor: Author) => { setAuthorsList(prev => [...prev, newAuthor]); }, []);
  const handleUpdatePaymentMethod = useCallback((methodId: string, updatedData: Partial<PaymentMethod>) => { setPaymentMethods(prev => prev.map(m => m.id === methodId ? { ...m, ...updatedData } : m)); }, []);
  const handleDeletePaymentMethod = useCallback((methodId: string) => { setPaymentMethods(prev => prev.filter(m => m.id !== methodId)); }, []);
  const handleAddPaymentMethod = useCallback((newMethodData: Omit<PaymentMethod, 'id'>) => { const newMethod: PaymentMethod = { id: `pm-${Date.now()}`, ...newMethodData, }; setPaymentMethods(prev => [...prev, newMethod]); }, []);
  const handleMarkNotificationAsRead = useCallback((id: string) => { setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)); }, []);
  const handleMarkAllNotificationsAsRead = useCallback(() => { setNotifications(prev => { if (currentUser) { return prev.map(n => n.userId === currentUser.id ? { ...n, read: true } : n); } return prev; }); }, [currentUser]);
  const userNotifications = useMemo(() => currentUser ? notifications.filter(n => n.userId === currentUser.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : [] , [notifications, currentUser]);
  const activeChat = useMemo(() => chats.find(c => c.id === activeChatId), [chats, activeChatId]);
  const activeChatRecipient = useMemo(() => { if (!activeChat || !currentUser) return null; const recipientId = activeChat.participants.find(id => id !== currentUser.id); return users.find(u => u.id === recipientId) || mockRegisteredUsers.find(u => u.id === recipientId); }, [activeChat, currentUser, users]);
  const userChats = useMemo(() => { if (!currentUser) return []; return chats.filter(chat => chat.participants.includes(currentUser.id)); }, [chats, currentUser]);
  const renderGlobalCTA = () => { if (!currentUser || currentUser.role === 'reader') { return <BecomeAuthorCTA onAction={handleBecomeAuthorClick} />; } return <DashboardCTA onAction={handleNavigateToDashboard} userRole={currentUser.role === 'admin' ? 'admin' : 'author'} />; };

  // Updated BookCarousel with Navigation Arrows and specific widths
  const BookCarousel = ({ title, books: booksToShow, onSelect, onRead, purchased, favorited, onToggleFavorite, onSeeAll }: any) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    
    const scroll = (direction: 'left' | 'right') => {
      if (scrollRef.current) {
        // Scroll by container width or approximately 3 items
        const scrollAmount = scrollRef.current.clientWidth * 0.8; 
        if (direction === 'left') scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        else scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    };

    return (
        <div className="relative group/carousel mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">{title}</h2>
            {onSeeAll && (
                 <button onClick={() => onSeeAll(title, booksToShow)} className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-white/50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors flex items-center gap-1">
                    <span className="text-sm font-bold hidden sm:inline">{t('viewAll')}</span>
                    <ChevronRightIcon className="h-5 w-5" />
                </button>
            )}
          </div>
          <div className="relative">
             <button 
                onClick={() => scroll('left')} 
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-3 bg-white dark:bg-black text-gray-900 dark:text-white rounded-full shadow-xl opacity-0 group-hover/carousel:opacity-100 transition-opacity disabled:opacity-0 -ml-5 border border-gray-200 dark:border-gray-800 hidden md:flex items-center justify-center"
             >
                <ChevronLeftIcon className="h-6 w-6" />
             </button>
             
             <div ref={scrollRef} className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth py-4 -my-4 px-1 snap-x snap-mandatory">
                {booksToShow.map((book: Book) => (
                    <div 
                        key={book.id} 
                        // Strict width enforcement: Mobile 2, Tablet 3, Desktop 6
                        className="snap-start flex-shrink-0 min-w-[calc(50%-12px)] md:min-w-[calc(33.333%-16px)] lg:min-w-[calc(16.666%-20px)]"
                    >
                        <BookCard book={book} onSelect={onSelect} onRead={onRead} isPurchased={purchased.has(book.id)} isFavorited={favorited.has(book.id)} onToggleFavorite={onToggleFavorite} />
                    </div>
                ))}
             </div>
             
             <button 
                onClick={() => scroll('right')} 
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-3 bg-white dark:bg-black text-gray-900 dark:text-white rounded-full shadow-xl opacity-0 group-hover/carousel:opacity-100 transition-opacity -mr-5 border border-gray-200 dark:border-gray-800 hidden md:flex items-center justify-center"
             >
                <ChevronRightIcon className="h-6 w-6" />
             </button>
          </div>
        </div>
      );
  };

  const renderMainLayout = (currentView: View) => {
    // ... (keep existing view rendering logic unchanged except 'home')
    switch (currentView) {
      case 'detail':
      case 'preview':
        const safeBackgroundView = ['detail', 'preview', 'reader', 'author_profile', 'news_detail'].includes(previousView) ? 'home' : previousView;
        return renderMainLayout(safeBackgroundView);
      // ... other cases (author_profile, collection, blog, etc) ...
      case 'author_profile':
        return selectedAuthor && (
          <AuthorProfile
            author={selectedAuthor}
            booksByAuthor={publicBooks.filter(b => b.author.id === selectedAuthor?.id)}
            onBack={handleCloseAuthorProfile}
            onSelectBook={handleSelectBook}
            onReadBook={handleReadBook}
            purchasedBooks={purchasedBooks}
            favoritedBooks={favoritedBooks}
            onToggleFavorite={handleToggleFavorite}
            isFollowing={currentUser?.following?.includes(selectedAuthor.id) || false}
            onToggleFollow={handleToggleFollow}
            currentUser={currentUser}
            onLogin={() => setAuthModal('login')}
            onRegister={() => setAuthModal('register')}
            onLogout={handleLogout}
            onNavigateToDashboard={handleNavigateToDashboard}
            onNavigateSettings={() => setIsSettingsModalOpen(true)}
            onOpenChat={() => { const targetUser = users.find(u => u.name === selectedAuthor.name); if (targetUser) handleOpenChat(targetUser.id); else handleOpenChat('author-user-01'); }}
            onBecomeAuthor={handleBecomeAuthorClick}
          />
        );
      case 'collection':
         const totalCollectionPages = Math.ceil(collectionBooks.length / BOOKS_PER_PAGE_GRID);
         const paginatedCollection = collectionBooks.slice((collectionPage - 1) * BOOKS_PER_PAGE_GRID, collectionPage * BOOKS_PER_PAGE_GRID);
         return ( <div className="pb-24 min-h-screen"> <div className="max-w-[1600px] mx-auto"> <div className="pt-8 px-4 md:px-8 lg:px-16 flex items-center gap-4"> <button onClick={() => setView(previousView)} className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-300"><ArrowLeftIcon className="h-6 w-6" /></button> <h1 className="text-3xl font-bold text-brand-blue dark:text-white">{collectionTitle}</h1> </div> <div className="px-4 md:px-8 lg:px-16 py-8"> <BookGrid title="" books={paginatedCollection} onSelectBook={handleSelectBook} onReadBook={handleReadBook} purchasedBooks={purchasedBooks} favoritedBooks={favoritedBooks} onToggleFavorite={handleToggleFavorite} currentPage={collectionPage} totalPages={totalCollectionPages} onPageChange={setCollectionPage} /> </div> </div> </div> );
      case 'blog': return ( <div className="pb-24 min-h-screen"> <div className="max-w-[1600px] mx-auto"> <div className="pt-8 px-4 md:px-8 lg:px-16 mb-6"> <h1 className="text-3xl font-bold text-brand-blue dark:text-white mb-2">Blog de Notícias</h1> <p className="text-gray-600 dark:text-gray-400">Fique por dentro das novidades literárias e atualizações da plataforma.</p> </div> <div className="px-4 md:px-8 lg:px-16 py-8"> {news.length > 0 ? ( <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"> {news.map(item => ( <NewsCard key={item.id} news={item} onClick={handleSelectNews} /> ))} </div> ) : ( <div className="text-center py-16 bg-white/50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm"> <NewspaperIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" /> <p className="text-gray-500 dark:text-gray-400 text-lg">Ainda não há notícias publicadas.</p> </div> )} </div> </div> </div> );
      case 'news_detail': if (!selectedNews) return renderMainLayout('blog'); return ( <NewsDetail news={selectedNews} onBack={() => setView(previousView)} currentUser={currentUser} onAddComment={handleAddComment} onLogin={() => setAuthModal('login')} /> );
      case 'authors': return ( <div className="pb-24 min-h-screen"> <div className="max-w-[1600px] mx-auto"> <div className="pt-8 px-4 md:px-8 lg:px-16 mb-6"> <h1 className="text-3xl font-bold text-brand-blue dark:text-white">{t('authors')}</h1> <p className="text-gray-600 dark:text-gray-400 mt-2">Conheça as mentes brilhantes por trás das histórias.</p> </div> <div className="px-4 md:px-8 lg:px-16 py-8"> <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8 justify-items-center"> {authorsList.map(author => ( <AuthorCard key={author.id} author={author} onClick={handleSelectAuthor} /> ))} </div> <div className="mt-16"> <BecomeAuthorCTA onAction={handleBecomeAuthorClick} /> </div> </div> </div> </div> );
      case 'audiobooks': return ( <div className="pb-24 min-h-screen"> <div className="max-w-[1600px] mx-auto"> <div className="pt-8 px-4 md:px-8 lg:px-16 mb-6"> <h1 className="text-3xl font-bold text-brand-blue dark:text-white">{t('audiobooks')}</h1> <p className="text-gray-600 dark:text-gray-400 mt-2">Explore nossa coleção de livros narrados.</p> </div> <div className="px-4 md:px-8 lg:px-16 py-8"> {audiobooksList.length > 0 ? ( <BookGrid title="" books={audiobooksList} onSelectBook={handleSelectBook} onReadBook={handleReadBook} purchasedBooks={purchasedBooks} favoritedBooks={favoritedBooks} onToggleFavorite={handleToggleFavorite} /> ) : ( <div className="text-center py-16 bg-white/50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm"> <HeadphonesIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" /> <p className="text-gray-500 dark:text-gray-400 text-lg">Ainda não há audiobooks disponíveis.</p> </div> )} </div> </div> </div> );
      case 'dashboard': if (!currentUser) return renderMainLayout('home'); const userBooksDash = publicBooks.filter(b => purchasedBooks.has(b.id)); const authorBooks = currentUser.role === 'author' ? books.filter(b => b.author.name === currentUser.name) : []; return ( <div className="pb-24 min-h-screen"> <div className="max-w-[1600px] mx-auto"> <div className="pt-8 px-4 md:px-8 lg:px-16 mb-6"><h1 className="text-3xl font-bold text-brand-blue dark:text-white">{currentUser.role === 'admin' ? t('adminPanel') : t('dashboard')}</h1></div> <div className={currentUser.role === 'admin' ? "" : "px-4 md:px-8 lg:px-16 py-8"}> <Dashboard user={currentUser} purchasedBooks={userBooksDash} authorBooks={authorBooks} allUsers={users} allBooks={books} onReadBook={handleReadBook} onSelectBook={handleSelectBook} allPurchases={purchases} onDeleteBook={handleDeleteBook} onUpdateBook={handleUpdateBook} onAddBook={handleAddBook} favoritedBooks={favoritedBooks} onToggleFavorite={handleToggleFavorite} dashboardFavoritesPage={dashboardFavoritesPage} onDashboardFavoritesPageChange={setDashboardFavoritesPage} dashboardLibraryPage={dashboardLibraryPage} onDashboardLibraryPageChange={setDashboardLibraryPage} booksPerPage={BOOKS_PER_PAGE_GRID} onDeleteUser={handleDeleteUser} onUpdateUser={handleUpdateUser} paymentMethods={paymentMethods} onUpdatePaymentMethod={handleUpdatePaymentMethod} onDeletePaymentMethod={handleDeletePaymentMethod} onAddPaymentMethod={handleAddPaymentMethod} authors={authorsList} onSelectAuthor={handleSelectAuthor} categories={categories} onAddCategory={handleAddCategory} onAddAuthor={handleAddAuthor} activeTab={dashboardTab} notifications={userNotifications} onMarkAsRead={handleMarkNotificationAsRead} chats={currentUser.role === 'admin' ? chats : userChats} onOpenChat={(id) => { if (currentUser.role === 'admin') { setActiveChatId(id); } else { const chat = chats.find(c => c.id === id); if (chat) setActiveChatId(id); } }} news={news} onAddNews={handleAddNews} onUpdateNews={handleUpdateNews} onDeleteNews={handleDeleteNews} onBecomeAuthor={handleBecomeAuthorClick} onAddUser={handleAddUser} onAddNotification={handleAddNotification} /> </div> </div> </div> );
      case 'reader': return selectedBook && ( <ReaderView book={selectedBook} onBack={handleCloseReaderOrPreview} currentUser={currentUser} isPurchased={purchasedBooks.has(selectedBook.id)} onLogin={() => setAuthModal('login')} /> );
      case 'home':
        return (
          <div className="pb-24 min-h-screen">
            <div className="max-w-[1600px] mx-auto">
                <div className="px-4 md:px-8 lg:px-16 py-8 space-y-20">
                {featuredBooks.length > 0 && (
                    <HeroBanner 
                        books={topSellers}
                        onExplore={() => setView('book_store')} 
                        currentUser={currentUser}
                        onRegister={() => setAuthModal('register')}
                        onLogin={() => setAuthModal('login')}
                        onBookClick={handleSelectBook}
                    />
                )}

                {/* Categories Section - Updated Pills */}
                <div>
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{t('categories')}</h2>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide mask-fade-right">
                        {categories.map((category) => (
                            <button 
                                key={category} 
                                onClick={() => { setSearchCategory(category); setView('search'); }} 
                                className="group flex items-center gap-3 whitespace-nowrap px-7 py-3.5 bg-[#1a1a1a] text-white border border-white/10 rounded-full font-bold hover:bg-brand-blue dark:hover:bg-indigo-600 hover:border-transparent transition-all shadow-lg transform hover:-translate-y-1"
                            >
                                <span className="text-xl group-hover:scale-110 transition-transform">{categoryIcons[category] || '📚'}</span>
                                <span>{category}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Platform Benefits - Colored Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-xl relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                        <div className="relative z-10">
                            <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm shadow-lg">
                                <DownloadIcon className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Leitura Offline</h3>
                            <p className="text-blue-100 text-sm font-medium leading-relaxed">Baixe seus livros e leia onde quiser, sem gastar dados.</p>
                        </div>
                    </div>
                    <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-xl relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                        <div className="relative z-10">
                            <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm shadow-lg">
                                <PhoneIcon className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Pagamento Fácil</h3>
                            <p className="text-emerald-100 text-sm font-medium leading-relaxed">Pague com M-Pesa ou E-Mola em segundos. Seguro e instantâneo.</p>
                        </div>
                    </div>
                    <div className="p-8 rounded-3xl bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-xl relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl"></div>
                        <div className="relative z-10">
                            <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm shadow-lg">
                                <GlobeIcon className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Comunidade Global</h3>
                            <p className="text-orange-100 text-sm font-medium leading-relaxed">Conecte-se com autores e leitores de Moçambique e do mundo.</p>
                        </div>
                    </div>
                </div>

                {/* Quote of the Day */}
                <div className="relative p-12 md:p-16 rounded-[2.5rem] bg-gray-100 dark:bg-[#111] border border-gray-200 dark:border-gray-800 text-center overflow-hidden group">
                    {/* Decorative Quotes */}
                    <div className="absolute top-4 left-8 text-9xl font-serif text-gray-300 dark:text-white/5 select-none leading-none">“</div>
                    <div className="absolute bottom-4 right-8 text-9xl font-serif text-gray-300 dark:text-white/5 select-none leading-none rotate-180">“</div>
                    
                    <div className="relative z-10 max-w-4xl mx-auto">
                        <p className="text-2xl md:text-4xl font-serif italic text-gray-800 dark:text-gray-200 leading-relaxed">
                            "A leitura é uma fonte inesgotável de prazer, mas por incrível que pareça, a quase totalidade, não sente esta sede."
                        </p>
                        <div className="mt-8 flex flex-col items-center">
                            <div className="h-1 w-20 bg-brand-blue dark:bg-indigo-500 rounded-full mb-4"></div>
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">
                                Carlos Drummond de Andrade
                            </p>
                        </div>
                    </div>
                </div>

                {/* Book Carousels with new Arrow Navigation */}
                {onSaleBooks.length > 0 && <BookCarousel title={t('booksOnSale')} books={onSaleBooks} onSelect={handleSelectBook} onRead={handleReadBook} purchased={purchasedBooks} favorited={favoritedBooks} onToggleFavorite={handleToggleFavorite} onSeeAll={() => handleSeeAll(t('booksOnSale'), onSaleBooks)} />}

                <BookCarousel title={t('topSellers')} books={topSellers} onSelect={handleSelectBook} onRead={handleReadBook} purchased={purchasedBooks} favorited={favoritedBooks} onToggleFavorite={handleToggleFavorite} onSeeAll={() => handleSeeAll(t('topSellers'), topSellers)} />

                {news.length > 0 && (
                    <div>
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Últimas do Blog</h2>
                            <button onClick={() => setView('blog')} className="text-brand-blue dark:text-indigo-400 font-bold hover:underline text-sm flex items-center gap-1 group">
                                Ver Blog <ChevronRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {news.slice(0, 3).map(item => (
                                <NewsCard key={item.id} news={item} onClick={handleSelectNews} />
                            ))}
                        </div>
                    </div>
                )}

                {recentlyViewedBooks.length > 0 && <BookCarousel title={t('recentlyViewed')} books={recentlyViewedBooks} onSelect={handleSelectBook} onRead={handleReadBook} purchased={purchasedBooks} favorited={favoritedBooks} onToggleFavorite={handleToggleFavorite} onSeeAll={() => handleSeeAll(t('recentlyViewed'), recentlyViewedBooks)} />}
                
                {audiobooksList.length > 0 && <BookCarousel title={t('audiobooks')} books={audiobooksList} onSelect={handleSelectBook} onRead={handleReadBook} purchased={purchasedBooks} favorited={favoritedBooks} onToggleFavorite={handleToggleFavorite} onSeeAll={() => handleSeeAll(t('audiobooks'), audiobooksList)} />}

                {ebooksList.length > 0 && <BookCarousel title={t('eBooks')} books={ebooksList} onSelect={handleSelectBook} onRead={handleReadBook} purchased={purchasedBooks} favorited={favoritedBooks} onToggleFavorite={handleToggleFavorite} onSeeAll={() => handleSeeAll(t('eBooks'), ebooksList)} />}

                {recommendedBooks.length > 0 && <BookCarousel title={t('recommendedForYou')} books={recommendedBooks} onSelect={handleSelectBook} onRead={handleReadBook} purchased={purchasedBooks} favorited={favoritedBooks} onToggleFavorite={handleToggleFavorite} onSeeAll={() => handleSeeAll(t('recommendedForYou'), recommendedBooks)} />}
                
                {freeBooks.length > 0 && <BookCarousel title={t('freeBooks')} books={freeBooks} onSelect={handleSelectBook} onRead={handleReadBook} purchased={purchasedBooks} favorited={favoritedBooks} onToggleFavorite={handleToggleFavorite} onSeeAll={() => handleSeeAll(t('freeBooks'), freeBooks)} />}
                
                <div className="mt-20">
                    {renderGlobalCTA()}
                </div>

                </div>
            </div>
          </div>
        );
      case 'library':
        // ... same as before ...
        const userBooks = publicBooks.filter(b => purchasedBooks.has(b.id));
        const totalLibraryPages = Math.ceil(userBooks.length / BOOKS_PER_PAGE_GRID);
        const paginatedLibrary = userBooks.slice((libraryPage - 1) * BOOKS_PER_PAGE_GRID, libraryPage * BOOKS_PER_PAGE_GRID);
        return (
           <div className="pb-24 min-h-screen">
             <div className="max-w-[1600px] mx-auto">
                <div className="pt-8 px-4 md:px-8 lg:px-16 mb-6"><h1 className="text-3xl font-bold text-brand-blue dark:text-white">{t('library')}</h1></div>
                
                <div className="px-4 md:px-8 lg:px-16 py-8">
                {userBooks.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {paginatedLibrary.map(book => (
                                <BookCard key={book.id} book={book} onSelect={handleSelectBook} onRead={handleReadBook} isPurchased={true} isOffline={offlineBookIds.has(book.id)} onDownload={handleDownloadBook} onDeleteOffline={handleDeleteOfflineBook} showOfflineControls={true} isFavorited={favoritedBooks.has(book.id)} onToggleFavorite={handleToggleFavorite} />
                            ))}
                        </div>
                        <Pagination currentPage={libraryPage} totalPages={totalLibraryPages} onPageChange={setLibraryPage} />
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-60vh text-center">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('libraryIsEmpty')}</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xs">{t('libraryIsEmptyDescription')}</p>
                    </div>
                )}
                </div>

                <div className="px-4 md:px-8 lg:px-16 mb-8">
                    {renderGlobalCTA()}
                </div>
            </div>
          </div>
        );
      // ... other cases like book_store, search etc remain ...
      default: break;
    }
    
    // ... (keep book_store and search logic if not covered in switch above) ...
    // Since we use `case` above, this part is cleaner inside the switch or extracted. 
    // For brevity, I'll assume the structure follows the original file logic for store and search.
    if (currentView === 'book_store') {
        const totalStorePages = Math.ceil(filteredStoreBooks.length / BOOKS_PER_PAGE_GRID);
        const paginatedStoreBooks = filteredStoreBooks.slice((storePage - 1) * BOOKS_PER_PAGE_GRID, storePage * BOOKS_PER_PAGE_GRID);
        return (
        <div className="pb-24 min-h-screen">
            <div className="max-w-[1600px] mx-auto">
                <div className="pt-8 px-4 md:px-8 lg:px-16 mb-6 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-brand-blue dark:text-white">{t('bookStore')}</h1>
                    <button onClick={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)} className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors lg:hidden"><FilterIcon className="h-6 w-6" /></button>
                </div>
                
                <div className="flex flex-col lg:flex-row px-4 md:px-8 lg:px-16 py-8 gap-8">
                    <aside className={`lg:w-64 flex-shrink-0 ${isFilterSidebarOpen ? 'block' : 'hidden lg:block'} space-y-6 glass-panel p-6 rounded-xl`}>
                        {/* Filters content same as before */}
                        <div className="flex justify-between items-center lg:hidden mb-4"><h3 className="font-bold text-lg">{t('filters')}</h3><button onClick={() => setIsFilterSidebarOpen(false)}><XIcon className="h-5 w-5"/></button></div>
                        <div><h4 className="font-bold mb-2 text-sm uppercase text-gray-500 dark:text-gray-400">{t('categories')}</h4><select value={storeFilterGenre || ''} onChange={e => setStoreFilterGenre(e.target.value || null)} className="w-full bg-white/50 dark:bg-white/10 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm"><option value="">{t('allCategories')}</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                        <div><h4 className="font-bold mb-2 text-sm uppercase text-gray-500 dark:text-gray-400">{t('priceRange')}</h4><div className="flex gap-2"><input type="number" placeholder={t('minPrice')} value={storeFilterPriceRange[0]} onChange={e => setStoreFilterPriceRange([e.target.value, storeFilterPriceRange[1]])} className="w-full bg-white/50 dark:bg-white/10 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm"/><input type="number" placeholder={t('maxPrice')} value={storeFilterPriceRange[1]} onChange={e => setStoreFilterPriceRange([storeFilterPriceRange[0], e.target.value])} className="w-full bg-white/50 dark:bg-white/10 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm"/></div></div>
                        <div><h4 className="font-bold mb-2 text-sm uppercase text-gray-500 dark:text-gray-400">{t('author')}</h4><select value={storeFilterAuthor || ''} onChange={e => setStoreFilterAuthor(e.target.value || null)} className="w-full bg-white/50 dark:bg-white/10 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm"><option value="">{t('allCategories').replace('Categorias', 'Autores')}</option>{allAuthorsNames.map(a => <option key={a} value={a}>{a}</option>)}</select></div>
                        <div><h4 className="font-bold mb-2 text-sm uppercase text-gray-500 dark:text-gray-400">{t('publicationDate')}</h4><div className="flex flex-col gap-2"><input type="date" placeholder={t('startDate')} value={storeFilterDateRange[0]} onChange={e => setStoreFilterDateRange([e.target.value, storeFilterDateRange[1]])} className="w-full bg-white/50 dark:bg-white/10 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm"/><input type="date" placeholder={t('endDate')} value={storeFilterDateRange[1]} onChange={e => setStoreFilterDateRange([storeFilterDateRange[0], e.target.value])} className="w-full bg-white/50 dark:bg-white/10 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm"/></div></div>
                        <div className="space-y-2"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={storeFilterFeatured} onChange={e => setStoreFilterFeatured(e.target.checked)} className="rounded text-indigo-500 focus:ring-indigo-500 bg-white/50 dark:bg-white/10 border-gray-300 dark:border-gray-600"/><span className="text-sm">{t('isFeatured')}</span></label><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={storeFilterOnSale} onChange={e => setStoreFilterOnSale(e.target.checked)} className="rounded text-indigo-500 focus:ring-indigo-500 bg-white/50 dark:bg-white/10 border-gray-300 dark:border-gray-600"/><span className="text-sm">{t('onSale')}</span></label></div>
                        <button onClick={handleClearFilters} className="w-full py-2 text-sm text-brand-blue dark:text-indigo-400 hover:underline">{t('clearFilters')}</button>
                    </aside>
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('showingResults', { start: (storePage - 1) * BOOKS_PER_PAGE_GRID + 1, end: Math.min(storePage * BOOKS_PER_PAGE_GRID, filteredStoreBooks.length), total: filteredStoreBooks.length })}</p>
                            <div className="flex items-center gap-3">
                                <div className="flex bg-gray-100 dark:bg-white/10 rounded-lg p-1">
                                    <button onClick={() => setStoreViewMode('grid')} className={`p-1.5 rounded-md transition-colors ${storeViewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow text-brand-blue dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5'}`} title="Grid View"><ViewGridIcon className="h-5 w-5" /></button>
                                    <button onClick={() => setStoreViewMode('list')} className={`p-1.5 rounded-md transition-colors ${storeViewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow text-brand-blue dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-white/5'}`} title="List View"><ViewListIcon className="h-5 w-5" /></button>
                                </div>
                                <select value={storeSort} onChange={e => setStoreSort(e.target.value)} className="bg-white/50 dark:bg-white/10 border-transparent rounded-lg p-2 text-sm focus:ring-0 backdrop-blur-sm"><option value="relevance">{t('sortByRelevance')}</option><option value="price_asc">{t('sortByPriceAsc')}</option><option value="price_desc">{t('sortByPriceDesc')}</option><option value="rating_desc">{t('sortByRating')}</option><option value="publicationDate_desc">{t('sortByPublicationDate')}</option><option value="most_read">{t('mostRead')}</option><option value="recommended">{t('recommended')}</option></select>
                            </div>
                        </div>
                        {paginatedStoreBooks.length > 0 ? (
                            <>
                                <div className={storeViewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-6" : "flex flex-col gap-4"}>
                                    {paginatedStoreBooks.map(book => (<BookCard key={book.id} book={book} onSelect={handleSelectBook} onRead={handleReadBook} isPurchased={purchasedBooks.has(book.id)} isFavorited={favoritedBooks.has(book.id)} onToggleFavorite={handleToggleFavorite} layout={storeViewMode} />))}
                                </div>
                                <Pagination currentPage={storePage} totalPages={totalStorePages} onPageChange={setStorePage} />
                            </>
                        ) : (
                            <div className="text-center py-16 bg-white/50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm"><p className="text-gray-500 dark:text-gray-400 text-lg">{t('noResultsFound')} "{searchQuery}".</p></div>
                        )}
                    </div>
                </div>
                <div className="px-4 md:px-8 lg:px-16 mt-8">{renderGlobalCTA()}</div>
            </div>
        </div>
        );
    }
    if (currentView === 'search') {
        const totalSearchPages = Math.ceil(searchResults.length / BOOKS_PER_PAGE_GRID);
        const paginatedSearch = searchResults.slice((searchPage - 1) * BOOKS_PER_PAGE_GRID, searchPage * BOOKS_PER_PAGE_GRID);
        return (
        <div className="pb-24 min-h-screen">
            <div className="max-w-[1600px] mx-auto">
                <div className="pt-8 px-4 md:px-8 lg:px-16 mb-6"><h1 className="text-3xl font-bold text-brand-blue dark:text-white">{t('search')}</h1></div>
                <div className="px-4 md:px-8 lg:px-16 py-8">
                <div className="relative mb-8"><SearchInput value={searchQuery} onChange={setSearchQuery} onSearch={setSearchQuery} suggestions={allSearchSuggestions} historyKey="global_search" placeholder={t('searchForBooksOrAuthors')} className="w-full" autoFocus /></div>
                <div className="flex flex-col sm:flex-row gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    <CategoryDropdown categories={categories} selectedCategory={searchCategory} onSelectCategory={setSearchCategory} />
                    <select value={selectedSearchAuthor || ''} onChange={(e) => setSelectedSearchAuthor(e.target.value || null)} className="bg-white dark:bg-[#212121] text-gray-700 dark:text-white border border-gray-200 dark:border-[#3e3e3e] rounded-full px-4 py-2 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-[#3e3e3e] transition-colors shadow-sm appearance-none pr-8"><option value="">{t('filterByAuthor')}</option>{allAuthorsNames.map(author => (<option key={author} value={author}>{author}</option>))}</select>
                    <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as SortOrder)} className="bg-white dark:bg-[#212121] text-gray-700 dark:text-white border border-gray-200 dark:border-[#3e3e3e] rounded-full px-4 py-2 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-[#3e3e3e] transition-colors shadow-sm appearance-none pr-8"><option value="relevance">{t('sortByRelevance')}</option><option value="price_asc">{t('sortByPriceAsc')}</option><option value="price_desc">{t('sortByPriceDesc')}</option><option value="rating_desc">{t('sortByRating')}</option><option value="publicationDate_desc">{t('sortByPublicationDate')}</option><option value="publicationDate_asc">{t('sortByPublicationDate')}</option></select>
                    {(searchCategory || selectedSearchAuthor || sortOrder !== 'relevance') && (<button onClick={handleClearFilters} className="text-sm text-red-500 font-semibold hover:underline whitespace-nowrap px-2">{t('clearFilters')}</button>)}
                </div>
                {paginatedSearch.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {paginatedSearch.map(book => (<BookCard key={book.id} book={book} onSelect={handleSelectBook} onRead={handleReadBook} isPurchased={purchasedBooks.has(book.id)} isFavorited={favoritedBooks.has(book.id)} onToggleFavorite={handleToggleFavorite} />))}
                        </div>
                        <Pagination currentPage={searchPage} totalPages={totalSearchPages} onPageChange={setSearchPage} />
                    </>
                ) : (
                    <div className="text-center py-16 bg-white/50 dark:bg-white/5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 backdrop-blur-sm"><h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('noResultsFound')} "{searchQuery}".</h2><p className="text-gray-600 dark:text-gray-400 mt-2">Tente ajustar seus filtros ou buscar por outro termo.</p></div>
                )}
                </div>
                <div className="px-4 md:px-8 lg:px-16 mb-8">{renderGlobalCTA()}</div>
            </div>
        </div>
        );
    }
    return null;
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${theme === 'dark' ? 'dark' : ''}`}>
      <Header 
        currentUser={currentUser}
        onLogin={() => setAuthModal('login')}
        onRegister={() => setAuthModal('register')}
        onLogout={handleLogout}
        onNavigateToDashboard={handleNavigateToDashboard}
        onNavigateHome={() => setView('home')}
        onNavigateSettings={() => setIsSettingsModalOpen(true)}
        notifications={userNotifications}
        onMarkAsRead={handleMarkNotificationAsRead}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        onNavigate={handleNavigation}
        onViewEmail={setEmailPreviewContent}
      />

      {renderMainLayout(view)}

      <BottomNav activeView={view === 'detail' || view === 'author_profile' || view === 'reader' || view === 'news_detail' ? 'home' : view} setView={setView} />

      {authModal === 'login' && <LoginModal onClose={() => setAuthModal(null)} onLogin={handleLogin} onSwitchToRegister={() => setAuthModal('register')} onForgotPassword={() => setAuthModal('forgot-password')} users={users} />}
      {authModal === 'register' && <RegisterModal onClose={() => { setAuthModal(null); setRegisterAsAuthorIntent(false); }} onRegister={handleRegister} onSwitchToLogin={() => setAuthModal('login')} initialIsAuthor={registerAsAuthorIntent} />}
      {authModal === 'forgot-password' && <ForgotPasswordModal onClose={() => setAuthModal(null)} onSwitchToLogin={() => setAuthModal('login')} users={users} />}
      {isCheckoutOpen && bookForCheckout && <CheckoutModal book={bookForCheckout} onClose={handleCloseCheckout} onPaymentSuccess={handlePaymentSuccess} paymentMethods={paymentMethods} />}
      {selectedBook && view === 'detail' && <BookDetail book={selectedBook} allBooks={books} onBack={handleCloseDetailView} onPreview={handleShowPreview} onBuyNow={handleBuyNow} onRead={() => handleReadBook(selectedBook)} isPurchased={purchasedBooks.has(selectedBook.id)} onBookSelect={handleSelectBook} onSelectAuthor={handleSelectAuthor} purchasedBooks={purchasedBooks} isFavorited={favoritedBooks.has(selectedBook.id)} onToggleFavorite={handleToggleFavorite} currentUser={currentUser} onLogin={() => setAuthModal('login')} onRegister={() => setAuthModal('register')} onLogout={handleLogout} onNavigateToDashboard={handleNavigateToDashboard} onNavigateSettings={() => setIsSettingsModalOpen(true)} />}
      {selectedBook && view === 'preview' && <ReaderView book={selectedBook} onBack={handleCloseReaderOrPreview} isPreview={true} onBuyFromPreview={handleBuyNow} currentUser={currentUser} isPurchased={false} onLogin={() => setAuthModal('login')} />}
      {isSettingsModalOpen && currentUser && <AccountSettingsModal user={currentUser} onClose={() => setIsSettingsModalOpen(false)} onSave={(data) => handleUpdateUser(currentUser.id, data)} paymentMethods={paymentMethods} onBecomeAuthor={handleBecomeAuthor} />}
      {isAuthorOnboardingOpen && <AuthorOnboardingModal isOpen={isAuthorOnboardingOpen} onClose={() => { setIsAuthorOnboardingOpen(false); if (!currentUser) setAuthModal('register'); }} onComplete={handleAuthorOnboardingComplete} />}
      {emailPreviewContent && <EmailPreviewModal isOpen={!!emailPreviewContent} onClose={() => setEmailPreviewContent(null)} htmlContent={emailPreviewContent} />}
      {activeChatId && activeChat && currentUser && activeChatRecipient && <ChatModal isOpen={!!activeChatId} onClose={() => setActiveChatId(null)} chat={activeChat} currentUser={currentUser} recipient={activeChatRecipient} onSendMessage={handleSendMessage} />}
      {toast && toast.visible && <div className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-xl z-[100] text-white text-sm font-semibold flex items-center gap-2 animate-slide-up ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-gray-800'}`}>{toast.type === 'success' && <CheckCircleIcon className="h-5 w-5" />}{toast.type === 'info' && <InformationCircleIcon className="h-5 w-5" />}{toast.message}</div>}
    </div>
  );
};

export default App;