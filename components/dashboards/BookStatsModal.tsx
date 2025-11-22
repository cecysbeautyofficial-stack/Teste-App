
import React, { useState, useEffect, useMemo } from 'react';
import { Book, User, Purchase } from '../../types';
import { XIcon, UsersIcon, ChartBarIcon, CurrencyDollarIcon, ClockIcon, ChartPieIcon, AnnotationIcon } from '../Icons';
import { useAppContext } from '../../contexts/AppContext';

interface BookStatsModalProps {
  book: Book;
  onClose: () => void;
  allUsers: User[];
  allPurchases: Purchase[];
  salesData: number[];
}

const StatBox: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex items-center space-x-3 border border-gray-200 dark:border-gray-700">
        <div className="bg-white dark:bg-gray-700 p-2 rounded-full shadow-sm">{icon}</div>
        <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

// Mock data for engagement
const engagementStats = {
    avgReadTime: "4h 32m",
    completionRate: "82%",
    mostHighlighted: [
      "Numa toca no chão vivia um hobbit. Não uma toca desagradável, suja e úmida...",
      "Esta história é sobre como um Bolseiro teve uma aventura...",
      "Afinal, magos são magos."
    ]
};

const BookStatsModal: React.FC<BookStatsModalProps> = ({ book, onClose, allUsers, allPurchases, salesData }) => {
  const { formatPrice } = useAppContext();
  const totalRevenue = (book.sales || 0) * book.price;
  const maxSale = useMemo(() => Math.max(...salesData, 1), [salesData]);
  
  const [chartBars, setChartBars] = useState<{ sale: number; height: number }[]>([]);

  const buyers = useMemo(() => {
    if (!allPurchases || !allUsers) return [];
    return allPurchases
        .filter(p => p.bookId === book.id)
        .map(p => {
            const user = allUsers.find(u => u.id === p.userId);
            return { ...p, userName: user?.name || 'Unknown User', userPhoto: `https://i.pravatar.cc/150?u=${p.userId}` };
        })
        .sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime());
  }, [allPurchases, allUsers, book.id]);

  useEffect(() => {
    setChartBars(salesData.map(sale => ({ sale, height: 0 })));

    const animationTimeout = setTimeout(() => {
      setChartBars(salesData.map(sale => ({
        sale,
        height: (sale / maxSale) * 100
      })));
    }, 150);

    return () => clearTimeout(animationTimeout);
  }, [salesData, maxSale]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={onClose}>
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl w-full max-w-2xl transform transition-all relative text-gray-900 dark:text-white" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start">
                <div className="flex items-center gap-4">
                    <img src={book.coverUrl} alt={book.title} className="w-20 h-30 object-cover rounded-md shadow-md" />
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{book.title}</h2>
                        <p className="text-gray-500 dark:text-gray-400">Estatísticas de Desempenho</p>
                    </div>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
                    <XIcon className="h-6 w-6" />
                </button>
            </div>
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatBox title="Vendas Totais" value={book.sales?.toLocaleString() || '0'} icon={<ChartBarIcon className="h-5 w-5 text-indigo-500 dark:text-indigo-400"/>} />
                    <StatBox title="Receita Total" value={formatPrice(totalRevenue)} icon={<CurrencyDollarIcon className="h-5 w-5 text-green-500 dark:text-green-400"/>} />
                    <StatBox title="Leitores Atuais" value={book.readers?.toLocaleString() || '0'} icon={<UsersIcon className="h-5 w-5 text-blue-500 dark:text-blue-400"/>} />
                </div>
                
                <div>
                    <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-100">Vendas nos Últimos 30 Dias</h3>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="h-48 flex items-end justify-between gap-1 border-b border-gray-300 dark:border-gray-700 pb-2">
                            {chartBars.map((bar, index) => (
                                <div key={index} className="group relative w-full h-full flex items-end">
                                    <div className="absolute bottom-full mb-2 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                        <span className="bg-black text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg">
                                            {bar.sale}
                                        </span>
                                    </div>
                                    <div 
                                        className="w-full bg-indigo-500 rounded-t-sm group-hover:bg-indigo-400 transition-all duration-700 ease-in-out" 
                                        style={{ height: `${bar.height}%` }}
                                    ></div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-between mt-2 gap-1">
                            {salesData.map((_, index) => (
                                <div key={index} className="w-full text-center">
                                    {(index + 1) % 5 === 0 || index === 0 ? (
                                        <span className="text-[10px] text-gray-500">{index + 1}</span>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-100">Engajamento do Leitor</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <StatBox title="Tempo Médio de Leitura" value={engagementStats.avgReadTime} icon={<ClockIcon className="h-5 w-5 text-yellow-500 dark:text-yellow-400"/>} />
                        <StatBox title="Taxa de Conclusão" value={engagementStats.completionRate} icon={<ChartPieIcon className="h-5 w-5 text-teal-500 dark:text-teal-400"/>} />
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                           <AnnotationIcon className="h-5 w-5 text-gray-400" />
                           Passagens Mais Destacadas
                        </h4>
                        <div className="space-y-3 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            {engagementStats.mostHighlighted.map((passage, index) => (
                                <div key={index} className="border-l-4 border-yellow-500 pl-4 py-1">
                                    <blockquote className="text-sm text-gray-600 dark:text-gray-300 italic">
                                        "{passage}"
                                    </blockquote>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold mb-3 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                        <UsersIcon className="h-5 w-5 text-gray-400" />
                        Recent Buyers
                    </h3>
                    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700">
                        {buyers.length > 0 ? (
                            <ul className="space-y-3">
                                {buyers.map(buyer => (
                                    <li key={buyer.userId + buyer.purchaseDate} className="flex justify-between items-center text-sm">
                                        <div className="flex items-center gap-3">
                                            <img src={buyer.userPhoto} alt={buyer.userName} className="w-8 h-8 rounded-full"/>
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">{buyer.userName}</span>
                                        </div>
                                        <span className="text-gray-500">{new Date(buyer.purchaseDate).toLocaleDateString()}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-center text-gray-500 text-sm py-4">No purchases recorded for this book yet.</p>
                        )}
                    </div>
                </div>

                 <div className="text-center pt-2">
                    <button onClick={onClose} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-2 px-6 rounded-lg transition-colors">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    </div>
  )
};

export default BookStatsModal;
