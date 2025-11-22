

import React, { useState, useMemo } from 'react';
import { Book, PaymentMethod } from '../types';
import { XIcon, CreditCardIcon, PhoneIcon, CheckCircleIcon, LockClosedIcon, InformationCircleIcon } from './Icons';
import { useAppContext } from '../contexts/AppContext';
import { mpesaService } from '../services/mpesaService';

interface CheckoutModalProps {
  book: Book;
  onClose: () => void;
  onPaymentSuccess: () => void;
  paymentMethods: PaymentMethod[];
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ book, onClose, onPaymentSuccess, paymentMethods }) => {
  const enabledMethods = useMemo(() => paymentMethods.filter(p => p.enabled), [paymentMethods]);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(enabledMethods.length > 0 ? enabledMethods[0] : null);
  
  // Payment States: idle -> processing -> waiting_confirmation (M-Pesa) -> success -> error
  const [status, setStatus] = useState<'idle' | 'processing' | 'waiting_confirmation' | 'success' | 'error'>('idle');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const { t, formatPrice } = useAppContext();
  
  const total = book.price;

  const isMpesa = selectedMethod?.name.toLowerCase().includes('mpesa') || selectedMethod?.name.toLowerCase().includes('m-pesa');

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMethod) return;
    setErrorMessage('');

    if (isMpesa) {
        // Basic Validation for MZ numbers
        const cleanPhone = phoneNumber.replace(/\D/g, '');
        if (!/^(84|85)\d{7}$/.test(cleanPhone)) {
            setErrorMessage("Por favor, insira um número Vodacom válido (ex: 84 123 4567).");
            return;
        }

        setStatus('processing');
        
        try {
            // We create a transaction reference
            const reference = `TX-${book.id}-${Date.now()}`;
            
            // Simulate "waiting for pin" UI state immediately for better UX 
            // while the service processes the encryption and mock network call
            const waitingTimer = setTimeout(() => {
                if (status !== 'error' && status !== 'success') setStatus('waiting_confirmation');
            }, 1500);

            const success = await mpesaService.initiatePayment(cleanPhone, total, reference);
            clearTimeout(waitingTimer);

            if (success) {
                setStatus('success');
                setTimeout(() => {
                    onPaymentSuccess();
                }, 2000);
            } else {
                setStatus('error');
                setErrorMessage("O pagamento falhou ou foi cancelado. Verifique seu saldo e tente novamente.");
            }
        } catch (error) {
            setStatus('error');
            setErrorMessage("Erro de conexão com M-Pesa.");
        }
    } else {
        // Standard flow for cards/others (Simulation)
        setStatus('processing');
        setTimeout(() => {
            setStatus('success');
            setTimeout(() => {
                onPaymentSuccess();
            }, 2000);
        }, 2500);
    }
  };
  
  const getPaymentMethodIcon = (method: PaymentMethod) => {
      switch(method.icon){
          case 'phone':
            const isMpesaIcon = method.name.toLowerCase().includes('mpesa');
            return <PhoneIcon className={`h-6 w-6 ${isMpesaIcon ? 'text-red-500' : 'text-green-500'}`}/>;
          case 'card':
            return <CreditCardIcon className="h-6 w-6 text-blue-500"/>;
          case 'generic':
            return <CreditCardIcon className="h-6 w-6 text-gray-400"/>;
      }
  }

  const renderPaymentForm = () => {
    if (!selectedMethod) return null;

    switch (selectedMethod.icon) {
      case 'phone':
        return (
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('phoneNumber')}</label>
            <div className="mt-1 relative">
              <input 
                type="tel" 
                id="phone" 
                name="phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-[#121212] text-gray-900 dark:text-white transition-colors pl-12"
                placeholder='84 123 4567'
                required
                disabled={status !== 'idle' && status !== 'error'}
              />
              <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400 text-sm">+258</span>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {isMpesa ? "Insira seu número Vodacom (84/85)." : t('phoneHint')}
            </p>
          </div>
        );
      case 'card':
        return (
          <div className="space-y-4">
             <div>
              <label htmlFor="card-number" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('cardNumber')}</label>
              <input type="text" id="card-number" className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-[#121212] text-gray-900 dark:text-white transition-colors" placeholder="•••• •••• •••• 1234" disabled={status !== 'idle' && status !== 'error'} />
            </div>
            <div className="flex space-x-4">
                <div className="flex-1">
                    <label htmlFor="expiry-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('expiryDate')}</label>
                    <input type="text" id="expiry-date" className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-[#121212] text-gray-900 dark:text-white transition-colors" placeholder="MM / AA" disabled={status !== 'idle' && status !== 'error'} />
                </div>
                <div className="flex-1">
                    <label htmlFor="cvc" className="block text-sm font-medium text-gray-700 dark:text-gray-300">CVC</label>
                    <input type="text" id="cvc" className="mt-1 block w-full border border-gray-300 dark:border-gray-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-[#121212] text-gray-900 dark:text-white transition-colors" placeholder="•••" disabled={status !== 'idle' && status !== 'error'} />
                </div>
            </div>
          </div>
        );
      default:
        return <p className="text-sm text-gray-500 dark:text-gray-400 text-center">Formulário de pagamento para {selectedMethod.name} não implementado.</p>;
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-[#212121] border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl w-full max-w-md transform transition-all relative text-gray-900 dark:text-white">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-white z-10">
          <XIcon className="h-6 w-6" />
        </button>

        {status === 'success' ? (
          <div className="p-8 text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('paymentSuccessful')}</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">{t('preparingYourBook')}</p>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold">{t('completePurchase')}</h2>
            </div>
            
            {status === 'waiting_confirmation' ? (
                <div className="p-8 text-center flex flex-col items-center">
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-red-100 dark:bg-red-900/30 rounded-full animate-ping"></div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-full relative z-10 border border-red-100 dark:border-red-900">
                             <PhoneIcon className="h-12 w-12 text-red-500 animate-pulse" />
                        </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Confirme no seu celular</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Enviamos uma solicitação de pagamento M-Pesa para <strong>{phoneNumber}</strong>.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-md">
                        Por favor, digite seu PIN do M-Pesa para confirmar a transação de <strong>{formatPrice(total)}</strong>.
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Aguardando confirmação...
                    </div>
                </div>
            ) : (
                <div className="p-6">
                    <div className="mb-6">
                        <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-gray-100">{t('orderSummary')}</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center text-gray-600 dark:text-gray-300">
                                <span className="truncate pr-4">{book.title}</span>
                                <span className="flex-shrink-0 font-medium">{formatPrice(book.price)}</span>
                            </div>
                        </div>
                        <div className="flex justify-between items-center text-lg font-bold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                            <span>{t('total')}</span>
                            <span>{formatPrice(total)}</span>
                        </div>
                    </div>

                    <div className="mb-6">
                        <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-100">{t('selectPaymentMethod')}</h4>
                        <div className="grid grid-cols-3 gap-2">
                            {enabledMethods.map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => {
                                        setSelectedMethod(method);
                                        setStatus('idle');
                                        setErrorMessage('');
                                    }}
                                    disabled={status === 'processing'}
                                    className={`flex flex-col items-center justify-center p-3 border rounded-lg text-sm transition-colors disabled:opacity-50 ${
                                        selectedMethod?.id === method.id 
                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/50 ring-2 ring-indigo-500 text-indigo-700 dark:text-white' 
                                        : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#303030] text-gray-700 dark:text-gray-300'
                                    }`}
                                >
                                    {getPaymentMethodIcon(method)}
                                    <span className="mt-1.5 font-medium">{method.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <form onSubmit={handlePayment}>
                        {renderPaymentForm()}
                        
                        {errorMessage && (
                            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-lg flex items-center gap-2">
                                <InformationCircleIcon className="h-5 w-5 flex-shrink-0" />
                                {errorMessage}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={status === 'processing' || !selectedMethod} 
                            className={`w-full mt-6 font-bold py-3 px-4 rounded-lg flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                                isMpesa 
                                ? 'bg-red-600 hover:bg-red-700 text-white' 
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                        >
                            {status === 'processing' ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : <LockClosedIcon className="h-5 w-5 mr-2" />}
                            
                            {status === 'processing' 
                                ? (isMpesa ? 'Enviando solicitação...' : t('processing')) 
                                : `${t('pay')} ${formatPrice(total)}`
                            }
                        </button>
                    </form>
                </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
