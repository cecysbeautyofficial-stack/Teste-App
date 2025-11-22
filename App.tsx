
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Book, User, Author, SortOrder, PaymentMethod, Notification, View, AuthorOnboardingData } from './types';
import { books as initialBooks, mockRegisteredUsers, purchases, authors as initialAuthors, mockPaymentMethods, bookCategories as initialBookCategories, mockNotifications } from './constants';
import BookDetail from './components/BookDetail';
import CheckoutModal from './components/CheckoutModal';
import ReaderView from './components/ReaderView';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import ForgotPasswordModal from './components/ForgotPasswordModal';
import BottomNav from './components/BottomNav';
import { HomeIcon, LibraryIcon, StoreIcon, SearchIcon, UserCircleIcon, ChevronRightIcon, ArrowLeftIcon, XIcon, ArrowRightIcon, SunIcon, MoonIcon, BellIcon, ChevronLeftIcon, FilterIcon, CheckCircleIcon, InformationCircleIcon, CogIcon, QuestionMarkCircleIcon, ShieldCheckIcon } from './components/Icons';
import BookCard from './components/BookCard';
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
import { templates } from './utils/emailTemplates';

type AuthModal = 'login' | 'register' | 'forgot-password' | null;

const App: React.FC = () => {
  const [view, setView] = useState<View>('home');
  const [previousView, setPreviousView] = useState<View>('home');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [selectedAuthor, setSelectedAuthor] = useState<Author | null>(null);
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [purchasedBooks, setPurchasedBooks] = useState<Set<string>>(new Set(['1', '3', '5', '2', '7']));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockRegisteredUsers);
  const [authModal, setAuthModal] = useState<AuthModal>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Initialize Recently Viewed from Local Storage for persistence
  const [recentlyViewedBooks, setRecentlyViewedBooks] = useState<Book[]>(() => {
      try {
          const saved = localStorage.getItem('livroflix_recent_books');
          return saved ? JSON.parse(saved) : [];
      } catch (e) {
          console.error("Error loading recent books:", e);
          return [];
      }
  });
  
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [bookForCheckout, setBookForCheckout] = useState<Book | null>(null);

  const [favoritedBooks, setFavoritedBooks] = useState<Set<string>>(new Set());
  const [highlights, setHighlights] = useState<Record<string, Set<number>>>({});
  
  const [offlineBookIds, setOfflineBookIds] = useState<Set<string>>(new Set());
  const [isDBInitialized, setIsDBInitialized] = useState(false);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  // Author Onboarding State
  const [isAuthorOnboardingOpen, setIsAuthorOnboardingOpen] = useState(false);
  const [pendingAuthorData, setPendingAuthorData] = useState<Partial<User> | null>(null);

  // Notification & Email State
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [emailPreviewContent, setEmailPreviewContent] = useState<string | null>(null);
  
  // Dynamic Data States
  const [categories, setCategories] = useState<string[]>(initialBookCategories);
  const [authorsList, setAuthorsList] = useState<Author[]>(initialAuthors);

  // Search State
  const [searchCategory, setSearchCategory] = useState<string | null>(null);
  const [selectedSearchAuthor, setSelectedSearchAuthor] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('relevance');

  // Store Page Filters
  const [storeFilterGenre, setStoreFilterGenre] = useState<string | null>(null);
  const [storeFilterPriceRange, setStoreFilterPriceRange] = useState<[string, string]>(['', '']); // Min, Max
  const [storeFilterAuthor, setStoreFilterAuthor] = useState<string | null>(null);
  const [storeFilterDateRange, setStoreFilterDateRange] = useState<[string, string]>(['', '']); // Start, End
  const [storeFilterFeatured, setStoreFilterFeatured] = useState(false);
  const [storeFilterOnSale, setStoreFilterOnSale] = useState(false);
  const [storeSort, setStoreSort] = useState<string>('relevance'); // reusing relevance for default
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

  // Collection View State
  const [collectionTitle, setCollectionTitle] = useState('');
  const [collectionBooks, setCollectionBooks] = useState<Book[]>([]);
  const [collectionPage, setCollectionPage] = useState(1);

  // Dashboard State
  const [dashboardTab, setDashboardTab] = useState('overview');

  // Pagination State
  const [libraryPage, setLibraryPage] = useState(1);
  const [searchPage, setSearchPage] = useState(1);
  const [storePage, setStorePage] = useState(1);
  const [dashboardFavoritesPage, setDashboardFavoritesPage] = useState(1);
  const [dashboardLibraryPage, setDashboardLibraryPage] = useState(1);

  // Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(mockPaymentMethods);

  const { t, theme, toggleTheme, showToast, toast, formatPrice } = useAppContext();

  const BOOKS_PER_PAGE_GRID = 12;

  // ... (Persistence and filtering logic remains same) ...
  // Persist Recently Viewed Books whenever they change
  useEffect(() => {
      localStorage.setItem('livroflix_recent_books', JSON.stringify(recentlyViewedBooks));
  }, [recentlyViewedBooks]);

  // Visibility Logic
  const publicBooks = useMemo(() => {
      return books.filter(b => b.status === 'Published');
  }, [books]);

  const topSellers = useMemo(() => [...publicBooks].sort((a, b) => (b.sales || 0) - (a.sales || 0)), [publicBooks]);
  const freeBooks = useMemo(() => publicBooks.filter(b => b.price === 0), [publicBooks]);
  const paidBooks = useMemo(() => publicBooks.filter(b => b.price > 0).sort((a,b) => (b.rating || 0) - (a.rating || 0)), [publicBooks]);
  const featuredBooks = useMemo(() => publicBooks.filter(b => b.isFeatured), [publicBooks]);
  
  const allAuthorsNames = useMemo(() => [...new Set(publicBooks.map(b => b.author.name))].sort(), [publicBooks]);

  const allSearchSuggestions = useMemo(() => {
      const titles = publicBooks.map(b => b.title);
      const authors = allAuthorsNames;
      const categoryNames = categories;
      return Array.from(new Set([...titles, ...authors, ...categoryNames]));
  }, [publicBooks, allAuthorsNames, categories]);

  const recommendedBooks = useMemo(() => {
    const historyBooks = [
      ...recentlyViewedBooks,
      ...publicBooks.filter(b => purchasedBooks.has(b.id))
    ];

    if (historyBooks.length === 0) {
      return topSellers;
    }
    
    const historyBookIds = new Set(historyBooks.map(b => b.id));
    const historyCategories = new Set(historyBooks.map(b => b.category));

    const recommendations = publicBooks.filter(book => 
      historyCategories.has(book.category) && 
      !historyBookIds.has(book.id)
    );

    if (recommendations.length === 0) {
        return topSellers.filter(b => !historyBookIds.has(b.id));
    }

    return recommendations.sort(() => 0.5 - Math.random());
  }, [recentlyViewedBooks, purchasedBooks, publicBooks, topSellers]);

  // Store Filtering Logic
  const filteredStoreBooks = useMemo(() => {
      let results = [...publicBooks];

      // Genre
      if (storeFilterGenre) {
          results = results.filter(b => b.category === storeFilterGenre);
      }

      // Price Range
      const minPrice = storeFilterPriceRange[0] ? parseFloat(storeFilterPriceRange[0]) : 0;
      const maxPrice = storeFilterPriceRange[1] ? parseFloat(storeFilterPriceRange[1]) : Infinity;
      if (storeFilterPriceRange[0] || storeFilterPriceRange[1]) {
          results = results.filter(b => {
              const price = b.salePrice || b.price;
              return price >= minPrice && price <= maxPrice;
          });
      }

      // Author
      if (storeFilterAuthor) {
          results = results.filter(b => b.author.name === storeFilterAuthor);
      }

      // Date Range
      if (storeFilterDateRange[0] && storeFilterDateRange[1]) {
          const start = new Date(storeFilterDateRange[0]).getTime();
          const end = new Date(storeFilterDateRange[1]).getTime();
          results = results.filter(b => {
              const pubDate = new Date(b.publishDate || '').getTime();
              return pubDate >= start && pubDate <= end;
          });
      }

      // Featured
      if (storeFilterFeatured) {
          results = results.filter(b => b.isFeatured);
      }

      // On Sale
      if (storeFilterOnSale) {
           results = results.filter(b => {
               return b.salePrice && b.saleStartDate && b.saleEndDate && 
                     new Date() >= new Date(b.saleStartDate) && 
                     new Date() <= new Date(b.saleEndDate);
           });
      }

      // Sorting
      switch (storeSort) {
          case 'price_asc':
              results.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
              break;
          case 'price_desc':
              results.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
              break;
          case 'publicationDate_desc':
              results.sort((a, b) => new Date(b.publishDate || 0).getTime() - new Date(a.publishDate || 0).getTime());
              break;
           case 'most_read':
              results.sort((a, b) => (b.readers || 0) - (a.readers || 0));
              break;
           case 'recommended':
              results.sort((a, b) => b.rating - a.rating);
              break;
           case 'relevance':
           default:
              results.sort((a, b) => new Date(b.publishDate || 0).getTime() - new Date(a.publishDate || 0).getTime());
              break;
      }

      return results;
  }, [publicBooks, storeFilterGenre, storeFilterPriceRange, storeFilterAuthor, storeFilterDateRange, storeFilterFeatured, storeFilterOnSale, storeSort]);


  useEffect(() => {
    initDB().then(async () => {
        const ids = await getOfflineBookIds();
        setOfflineBookIds(new Set(ids));
        setIsDBInitialized(true);
    }).catch(err => {
        console.error("Failed to initialize DB:", err);
    });
  }, []);

  // Dynamic Admin Notifications Logic
  useEffect(() => {
      if (currentUser?.role === 'admin') {
          const pendingBooksCount = books.filter(b => b.status === 'Pending Approval').length;
          const pendingAuthorsCount = users.filter(u => u.role === 'author' && u.status === 'pending').length;
          
          // Only add if not already present to avoid dupes on render
          const hasPendingBookNotif = notifications.some(n => n.id === 'dynamic-pending-books');
          const hasPendingAuthorNotif = notifications.some(n => n.id === 'dynamic-pending-authors');

          let newNotifs: Notification[] = [];

          if (pendingBooksCount > 0 && !hasPendingBookNotif) {
              newNotifs.push({
                  id: 'dynamic-pending-books',
                  userId: currentUser.id,
                  title: 'Pending Approvals',
                  message: `${pendingBooksCount} book(s) awaiting approval.`,
                  type: 'warning',
                  date: new Date().toISOString(),
                  read: false,
                  linkTo: 'dashboard'
              });
          } else if (pendingBooksCount === 0 && hasPendingBookNotif) {
              setNotifications(prev => prev.filter(n => n.id !== 'dynamic-pending-books'));
          }

          if (pendingAuthorsCount > 0 && !hasPendingAuthorNotif) {
              newNotifs.push({
                   id: 'dynamic-pending-authors',
                   userId: currentUser.id,
                   title: 'Pending Authors',
                   message: `${pendingAuthorsCount} author(s) awaiting approval.`,
                   type: 'warning',
                   date: new Date().toISOString(),
                   read: false,
                   linkTo: 'dashboard'
              });
           } else if (pendingAuthorsCount === 0 && hasPendingAuthorNotif) {
              setNotifications(prev => prev.filter(n => n.id !== 'dynamic-pending-authors'));
           }

           if (newNotifs.length > 0) {
               setNotifications(prev => [...newNotifs, ...prev]);
           }
      }
  }, [books, users, currentUser]);

  useEffect(() => {
    setSearchPage(1);
  }, [searchQuery, searchCategory, selectedSearchAuthor, sortOrder]);
  
  useEffect(() => {
      setStorePage(1);
  }, [filteredStoreBooks]);

  // Handlers
  const handleDownloadBook = useCallback(async (book: Book) => {
    if (!isDBInitialized) return;
    try {
        await saveBookContent(book);
        setOfflineBookIds(prev => new Set(prev).add(book.id));
    } catch (error) {
        console.error("Failed to download book:", error);
    }
  }, [isDBInitialized]);

  const handleDeleteOfflineBook = useCallback(async (bookId: string) => {
    if (!isDBInitialized) return;
    try {
        await deleteBookContent(bookId);
        setOfflineBookIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(bookId);
            return newSet;
        });
    } catch (error) {
        console.error("Failed to delete book:", error);
    }
  }, [isDBInitialized]);
  
  const handleSelectBook = useCallback((book: Book) => {
    if (view !== 'detail') {
      setPreviousView(view);
    }
    setSelectedBook(book);
    setView('detail');

    setRecentlyViewedBooks(prev => {
        const newHistory = [book, ...prev.filter(b => b.id !== book.id)];
        return newHistory.slice(0, 10);
    });
  }, [view]);
  
  const handleSelectAuthor = useCallback((author: Author) => {
    if (view !== 'author_profile') {
        setPreviousView(view);
    }
    setSelectedAuthor(author);
    setView('author_profile');
  }, [view]);

  const handleCloseDetailView = useCallback(() => {
    setSelectedBook(null);
    setView(previousView);
  }, [previousView]);

  const handleCloseAuthorProfile = useCallback(() => {
    setSelectedAuthor(null);
    setView(previousView);
  }, [previousView]);

  const handleCloseReaderOrPreview = useCallback(() => {
    setView('detail');
  }, []);
  
  const handleNavigateToDashboard = useCallback(() => {
    if (view !== 'dashboard') {
        setPreviousView(view);
    }
    setView('dashboard');
    setDashboardTab('overview');
  }, [view]);
  
  const handleNavigation = useCallback((viewName: View, relatedId?: string) => {
      if (viewName === 'detail' && relatedId) {
          const book = books.find(b => b.id === relatedId);
          if (book) handleSelectBook(book);
      } else if (viewName === 'author_profile' && relatedId) {
          const author = authorsList.find(a => a.id === relatedId);
          if (author) handleSelectAuthor(author);
      } else {
          if (viewName === 'dashboard') {
              if (relatedId) setDashboardTab(relatedId);
              else setDashboardTab('overview');
          }
          if (view !== viewName) setPreviousView(view);
          setView(viewName);
      }
  }, [view, books, authorsList, handleSelectBook, handleSelectAuthor]);

  const handleBuyNow = useCallback((book: Book) => {
    if (!currentUser) {
      setAuthModal('login');
      return;
    }
    setBookForCheckout(book);
    setIsCheckoutOpen(true);
  }, [currentUser]);
  
  const handleShowPreview = useCallback(() => {
    if (selectedBook) {
      setView('preview');
    }
  }, [selectedBook]);

  const handleCloseCheckout = useCallback(() => {
    setIsCheckoutOpen(false);
    setBookForCheckout(null);
  }, []);
  
  const handlePaymentSuccess = useCallback(() => {
    if (bookForCheckout) {
      setPurchasedBooks(prev => {
        const newPurchases = new Set(prev);
        newPurchases.add(bookForCheckout.id);
        return newPurchases;
      });

      const priceStr = formatPrice(bookForCheckout.salePrice || bookForCheckout.price);
      const emailHtml = templates.purchaseReceipt(currentUser?.name || 'Cliente', bookForCheckout.title, priceStr, `ORD-${Date.now()}`);

      // In-App Notification with Email
      if (currentUser?.notificationsEnabled) {
        const newNotification: Notification = {
            id: `notif-${Date.now()}`,
            userId: currentUser.id,
            title: t('paymentSuccessful'),
            message: `${t('youBought')} "${bookForCheckout.title}"`,
            type: 'success',
            date: new Date().toISOString(),
            read: false,
            linkTo: 'library',
            emailHtml: emailHtml // Store generated email
        };
        setNotifications(prev => [newNotification, ...prev]);
      }
      
      // Simulate sending email
      if (currentUser?.emailNotificationsEnabled) {
          console.log(`[Email Simulation] Sending receipt to ${currentUser.email}. (See Notification for Preview)`);
      }

      setSelectedBook(bookForCheckout);
      setView('reader');
    }
    
    setBookForCheckout(null);
    setIsCheckoutOpen(false);
  }, [bookForCheckout, currentUser, t, formatPrice]);

  const handleReadBook = useCallback((book: Book) => {
    setSelectedBook(book);
    setView('reader');
  }, []);

  const handleSeeAll = useCallback((title: string, books: Book[]) => {
    setCollectionTitle(title);
    setCollectionBooks(books);
    setCollectionPage(1);
    if (view !== 'collection') {
        setPreviousView(view);
    }
    setView('collection');
  }, [view]);

  const handleLogin = (user: User) => {
    if (user.status === 'pending') {
        alert(t('accountPending'));
        return;
    }
    if (user.status === 'blocked') {
        alert(t('accountBlocked'));
        return;
    }
    setCurrentUser(user);
    setAuthModal(null);
    showToast(t('loginSuccess'), 'success');
  };

  const handleRegister = (user: Omit<User, 'id' | 'status'>, isAuthorFlow = false) => {
    if (isAuthorFlow) {
        setPendingAuthorData(user);
        setAuthModal(null);
        setIsAuthorOnboardingOpen(true);
        return;
    }

    const emailHtml = templates.welcome(user.name);

    const newUser: User = { 
        ...user, 
        id: `user-${Date.now()}`,
        avatarUrl: user.avatarUrl || `https://i.pravatar.cc/150?u=${Date.now()}`,
        status: 'active',
        notificationsEnabled: true,
        emailNotificationsEnabled: true
    };
    
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setAuthModal(null);
    showToast(t('registeredSuccess'), 'success');

    // Welcome Notification with Email
    const newNotification: Notification = {
        id: `welcome-${Date.now()}`,
        userId: newUser.id,
        title: 'Bem-vindo ao Leia Aqui!',
        message: 'Sua conta foi criada com sucesso. Explore nossa biblioteca.',
        type: 'success',
        date: new Date().toISOString(),
        read: false,
        emailHtml: emailHtml
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleAuthorOnboardingComplete = (onboardingData: AuthorOnboardingData) => {
      if (!pendingAuthorData) return;

      const emailHtml = templates.authorWelcome(pendingAuthorData.name || 'Autor');

      if ('id' in pendingAuthorData && pendingAuthorData.id) {
          // Updating existing user
          const updatedUser = {
              ...pendingAuthorData,
              status: 'pending' as 'pending',
              role: 'author' as 'author',
              authorOnboardingData: onboardingData
          };
          setUsers(prev => prev.map(u => u.id === pendingAuthorData.id ? updatedUser as User : u));
          
          if (currentUser?.id === pendingAuthorData.id) {
              setCurrentUser(null);
          }
          
          // We can't easily send a notification to a logged out user/pending user in this mock state without backend persistence, 
          // but we assume the system sends email.
      } else {
          // New user
          const newUser: User = {
              ...(pendingAuthorData as Omit<User, 'id' | 'status'>),
              id: `user-${Date.now()}`,
              avatarUrl: pendingAuthorData.avatarUrl || `https://i.pravatar.cc/150?u=${Date.now()}`,
              status: 'pending', 
              role: 'author',
              notificationsEnabled: true,
              emailNotificationsEnabled: true,
              authorOnboardingData: onboardingData
          };
          setUsers(prev => [...prev, newUser]);
      }

      setIsAuthorOnboardingOpen(false);
      setPendingAuthorData(null);

      showToast(t('authorRegistrationPendingMessage'), 'success');
      if (!currentUser) {
          setAuthModal('login');
      }
  };

  const handleBecomeAuthor = () => {
      if (!currentUser) return;
      setPendingAuthorData(currentUser);
      setIsAuthorOnboardingOpen(true);
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    setView('home');
    showToast(t('logoutSuccess'), 'info');
  };

  const handleUpdateUser = useCallback((userId: string, updatedUserData: Partial<User> & { avatarFile?: File, newPassword?: string }) => {
    setUsers(prevUsers => {
        const userToUpdate = prevUsers.find(u => u.id === userId);
        if (!userToUpdate) return prevUsers;

        let updatedUser = { ...userToUpdate, ...updatedUserData };

        if (updatedUserData.avatarFile) {
            const newAvatarUrl = URL.createObjectURL(updatedUserData.avatarFile);
            updatedUser = { ...updatedUser, avatarUrl: newAvatarUrl };
        }
        delete (updatedUser as any).avatarFile;
        
        if (updatedUserData.newPassword) {
            updatedUser.password = updatedUserData.newPassword;
        }
        delete (updatedUser as any).newPassword;
        
        const isSelfUpdate = currentUser?.id === userId;

        // Email Logic
        const effectiveEmailEnabled = updatedUserData.emailNotificationsEnabled !== undefined 
            ? updatedUserData.emailNotificationsEnabled 
            : userToUpdate.emailNotificationsEnabled;

        if (effectiveEmailEnabled) {
            // Password Change Email
            if (updatedUserData.newPassword) {
                 // Normally send email here
            }
            // Status Change (by Admin) - Author Approval
            if (updatedUserData.status && updatedUserData.status !== userToUpdate.status) {
                if (updatedUserData.status === 'active' && userToUpdate.role === 'author') {
                    showToast(t('authorApproved'), 'success');
                    const emailHtml = templates.authorApproved(userToUpdate.name);
                    const notif: Notification = {
                        id: `auth-approve-${Date.now()}`,
                        userId: userId,
                        title: 'Conta Aprovada!',
                        message: 'Sua conta de autor foi aprovada.',
                        type: 'success',
                        date: new Date().toISOString(),
                        read: false,
                        linkTo: 'dashboard',
                        emailHtml: emailHtml
                    };
                    // We need to update notifications state, but can't access it easily inside setUsers callback if we want to be clean.
                    // We'll do a side effect in a useEffect or just set it here since setNotifications is available in closure.
                    setNotifications(prev => [notif, ...prev]);
                }
            }
        }

        if (isSelfUpdate) {
            setCurrentUser(updatedUser);
            showToast(t('profileUpdatedSuccess'), 'success');
        }

        return prevUsers.map(u => u.id === userId ? updatedUser : u);
    });
    setIsSettingsModalOpen(false);
  }, [currentUser, showToast, t]);

  const handleDeleteUser = useCallback((userId: string) => {
    if (currentUser?.id === userId) {
        alert(t('cannotDeleteOwnAccount'));
        return;
    }
    setUsers(prev => prev.filter(u => u.id !== userId));
  }, [currentUser, t]);
  
  // ... (Search logic remains same) ...
  const searchResults = useMemo(() => {
    if (searchQuery.trim() === '' && !searchCategory && !selectedSearchAuthor) {
      return [];
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    let results = publicBooks.filter(book => 
      book.title.toLowerCase().includes(lowercasedQuery) || 
      book.author.name.toLowerCase().includes(lowercasedQuery)
    );
    if (searchCategory) results = results.filter(book => book.category === searchCategory);
    if (selectedSearchAuthor) results = results.filter(book => book.author.name === selectedSearchAuthor);

    switch (sortOrder) {
      case 'price_asc': results.sort((a, b) => a.price - b.price); break;
      case 'price_desc': results.sort((a, b) => b.price - a.price); break;
      case 'rating_desc': results.sort((a, b) => b.rating - a.rating); break;
      case 'publicationDate_desc': results.sort((a, b) => new Date(b.publishDate || 0).getTime() - new Date(a.publishDate || 0).getTime()); break;
      case 'publicationDate_asc': results.sort((a, b) => new Date(a.publishDate || 0).getTime() - new Date(b.publishDate || 0).getTime()); break;
      case 'relevance': default: results.sort((a, b) => {
            const aTitleMatch = a.title.toLowerCase().includes(lowercasedQuery);
            const bTitleMatch = b.title.toLowerCase().includes(lowercasedQuery);
            if (aTitleMatch && !bTitleMatch) return -1;
            if (!aTitleMatch && bTitleMatch) return 1;
            return 0;
        }); break;
    }
    return results;
  }, [searchQuery, searchCategory, selectedSearchAuthor, sortOrder, publicBooks]);

  const handleClearFilters = () => {
      setSearchCategory(null);
      setSelectedSearchAuthor(null);
      setSortOrder('relevance');
  };

  const handleToggleFavorite = useCallback((bookId: string) => {
    if (!currentUser) {
        setAuthModal('login');
        return;
    }
    setFavoritedBooks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bookId)) {
        newSet.delete(bookId);
        showToast(t('favoriteRemoved'), 'info');
      } else {
        newSet.add(bookId);
        showToast(t('favoriteAdded'), 'success');
      }
      return newSet;
    });
  }, [currentUser, showToast, t]);

  const handleToggleFollow = useCallback((authorId: string) => {
    if (!currentUser) {
      setAuthModal('login');
      return;
    }
    const isFollowing = currentUser.following?.includes(authorId) || false;
    let updatedFollowing: string[];
    if (isFollowing) {
        updatedFollowing = currentUser.following?.filter(id => id !== authorId) || [];
        showToast(t('unfollowingAuthor'), 'info');
    } else {
        updatedFollowing = [...(currentUser.following || []), authorId];
        showToast(t('followingAuthor'), 'success');
    }
    const updatedUser = { ...currentUser, following: updatedFollowing };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
  }, [currentUser, showToast, t]);

  const handleDeleteBook = useCallback((bookId: string) => {
    setBooks(prev => prev.filter(b => b.id !== bookId));
    showToast(t('bookDeleted'), 'info');
  }, [showToast, t]);

  const handleUpdateBook = useCallback((bookId: string, updatedData: Partial<Book>) => {
    setBooks(prev => prev.map(b => {
        if (b.id === bookId) {
             // Check for status change to 'Published'
             if (updatedData.status === 'Published' && b.status !== 'Published') {
                 showToast(t('bookApproved'), 'success');
                 const authorUser = users.find(u => u.name === b.author.name);
                 if (authorUser) {
                    const emailHtml = templates.bookPublished(authorUser.name, b.title);
                    
                    if (authorUser.notificationsEnabled) {
                        const newNotif: Notification = {
                            id: `pub-notif-${Date.now()}`,
                            userId: authorUser.id,
                            title: t('bookPublished'),
                            message: `${t('yourBook')} "${b.title}" ${t('wasPublished')}`,
                            type: 'success',
                            date: new Date().toISOString(),
                            read: false,
                            linkTo: 'dashboard',
                            emailHtml: emailHtml
                        };
                        setNotifications(prev => [newNotif, ...prev]);
                    }
                 }
             } else if (updatedData.status === 'Draft' && b.status === 'Pending Approval') {
                 showToast(t('bookRejected'), 'info');
             }
             return { ...b, ...updatedData };
        }
        return b;
    }));
  }, [users, t, showToast]);

  const handleAddBook = useCallback((newBookData: Omit<Book, 'id' | 'author' | 'coverUrl' | 'rating' | 'sales' | 'readers' | 'publishDate'> & { coverImage?: File; bookFile?: File }, authorOverride?: Author) => {
      const authorToUse = authorOverride || authorsList.find(a => a.name === currentUser?.name);
      if (!authorToUse) return;
      
      const initialStatus = currentUser?.role === 'admin' ? 'Published' : 'Pending Approval';

      const newBook: Book = {
        id: `book-${Date.now()}`,
        ...newBookData,
        author: authorToUse,
        coverUrl: newBookData.coverImage ? URL.createObjectURL(newBookData.coverImage) : 'https://picsum.photos/300/450',
        pdfUrl: newBookData.bookFile ? URL.createObjectURL(newBookData.bookFile) : undefined,
        rating: 0,
        sales: 0,
        readers: 0,
        publishDate: new Date().toISOString().split('T')[0],
        status: initialStatus
      };
      delete (newBook as any).coverImage;
      delete (newBook as any).bookFile;

      setBooks(prev => [newBook, ...prev]);
      showToast(t('bookAddedSuccess'), 'success');
  }, [currentUser, authorsList, showToast, t]);

  const handleAddCategory = useCallback((newCategory: string) => {
      if (!categories.includes(newCategory)) {
          setCategories(prev => [...prev, newCategory].sort());
      }
  }, [categories]);

  const handleAddAuthor = useCallback((newAuthor: Author) => {
      setAuthorsList(prev => [...prev, newAuthor]);
  }, []);

  const handleUpdatePaymentMethod = useCallback((methodId: string, updatedData: Partial<PaymentMethod>) => {
    setPaymentMethods(prev => prev.map(m => m.id === methodId ? { ...m, ...updatedData } : m));
  }, []);

  const handleDeletePaymentMethod = useCallback((methodId: string) => {
    setPaymentMethods(prev => prev.filter(m => m.id !== methodId));
  }, []);

  const handleAddPaymentMethod = useCallback((newMethodData: Omit<PaymentMethod, 'id'>) => {
    const newMethod: PaymentMethod = {
        id: `pm-${Date.now()}`,
        ...newMethodData,
    };
    setPaymentMethods(prev => [...prev, newMethod]);
  }, []);

  // Notification Handlers
  const handleMarkNotificationAsRead = useCallback((id: string) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const handleMarkAllNotificationsAsRead = useCallback(() => {
      setNotifications(prev => {
         if (currentUser) {
             return prev.map(n => n.userId === currentUser.id ? { ...n, read: true } : n);
         }
         return prev;
      });
  }, [currentUser]);

  const userNotifications = useMemo(() => 
    currentUser ? notifications.filter(n => n.userId === currentUser.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) : []
  , [notifications, currentUser]);

  const BookCarousel = ({ title, books: booksToShow, onSelect, onRead, purchased, favorited, onToggleFavorite, onSeeAll }: any) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const scroll = (direction: 'left' | 'right') => {
      if (scrollRef.current) {
        const scrollAmount = 300; 
        if (direction === 'left') scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        else scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    };
    return (
        <div className="relative group/carousel">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
            {onSeeAll && (
                 <button onClick={() => onSeeAll(title, booksToShow)} className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-white/50 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors">
                    <span className="text-sm font-medium mr-1 hidden sm:inline">{t('viewAll')}</span>
                    <ChevronRightIcon className="h-5 w-5 inline" />
                </button>
            )}
          </div>
          <div className="relative">
             <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 dark:bg-black/60 text-gray-800 dark:text-white rounded-full shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-opacity disabled:opacity-0 -ml-4 md:-ml-6 backdrop-blur-md border border-white/10"><ChevronLeftIcon className="h-6 w-6" /></button>
             <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth py-4 -my-4 px-1">
                {booksToShow.map((book: Book) => (
                    <div key={book.id} className="min-w-[160px] w-[160px] sm:min-w-[180px] sm:w-[180px] md:min-w-[200px] md:w-[200px]">
                        <BookCard book={book} onSelect={onSelect} onRead={onRead} isPurchased={purchased.has(book.id)} isFavorited={favorited.has(book.id)} onToggleFavorite={onToggleFavorite} />
                    </div>
                ))}
             </div>
             <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 dark:bg-black/60 text-gray-800 dark:text-white rounded-full shadow-lg opacity-0 group-hover/carousel:opacity-100 transition-opacity -mr-4 md:-mr-6 backdrop-blur-md border border-white/10"><ChevronRightIcon className="h-6 w-6" /></button>
          </div>
        </div>
      );
  };

  const renderMainLayout = (currentView: View) => {
    switch (currentView) {
      case 'detail':
      case 'preview':
        const safeBackgroundView = ['detail', 'preview', 'reader', 'author_profile'].includes(previousView) ? 'home' : previousView;
        return renderMainLayout(safeBackgroundView);
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
          />
        );
      case 'collection':
         const totalCollectionPages = Math.ceil(collectionBooks.length / BOOKS_PER_PAGE_GRID);
         const paginatedCollection = collectionBooks.slice((collectionPage - 1) * BOOKS_PER_PAGE_GRID, collectionPage * BOOKS_PER_PAGE_GRID);
         return (
            <div className="pb-24 min-h-screen">
                <div className="max-w-[1600px] mx-auto">
                    <div className="pt-8 px-4 md:px-8 lg:px-16 flex items-center gap-4">
                        <button onClick={() => setView(previousView)} className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-600 dark:text-gray-300"><ArrowLeftIcon className="h-6 w-6" /></button>
                        <h1 className="text-3xl font-bold text-brand-blue dark:text-white">{collectionTitle}</h1>
                    </div>
                    <div className="px-4 md:px-8 lg:px-16 py-8">
                        <BookGrid title="" books={paginatedCollection} onSelectBook={handleSelectBook} onReadBook={handleReadBook} purchasedBooks={purchasedBooks} favoritedBooks={favoritedBooks} onToggleFavorite={handleToggleFavorite} currentPage={collectionPage} totalPages={totalCollectionPages} onPageChange={setCollectionPage} />
                    </div>
                </div>
            </div>
         );
      case 'dashboard':
        if (!currentUser) return renderMainLayout('home');
        const userBooksDash = publicBooks.filter(b => purchasedBooks.has(b.id));
        const authorBooks = currentUser.role === 'author' ? books.filter(b => b.author.name === currentUser.name) : [];
        return (
            <div className="pb-24 min-h-screen">
                 <div className="max-w-[1600px] mx-auto">
                    <div className="pt-8 px-4 md:px-8 lg:px-16 mb-6"><h1 className="text-3xl font-bold text-brand-blue dark:text-white">{currentUser.role === 'admin' ? t('adminPanel') : t('dashboard')}</h1></div>
                    <div className={currentUser.role === 'admin' ? "" : "px-4 md:px-8 lg:px-16 py-8"}>
                        <Dashboard 
                            user={currentUser}
                            purchasedBooks={userBooksDash}
                            authorBooks={authorBooks}
                            allUsers={users}
                            allBooks={books}
                            onReadBook={handleReadBook}
                            onSelectBook={handleSelectBook}
                            allPurchases={purchases}
                            onDeleteBook={handleDeleteBook}
                            onUpdateBook={handleUpdateBook}
                            onAddBook={handleAddBook}
                            favoritedBooks={favoritedBooks}
                            onToggleFavorite={handleToggleFavorite}
                            dashboardFavoritesPage={dashboardFavoritesPage}
                            onDashboardFavoritesPageChange={setDashboardFavoritesPage}
                            dashboardLibraryPage={dashboardLibraryPage}
                            onDashboardLibraryPageChange={setDashboardLibraryPage}
                            booksPerPage={BOOKS_PER_PAGE_GRID}
                            onDeleteUser={handleDeleteUser}
                            onUpdateUser={handleUpdateUser}
                            paymentMethods={paymentMethods}
                            onUpdatePaymentMethod={handleUpdatePaymentMethod}
                            onDeletePaymentMethod={handleDeletePaymentMethod}
                            onAddPaymentMethod={handleAddPaymentMethod}
                            authors={authorsList}
                            onSelectAuthor={handleSelectAuthor}
                            categories={categories}
                            onAddCategory={handleAddCategory}
                            onAddAuthor={handleAddAuthor}
                            activeTab={dashboardTab}
                            notifications={userNotifications}
                            onMarkAsRead={handleMarkNotificationAsRead}
                        />
                    </div>
                 </div>
            </div>
        );
      case 'reader':
        return selectedBook && <ReaderView book={selectedBook} onBack={handleCloseReaderOrPreview} />;
      case 'home':
        return (
          <div className="pb-24 min-h-screen">
            <div className="max-w-[1600px] mx-auto">
                <div className="px-4 md:px-8 lg:px-16 py-8 space-y-16">
                {featuredBooks.length > 0 && <HeroBanner book={featuredBooks[0]} onBuyNow={handleBuyNow} onRead={handleReadBook} onMoreInfo={handleSelectBook} isPurchased={purchasedBooks.has(featuredBooks[0].id)} />}
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('categories')}</h2>
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {categories.map((category) => (
                        <button key={category} onClick={() => { setSearchCategory(category); setView('search'); }} className="whitespace-nowrap px-6 py-3 bg-white/50 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-full font-semibold hover:bg-brand-blue hover:text-white dark:hover:bg-brand-blue dark:hover:text-white transition-all shadow-sm">{category}</button>
                    ))}
                    </div>
                </div>
                {recentlyViewedBooks.length > 0 && <BookCarousel title={t('recentlyViewed')} books={recentlyViewedBooks} onSelect={handleSelectBook} onRead={handleReadBook} purchased={purchasedBooks} favorited={favoritedBooks} onToggleFavorite={handleToggleFavorite} onSeeAll={() => handleSeeAll(t('recentlyViewed'), recentlyViewedBooks)} />}
                {recommendedBooks.length > 0 && <BookCarousel title={t('recommendedForYou')} books={recommendedBooks} onSelect={handleSelectBook} onRead={handleReadBook} purchased={purchasedBooks} favorited={favoritedBooks} onToggleFavorite={handleToggleFavorite} onSeeAll={() => handleSeeAll(t('recommendedForYou'), recommendedBooks)} />}
                <BookCarousel title={t('topSellers')} books={topSellers} onSelect={handleSelectBook} onRead={handleReadBook} purchased={purchasedBooks} favorited={favoritedBooks} onToggleFavorite={handleToggleFavorite} onSeeAll={() => handleSeeAll(t('topSellers'), topSellers)} />
                {freeBooks.length > 0 && <BookCarousel title={t('freeBooks')} books={freeBooks} onSelect={handleSelectBook} onRead={handleReadBook} purchased={purchasedBooks} favorited={favoritedBooks} onToggleFavorite={handleToggleFavorite} onSeeAll={() => handleSeeAll(t('freeBooks'), freeBooks)} />}
                <BookCarousel title={t('paidBooks')} books={paidBooks} onSelect={handleSelectBook} onRead={handleReadBook} purchased={purchasedBooks} favorited={favoritedBooks} onToggleFavorite={handleToggleFavorite} onSeeAll={() => handleSeeAll(t('paidBooks'), paidBooks)} />
                </div>
            </div>
          </div>
        );
      case 'library':
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {paginatedLibrary.map(book => (
                                <BookCard key={book.id} book={book} onSelect={handleSelectBook} onRead={handleReadBook} isPurchased={true} isOffline={offlineBookIds.has(book.id)} onDownload={handleDownloadBook} onDeleteOffline={handleDeleteOfflineBook} showOfflineControls={true} isFavorited={favoritedBooks.has(book.id)} onToggleFavorite={handleToggleFavorite} />
                            ))}
                        </div>
                        <Pagination currentPage={libraryPage} totalPages={totalLibraryPages} onPageChange={setLibraryPage} />
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('libraryIsEmpty')}</h2>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-xs">{t('libraryIsEmptyDescription')}</p>
                    </div>
                )}
                </div>
            </div>
          </div>
        );
      case 'book_store':
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
                         <div className="flex justify-between items-center lg:hidden mb-4"><h3 className="font-bold text-lg">{t('filters')}</h3><button onClick={() => setIsFilterSidebarOpen(false)}><XIcon className="h-5 w-5"/></button></div>
                         <div>
                             <h4 className="font-bold mb-2 text-sm uppercase text-gray-500 dark:text-gray-400">{t('categories')}</h4>
                             <select value={storeFilterGenre || ''} onChange={e => setStoreFilterGenre(e.target.value || null)} className="w-full bg-white/50 dark:bg-white/10 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm"><option value="">{t('allCategories')}</option>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
                         </div>
                         <div>
                             <h4 className="font-bold mb-2 text-sm uppercase text-gray-500 dark:text-gray-400">{t('priceRange')}</h4>
                             <div className="flex gap-2"><input type="number" placeholder={t('minPrice')} value={storeFilterPriceRange[0]} onChange={e => setStoreFilterPriceRange([e.target.value, storeFilterPriceRange[1]])} className="w-full bg-white/50 dark:bg-white/10 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm"/><input type="number" placeholder={t('maxPrice')} value={storeFilterPriceRange[1]} onChange={e => setStoreFilterPriceRange([storeFilterPriceRange[0], e.target.value])} className="w-full bg-white/50 dark:bg-white/10 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm"/></div>
                         </div>
                         <div>
                             <h4 className="font-bold mb-2 text-sm uppercase text-gray-500 dark:text-gray-400">{t('author')}</h4>
                              <select value={storeFilterAuthor || ''} onChange={e => setStoreFilterAuthor(e.target.value || null)} className="w-full bg-white/50 dark:bg-white/10 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm"><option value="">{t('allCategories').replace('Categorias', 'Autores')}</option>{allAuthorsNames.map(a => <option key={a} value={a}>{a}</option>)}</select>
                         </div>
                         <div>
                             <h4 className="font-bold mb-2 text-sm uppercase text-gray-500 dark:text-gray-400">{t('publicationDate')}</h4>
                             <div className="flex flex-col gap-2"><input type="date" placeholder={t('startDate')} value={storeFilterDateRange[0]} onChange={e => setStoreFilterDateRange([e.target.value, storeFilterDateRange[1]])} className="w-full bg-white/50 dark:bg-white/10 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm"/><input type="date" placeholder={t('endDate')} value={storeFilterDateRange[1]} onChange={e => setStoreFilterDateRange([storeFilterDateRange[0], e.target.value])} className="w-full bg-white/50 dark:bg-white/10 border border-gray-200 dark:border-gray-700 rounded-lg p-2 text-sm"/></div>
                         </div>
                         <div className="space-y-2">
                             <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={storeFilterFeatured} onChange={e => setStoreFilterFeatured(e.target.checked)} className="rounded text-indigo-500 focus:ring-indigo-500 bg-white/50 dark:bg-white/10 border-gray-300 dark:border-gray-600"/><span className="text-sm">{t('isFeatured')}</span></label>
                             <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={storeFilterOnSale} onChange={e => setStoreFilterOnSale(e.target.checked)} className="rounded text-indigo-500 focus:ring-indigo-500 bg-white/50 dark:bg-white/10 border-gray-300 dark:border-gray-600"/><span className="text-sm">{t('onSale')}</span></label>
                         </div>
                         <button onClick={handleClearFilters} className="w-full py-2 text-sm text-brand-blue dark:text-indigo-400 hover:underline">{t('clearFilters')}</button>
                    </aside>
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-6">
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('showingResults', { start: (storePage - 1) * BOOKS_PER_PAGE_GRID + 1, end: Math.min(storePage * BOOKS_PER_PAGE_GRID, filteredStoreBooks.length), total: filteredStoreBooks.length })}</p>
                            <select value={storeSort} onChange={e => setStoreSort(e.target.value)} className="bg-white/50 dark:bg-white/10 border-transparent rounded-lg p-2 text-sm focus:ring-0 backdrop-blur-sm"><option value="relevance">{t('sortByRelevance')}</option><option value="price_asc">{t('sortByPriceAsc')}</option><option value="price_desc">{t('sortByPriceDesc')}</option><option value="rating_desc">{t('sortByRating')}</option><option value="publicationDate_desc">{t('sortByPublicationDate')}</option><option value="most_read">{t('mostRead')}</option><option value="recommended">{t('recommended')}</option></select>
                        </div>
                        {paginatedStoreBooks.length > 0 ? (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                                    {paginatedStoreBooks.map(book => (<BookCard key={book.id} book={book} onSelect={handleSelectBook} onRead={handleReadBook} isPurchased={purchasedBooks.has(book.id)} isFavorited={favoritedBooks.has(book.id)} onToggleFavorite={handleToggleFavorite} />))}
                                </div>
                                <Pagination currentPage={storePage} totalPages={totalStorePages} onPageChange={setStorePage} />
                            </>
                        ) : (
                            <div className="text-center py-16 bg-white/50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm"><p className="text-gray-500 dark:text-gray-400 text-lg">{t('noResultsFound')} "{searchQuery}".</p></div>
                        )}
                    </div>
                </div>
             </div>
           </div>
        );
      case 'search':
        const totalSearchPages = Math.ceil(searchResults.length / BOOKS_PER_PAGE_GRID);
        const paginatedSearch = searchResults.slice((searchPage - 1) * BOOKS_PER_PAGE_GRID, searchPage * BOOKS_PER_PAGE_GRID);
        return (
          <div className="pb-24 min-h-screen">
            <div className="max-w-[1600px] mx-auto">
                <div className="pt-8 px-4 md:px-8 lg:px-16 mb-6"><h1 className="text-3xl font-bold text-brand-blue dark:text-white">{t('search')}</h1></div>
                <div className="px-4 md:px-8 lg:px-16 py-8">
                <div className="relative mb-8">
                    <SearchInput value={searchQuery} onChange={setSearchQuery} onSearch={setSearchQuery} suggestions={allSearchSuggestions} historyKey="global_search" placeholder={t('searchForBooksOrAuthors')} className="w-full" autoFocus />
                </div>
                <div className="flex flex-col sm:flex-row gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    <CategoryDropdown categories={categories} selectedCategory={searchCategory} onSelectCategory={setSearchCategory} />
                    <select value={selectedSearchAuthor || ''} onChange={(e) => setSelectedSearchAuthor(e.target.value || null)} className="bg-white dark:bg-[#212121] text-gray-700 dark:text-white border border-gray-200 dark:border-[#3e3e3e] rounded-full px-4 py-2 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-[#3e3e3e] transition-colors shadow-sm appearance-none pr-8" style={{ backgroundImage: 'none' }}><option value="">{t('filterByAuthor')}</option>{allAuthorsNames.map(author => (<option key={author} value={author}>{author}</option>))}</select>
                    <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as SortOrder)} className="bg-white dark:bg-[#212121] text-gray-700 dark:text-white border border-gray-200 dark:border-[#3e3e3e] rounded-full px-4 py-2 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-[#3e3e3e] transition-colors shadow-sm appearance-none pr-8" style={{ backgroundImage: 'none' }}><option value="relevance">{t('sortByRelevance')}</option><option value="price_asc">{t('sortByPriceAsc')}</option><option value="price_desc">{t('sortByPriceDesc')}</option><option value="rating_desc">{t('sortByRating')}</option><option value="publicationDate_desc">{t('sortByPublicationDate')}</option><option value="publicationDate_asc">{t('sortByPublicationDate')}</option></select>
                    {(searchCategory || selectedSearchAuthor || sortOrder !== 'relevance') && (<button onClick={handleClearFilters} className="text-sm text-red-500 font-semibold hover:underline whitespace-nowrap px-2">{t('clearFilters')}</button>)}
                </div>
                {paginatedSearch.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {paginatedSearch.map(book => (<BookCard key={book.id} book={book} onSelect={handleSelectBook} onRead={handleReadBook} isPurchased={purchasedBooks.has(book.id)} isFavorited={favoritedBooks.has(book.id)} onToggleFavorite={handleToggleFavorite} />))}
                        </div>
                        <Pagination currentPage={searchPage} totalPages={totalSearchPages} onPageChange={setSearchPage} />
                    </>
                ) : (
                    <div className="text-center py-16 bg-white/50 dark:bg-white/5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 backdrop-blur-sm"><h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('noResultsFound')} "{searchQuery}".</h2><p className="text-gray-600 dark:text-gray-400 mt-2">Tente ajustar seus filtros ou buscar por outro termo.</p></div>
                )}
                </div>
            </div>
          </div>
        );
      default:
        return null;
    }
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

      <BottomNav activeView={view === 'detail' || view === 'author_profile' || view === 'reader' ? 'home' : view} setView={setView} />

      {authModal === 'login' && (
        <LoginModal onClose={() => setAuthModal(null)} onLogin={handleLogin} onSwitchToRegister={() => setAuthModal('register')} onForgotPassword={() => setAuthModal('forgot-password')} users={users} />
      )}
      {authModal === 'register' && (
        <RegisterModal onClose={() => setAuthModal(null)} onRegister={handleRegister} onSwitchToLogin={() => setAuthModal('login')} />
      )}
      {authModal === 'forgot-password' && (
          <ForgotPasswordModal onClose={() => setAuthModal(null)} onSwitchToLogin={() => setAuthModal('login')} users={users} />
      )}

      {isCheckoutOpen && bookForCheckout && (
        <CheckoutModal book={bookForCheckout} onClose={handleCloseCheckout} onPaymentSuccess={handlePaymentSuccess} paymentMethods={paymentMethods} />
      )}

      {selectedBook && view === 'detail' && (
        <BookDetail 
            book={selectedBook} 
            allBooks={books} 
            onBack={handleCloseDetailView} 
            onPreview={handleShowPreview} 
            onBuyNow={handleBuyNow} 
            onRead={() => handleReadBook(selectedBook)} 
            isPurchased={purchasedBooks.has(selectedBook.id)} 
            onBookSelect={handleSelectBook} 
            onSelectAuthor={handleSelectAuthor} 
            purchasedBooks={purchasedBooks} 
            isFavorited={favoritedBooks.has(selectedBook.id)} 
            onToggleFavorite={handleToggleFavorite}
            currentUser={currentUser}
            onLogin={() => setAuthModal('login')}
            onRegister={() => setAuthModal('register')}
            onLogout={handleLogout}
            onNavigateToDashboard={handleNavigateToDashboard}
            onNavigateSettings={() => setIsSettingsModalOpen(true)}
        />
      )}

      {selectedBook && view === 'preview' && (
        <ReaderView book={selectedBook} onBack={handleCloseReaderOrPreview} isPreview={true} onBuyFromPreview={handleBuyNow} />
      )}

      {isSettingsModalOpen && currentUser && (
          <AccountSettingsModal 
            user={currentUser}
            onClose={() => setIsSettingsModalOpen(false)}
            onSave={(data) => handleUpdateUser(currentUser.id, data)}
            paymentMethods={paymentMethods}
            onBecomeAuthor={handleBecomeAuthor}
          />
      )}

      {isAuthorOnboardingOpen && (
          <AuthorOnboardingModal isOpen={isAuthorOnboardingOpen} onClose={() => { setIsAuthorOnboardingOpen(false); if (!currentUser) setAuthModal('register'); }} onComplete={handleAuthorOnboardingComplete} />
      )}

      {emailPreviewContent && (
          <EmailPreviewModal 
            isOpen={!!emailPreviewContent}
            onClose={() => setEmailPreviewContent(null)}
            htmlContent={emailPreviewContent}
          />
      )}

      {toast && toast.visible && (
          <div className={`fixed bottom-24 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full shadow-xl z-[100] text-white text-sm font-semibold flex items-center gap-2 animate-slide-up ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-gray-800'}`}>
              {toast.type === 'success' && <CheckCircleIcon className="h-5 w-5" />}
              {toast.type === 'info' && <InformationCircleIcon className="h-5 w-5" />}
              {toast.message}
          </div>
      )}
    </div>
  );
};

export default App;
