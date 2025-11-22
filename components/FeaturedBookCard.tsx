import React from 'react';
import { Book } from '../types';

interface FeaturedBookCardProps {
  book: Book;
  onClick: () => void;
}

const colors = [
  'border-blue-500',
  'border-orange-500',
  'border-green-500',
  'border-red-500',
  'border-purple-500',
  'border-yellow-500',
];

const FeaturedBookCard: React.FC<FeaturedBookCardProps> = ({ book, onClick }) => {
  const colorClass = colors[parseInt(book.id, 10) % colors.length];

  return (
    <div className="flex-shrink-0 w-40 h-56 rounded-lg relative overflow-hidden" onClick={onClick}>
      <div className={`absolute inset-0 bg-gray-800 border-4 ${colorClass} rounded-lg`}></div>
      <div className="absolute inset-0 p-4 flex flex-col justify-between text-white">
        <div>
          <h3 className="font-bold leading-tight">{book.title}</h3>
        </div>
        <div>
          <p className="text-xs text-gray-300">{book.author.name}</p>
        </div>
      </div>
    </div>
  );
};

export default FeaturedBookCard;
