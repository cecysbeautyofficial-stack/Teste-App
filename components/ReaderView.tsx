import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Book, User } from '../types';
import { ArrowLeftIcon, ExpandIcon, ChevronLeftIcon, ChevronRightIcon, CogIcon, PlusIcon, MinusIcon, CheckCircleIcon, LockClosedIcon, SparklesIcon, ClockIcon, PlayIcon, PauseIcon, ForwardIcon, RewindIcon, VolumeIcon, HeadphonesIcon } from './Icons';
import { useAppContext } from '../contexts/AppContext';
import { getBookContent, getOnlineBookContent } from '../utils/db';
import { analyzeReadingMetrics, ReadingMetrics } from '../services/geminiService';
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
  currentUser: User | null;
  isPurchased: boolean;
  onLogin?: () => void;
}

const PARAGRAPHS_PER_PAGE = 6;

const ReaderView: React.FC<ReaderViewProps> = ({ 
  book, 
  onBack, 
  isPreview = false, 
  onBuyFromPreview,
  currentUser,
  isPurchased,
  onLogin
}) => {
  const [content, setContent] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // AI Metrics
  const [aiMetrics, setAiMetrics] = useState<ReadingMetrics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // PDF State
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Audio State
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showAudioControls, setShowAudioControls] = useState(true);

  // Reader Customization State
  const [fontSize, setFontSize] = useState(18); // px
  const [lineHeight, setLineHeight] = useState(1.6);
  const [readerTheme, setReaderTheme] = useState<'light' | 'dark' | 'sepia'>('light');
  const [showSettings, setShowSettings] = useState(false);
  
  const readerRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const { t, language, theme: appTheme } = useAppContext();

  const isAudiobook = !!book.audioUrl;

  // Security / DRM Check
  useEffect(() => {
      if (isPreview) {
          setIsAuthorized(true);
          return;
      }

      // Strict check: User must be logged in AND must have purchased the book
      if (currentUser && isPurchased) {
          setIsAuthorized(true);
      } else {
          setIsAuthorized(false);
          setIsLoading(false); // Stop loading so we show the Access Denied screen
      }
  }, [currentUser, isPurchased, isPreview]);

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

  // Load Content
  useEffect(() => {
    if (!isAuthorized) return;

    // Audio Handling
    if (isAudiobook) {
        setIsLoading(false);
        return;
    }

    // PDF Handling
    if (book.pdfUrl) {
        setIsLoading(true);
        setError(null);
        
        const loadPdf = async () => {
            try {
                // Fetch the PDF as an ArrayBuffer first to bypass worker URL access issues (CORS/Blob)
                const response = await fetch(book.pdfUrl!);
                if (!response.ok) throw new Error(`Failed to fetch PDF: ${response.statusText}`);
                const arrayBuffer = await response.arrayBuffer();

                // Pass the data directly to PDF.js
                const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
                const loadedPdf = await loadingTask.promise;
                
                setPdfDoc(loadedPdf);
                setIsLoading(false);
                
                // Simulate AI Analysis for PDF
                setIsAnalyzing(true);
                setTimeout(() => {
                    setAiMetrics({
                        estimatedPages: loadedPdf.numPages,
                        readingTimeMinutes: Math.ceil(loadedPdf.numPages * 1.5), 
                        difficulty: "PDF Original"
                    });
                    setIsAnalyzing(false);
                }, 1500);

            } catch (error: any) {
                console.error('Error loading PDF:', error);
                setError(`Erro ao carregar o livro PDF. Detalhes: ${error.message}`);
                setIsLoading(false);
            }
        };

        loadPdf();
        return;
    }

    // Text Handling
    const fetchContent = async () => {
        setIsLoading(true);
        try {
            let loadedContent: string[] = [];
            const offlineContent = await getBookContent(book.id);
            
            if (offlineContent) {
                loadedContent = offlineContent;
            } else {
                const onlineContent = getOnlineBookContent(book.id);
                if (onlineContent) {
                    loadedContent = onlineContent;
                } else {
                    loadedContent = ["Conteúdo não disponível para visualização."];
                }
            }
            setContent(loadedContent);

            // Trigger AI Analysis for Text Content
            if (loadedContent.length > 0 && !isPreview) {
                setIsAnalyzing(true);
                const fullText = loadedContent.join(" ");
                const metrics = await analyzeReadingMetrics(fullText, fullText.length);
                if (metrics) setAiMetrics(metrics);
                setIsAnalyzing(false);
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
  }, [book.id, book.pdfUrl, isAuthorized, isPreview, isAudiobook]);
  
  const pages = useMemo(() => {
    if (book.pdfUrl || isAudiobook) return []; 
    
    const chunks: string[][] = [];
    if (!content || content.length === 0) return [['']];
    
    for (let i = 0; i < content.length; i += PARAGRAPHS_PER_PAGE) {
        chunks.push(content.slice(i, i + PARAGRAPHS_PER_PAGE));
    }
    
    if (isPreview) {
        return chunks.slice(0, 2);
    }
    
    return chunks;
  }, [content, isPreview, book.pdfUrl, isAudiobook]);

  const totalPages = useMemo(() => {
      if (book.pdfUrl) {
          const num = pdfDoc?.numPages || 0;
          return isPreview ? Math.min(num, 2) : num;
      }
      // If AI calculated pages, use that for display context, otherwise use chunks
      return pages.length;
  }, [book.pdfUrl, pdfDoc, isPreview, pages.length]);

  const currentContent = !book.pdfUrl && !isAudiobook ? (pages[currentPage - 1] || []) : [];
  const storageKey = `livroflix-page-progress-${book.id}`;

  // Load progress
  useEffect(() => {
    if (isPreview || isLoading || !isAuthorized) return;
    const savedPage = localStorage.getItem(storageKey);
    if (savedPage) {
        if (isAudiobook) {
             // Audio progress logic would go here
        } else {
            const pageNumber = parseInt(savedPage, 10);
            if (pageNumber > 0) {
                 if (totalPages > 0 && pageNumber > totalPages) {
                     setCurrentPage(1);
                 } else {
                     setCurrentPage(pageNumber);
                 }
            }
        }
    }
  }, [storageKey, isPreview, isLoading, totalPages, isAuthorized, isAudiobook]);

  // Save progress
  useEffect(() => {
    if (isPreview || !isAuthorized) return;
    if (!isAudiobook) {
        localStorage.setItem(storageKey, String(currentPage));
    }
  }, [currentPage, storageKey, isPreview, isAuthorized, isAudiobook]);
  
  // PDF Render Logic
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || !isAuthorized) return;

    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
        return;
    }

    const renderPage = () => {
        if (renderTaskRef.current) {
            renderTaskRef.current.cancel();
        }

        pdfDoc.getPage(currentPage).then((page: any) => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const container = containerRef.current;
            const containerWidth = container?.clientWidth || window.innerWidth;
            const containerHeight = container?.clientHeight || window.innerHeight;
            
            const unscaledViewport = page.getViewport({ scale: 1.0 });
            const padding = 32; 
            const availableWidth = containerWidth - padding;
            const availableHeight = containerHeight - 80; 

            const scaleX = availableWidth / unscaledViewport.width;
            const scaleY = availableHeight / unscaledViewport.height;
            const scale = Math.min(scaleX, scaleY, 3.0);

            const viewport = page.getViewport({ scale });
            const outputScale = window.devicePixelRatio || 1;
            
            canvas.width = Math.floor(viewport.width * outputScale);
            canvas.height = Math.floor(viewport.height * outputScale);
            canvas.style.width = Math.floor(viewport.width) + "px";
            canvas.style.height = Math.floor(viewport.height) + "px";

            const transform = outputScale !== 1 
              ? [outputScale, 0, 0, outputScale, 0, 0] 
              : null;

            const renderContext = {
                canvasContext: ctx,
                transform: transform,
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

    renderPage();

    const handleResize = () => {
        renderPage();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);

  }, [pdfDoc, currentPage, isFullscreen, totalPages, isAuthorized]);

  // Audio Handlers
  const togglePlay = () => {
      if (audioRef.current) {
          if (isPlaying) {
              audioRef.current.pause();
          } else {
              audioRef.current.play();
          }
          setIsPlaying(!isPlaying);
      }
  };

  const handleTimeUpdate = () => {
      if (audioRef.current) {
          const current = audioRef.current.currentTime;
          setProgress(current);
          if (Math.abs(current % 5) < 0.5 && !isPreview) {
               localStorage.setItem(storageKey, String(current));
          }
      }
  };

  const handleLoadedMetadata = () => {
      if (audioRef.current) {
          setAudioDuration(audioRef.current.duration);
          // Restore progress
          const savedTime = localStorage.getItem(storageKey);
          if (savedTime && !isPreview) {
              audioRef.current.currentTime = parseFloat(savedTime);
              setProgress(parseFloat(savedTime));
          }
      }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const time = parseFloat(e.target.value);
      if (audioRef.current) {
          audioRef.current.currentTime = time;
          setProgress(time);
      }
  };

  const skip = (seconds: number) => {
      if (audioRef.current) {
          audioRef.current.currentTime += seconds;
      }
  };

  const changePlaybackRate = () => {
      const rates = [1, 1.25, 1.5, 2];
      const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
      setPlaybackRate(nextRate);
      if (audioRef.current) {
          audioRef.current.playbackRate = nextRate;
      }
  };

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      
      if (hours > 0) {
          return `${hours}:${remainingMins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
      return `${remainingMins}:${secs.toString().padStart(2, '0')}`;
  };

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
        const doc = document as any;
        const fullscreenEl = doc.fullscreenElement || doc.mozFullScreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement;
        setIsFullscreen(!!fullscreenEl);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
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
    const isFull = doc.fullscreenElement;

    if (!isFull) {
        if (elem.requestFullscreen) elem.requestFullscreen();
    } else {
        if (doc.exitFullscreen) doc.exitFullscreen();
    }
  }, []);

  const isLastPreviewPage = isPreview && currentPage === totalPages;
  const showNextButton = !isLastPreviewPage && currentPage < totalPages && !isAudiobook;
  const showPrevButton = currentPage > 1 && !isAudiobook;

  const progressPercentage = isAudiobook ? 0 : (totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0);
  
  const timeRemaining = useMemo(() => {
      if (aiMetrics) {
          const timePerPage = aiMetrics.readingTimeMinutes / (aiMetrics.estimatedPages || totalPages || 1);
          const remainingPages = (totalPages - currentPage);
          return Math.ceil(remainingPages * timePerPage);
      }
      return (totalPages - currentPage) * 2;
  }, [aiMetrics, totalPages, currentPage]);

  const getThemeClasses = () => {
      if (isAudiobook) return 'bg-gradient-to-b from-gray-900 to-black text-white';
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

  if (!isAuthorized) {
      return (
          <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-[100] text-white p-8 text-center">
              <div className="bg-red-600/20 p-6 rounded-full mb-6 border-2 border-red-500/50 shadow-[0_0_30px_rgba(220,38,38,0.3)]">
                  <LockClosedIcon className="h-16 w-16 text-red-500" />
              </div>
              <h1 className="text-3xl font-bold mb-2">Acesso Negado</h1>
              <p className="text-gray-400 max-w-md mb-8">
                  Este livro é protegido por direitos de autor. Apenas o utilizador que comprou este exemplar tem permissão para lê-lo.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full justify-center px-4">
                  <button 
                    onClick={onBack}
                    className="bg-white text-gray-900 px-8 py-3 rounded-full font-bold hover:bg-gray-200 transition-colors shadow-lg w-full sm:w-auto whitespace-nowrap"
                  >
                      Voltar à Loja
                  </button>
                  {!currentUser && onLogin && (
                      <button 
                        onClick={onLogin} 
                        className="text-white font-bold underline cursor-pointer hover:text-gray-200 text-sm md:text-base transition-colors text-center"
                      >
                          Faça login para aceder à sua biblioteca.
                      </button>
                  )}
              </div>
          </div>
      );
  }

  return (
    <div ref={readerRef} className={`fixed inset-0 flex flex-col items-center justify-center z-[100] transition-colors duration-300 ${getThemeClasses()}`}>
      
      {isAudiobook && (
          <audio 
            ref={audioRef}
            src={book.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
          />
      )}

      {/* Header */}
      <header className={`absolute top-0 left-0 right-0 z-20 shadow-sm transition-colors duration-300 ${readerTheme === 'dark' || isAudiobook ? 'bg-black/50 border-b border-white/10' : 'bg-white/90 border-b border-gray-100'}`}>
        <div className="max-w-[1600px] mx-auto h-14 flex justify-between items-center px-4 md:px-8 lg:px-16">
            <button onClick={onBack} className={`flex items-center gap-2 p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${isAudiobook ? 'text-white' : ''}`}>
                <ArrowLeftIcon className="h-5 w-5" />
                <span className="font-semibold hidden sm:inline truncate max-w-[150px]">{book.title}</span>
            </button>
            
            <div className="flex items-center gap-2">
                {/* Settings Toggle - Hide for Audio for now except generic */}
                {!book.pdfUrl && !isAudiobook && (
                <div className="relative" ref={settingsRef}>
                    <button 
                        onClick={() => setShowSettings(!showSettings)} 
                        className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-black/10 dark:bg-white/20' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
                        title={t('readerSettings')}
                    >
                        <CogIcon className="h-6 w-6" />
                    </button>
                    {showSettings && (
                        <div className={`absolute top-full right-0 mt-2 w-72 rounded-xl shadow-2xl border p-4 z-50 ${readerTheme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                            <div className="mb-4">
                                <label className="text-xs font-semibold mb-2 block">{t('fontSize')}</label>
                                <div className={`flex items-center justify-between rounded-lg p-1 ${readerTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded"><MinusIcon className="h-4 w-4"/></button>
                                    <span className="font-mono text-sm">{fontSize}px</span>
                                    <button onClick={() => setFontSize(Math.min(32, fontSize + 2))} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded"><PlusIcon className="h-4 w-4"/></button>
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="text-xs font-semibold mb-2 block">{t('lineHeight')}</label>
                                <div className={`flex p-1 rounded-lg ${readerTheme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    {[1.2, 1.6, 2.0].map((h) => (
                                        <button key={h} onClick={() => setLineHeight(h)} className={`flex-1 py-1 text-xs rounded ${lineHeight === h ? (readerTheme === 'dark' ? 'bg-gray-600 shadow' : 'bg-white shadow') : ''}`}>{h === 1.2 ? 'Compact' : h === 1.6 ? 'Normal' : 'Wide'}</button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-semibold mb-2 block">{t('theme')}</label>
                                <div className="flex gap-2">
                                    <button onClick={() => setReaderTheme('light')} className={`flex-1 py-2 rounded border text-xs font-semibold flex items-center justify-center gap-1 ${readerTheme === 'light' ? 'ring-2 ring-indigo-500 border-transparent' : 'border-gray-300'} bg-white text-gray-900`}>{readerTheme === 'light' && <CheckCircleIcon className="h-3 w-3 text-indigo-500"/>}{t('light')}</button>
                                    <button onClick={() => setReaderTheme('sepia')} className={`flex-1 py-2 rounded border text-xs font-semibold flex items-center justify-center gap-1 ${readerTheme === 'sepia' ? 'ring-2 ring-indigo-500 border-transparent' : 'border-[#d3c4b1]'} bg-[#f4ecd8] text-[#5b4636]`}>{readerTheme === 'sepia' && <CheckCircleIcon className="h-3 w-3 text-indigo-500"/>}{t('sepia')}</button>
                                    <button onClick={() => setReaderTheme('dark')} className={`flex-1 py-2 rounded border text-xs font-semibold flex items-center justify-center gap-1 ${readerTheme === 'dark' ? 'ring-2 ring-indigo-500 border-transparent' : 'border-gray-600'} bg-gray-900 text-white`}>{readerTheme === 'dark' && <CheckCircleIcon className="h-3 w-3 text-indigo-500"/>}{t('dark')}</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                )}

                {/* AI Indicator */}
                {!isAudiobook && (
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-full border border-indigo-200 dark:border-indigo-800">
                        {isAnalyzing ? (
                            <div className="flex items-center gap-2">
                                <SparklesIcon className="h-3 w-3 text-indigo-500 animate-spin" />
                                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300">Analisando Livro...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2" title="Páginas estimadas por IA">
                                <SparklesIcon className="h-3 w-3 text-indigo-500" />
                                <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300">
                                    {aiMetrics ? `${aiMetrics.estimatedPages} Páginas` : `${totalPages} Páginas`}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                <button onClick={toggleFullscreen} className={`p-2 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${isAudiobook ? 'text-white' : ''}`} title="Toggle Fullscreen">
                    <ExpandIcon className="h-5 w-5"/>
                </button>
            </div>
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="relative flex-1 flex items-center justify-center w-full h-full overflow-hidden pt-14 pb-16" ref={containerRef}>
        
        {/* Prev Button */}
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
        ) : error ? (
            <div className="text-center p-8 text-white">
                <p className="text-red-400 mb-4">{error}</p>
                <button onClick={onBack} className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm">Voltar</button>
            </div>
        ) : isAudiobook ? (
            // Audio Player UI
            <div className="flex flex-col items-center justify-center w-full max-w-md px-6 space-y-8">
                {/* Cover Art with Glow */}
                <div className="relative group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 animate-pulse"></div>
                    <img 
                        src={book.coverUrl} 
                        alt={book.title} 
                        className="relative w-64 h-64 sm:w-72 sm:h-72 object-cover rounded-2xl shadow-2xl border border-white/10 z-10"
                    />
                </div>

                <div className="text-center space-y-1 w-full">
                    <h2 className="text-2xl font-bold text-white truncate px-4">{book.title}</h2>
                    <p className="text-gray-400">{book.author.name}</p>
                </div>

                {/* Audio Controls */}
                <div className="w-full space-y-4 bg-white/5 p-6 rounded-3xl backdrop-blur-md border border-white/10">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <input 
                            type="range" 
                            min="0" 
                            max={audioDuration || 100} 
                            value={progress} 
                            onChange={handleSeek}
                            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400"
                        />
                        <div className="flex justify-between text-xs text-gray-400 font-mono">
                            <span>{formatTime(progress)}</span>
                            <span>{formatTime(audioDuration)}</span>
                        </div>
                    </div>

                    {/* Main Buttons */}
                    <div className="flex items-center justify-center gap-6">
                        <button onClick={() => skip(-10)} className="p-2 text-gray-400 hover:text-white transition-colors">
                            <RewindIcon className="h-6 w-6" />
                        </button>
                        <button 
                            onClick={togglePlay} 
                            className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-white/10"
                        >
                            {isPlaying ? <PauseIcon className="h-8 w-8 fill-current" /> : <PlayIcon className="h-8 w-8 fill-current ml-1" />}
                        </button>
                        <button onClick={() => skip(10)} className="p-2 text-gray-400 hover:text-white transition-colors">
                            <ForwardIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Secondary Controls */}
                    <div className="flex justify-between items-center pt-2 px-2">
                        <button 
                            onClick={changePlaybackRate}
                            className="text-xs font-bold text-indigo-400 hover:text-indigo-300 px-2 py-1 bg-white/5 rounded-md transition-colors"
                        >
                            {playbackRate}x
                        </button>
                        <div className="flex items-center gap-2">
                            <VolumeIcon className="h-4 w-4 text-gray-400" />
                            <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.1" 
                                value={volume} 
                                onChange={(e) => {
                                    setVolume(parseFloat(e.target.value));
                                    if (audioRef.current) audioRef.current.volume = parseFloat(e.target.value);
                                }}
                                className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-white" 
                            />
                        </div>
                    </div>
                </div>
            </div>
        ) : book.pdfUrl ? (
            <div className="flex flex-col items-center justify-center w-full h-full overflow-auto relative">
                <canvas ref={canvasRef} className="shadow-2xl max-w-full max-h-full object-contain" />
                {isLastPreviewPage && onBuyFromPreview && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-30">
                        <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-2xl text-center max-w-sm border border-white/10 mx-4 animate-slide-up">
                            <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{t('likedTheSample')}</h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">{t('buyToContinue')}</p>
                            <button onClick={() => onBuyFromPreview(book)} className="bg-brand-red hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition-transform hover:scale-105 shadow-lg w-full">{t('buyNow')}</button>
                        </div>
                    </div>
                )}
            </div>
        ) : (
            <div className="h-full w-full max-w-3xl px-6 sm:px-12 overflow-y-auto custom-scrollbar">
              <div className="min-h-full flex flex-col justify-center transition-all duration-300 ease-in-out py-8" style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight, fontFamily: "'Merriweather', 'Georgia', serif" }}>
                <div className="space-y-6">
                    {currentContent.map((text, index) => (
                        <p key={index} className="text-justify">{text}</p>
                    ))}
                </div>
                {isLastPreviewPage && onBuyFromPreview && (
                    <div className="mt-12 p-8 rounded-2xl text-center bg-gray-50 dark:bg-white/5 border border-dashed border-gray-300 dark:border-gray-700">
                        <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{t('likedTheSample')}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">{t('buyToContinue')}</p>
                        <button onClick={() => onBuyFromPreview(book)} className="bg-brand-red hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full transition-transform hover:scale-105 shadow-lg">{t('buyNow')}</button>
                    </div>
                )}
              </div>
            </div>
        )}

        {/* Next Button */}
        {showNextButton && (
            <button 
                onClick={handleNextPage} 
                className={`absolute right-2 sm:right-6 z-10 p-3 rounded-full shadow-lg transition-all hover:scale-110 ${getControlThemeClasses()}`}
            >
                <ChevronRightIcon className="w-6 h-6"/>
            </button>
        )}
      </main>

      {/* Enhanced Footer with Progress - Hide for Audiobooks as controls are central */}
      {!isAudiobook && (
      <footer className={`absolute bottom-0 left-0 right-0 h-14 flex flex-col justify-center z-20 backdrop-blur-xl border-t border-white/10 px-6 ${readerTheme === 'dark' ? 'bg-black/80 text-white' : 'bg-white/90 text-gray-800'}`}>
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between gap-4">
            
            {/* Left: Page Counter */}
            <div className="flex flex-col">
                <span className="text-xs font-bold opacity-80">
                    Página {currentPage} <span className="opacity-50">de {totalPages || '?'}</span>
                </span>
                {aiMetrics && (
                    <span className="text-[10px] opacity-50">
                        Dificuldade: {aiMetrics.difficulty}
                    </span>
                )}
            </div>

            {/* Middle: Progress Bar */}
            <div className="flex-1 flex flex-col gap-1 max-w-md">
                <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
            </div>

            {/* Right: Time Remaining */}
            <div className="flex flex-col items-end text-right min-w-[80px]">
                <span className="text-xs font-bold opacity-80">{progressPercentage}% Lido</span>
                {!isPreview && (
                    <div className="flex items-center gap-1 text-[10px] opacity-50">
                        <ClockIcon className="h-3 w-3" />
                        <span>{timeRemaining} min restantes</span>
                    </div>
                )}
            </div>
        </div>
      </footer>
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.5); border-radius: 20px; }
      `}</style>
    </div>
  );
};

export default ReaderView;