
import React from 'react';
import { ChartBarIcon, ArrowRightIcon } from './Icons';
import { useAppContext } from '../contexts/AppContext';

interface DashboardCTAProps {
  onAction: () => void;
  userRole: 'author' | 'admin';
}

const DashboardCTA: React.FC<DashboardCTAProps> = ({ onAction, userRole }) => {
  const { t } = useAppContext();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900 to-purple-900 dark:from-[#1a1a1a] dark:to-[#0f0f0f] shadow-2xl mb-12 border border-white/10 group">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-colors duration-500"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-8">
        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/90 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
            <ChartBarIcon className="h-3 w-3 text-green-400" />
            <span>{userRole === 'admin' ? t('adminPanel') : t('dashboard')}</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
            {userRole === 'admin' ? 'Administração da Plataforma' : 'Gerencie sua Carreira Literária'}
          </h2>
          
          <p className="text-indigo-100 text-lg max-w-xl leading-relaxed">
            {userRole === 'admin' 
                ? 'Gerencie usuários, aprove livros e monitore as métricas financeiras da plataforma.'
                : 'Acompanhe suas vendas, responda a avaliações e publique novas obras para seus leitores.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center md:justify-start">
            <button 
              onClick={onAction}
              className="inline-flex items-center justify-center gap-2 bg-white text-indigo-900 font-bold py-3 px-8 rounded-full hover:bg-indigo-50 transition-all transform hover:scale-105 shadow-lg"
            >
              {t('dashboard')}
              <ArrowRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Illustration area */}
        <div className="hidden md:block relative">
            <div className="relative w-64 h-64 lg:w-80 lg:h-80 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm flex items-center justify-center shadow-2xl transform rotate-3 transition-transform group-hover:rotate-0 duration-500">
                 {/* Mock Dashboard UI */}
                 <div className="w-full h-full p-6 flex flex-col gap-4 opacity-80">
                    <div className="h-8 w-1/2 bg-white/20 rounded animate-pulse"></div>
                    <div className="flex gap-4">
                        <div className="h-24 w-1/2 bg-indigo-500/30 rounded border border-indigo-400/30"></div>
                        <div className="h-24 w-1/2 bg-purple-500/30 rounded border border-purple-400/30"></div>
                    </div>
                    <div className="flex-1 bg-white/10 rounded border border-white/5"></div>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCTA;
