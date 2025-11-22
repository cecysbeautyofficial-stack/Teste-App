import React from 'react';
import { User } from '../types';
import { XIcon, DownloadIcon, BookIcon, HeadphonesIcon, ChevronRightIcon } from './Icons';
import { useAppContext } from '../contexts/AppContext';

interface AccountModalProps {
    user: User;
    onClose: () => void;
    onLogout: () => void;
    purchasedBooksCount: number;
}

const AccountModal: React.FC<AccountModalProps> = ({ user, onClose, onLogout, purchasedBooksCount }) => {
    const { t } = useAppContext();

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col p-4 text-white" onClick={onClose}>
            <div className="flex-shrink-0 flex items-center justify-between mb-8 pt-4">
                <h1 className="text-2xl font-bold">{t('account')}</h1>
                <button onClick={onClose} className="bg-gray-700 rounded-full p-2">
                    <XIcon className="h-6 w-6" />
                </button>
            </div>
            
            <div className="flex-grow space-y-4 overflow-y-auto" onClick={e => e.stopPropagation()}>
                {/* User Info */}
                <div className="bg-gray-800 rounded-xl p-4 flex items-center space-x-4">
                    <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt={user.name} className="w-16 h-16 rounded-full" />
                    <div>
                        <p className="font-bold text-lg">{user.name}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                </div>

                {/* Purchases */}
                <div className="space-y-2">
                    <p className="text-gray-400 text-xs font-semibold uppercase px-4">{t('myPurchases')}</p>
                    <div className="bg-gray-800 rounded-xl">
                        <button className="w-full flex justify-between items-center p-4">
                            <div className="flex items-center space-x-3">
                                <DownloadIcon className="h-6 w-6 text-gray-300" />
                                <span>{t('updates')}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-gray-400">
                                <span>0</span>
                                <ChevronRightIcon className="h-4 w-4"/>
                            </div>
                        </button>
                        <div className="h-px bg-gray-700 mx-4"></div>
                        <button className="w-full flex justify-between items-center p-4">
                            <div className="flex items-center space-x-3">
                                <BookIcon className="h-6 w-6 text-gray-300" />
                                <span>{t('books')}</span>
                            </div>
                             <div className="flex items-center space-x-2 text-gray-400">
                                <span>{purchasedBooksCount}</span>
                                <ChevronRightIcon className="h-4 w-4"/>
                            </div>
                        </button>
                         <div className="h-px bg-gray-700 mx-4"></div>
                        <button className="w-full flex justify-between items-center p-4">
                            <div className="flex items-center space-x-3">
                                <HeadphonesIcon className="h-6 w-6 text-gray-300" />
                                <span>{t('audiobooks')}</span>
                            </div>
                             <div className="flex items-center space-x-2 text-gray-400">
                                <span>0</span>
                                <ChevronRightIcon className="h-4 w-4"/>
                            </div>
                        </button>
                    </div>
                </div>

                 <button className="w-full bg-gray-800 rounded-xl p-4 text-left">
                    {t('notifications')}
                </button>

                {/* Actions */}
                <div className="space-y-2">
                     <div className="bg-gray-800 rounded-xl p-4">
                        <p className="font-semibold">{t('manageHiddenPurchases')}</p>
                        <p className="text-gray-400 text-sm">{t('manageHiddenPurchasesDesc')}</p>
                    </div>
                    <button className="w-full bg-gray-800 rounded-xl p-4 text-left">
                       {t('redeemGiftCard')}
                    </button>
                    <button className="w-full bg-gray-800 rounded-xl p-4 text-left">
                       {t('accountSettings')}
                    </button>
                    <button onClick={onLogout} className="w-full bg-gray-800 rounded-xl p-4 text-left text-red-500 font-semibold">
                       {t('signOut')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccountModal;