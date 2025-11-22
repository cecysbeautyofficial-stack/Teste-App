
import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, CheckCircleIcon, SparklesIcon } from './Icons';
import { useAppContext } from '../contexts/AppContext';
import { AuthorOnboardingData } from '../types';
import Logo from './Logo';

interface AuthorOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: AuthorOnboardingData) => void;
}

const AuthorOnboardingModal: React.FC<AuthorOnboardingModalProps> = ({ isOpen, onClose, onComplete }) => {
  const { t } = useAppContext();
  const [step, setStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [answers, setAnswers] = useState<Partial<AuthorOnboardingData>>({});

  const questions = [
    {
      key: 'experienceLevel',
      title: t('onboardingExpTitle'),
      options: [
        { label: t('onboardingExpOption1'), value: 'aspiring', icon: '🌱' },
        { label: t('onboardingExpOption2'), value: 'hobbyist', icon: '🎨' },
        { label: t('onboardingExpOption3'), value: 'professional', icon: '💼' },
      ]
    },
    {
      key: 'primaryGenre',
      title: t('onboardingGenreTitle'),
      options: [
        { label: t('onboardingGenreOption1'), value: 'fiction', icon: '🐉' },
        { label: t('onboardingGenreOption2'), value: 'non-fiction', icon: '💡' },
        { label: t('onboardingGenreOption3'), value: 'academic', icon: '🎓' },
      ]
    },
    {
      key: 'writingGoal',
      title: t('onboardingGoalTitle'),
      options: [
        { label: t('onboardingGoalOption1'), value: 'money', icon: '💰' },
        { label: t('onboardingGoalOption2'), value: 'audience', icon: '📢' },
        { label: t('onboardingGoalOption3'), value: 'share', icon: '❤️' },
      ]
    },
    {
      key: 'publishingStatus',
      title: t('onboardingStatusTitle'),
      options: [
        { label: t('onboardingStatusOption1'), value: 'ready', icon: '🚀' },
        { label: t('onboardingStatusOption2'), value: 'writing', icon: '✍️' },
        { label: t('onboardingStatusOption3'), value: 'planning', icon: '🤔' },
      ]
    }
  ];

  const handleSelect = (value: string) => {
    const currentQuestionKey = questions[step].key;
    setAnswers(prev => ({ ...prev, [currentQuestionKey]: value }));
  };

  const handleContinue = () => {
    if (step < questions.length - 1) {
      setStep(prev => prev + 1);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = () => {
    setIsProcessing(true);
    // Simulate processing delay for the "Creating experience" animation
    setTimeout(() => {
        onComplete(answers as AuthorOnboardingData);
        setIsProcessing(false);
    }, 2000);
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
    } else {
        onClose();
    }
  };

  if (!isOpen) return null;

  const progress = ((step + 1) / questions.length) * 100;

  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-[#0f0f0f] z-[60] flex flex-col transition-colors duration-300">
      {isProcessing ? (
        <div className="flex flex-col items-center justify-center h-full w-full p-6 text-center animate-fade-in-up">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full"></div>
                <SparklesIcon className="h-24 w-24 text-indigo-600 dark:text-indigo-400 animate-pulse relative z-10" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t('creatingProfile')}</h2>
            <div className="w-64 h-2 bg-gray-200 dark:bg-gray-800 rounded-full mt-4 overflow-hidden">
                <div className="h-full bg-indigo-500 animate-progress-indeterminate"></div>
            </div>
        </div>
      ) : (
        <>
            {/* Header */}
            <div className="px-6 pt-8 pb-4 max-w-2xl mx-auto w-full">
                <div className="flex items-center justify-between mb-2">
                    <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
                        <ArrowLeftIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                    </button>
                    <div className="flex-1 flex justify-center">
                        <Logo />
                    </div>
                    <div className="w-8"></div> {/* Spacer for centering */}
                </div>
                <div className="mt-4 h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-brand-blue dark:bg-indigo-500 transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 pb-12 max-w-2xl mx-auto w-full overflow-y-auto">
                <div className="w-full animate-slide-up" key={step}>
                    <h2 className="text-2xl md:text-3xl font-bold text-center text-brand-blue dark:text-white mb-10 leading-tight">
                        {questions[step].title}
                    </h2>

                    <div className="space-y-4">
                        {questions[step].options.map((option) => {
                            const isSelected = answers[questions[step].key as keyof AuthorOnboardingData] === option.value;
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group text-left ${
                                        isSelected 
                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-md transform scale-[1.02]' 
                                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#212121] hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-3xl">{option.icon}</span>
                                        <span className={`font-semibold text-lg ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-200'}`}>
                                            {option.label}
                                        </span>
                                    </div>
                                    {isSelected && (
                                        <CheckCircleIcon className="h-6 w-6 text-indigo-500 flex-shrink-0" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-white dark:bg-[#212121] border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
                <div className="max-w-2xl mx-auto">
                    <button
                        onClick={handleContinue}
                        disabled={!answers[questions[step].key as keyof AuthorOnboardingData]}
                        className="w-full bg-brand-blue hover:bg-brand-blue/90 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-bold py-4 rounded-xl text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
                    >
                        {t('continue')}
                    </button>
                </div>
            </div>
        </>
      )}
      <style>{`
        @keyframes progress-indeterminate {
            0% { width: 0%; margin-left: 0%; }
            50% { width: 50%; margin-left: 25%; }
            100% { width: 100%; margin-left: 100%; }
        }
        .animate-progress-indeterminate {
            animation: progress-indeterminate 1.5s infinite linear;
        }
        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default AuthorOnboardingModal;
