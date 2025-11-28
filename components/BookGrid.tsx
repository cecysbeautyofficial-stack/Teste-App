import React from 'react';
import { Book } from '../types';
import BookCard from './BookCard';
import Pagination from './Pagination';

interface BookGridProps {
  title: string;
  books: Book[];
  onSelectBook: (book: Book) => void;
  onReadBook: (book: Book) => void;
  purchasedBooks: Set<string>;
  favoritedBooks: Set<string>;
  onToggleFavorite: (bookId: string) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const BookGrid: React.FC<BookGridProps> = ({ title, books, onSelectBook, purchasedBooks, onReadBook, favoritedBooks, onToggleFavorite, currentPage, totalPages, onPageChange }) => {
  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">{title}</h2>
      {books.length > 0 ? (
        <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {books.map(book => (
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
            {currentPage && totalPages && onPageChange && totalPages > 1 && (
                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                />
            )}
        </>
      ) : (
        <div className="text-center py-16 px-6 bg-white dark:bg-gray-800/50 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">No books to display in this section.</h2>
        </div>
      )}
    </section>
  );
};

export default BookGrid;