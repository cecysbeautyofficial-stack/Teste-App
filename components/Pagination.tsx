import React from 'react';
import { ArrowLeftIcon, ArrowRightIcon } from './Icons';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  const pagesToShow = new Set<number>();
  
  pagesToShow.add(1);
  pagesToShow.add(totalPages);
  
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
      pageNumbers.push(<span key={`ellipsis-${lastPage}`} className="px-1 sm:px-4 py-2 text-gray-400">...</span>);
    }
    pageNumbers.push(
      <button
        key={page}
        onClick={() => onPageChange(page)}
        className={`px-3 sm:px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
          currentPage === page 
          ? 'bg-indigo-500 text-white' 
          : 'text-gray-300 hover:bg-gray-700'
        }`}
      >
        {page}
      </button>
    );
    lastPage = page;
  }

  return (
    <div className="flex justify-center items-center space-x-1 sm:space-x-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold rounded-md transition-colors text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Previous</span>
      </button>
      <div className="flex items-center space-x-1">
        {pageNumbers}
      </div>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-semibold rounded-md transition-colors text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="hidden sm:inline">Next</span>
        <ArrowRightIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Pagination;
