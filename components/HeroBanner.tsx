
import React, { useState, useEffect } from 'react';
import { Book, User } from '../types';
import { ArrowRightIcon, StarIcon, SparklesIcon } from './Icons';
import { useAppContext } from '../contexts/AppContext';

interface HeroBannerProps {
  books: Book[];
  onExplore: () => void;
  currentUser: User | null;
  onRegister: () => void;
  onLogin: () => void;
  onBookClick: (book: Book) => void;
}

const HeroBanner: React.FC<HeroBannerProps> = ({ 
  books, 
  onExplore, 
  currentUser, 
  onRegister, 
  onLogin, 
  onBookClick 
}) => {
  const { t } = useAppContext();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Filter top books for the slider (e.g., top 5)
  const sliderBooks = books.slice(0, 5);

  useEffect(() => {
    if (sliderBooks.length <= 1) return;
    const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % sliderBooks.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [sliderBooks.length]);

  const currentBook = sliderBooks[currentIndex];

  if (!currentBook) return null;

  return (
    <div className="relative w-full overflow-hidden rounded-[2.5rem] bg-[#0a0a0a] shadow-2xl mb-12 md:mb-20 group/hero h-[500px] md:h-[600px]">
      {/* Cinematic Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#151932] via-[#16213e] to-[#0f0f0f] z-0"></div>
      
      {/* Background Image Blurred (Optional aesthetic) */}
      <div 
        className="absolute inset-0 opacity-20 bg-cover bg-center blur-3xl transition-all duration-1000"
        style={{ backgroundImage: `url(${currentBook.coverUrl})` }}
      ></div>

      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.05] pointer-events-none"></div>

      <div className="relative z-10 h-full flex flex-col lg:flex-row items-center justify-between px-6 md:px-16 lg:px-24 py-8 md:py-12 gap-8">
        
        {/* Content - Left Side */}
        <div className="flex-1 flex flex-col justify-center items-start space-y-4 md:space-y-6 max-w-2xl z-20">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-yellow-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-lg animate-fade-in">
            <SparklesIcon className="h-3 w-3" />
            <span>Destaque da Semana</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight drop-shadow-2xl transition-all duration-500">
            {currentBook.title}
          </h1>
          
          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-gray-300">
             <div className="flex items-center gap-1 text-yellow-400 font-bold">
                <StarIcon className="h-4 w-4 fill-current" /> 
                <span>{currentBook.rating.toFixed(1)}</span>
             </div>
             <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
             <span className="font-medium text-white">{currentBook.author.name}</span>
             <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
             <span className="text-gray-400">{currentBook.category}</span>
          </div>

          {/* Synopsis */}
          <p className="text-gray-400 text-sm md:text-lg leading-relaxed line-clamp-3 font-medium max-w-xl transition-all duration-500">
            {currentBook.description}
          </p>

          {/* Actions */}
          <div className="pt-4 flex flex-wrap gap-4">
             <button 
                onClick={() => onBookClick(currentBook)}
                className="bg-brand-red hover:bg-red-600 text-white px-6 md:px-8 py-3 md:py-3.5 rounded-xl font-bold text-sm md:text-base transition-all transform hover:-translate-y-1 shadow-lg shadow-red-900/30 flex items-center gap-2"
            >
                <span>Ler Agora</span>
                <ArrowRightIcon className="h-5 w-5" />
            </button>
            
            {!currentUser && (
                <button 
                    onClick={onRegister}
                    className="bg-white/5 hover:bg-white/10 text-white px-6 md:px-8 py-3 md:py-3.5 rounded-xl font-bold text-sm md:text-base transition-all border border-white/10 backdrop-blur-md"
                >
                    Criar Conta Grátis
                </button>
            )}
          </div>
        </div>

        {/* Visuals - Right Side */}
        <div className="flex-1 h-full flex items-center justify-center lg:justify-end relative z-10 mt-4 lg:mt-0">
            {/* Book Cover with transition */}
            <div className="relative w-48 md:w-72 aspect-[2/3] transform transition-all duration-700 ease-out hover:scale-105 group/cover">
                <div className="absolute inset-0 bg-black/50 blur-2xl rounded-full transform translate-y-10 scale-90 opacity-60"></div>
                <img 
                    key={currentBook.id} // Key change triggers animation
                    src={currentBook.coverUrl} 
                    alt={currentBook.title} 
                    className="relative w-full h-full object-cover rounded-xl shadow-2xl border border-white/10 animate-slide-up"
                />
            </div>
        </div>

      </div>

      {/* Slider Indicators */}
      <div className="absolute bottom-6 md:bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
        {sliderBooks.map((_, idx) => (
            <button 
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-brand-red' : 'w-2 bg-white/30 hover:bg-white/50'}`}
                aria-label={`Slide ${idx + 1}`}
            />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;
