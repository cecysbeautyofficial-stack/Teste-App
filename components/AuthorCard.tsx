
import React from 'react';
import { Author } from '../types';

interface AuthorCardProps {
  author: Author;
  onClick: (author: Author) => void;
}

const AuthorCard: React.FC<AuthorCardProps> = ({ author, onClick }) => {
  return (
    <div
      onClick={() => onClick(author)}
      className="flex flex-col items-center gap-3 min-w-[120px] w-[120px] group cursor-pointer p-2"
    >
      <div className="relative w-24 h-24 rounded-full overflow-hidden shadow-md border-2 border-transparent group-hover:border-brand-blue dark:group-hover:border-indigo-400 transition-all duration-300">
        <img
          src={author.photoUrl}
          alt={author.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <h3 className="text-sm font-semibold text-center text-gray-800 dark:text-gray-200 line-clamp-2 group-hover:text-brand-blue dark:group-hover:text-indigo-400 transition-colors">
        {author.name}
      </h3>
    </div>
  );
};

export default AuthorCard;
