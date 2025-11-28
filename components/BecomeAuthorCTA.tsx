
import React from 'react';
import { SparklesIcon, ArrowRightIcon } from './Icons';
import { useAppContext } from '../contexts/AppContext';

interface BecomeAuthorCTAProps {
  onAction: () => void;
}

const BecomeAuthorCTA: React.FC<BecomeAuthorCTAProps> = ({ onAction }) => {
  const { t } = useAppContext();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#262261] to-[#1e1b4b] dark:from-[#1a1a1a] dark:to-[#0f0f0f] shadow-2xl mb-12 border border-white/10 group">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-red/20 rounded-full blur-3xl group-hover:bg-brand-red/30 transition-colors duration-500"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-8">
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            <SparklesIcon className="h-3 w-3 text-yellow-400" />
            <span>{t('becomeAuthor')}</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            Publique suas histórias no <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red to-orange-500">Leia Aqui</span>
          </h2>
          
          <p className="text-blue-100 text-lg max-w-xl leading-relaxed">
            {t('becomeAuthorDesc')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center md:justify-start">
            <button 
              onClick={onAction}
              className="inline-flex items-center justify-center gap-2 bg-white text-brand-blue font-bold py-3 px-8 rounded-full hover:bg-gray-50 transition-all transform hover:scale-105 shadow-lg"
            >
              {t('continue')}
              <ArrowRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Illustration area */}
        <div className="hidden md:block relative">
            <div className="relative w-64 h-64 lg:w-80 lg:h-80">
                {/* Abstract Book/Writing Representation */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-white/20 rounded-2xl transform rotate-6 border border-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl">
                     <div className="text-white/80">
                        <svg className="w-32 h-32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                     </div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-bl from-brand-red/80 to-brand-red/40 rounded-2xl transform -rotate-6 opacity-60 -z-10"></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeAuthorCTA;
