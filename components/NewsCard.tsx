
import React from 'react';
import { NewsArticle } from '../types';
import { ClockIcon, HashtagIcon } from './Icons';

interface NewsCardProps {
  news: NewsArticle;
  onClick: (news: NewsArticle) => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ news, onClick }) => {
  return (
    <div 
        onClick={() => onClick(news)}
        className="group bg-white dark:bg-[#212121] rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 dark:border-gray-700 flex flex-col h-full"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
            src={news.imageUrl} 
            alt={news.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
            <ClockIcon className="h-3 w-3" />
            <span>{new Date(news.date).toLocaleDateString()}</span>
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-brand-blue dark:group-hover:text-indigo-400 transition-colors">
            {news.title}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4 flex-1">
            {news.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mt-auto">
            {news.hashtags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-[10px] font-medium text-gray-600 dark:text-gray-300">
                    <HashtagIcon className="h-2 w-2 text-brand-blue dark:text-indigo-400" />
                    {tag}
                </span>
            ))}
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
