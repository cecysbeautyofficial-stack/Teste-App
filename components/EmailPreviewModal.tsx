
import React from 'react';
import { XIcon, MailIcon } from './Icons';
import { useAppContext } from '../contexts/AppContext';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  htmlContent: string;
  subject?: string;
}

const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({ isOpen, onClose, htmlContent, subject }) => {
  if (!isOpen) return null;
  const { t } = useAppContext();

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[200] p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-3xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative animate-slide-up" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="bg-gray-100 dark:bg-[#252525] border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-3">
                <div className="bg-white dark:bg-[#333] p-2 rounded-full shadow-sm">
                    <MailIcon className="h-5 w-5 text-brand-blue dark:text-indigo-400" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">Pré-visualização de Email</h3>
                    {subject && <p className="text-xs text-gray-500 dark:text-gray-400">{subject}</p>}
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors text-gray-500 dark:text-gray-400">
                <XIcon className="h-6 w-6" />
            </button>
        </div>

        {/* Content */}
        <div className="flex-grow bg-gray-50 dark:bg-[#121212] p-4 sm:p-8 overflow-y-auto">
            <div className="max-w-[600px] mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
                <iframe 
                    srcDoc={htmlContent} 
                    className="w-full h-[600px] border-0 bg-white"
                    title="Email Preview"
                    sandbox="allow-same-origin"
                />
            </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-100 dark:bg-[#252525] border-t border-gray-200 dark:border-gray-700 p-4 text-center text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
            Esta é uma simulação visual do email que seria enviado ao usuário.
        </div>
      </div>
    </div>
  );
};

export default EmailPreviewModal;
