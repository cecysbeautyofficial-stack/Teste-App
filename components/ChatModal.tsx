
import React, { useState, useEffect, useRef } from 'react';
import { User, Chat } from '../types';
import { XIcon, PaperAirplaneIcon } from './Icons';
import { useAppContext } from '../contexts/AppContext';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat: Chat;
  currentUser: User;
  recipient: User;
  onSendMessage: (chatId: string, content: string) => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, chat, currentUser, recipient, onSendMessage }) => {
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t } = useAppContext();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat.messages]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSendMessage(chat.id, message);
    setMessage('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[200] p-4" onClick={onClose}>
      <div className="bg-white dark:bg-[#1a1a1a] w-full max-w-md h-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative animate-slide-up border border-gray-200 dark:border-gray-700" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="bg-gray-100 dark:bg-[#252525] border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center flex-shrink-0">
            <div className="flex items-center gap-3">
                <img src={recipient.avatarUrl || `https://i.pravatar.cc/150?u=${recipient.id}`} alt={recipient.name} className="w-10 h-10 rounded-full object-cover shadow-sm" />
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">{recipient.name}</h3>
                    <span className="text-xs text-green-500 font-medium">Online</span>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors text-gray-500 dark:text-gray-400">
                <XIcon className="h-5 w-5" />
            </button>
        </div>

        {/* Messages Area */}
        <div className="flex-grow bg-gray-50 dark:bg-[#121212] p-4 overflow-y-auto flex flex-col gap-3">
            {chat.messages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-sm ${
                            isMe 
                            ? 'bg-brand-blue text-white rounded-tr-none' 
                            : 'bg-white dark:bg-[#2a2a2a] text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-200 dark:border-gray-700'
                        }`}>
                            <p>{msg.content}</p>
                            <span className={`text-[10px] block mt-1 opacity-70 ${isMe ? 'text-right' : 'text-left'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-[#252525] p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
            <form onSubmit={handleSend} className="flex gap-2">
                <input 
                    type="text" 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Escreva uma mensagem..." 
                    className="flex-1 bg-gray-100 dark:bg-[#1a1a1a] border border-gray-300 dark:border-gray-600 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue text-gray-900 dark:text-white"
                />
                <button 
                    type="submit"
                    disabled={!message.trim()}
                    className="bg-brand-blue hover:bg-blue-700 text-white p-2.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <PaperAirplaneIcon className="h-5 w-5 transform rotate-90" />
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
