
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Book } from '../types';
import { ArrowLeftIcon, ExpandIcon, ChevronLeftIcon, ChevronRightIcon, CogIcon, PlusIcon, MinusIcon, CheckCircleIcon } from './Icons';
import { useAppContext } from '../contexts/AppContext';
import { getBookContent, getOnlineBookContent } from '../utils/db';
import * as pdfjsLib from 'pdfjs-dist';

// Fix for potential ESM default export wrapping
const pdfjs = (pdfjsLib as any).default || pdfjsLib;

// Set the worker source for pdfjs
if (pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
}

interface ReaderViewProps {
  book: Book;
  onBack: () => void;
  isPreview?: boolean;
  onBuyFromPreview?: (book: Book) => void;
}

const PARAGRAPHS_PER_PAGE = 6;

const ReaderView: React.FC<ReaderViewProps> = ({ 
  book, 
  onBack, 
  isPreview = false, 
  onBuyFromPreview,
}) => {
  const [content, setContent] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // PDF State
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Reader Customization State
  const [fontSize, setFontSize] = useState(18); // px
  const [lineHeight, setLineHeight] = useState(1.6);
  const [readerTheme, setReaderTheme] = useState<'light' | 'dark' | 'sepia'>('light');
  const [showSettings, setShowSettings] = useState(false);
  
  const readerRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const { t, language, theme: appTheme } = useAppContext();

  // Initial theme setup
  useEffect(() => {
      if (appTheme === 'dark') setReaderTheme('dark');
      else setReaderTheme('light');
  }, [appTheme]);

  // Click outside listener for settings menu
  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
              setShowSettings(false);
          }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Load Content (Text or PDF)
  useEffect(() => {
    if (book.pdfUrl) {
        setIsLoading(true);
        // Use the resolved pdfjs object here
        const loadingTask = pdfjs.getDocument(book.pdfUrl);
        loadingTask.promise.then((loadedPdf: any) => {
            setPdfDoc(loadedPdf);
            setIsLoading(false);
        }, (reason: any) => {
            console.error('Error loading PDF:', reason);
            setIsLoading(false);
        });
        return;
    }

    const fetchContent = async () => {
        setIsLoading(true);
        try {
            const offlineContent = await getBookContent(book.id);
            if (offlineContent) {
                setContent(offlineContent);
            } else {
                const onlineContent = getOnlineBookContent(book.id);
                if (onlineContent) {
                    setContent(onlineContent);
                } else {
                    setContent(["Conteúdo não disponível para visualização."]);
                }
            }
        } catch (error) {
            console.error("Failed to load book content:", error);
            const onlineContent = getOnlineBookContent(book.id);
            setContent(onlineContent || ["Erro ao carregar conteúdo."]);
        } finally {
            setIsLoading(false);
        }
    };
    fetchContent();
  }, [book.id, book.pdfUrl]);
  
  const pages = useMemo(() => {
    if (book.pdfUrl) return []; 
    const fullContent = isPreview ? content.slice(0, 5) : content;
    const chunks: string[][] = [];
    if (!fullContent || fullContent.length === 0) return [['']];
    for (let i = 0; i < fullContent.length; i += PARAGRAPHS_PER_PAGE) {
        chunks.push(fullContent.slice(i, i + PARAGRAPHS_PER_PAGE));
    }
    return chunks;
  }, [content, isPreview, book.pdfUrl]);

  const totalPages = book.pdfUrl ? (pdfDoc?.numPages || 0) : pages.length;
  const currentContent = !book.pdfUrl ? (pages[currentPage - 1] || []) : [];
  const storageKey = `livroflix-page-progress-${book.id}`;

  // Load progress
  useEffect(() => {
    if (isPreview || isLoading) return;
    // We now allow saving progress for PDF as well
    const savedPage = localStorage.getItem(storageKey);
    if (savedPage) {
        const pageNumber = parseInt(savedPage, 10);
        if (pageNumber > 0) {
             // Check bounds only if we know total pages (might be delayed for PDF)
             if (totalPages > 0 && pageNumber > totalPages) {
                 setCurrentPage(1);
             } else {
                 setCurrentPage(pageNumber);
             }
        }
    }
  }, [storageKey, isPreview, isLoading, totalPages]);

  // Save progress
  useEffect(() => {
    if (isPreview) return;
    localStorage.setItem(storageKey, String(currentPage));
  }, [currentPage, storageKey, isPreview]);
  
  // Render PDF Page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    const renderPage = () => {
        if (renderTaskRef.current) {
            renderTaskRef.current.cancel();
        }

        pdfDoc.getPage(currentPage).then((page: any) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Calculate scale to fit container
            const container = containerRef.current;
            const containerWidth = container?.clientWidth || window.innerWidth;
            const containerHeight = container?.clientHeight || window.innerHeight;
            
            // Get viewport at scale 1.0 to know original dimensions
            const unscaledViewport = page.getViewport({ scale: 1.0 });
            
            // Subtract some padding for the scale calculation
            const padding = 32; 
            const availableWidth = containerWidth - padding;
            const availableHeight = containerHeight - 80; // Minus header/footer approx

            const scaleX = availableWidth / unscaledViewport.width;
            const scaleY = availableHeight / unscaledViewport.height;
            
            // Choose the smaller scale to fit entirely, cap at reasonable max zoom
            const scale = Math.min(scaleX, scaleY, 2.0);

            const viewport = page.getViewport({ scale });

            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext = {
                canvasContext: ctx,
                viewport: viewport,
            };

            const renderTask = page.render(renderContext);
            renderTaskRef.current = renderTask;

            renderTask.promise.then(() => {
                renderTaskRef.current = null;
            }).catch((error: any) => {
                if (error.name !== 'RenderingCancelledException') {
                    console.error('Render error:', error);
                }
            });
        });
    };

    // Initial render
    renderPage();

    // Re-render on resize
    const handleResize = () => {
        // Debounce could be added here
        renderPage();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);

  }, [pdfDoc, currentPage, isFullscreen]);

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
        const doc = document as any;
        const fullscreenEl = doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement;
        setIsFullscreen(!!fullscreenEl);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
        document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
        document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage(p => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const handlePrevPage = useCallback(() => {
    setCurrentPage(p => Math.max(p - 1, 1));
  }, []);
  
  const toggleFullscreen = useCallback(() => {
    const elem = readerRef.current as any;
    const doc = document as any;

    const isFull = doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement;

    if (!isFull) {
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch((err: any) => {
                console.warn(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari and Opera */
            elem.webkitRequestFullscreen();
        } else if (elem.mozRequestFullScreen) { /* Firefox */
            elem.mozRequestFullScreen();
        } else if (elem.msRequestFullscreen) { /* IE/Edge */
            elem.msRequestFullscreen();
        }
    } else {
        if (doc.exitFullscreen) {
            doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
            doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
            doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
            doc.msExitFullscreen();
        }
    }
  }, []);

  const isLastPreviewPage = isPreview && currentPage === totalPages;
  const showNextButton = !isLastPreviewPage && currentPage < totalPages;
  const showPrevButton = currentPage > 1;

  const currentDateTime = useMemo(() => {
    return new Date().toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  }, [language]);

  // Theme Styles configuration
  const getThemeClasses = () => {
      switch(readerTheme) {
          case 'dark': return 'bg-gray-900 text-gray-300';
          case 'sepia': return 'bg-[#f4ecd8] text-[#5b4636]';
          case 'light': default: return 'bg-white text-gray-900';
      }
  };
  
  const getControlThemeClasses = () => {
      switch(readerTheme) {
        case 'dark': return 'bg-gray-800 text-white border-gray-700';
        case 'sepia': return 'bg-[#eaddcf] text-[#5b4636] border-[#d3c4b1]';
        case 'light': default: return 'bg-gray-100 text-gray-900 border-gray-200';
      }
  };

  return (
    <div ref={readerRef} className={`fixed inset-0 flex flex-col items-center justify-center z-[100] transition-colors duration-300 ${getThemeClasses()}`}>
      {/* Header */}
      <header className={`absolute top-0 left-0 right-0 z-20 shadow-sm transition-colors duration-300 ${readerTheme === 'dark' ? 'bg-black/50' : 'bg-white/90 border-b border-gray-100'}`}>
        <div className="max-w-[1600px] mx-auto h-14 flex justify-between items-center px-4 md:px-8 lg:px-16">
            <button onClick={onBack} className="flex items-center gap-2 p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                <ArrowLeftIcon className="h-5 w-5" />
                <span className="font-semibold hidden sm:inline truncate max-w-[150px]">{book.title}</span>
            </button>
            
            <div className="flex items-center gap-2">
                {/* Settings Toggle - Hide for PDF */}
                {!book.pdfUrl && (
                <div className="relative" ref={settingsRef}>
                    <button 
                        onClick={() => setShowSettings(!showSettings)} 
                        className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-black/10 dark:bg-white/20' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
                        title={t('readerSettings')}
                    >
                        <CogIcon className="h-6 w-6" />
                    </button>
                    
                    {/* Settings Popover */}
                    {showSettings && (
                        <div className={`absolute top-full right-0 mt-2 w-72 rounded-xl shadow-2xl border p-4 z-50 ${readerTheme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                            <h3 className="font-bold mb-4 text-sm uppercase tracking-wider opacity-70">{t('readerSettings')}</h3>
                            
                            {/* Font Size Control */}
                            <div className="mb-4">
                                <label className="text-xs font-semibold mb-2 block">{t('fontSize')}</label>
                                <div className={`flex items-center justify-between rounded-lg p-1 ${readerTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded"><MinusIcon className="h-4 w-4"/></button>
                                    <span className="font-mono text-sm">{fontSize}px</span>
                                    <button onClick={() => setFontSize(Math.min(32, fontSize + 2))} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded"><PlusIcon className="h-4 w-4"/></button>
                                </div>
                            </div>

                            {/* Line Height Control */}
                            <div className="mb-4">
                                <label className="text-xs font-semibold mb-2 block">{t('lineHeight')}</label>
                                <div className={`flex p-1 rounded-lg ${readerTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    {[1.2, 1.6, 2.0].map((h) => (
                                        <button 
                                            key={h}
                                            onClick={() => setLineHeight(h)}
                                            className={`flex-1 py-1 text-xs rounded ${lineHeight === h ? (readerTheme === 'dark' ? 'bg-gray-600 shadow' : 'bg-white shadow') : ''}`}
                                        >
                                            {h === 1.2 ? 'Compact' : h === 1.6 ? 'Normal' : 'Wide'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Theme Control */}
                            <div>
                                <label className="text-xs font-semibold mb-2 block">{t('theme')}</label>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setReaderTheme('light')}
                                        className={`flex-1 py-2 rounded border text-xs font-semibold flex items-center justify-center gap-1 ${readerTheme === 'light' ? 'ring-2 ring-indigo-500 border-transparent' : 'border-gray-300'} bg-white text-gray-900`}
                                    >
                                        {readerTheme === 'light' && <CheckCircleIcon className="h-3 w-3 text-indigo-500"/>}
                                        {t('light')}
                                    </button>
                                    <button 
                                        onClick={() => setReaderTheme('sepia')}
                                        className={`flex-1 py-2 rounded border text-xs font-semibold flex items-center justify-center gap-1 ${readerTheme === 'sepia' ? 'ring-2 ring-indigo-500 border-transparent' : 'border-[#d3c4b1]'} bg-[#f4ecd8] text-[#5b4636]`}
                                    >
                                        {readerTheme === 'sepia' && <CheckCircleIcon className="h-3 w-3 text-indigo-500"/>}
                                        {t('sepia')}
                                    </button>
                                    <button 
                                        onClick={() => setReaderTheme('dark')}
                                        className={`flex-1 py-2 rounded border text-xs font-semibold flex items-center justify-center gap-1 ${readerTheme === 'dark' ? 'ring-2 ring-indigo-500 border-transparent' : 'border-gray-600'} bg-gray-900 text-white`}
                                    >
                                        {readerTheme === 'dark' && <CheckCircleIcon className="h-3 w-3 text-indigo-500"/>}
                                        {t('dark')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                )}

                <div className="hidden sm:flex items-center gap-4 text-xs opacity-70">
                    <span>{currentDateTime}</span>
                    {book.status === 'Draft' && (
                        <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-full">{t('draft')}</span>
                    )}
                </div>
                <button onClick={toggleFullscreen} className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors" title="Toggle Fullscreen">
                    <ExpandIcon className="h-5 w-5"/>
                </button>
            </div>
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="relative flex-1 flex items-center justify-center w-full h-full overflow-hidden pt-14 pb-12" ref={containerRef}>
        
        {showPrevButton && (
            <button 
                onClick={handlePrevPage} 
                className={`absolute left-2 sm:left-6 z-10 p-3 rounded-full shadow-lg transition-all hover:scale-110 ${getControlThemeClasses()}`}
            >
                <ChevronLeftIcon className="w-6 h-6"/>
            </button>
        )}

        {isLoading ? (
             <div className="flex items-center justify-center h-64">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current opacity-50"></div>
                 <span className="ml-3 opacity-70">{t('loadingBook')}</span>
             </div>
        ) : book.pdfUrl ? (
            <div className="flex flex-col items-center justify-center w-full h-full overflow-auto">
                <canvas ref={canvasRef} className="shadow-2xl max-w-full max-h-full object-contain" />
            </div>
        ) : (
            <div className="h-full w-full max-w-3xl px-6 sm:px-12 overflow-y-auto custom-scrollbar">
              <div 
                className="min-h-full flex flex-col justify-center transition-all duration-300 ease-in-out py-8"
                style={{ 
                    fontSize: `${fontSize}px`, 
                    lineHeight: lineHeight,
                    fontFamily: "'Merriweather', 'Georgia', serif" 
                }}
              >
                <div className="space-y-6">
                    {currentContent.map((text, index) => (
                        <p key={index} className="text-justify">{text}</p>
                    ))}
                </div>
                
                {isLastPreviewPage && onBuyFromPreview && (
                    <div className="mt-12 p-8 rounded-xl text-center bg-black/5 dark:bg-white/10 backdrop-blur-sm border border-black/10 dark:border-white/10">
                        <h3 className="text-2xl font-bold mb-2">{t('likedTheSample')}</h3>
                        <p className="opacity-80 mb-6">{t('buyToContinue')}</p>
                        <button
                            onClick={() => onBuyFromPreview(book)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full transition-transform hover:scale-105 shadow-lg"
                        >
                            {t('buyNow')}
                        </button>
                    </div>
                )}
              </div>
            </div>
        )}

        {showNextButton && (
            <button 
                onClick={handleNextPage} 
                className={`absolute right-2 sm:right-6 z-10 p-3 rounded-full shadow-lg transition-all hover:scale-110 ${getControlThemeClasses()}`}
            >
                <ChevronRightIcon className="w-6 h-6"/>
            </button>
        )}
      </main>

      {/* Footer */}
      <footer className={`absolute bottom-0 left-0 right-0 h-12 flex items-center justify-center text-xs font-medium opacity-60 z-20 select-none pointer-events-none`}>
        <span className="bg-black/20 dark:bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
            {t('pages')} {currentPage} / {totalPages || '?'}
        </span>
        {!book.pdfUrl && (
            <div className="absolute right-4 hidden sm:block w-32 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                 <div 
                    className="h-full bg-indigo-500 transition-all duration-300" 
                    style={{ width: `${(currentPage / totalPages) * 100}%` }}
                 ></div>
            </div>
        )}
      </footer>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: rgba(156, 163, 175, 0.5);
            border-radius: 20px;
        }
      `}</style>
    </div>
  );
};

export default ReaderView;
