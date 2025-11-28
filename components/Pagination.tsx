
import React from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from './Icons';
import { useAppContext } from '../contexts/AppContext';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const { t } = useAppContext();

  if (totalPages <= 1) return null;

  const pageNumbers = [];
  const pagesToShow = new Set<number>();
  
  // Always show first and last
  pagesToShow.add(1);
  pagesToShow.add(totalPages);
  
  // Show current and immediate neighbors
  for (let i = -1; i <= 1; i++) {
    const page = currentPage + i;
    if (page > 1 && page < totalPages) {
      pagesToShow.add(page);
    }
  }

  const sortedPages = Array.from(pagesToShow).sort((a, b) => a - b);

  let lastPage = 0;
  for (const page of sortedPages) {
    if (page > lastPage + 1) {
      pageNumbers.push(<span key={`ellipsis-${lastPage}`} className="px-2 py-2 text-gray-400 dark:text-gray-500 font-medium">...</span>);
    }
    pageNumbers.push(
      <button
        key={page}
        onClick={() => onPageChange(page)}
        className={`min-w-[40px] h-10 flex items-center justify-center text-sm font-bold rounded-lg transition-all duration-200 ${
          currentPage === page 
          ? 'bg-brand-blue text-white shadow-lg shadow-blue-500/30 scale-105 border border-transparent' 
          : 'bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-brand-blue dark:hover:text-white border border-gray-200 dark:border-white/5'
        }`}
      >
        {page}
      </button>
    );
    lastPage = page;
  }

  return (
    <div className="flex justify-center items-center gap-3 mt-12 flex-wrap">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-white/5"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        <span className="hidden sm:inline">{t('previousPage')}</span>
      </button>
      
      <div className="flex items-center gap-1">
        {pageNumbers}
      </div>
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-white/5"
      >
        <span className="hidden sm:inline">{t('nextPage')}</span>
        <ArrowRightIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Pagination;
