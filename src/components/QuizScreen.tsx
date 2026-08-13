import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Heart, Volume2, Lightbulb, Check, X, Sparkles, RefreshCw, AlertCircle, Award, Layers } from 'lucide-react';
import { UserState, GameMode, WordItem, QuizQuestion } from '../types';
import { VOCABULARY_WORDS, VOCABULARY_SENTENCES } from '../data/vocabulary';
import { LANGUAGES } from '../data/languages';
import { fetchSheetWords } from '../utils/api';
import { playClickSound, playCorrectSound, playWrongSound, triggerHaptic, playTTSAudio } from '../utils/sound';
import confetti from 'canvas-confetti';

interface QuizScreenProps {
  state: UserState;
  selectedLevel?: number;
  preloadedWords?: Record<string, WordItem[]>;
  onBack: () => void;
  onAnswerResult: (isCorrect: boolean, answerTimeMs: number, wordId: number, xpDelta?: number) => void;
  onOutOfHearts: () => void;
  onCompleteSession: (stats: { correct: number; wrong: number; totalXP: number }) => void;
}

// Fisher-Yates array shuffle helper
const shuffleArray = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export const QuizScreen: React.FC<QuizScreenProps> = ({
  state,
  selectedLevel = 1,
  preloadedWords = {},
  onBack,
  onAnswerResult,
  onOutOfHearts,
  onCompleteSession
}) => {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [sheetWords, setSheetWords] = useState<WordItem[]>([]);
  const [isLoadingWords, setIsLoadingWords] = useState(true);

  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isSpeakerPlaying, setIsSpeakerPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);
  
  // Quiz Streak Tracking (4 streak -> 20% bonus, 20 streak -> 100% bonus max)
  const [quizStreak, setQuizStreak] = useState(0);

  // Session tracking
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionWrong, setSessionWrong] = useState(0);
  const [sessionXP, setSessionXP] = useState(0);

  const startTimeRef = useRef<number>(Date.now());

  // Map language ID to sheet column index (0: fa, 1: en, 2: ja, 3: zh, 4: de, 5: hi, 6: es, 7: ar, 8: ru)
  const langColMap: Record<string, number> = {
    fa: 0,
    en: 1,
    ja: 2,
    zh: 3,
    de: 4,
    hi: 5,
    es: 6,
    ar: 7,
    ru: 8
  };

  // Fetch live words from Google Sheets on mount (using preloaded words if available for instant load)
  useEffect(() => {
    let isMounted = true;

    async function loadLiveWords() {
      setIsLoadingWords(true);
      const modeParam = state.activeMode === 'sentence' ? 'sentence' : 'word';
      const cacheKey = `${modeParam}_${selectedLevel}`;
      
      // Check if preloaded in background on app startup
      const cached = preloadedWords[cacheKey] || preloadedWords[modeParam];
      if (cached && cached.length > 0) {
        const shuffled = shuffleArray(cached);
        setSheetWords(shuffled);
        setTotalQuestions(Math.min(20, shuffled.length));
        setIsLoadingWords(false);
        return;
      }

      const rawRows = await fetchSheetWords(modeParam, selectedLevel);
      if (!isMounted) return;

      if (rawRows.length > 0) {
        const parsedWords: WordItem[] = rawRows.map((r, i) => ({
          id: i + 1,
          translations: r.translations,
          difficulty: 'Normal' as const,
          category: 'general'
        }));

        const shuffled = shuffleArray(parsedWords);
        setSheetWords(shuffled);
        setTotalQuestions(Math.min(20, shuffled.length));
      } else {
        // Fallback to local dataset if offline
        const fallback = state.activeMode === 'sentence' ? VOCABULARY_SENTENCES : VOCABULARY_WORDS;
        const shuffled = shuffleArray(fallback);
        setSheetWords(shuffled);
        setTotalQuestions(Math.min(20, shuffled.length));
      }
      setIsLoadingWords(false);
    }

    loadLiveWords();
    return () => { isMounted = false; };
  }, [state.activeMode, selectedLevel, state.sourceLang, state.targetLang]);

  // Generate question from dynamic sheet dataset
  const generateQuestion = (idx: number, dataset: WordItem[]): QuizQuestion => {
    const wordItem = dataset[idx % dataset.length];

    const srcCol = langColMap[state.sourceLang] ?? 1;
    const tgtCol = langColMap[state.targetLang] ?? 0;

    const questionWord = (wordItem.translations[srcCol] || wordItem.translations[1] || 'Magnificent').replace(/\*/g, '');
    const correctMeaning = (wordItem.translations[tgtCol] || wordItem.translations[0] || 'باشکوه').replace(/\*/g, '');

    // Gather 3 wrong options from dataset
    const otherWords = dataset.filter(w => w.id !== wordItem.id);
    const shuffledOthers = shuffleArray(otherWords);
    const wrongDistractors = shuffledOthers.slice(0, 3).map(w => (w.translations[tgtCol] || w.translations[0] || '').replace(/\*/g, ''));

    const fallbackDistractors = ["کوچک", "زیبا", "سریع", "دقیق", "آرام"];
    while (wrongDistractors.length < 3) {
      const fb = fallbackDistractors.find(d => d !== correctMeaning && !wrongDistractors.includes(d));
      if (fb) wrongDistractors.push(fb);
      else wrongDistractors.push(`گزینه ${wrongDistractors.length + 1}`);
    }

    const allChoices = shuffleArray([
      { text: correctMeaning, isCorrect: true },
      ...wrongDistractors.slice(0, 3).map(t => ({ text: t, isCorrect: false }))
    ]);

    const optionLetters = ['A', 'B', 'C', 'D'];
    const options = allChoices.map((c, i) => ({
      id: optionLetters[i],
      text: c.text,
      isCorrect: c.isCorrect
    }));

    return {
      wordItem,
      questionText: questionWord,
      displayQuestion: state.isListeningMode ? '🔊 (Listen closely)' : questionWord,
      correctAnswer: correctMeaning,
      options,
      ttsText: questionWord,
      ttsCode: LANGUAGES.find(l => l.id === state.sourceLang)?.ttsCode || 'en',
      difficulty: 'Normal',
      phonetic: wordItem.phonetic && !wordItem.phonetic.includes('live_sheet') ? wordItem.phonetic : undefined,
      partOfSpeech: wordItem.partOfSpeech && wordItem.partOfSpeech !== 'vocab' ? wordItem.partOfSpeech : undefined
    };
  };

  // Load question when question index or words change
  useEffect(() => {
    if (isLoadingWords || sheetWords.length === 0) return;

    if (state.lives <= 0) {
      onOutOfHearts();
      return;
    }

    const q = generateQuestion(questionIndex, sheetWords);
    setCurrentQuestion(q);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setEliminatedOptions([]);
    setTimeLeft(15);
    startTimeRef.current = Date.now();

    if (state.ttsOn) {
      const timer = setTimeout(() => {
        playTTSAudio(
          q.ttsText,
          q.ttsCode,
          () => setIsSpeakerPlaying(true),
          () => setIsSpeakerPlaying(false)
        );
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [questionIndex, isLoadingWords, sheetWords]);

  // Handle Timeout
  const handleTimeOut = () => {
    if (isAnswered || !currentQuestion) return;
    setIsAnswered(true);
    setQuizStreak(0); // Reset streak on timeout!
    playWrongSound();
    triggerHaptic('error');
    setSessionWrong(w => w + 1);
    setSessionXP(xp => Math.max(0, xp - 50));
    onAnswerResult(false, 15000, currentQuestion.wordItem.id, -50);
    proceedNext();
  };

  // Countdown timer loop - fixes timer advancing on expiration
  useEffect(() => {
    if (isAnswered || isLoadingWords || !currentQuestion) return;

    if (timeLeft <= 0) {
      handleTimeOut();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, isAnswered, isLoadingWords, currentQuestion, questionIndex]);

  // Handle option selection (+10 XP base, +20% bonus at 4 streak, +100% bonus max at 20 streak, -50 XP on wrong)
  const handleSelectOption = (optionId: string) => {
    if (isAnswered || !currentQuestion) return;
    if (eliminatedOptions.includes(optionId)) return;

    setIsAnswered(true);
    setSelectedOptionId(optionId);

    const chosen = currentQuestion.options.find(o => o.id === optionId);
    const isCorrect = Boolean(chosen?.isCorrect);
    const answerTime = Date.now() - startTimeRef.current;

    let xpGained = -50;

    if (isCorrect) {
      const newStreak = quizStreak + 1;
      setQuizStreak(newStreak);

      // Streak Bonus Logic:
      // < 4 streak -> 0% bonus (10 XP)
      // 4..19 streak -> 20% to <100% bonus (12 XP to 19 XP)
      // >= 20 streak -> 100% bonus MAX (20 XP)
      let bonusPct = 0;
      if (newStreak >= 20) {
        bonusPct = 1.0;
      } else if (newStreak >= 4) {
        bonusPct = 0.20 + ((newStreak - 4) / 16) * 0.80;
      }

      xpGained = Math.round(10 * (1 + bonusPct));

      playCorrectSound();
      triggerHaptic('success');
      setSessionCorrect(c => c + 1);
      setSessionXP(xp => xp + xpGained);
      
      if (newStreak % 5 === 0) {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#8b7fff', '#ff3d77', '#2fe6a0', '#ffc13d']
        });
      }
    } else {
      setQuizStreak(0); // Reset streak on incorrect answer!
      playWrongSound();
      triggerHaptic('error');
      setSessionWrong(w => w + 1);
      setSessionXP(xp => Math.max(0, xp - 50));
    }

    onAnswerResult(isCorrect, answerTime, currentQuestion.wordItem.id, xpGained);
    proceedNext();
  };

  const proceedNext = () => {
    setTimeout(() => {
      setQuestionIndex(prevIdx => {
        if (prevIdx + 1 >= totalQuestions) {
          onCompleteSession({
            correct: sessionCorrect + 1,
            wrong: sessionWrong,
            totalXP: sessionXP
          });
          return prevIdx;
        }
        return prevIdx + 1;
      });
    }, 1400);
  };

  const handleSpeakerClick = () => {
    if (!currentQuestion) return;
    playClickSound();
    playTTSAudio(
      currentQuestion.ttsText,
      currentQuestion.ttsCode,
      () => setIsSpeakerPlaying(true),
      () => setIsSpeakerPlaying(false)
    );
  };

  const handleUseHint = () => {
    if (!currentQuestion || isAnswered || state.hintTokens <= 0) return;
    playClickSound();
    triggerHaptic('medium');

    // Eliminate 1 wrong option that hasn't been eliminated
    const wrongOptions = currentQuestion.options.filter(o => !o.isCorrect && !eliminatedOptions.includes(o.id));
    if (wrongOptions.length > 0) {
      const toEliminate = wrongOptions[0].id;
      setEliminatedOptions(prev => [...prev, toEliminate]);
    }
  };

  if (!currentQuestion) {
    return <div className="p-8 text-center text-slate-400">Loading question...</div>;
  }

  const progressPercent = ((questionIndex + 1) / totalQuestions) * 100;

  return (
    <div className="flex flex-col h-[calc(100vh-1rem)] max-w-md mx-auto justify-between pb-6 select-none animate-fadeIn">
      {/* 1. Top Navigation Bar & Progress Indicator */}
      <div>
        <div className="flex items-center justify-between px-2 py-3">
          {/* Back button */}
          <button
            onClick={() => {
              playClickSound();
              onBack();
            }}
            className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white active:scale-95 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Question Counter (e.g., "7 / 20") */}
          <div className="text-sm font-bold text-slate-300 font-['Space_Grotesk'] tracking-wider">
            {questionIndex + 1} / {totalQuestions}
          </div>

          {/* Lives Counter (e.g., "❤️ 4") */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold text-xs">
            <Heart className="w-4 h-4 fill-rose-500" />
            <span>{state.lives}</span>
          </div>
        </div>

        {/* Glowing Progress Bar */}
        <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden px-0.5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400 shadow-[0_0_12px_rgba(216,180,254,0.8)] transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 2. Main Question Card with Glowing Radar Speaker */}
      <div className="relative my-auto flex flex-col items-center justify-center p-6 rounded-3xl bg-gradient-to-b from-[#131327]/90 via-[#0e0e1e]/95 to-[#0b0b18] border border-white/[0.08] shadow-2xl shadow-purple-950/30 text-center overflow-hidden">
        {/* In-Quiz Streak Bonus Pill (Top Left) */}
        {quizStreak >= 4 && (
          <div className="absolute top-4 left-4 animate-pulse">
            <span className={`px-2.5 py-1 rounded-xl text-[11px] font-extrabold tracking-wider flex items-center gap-1 border ${
              quizStreak >= 20
                ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 shadow-[0_0_12px_rgba(251,191,36,0.5)]'
                : 'bg-purple-500/20 text-purple-300 border-purple-400/40 shadow-[0_0_10px_rgba(168,85,247,0.4)]'
            }`}>
              <span>{quizStreak >= 20 ? '⚡' : '🔥'}</span>
              <span>{quizStreak} STREAK (+{quizStreak >= 20 ? 100 : Math.round((0.20 + ((quizStreak - 4) / 16) * 0.80) * 100)}% XP)</span>
            </span>
          </div>
        )}

        {/* Ambient Neon Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />

        {/* Glowing Radar Speaker Button */}
        <div className="relative my-4">
          {/* Animated radar ripple rings */}
          <div className={`absolute inset-0 rounded-full border-2 border-purple-500/40 ${isSpeakerPlaying ? 'animate-radar' : ''}`} />
          <div className={`absolute -inset-3 rounded-full border border-cyan-400/30 ${isSpeakerPlaying ? 'animate-radar delay-150' : ''}`} />

          <button
            id="btn-quiz-speaker"
            onClick={handleSpeakerClick}
            className={`relative w-24 h-24 rounded-full bg-gradient-to-br from-[#1e1744] via-[#151033] to-[#0d0a22] border-2 border-purple-400/50 flex items-center justify-center text-white shadow-[0_0_30px_rgba(139,127,255,0.4)] hover:scale-105 active:scale-95 transition-all group ${
              isSpeakerPlaying ? 'border-cyan-400 shadow-[0_0_35px_rgba(34,211,238,0.6)]' : ''
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Volume2 className={`w-8 h-8 text-purple-300 group-hover:text-cyan-300 transition-colors ${
                isSpeakerPlaying ? 'animate-bounce text-cyan-300' : ''
              }`} />
            </div>
          </button>
        </div>

        {/* Question Word */}
        <h2 className="text-3xl font-extrabold text-white tracking-tight font-['Space_Grotesk'] mt-2">
          {currentQuestion.displayQuestion}
        </h2>

        {/* Optional Phonetic & Subtitle */}
        {Boolean(currentQuestion.phonetic || currentQuestion.partOfSpeech) && (
          <div className="flex items-center gap-2 mt-1">
            {currentQuestion.phonetic && (
              <span className="text-xs font-mono text-purple-300/70">
                {currentQuestion.phonetic}
              </span>
            )}
            {currentQuestion.partOfSpeech && (
              <span className="text-[10px] uppercase font-bold text-slate-500 bg-white/[0.04] px-1.5 py-0.5 rounded">
                {currentQuestion.partOfSpeech}
              </span>
            )}
          </div>
        )}

        <p className="text-xs text-purple-300/80 font-medium mt-3">
          Choose the correct meaning
        </p>
      </div>

      {/* 3. 2x2 Custom Inline Keyboard Option Tiles */}
      <div className="grid grid-cols-2 gap-3">
        {currentQuestion.options.map(option => {
          const isSelected = selectedOptionId === option.id;
          const isCorrect = option.isCorrect;
          const isEliminated = eliminatedOptions.includes(option.id);

          // State styling
          let styleClasses = "bg-[#111122] border-white/[0.08] text-slate-200 hover:border-purple-400/40 hover:bg-[#15152a]";
          
          if (isEliminated) {
            styleClasses = "opacity-25 bg-slate-900 border-transparent text-slate-600 pointer-events-none";
          } else if (isAnswered) {
            if (isCorrect) {
              styleClasses = "bg-emerald-950/50 border-emerald-400 text-emerald-200 shadow-[0_0_25px_rgba(47,230,160,0.35)] ring-1 ring-emerald-400 scale-[1.02]";
            } else if (isSelected && !isCorrect) {
              styleClasses = "bg-rose-950/50 border-rose-500 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-shake";
            } else {
              styleClasses = "opacity-40 bg-[#0d0d1a] border-white/[0.04] text-slate-500";
            }
          }

          return (
            <button
              key={option.id}
              id={`quiz-option-${option.id}`}
              disabled={isAnswered || isEliminated}
              onClick={() => handleSelectOption(option.id)}
              className={`relative overflow-hidden text-left p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between min-h-[92px] active:scale-[0.98] ${styleClasses}`}
            >
              {/* Option Letter Indicator ('A', 'B', 'C', 'D') */}
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-extrabold text-slate-400 font-['Space_Grotesk']">
                  {option.id}
                </span>
                {isAnswered && isCorrect && (
                  <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-md">
                    <Check className="w-3 h-3 text-slate-950 stroke-[3]" />
                  </div>
                )}
                {isAnswered && isSelected && !isCorrect && (
                  <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center shadow-md">
                    <X className="w-3 h-3 text-white stroke-[3]" />
                  </div>
                )}
              </div>

              {/* Translation Text (centered in Persian/Target language) */}
              <div className="w-full text-center my-auto">
                <span className="text-lg font-bold tracking-normal leading-tight font-sans">
                  {option.text}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 4. Bottom Quiz Action Bar (Hint, Circular Countdown, Streak/Counter) */}
      <div className="flex items-center justify-between px-2 pt-4">
        {/* Left: Hint Button */}
        <button
          id="btn-quiz-hint"
          onClick={handleUseHint}
          disabled={isAnswered || state.hintTokens <= 0 || eliminatedOptions.length >= 2}
          className="relative w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-amber-400 hover:bg-amber-400/10 active:scale-95 disabled:opacity-30 transition-all"
          title="Use Hint (Eliminate 1 wrong option)"
        >
          <Lightbulb className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-[9px] font-black text-slate-950 flex items-center justify-center">
            {state.hintTokens}
          </span>
        </button>

        {/* Center: Circular Countdown Timer with Glowing Ring */}
        <div className="relative flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-[#111124] border border-purple-500/30 flex items-center justify-center shadow-[0_0_18px_rgba(139,127,255,0.3)]">
            {/* SVG circle stroke animation */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="24"
                className="stroke-white/[0.08]"
                strokeWidth="3"
                fill="transparent"
              />
              <circle
                cx="28"
                cy="28"
                r="24"
                className="stroke-purple-400 transition-all duration-1000"
                strokeWidth="3"
                strokeDasharray="150"
                strokeDashoffset={150 - (150 * (timeLeft / 15))}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className={`text-base font-extrabold font-['Space_Grotesk'] ${
              timeLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-white'
            }`}>
              {timeLeft}
            </span>
          </div>
        </div>

        {/* Right: Quiz Session Streak Counter */}
        <div className="px-3.5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs font-bold text-slate-300 font-['Space_Grotesk'] flex items-center gap-1.5">
          <span className="text-amber-400 font-black flex items-center gap-1">
            🔥 {quizStreak}
          </span>
          <span className="text-slate-400">Streak</span>
        </div>
      </div>
    </div>
  );
};
