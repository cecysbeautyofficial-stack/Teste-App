
import React from 'react';
import { User, Book, Purchase, PaymentMethod, Author, Notification } from '../types';
import ReaderDashboard from './dashboards/ReaderDashboard';
import AuthorDashboard from './dashboards/AuthorDashboard';
import AdminDashboard from './dashboards/AdminDashboard';

interface DashboardProps {
  user: User;
  purchasedBooks: Book[];
  authorBooks: Book[];
  allUsers: User[];
  allBooks: Book[];
  onReadBook: (book: Book) => void;
  onSelectBook: (book: Book) => void;
  allPurchases: Purchase[];
  onDeleteBook: (bookId: string) => void;
  onUpdateBook: (bookId: string, updatedData: Partial<Book>) => void;
  onAddBook: (newBookData: Omit<Book, 'id' | 'author' | 'coverUrl' | 'rating' | 'sales' | 'readers' | 'publishDate'> & { coverImage?: File; bookFile?: File }, authorOverride?: Author) => void;
  favoritedBooks: Set<string>;
  onToggleFavorite: (bookId: string) => void;
  dashboardFavoritesPage: number;
  onDashboardFavoritesPageChange: (page: number) => void;
  dashboardLibraryPage: number;
  onDashboardLibraryPageChange: (page: number) => void;
  booksPerPage: number;
  onUpdateUser: (userId: string, updatedData: Partial<User> & { avatarFile?: File; newPassword?: string }) => void;
  onDeleteUser: (userId: string) => void;
  paymentMethods: PaymentMethod[];
  onUpdatePaymentMethod: (methodId: string, updatedData: Partial<PaymentMethod>) => void;
  onDeletePaymentMethod: (methodId: string) => void;
  onAddPaymentMethod: (newMethodData: Omit<PaymentMethod, 'id'>) => void;
  authors: Author[];
  onSelectAuthor: (author: Author) => void;
  categories: string[];
  onAddCategory: (category: string) => void;
  onAddAuthor: (author: Author) => void;
  activeTab: string;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
    user, purchasedBooks, authorBooks, allUsers, allBooks, onReadBook, onSelectBook,
    allPurchases, onDeleteBook, onUpdateBook, onAddBook, favoritedBooks, onToggleFavorite,
    dashboardFavoritesPage, onDashboardFavoritesPageChange,
    dashboardLibraryPage, onDashboardLibraryPageChange,
    booksPerPage,
    onUpdateUser, onDeleteUser,
    paymentMethods, onUpdatePaymentMethod, onDeletePaymentMethod, onAddPaymentMethod,
    authors, onSelectAuthor, categories, onAddCategory, onAddAuthor,
    activeTab, notifications, onMarkAsRead
}) => {
  const renderDashboard = () => {
    switch (user.role) {
      case 'reader':
        return <ReaderDashboard 
                    user={user} 
                    purchasedBooks={purchasedBooks} 
                    onReadBook={onReadBook}
                    onSelectBook={onSelectBook}
                    allBooks={allBooks}
                    allPurchases={allPurchases}
                    favoritedBooks={favoritedBooks}
                    onToggleFavorite={onToggleFavorite}
                    favoritesPage={dashboardFavoritesPage}
                    onFavoritesPageChange={onDashboardFavoritesPageChange}
                    libraryPage={dashboardLibraryPage}
                    onLibraryPageChange={onDashboardLibraryPageChange}
                    booksPerPage={booksPerPage}
                    paymentMethods={paymentMethods}
                    authors={authors}
                    onSelectAuthor={onSelectAuthor}
                    activeTab={activeTab}
                    notifications={notifications}
                    onMarkAsRead={onMarkAsRead}
                />;
      case 'author':
        return <AuthorDashboard 
                    user={user} 
                    authorBooks={authorBooks} 
                    allUsers={allUsers} 
                    allPurchases={allPurchases}
                    onReadBook={onReadBook}
                    onDeleteBook={onDeleteBook}
                    onUpdateBook={onUpdateBook}
                    onAddBook={onAddBook}
                    paymentMethods={paymentMethods}
                    categories={categories}
                    activeTab={activeTab}
                    notifications={notifications}
                    onMarkAsRead={onMarkAsRead}
                />;
      case 'admin':
        return <AdminDashboard 
                    user={user} 
                    allUsers={allUsers} 
                    allBooks={allBooks} 
                    allPurchases={allPurchases}
                    onReadBook={onReadBook}
                    onSelectBook={onSelectBook}
                    onUpdateUser={onUpdateUser}
                    onDeleteUser={onDeleteUser}
                    onUpdateBook={onUpdateBook}
                    onDeleteBook={onDeleteBook}
                    paymentMethods={paymentMethods}
                    onUpdatePaymentMethod={onUpdatePaymentMethod}
                    onDeletePaymentMethod={onDeletePaymentMethod}
                    onAddPaymentMethod={onAddPaymentMethod}
                    onAddBook={onAddBook}
                    categories={categories}
                    authors={authors}
                    onAddCategory={onAddCategory}
                    onAddAuthor={onAddAuthor}
                    activeTab={activeTab}
                    notifications={notifications}
                    onMarkAsRead={onMarkAsRead}
                />;
      default:
        return <div className="text-center p-8">Função de usuário desconhecida.</div>;
    }
  };

  return (
    <div>
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
