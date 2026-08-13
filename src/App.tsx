import React, { useState, useEffect } from 'react';
import { UserState, AppTab, GameMode, WordItem } from './types';
import { loadUserState, saveUserState } from './utils/storage';
import { fetchSheetUser, updateSheetScore, fetchSheetWords } from './utils/api';
import { calculateLevelFromXP } from './data/ranks';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { QuizScreen } from './components/QuizScreen';
import { QuestsScreen } from './components/QuestsScreen';
import { StatsScreen } from './components/StatsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';
import { BotMenuDrawer } from './components/BotMenuDrawer';
import { SettingsModal } from './components/SettingsModal';
import { AchievementsModal } from './components/AchievementsModal';
import { SessionSummaryModal } from './components/SessionSummaryModal';
import { OutOfHeartsModal } from './components/OutOfHeartsModal';
import { NamePromptModal } from './components/NamePromptModal';
import { playLevelUpSound, playClickSound, triggerHaptic } from './utils/sound';
import confetti from 'canvas-confetti';

export default function App() {
  const [state, setState] = useState<UserState>(() => loadUserState());
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [inQuizMode, setInQuizMode] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [preloadedWords, setPreloadedWords] = useState<Record<string, WordItem[]>>({});

  // Modals & Drawers
  const [isLangModalOpen, setIsLangModalOpen] = useState(false);
  const [isBotMenuOpen, setIsBotMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
  const [sessionSummaryStats, setSessionSummaryStats] = useState<{ correct: number; wrong: number; totalXP: number } | null>(null);
  const [isOutOfHeartsOpen, setIsOutOfHeartsOpen] = useState(false);
  const [isNamePromptOpen, setIsNamePromptOpen] = useState(false);

  // Auto-save state changes
  useEffect(() => {
    saveUserState(state);
  }, [state]);

  // Pre-load words in background on boot with staggering to avoid hitting Google Apps Script concurrency limits
  useEffect(() => {
    let isCancelled = false;
    async function preloadAllWords() {
      for (const mode of ['word', 'sentence'] as const) {
        for (let level = 1; level <= 5; level++) {
          if (isCancelled) return;
          try {
            const rawRows = await fetchSheetWords(mode, level);
            if (isCancelled) return;
            if (rawRows.length > 0) {
              const parsedWords: WordItem[] = rawRows.map((r, i) => ({
                id: i + 1,
                translations: r.translations,
                difficulty: 'Normal' as const,
                category: 'general'
              }));
              setPreloadedWords(prev => ({
                ...prev,
                [`${mode}_${level}`]: parsedWords,
                [mode]: parsedWords
              }));
            }
          } catch (e) {
            console.warn(`Preload error for ${mode} level ${level}:`, e);
          }
          // Stagger requests by 300ms to avoid concurrent burst limits
          await new Promise(res => setTimeout(res, 300));
        }
      }
    }
    preloadAllWords();
    return () => { isCancelled = true; };
  }, []);

  // Telegram WebApp Setup & Live Google Sheet User Sync
  useEffect(() => {
    let currentUserId: number | string = 7260262549; // Default user ID from Google Sheets
    let currentName = state.user.name;
    let currentUsername = state.user.username?.replace(/^@/, '') || 'Learner';
    let hasCapturedTelegramName = false;

    const tg = (window as unknown as { Telegram?: { WebApp?: {
      ready: () => void;
      expand: () => void;
      setHeaderColor: (color: string) => void;
      setBackgroundColor: (color: string) => void;
      initDataUnsafe?: { user?: { first_name?: string; username?: string; last_name?: string; id?: number } };
    }} }).Telegram?.WebApp;

    if (tg) {
      tg.ready();
      tg.expand();
      try {
        tg.setHeaderColor('#0a0a14');
        tg.setBackgroundColor('#080811');
      } catch {}

      if (tg.initDataUnsafe?.user) {
        const u = tg.initDataUnsafe.user;
        currentUserId = u.id || currentUserId;
        const tgName = [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username;
        if (tgName) {
          currentName = tgName;
          currentUsername = u.username || tgName;
          hasCapturedTelegramName = true;
        }
      }
    }

    if (hasCapturedTelegramName) {
      // Auto-saved name from Telegram profile
      setState(prev => ({
        ...prev,
        user: {
          ...prev.user,
          id: currentUserId,
          name: currentName,
          username: `@${currentUsername}`,
          hasProvidedName: true
        }
      }));
    } else if (!state.user.hasProvidedName) {
      // No name in Telegram profile and not asked before -> ask on first open
      setIsNamePromptOpen(true);
    }

    // Sync live user score from Google Sheets Users tab
    async function syncGoogleSheetUser() {
      const sheetUser = await fetchSheetUser(currentUserId);
      if (sheetUser) {
        const lvlInfo = calculateLevelFromXP(sheetUser.xp);
        setState(prev => ({
          ...prev,
          user: {
            ...prev.user,
            id: sheetUser.userId || currentUserId,
            name: prev.user.hasProvidedName ? prev.user.name : (sheetUser.username || currentName),
            username: `@${sheetUser.username || currentUsername}`
          },
          score: sheetUser.xp,
          level: lvlInfo.level
        }));
      }
    }

    syncGoogleSheetUser();
  }, []);

  const handleSaveName = (providedName: string) => {
    setState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        name: providedName,
        hasProvidedName: true
      }
    }));
    setIsNamePromptOpen(false);
  };

  // Handlers for starting quizzes
  const handleStartQuiz = (mode: GameMode, category = 'all', level = selectedLevel) => {
    if (state.lives <= 0) {
      setIsOutOfHeartsOpen(true);
      return;
    }
    setSelectedLevel(level);
    setState(prev => ({ ...prev, activeMode: mode, selectedCategory: category }));
    setInQuizMode(true);
  };

  // Answer result progression handler (supports streak bonus XP delta)
  const handleAnswerResult = (isCorrect: boolean, answerTimeMs: number, wordId: number, xpDelta?: number) => {
    setState(prev => {
      const delta = typeof xpDelta === 'number' ? xpDelta : (isCorrect ? 10 : -50);
      const newScore = Math.max(0, prev.score + delta);
      const lvlInfo = calculateLevelFromXP(newScore);
      const newStreak = isCorrect ? prev.streak + 1 : 0;
      const newBestStreak = Math.max(prev.bestStreak, newStreak);
      const newLives = isCorrect ? prev.lives : Math.max(0, prev.lives - 1);
      const newTotalAns = prev.totalQuestionsAnswered + 1;
      const newTotalCorrect = isCorrect ? prev.totalCorrect + 1 : prev.totalCorrect;
      const newTotalWrong = !isCorrect ? prev.totalWrong + 1 : prev.totalWrong;

      // Asynchronously update Google Sheets live score!
      updateSheetScore(prev.user.id || 7260262549, newScore, prev.user.name, prev.totalWrong);

      // Update daily quests
      const updatedQuests = prev.dailyQuests.quests.map(q => {
        if (q.id === 'quest_1' && isCorrect) {
          const nextCount = q.current + 1;
          return { ...q, current: nextCount, completed: nextCount >= q.target };
        }
        if (q.id === 'quest_2' && newStreak >= q.target) {
          return { ...q, current: newStreak, completed: true };
        }
        return q;
      });

      return {
        ...prev,
        score: newScore,
        level: lvlInfo.level,
        streak: newStreak,
        bestStreak: newBestStreak,
        lives: newLives,
        totalQuestionsAnswered: newTotalAns,
        totalCorrect: newTotalCorrect,
        totalWrong: newTotalWrong,
        dailyQuests: {
          ...prev.dailyQuests,
          quests: updatedQuests
        }
      };
    });
  };

  const handleClaimQuest = (questId: string) => {
    setState(prev => {
      const quest = prev.dailyQuests.quests.find(q => q.id === questId);
      if (!quest || quest.claimed) return prev;

      const updatedQuests = prev.dailyQuests.quests.map(q =>
        q.id === questId ? { ...q, claimed: true } : q
      );

      return {
        ...prev,
        score: prev.score + quest.rewardXP,
        dailyQuests: {
          ...prev.dailyQuests,
          quests: updatedQuests
        }
      };
    });
  };

  const handleRefillLives = () => {
    setState(prev => ({
      ...prev,
      lives: prev.maxLives,
      lastLifeUpdate: null
    }));
    setIsOutOfHeartsOpen(false);
  };

  const handleResetProgress = () => {
    localStorage.removeItem('langquiz_pro_state_v2');
    window.location.reload();
  };

  const unclaimedQuestsCount = state.dailyQuests.quests.filter(q => q.completed && !q.claimed).length;

  return (
    <div className="min-h-screen bg-[#080811] text-[#f4f3f8] flex flex-col justify-between selection:bg-purple-500/30">
      {/* Top Header (Visible on home, quests, stats, profile tabs) */}
      {!inQuizMode && (
        <Header
          sourceLangId={state.sourceLang}
          targetLangId={state.targetLang}
          soundOn={state.soundOn}
          onToggleSound={() => setState(prev => ({ ...prev, soundOn: !prev.soundOn }))}
          onOpenDrawer={() => setIsBotMenuOpen(true)}
          onOpenNotifications={() => setActiveTab('quests')}
          onOpenLanguageModal={() => setIsLangModalOpen(true)}
        />
      )}

      {/* Main Container */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 pt-3">
        {inQuizMode ? (
          <QuizScreen
            state={state}
            selectedLevel={selectedLevel}
            preloadedWords={preloadedWords}
            onBack={() => setInQuizMode(false)}
            onAnswerResult={handleAnswerResult}
            onOutOfHearts={() => {
              setInQuizMode(false);
              setIsOutOfHeartsOpen(true);
            }}
            onCompleteSession={stats => {
              setInQuizMode(false);
              setSessionSummaryStats(stats);
            }}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeScreen
                state={state}
                onStartQuiz={handleStartQuiz}
                onOpenQuests={() => setActiveTab('quests')}
                onOpenStats={() => setActiveTab('stats')}
                onOpenProfile={() => setActiveTab('profile')}
                onOpenLanguageModal={() => setIsLangModalOpen(true)}
              />
            )}

            {activeTab === 'quests' && (
              <QuestsScreen
                state={state}
                onClaimQuest={handleClaimQuest}
                onStartQuestQuiz={() => handleStartQuiz('word')}
              />
            )}

            {activeTab === 'stats' && (
              <StatsScreen
                state={state}
                onReviewWeakWords={() => handleStartQuiz('review')}
                onOpenAchievementsModal={() => setIsAchievementsOpen(true)}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileScreen
                state={state}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onEditProfile={() => setIsSettingsOpen(true)}
                onShareReferral={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'LangQuiz Pro',
                      text: `Learn languages with me on Telegram! Use code ${state.referralCode}`,
                      url: `https://t.me/LangQuizProBot?start=${state.referralCode}`
                    }).catch(() => {});
                  } else {
                    navigator.clipboard?.writeText(`https://t.me/LangQuizProBot?start=${state.referralCode}`);
                    alert('Referral link copied to clipboard!');
                  }
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation (Hidden while in active quiz session) */}
      {!inQuizMode && (
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          questsBadgeCount={unclaimedQuestsCount}
        />
      )}

      {/* Modals & Drawers */}
      {isLangModalOpen && (
        <LanguageSelectorModal
          sourceLangId={state.sourceLang}
          targetLangId={state.targetLang}
          onSelectLanguages={(src, tgt) => {
            setState(prev => ({ ...prev, sourceLang: src, targetLang: tgt }));
          }}
          onClose={() => setIsLangModalOpen(false)}
        />
      )}

      {isBotMenuOpen && (
        <BotMenuDrawer
          isOpen={isBotMenuOpen}
          onClose={() => setIsBotMenuOpen(false)}
          onNavigateTab={tab => {
            setInQuizMode(false);
            setActiveTab(tab);
          }}
          onStartMode={mode => {
            setInQuizMode(false);
            handleStartQuiz(mode);
          }}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenLanguages={() => setIsLangModalOpen(true)}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          state={state}
          onUpdateState={setState}
          onClose={() => setIsSettingsOpen(false)}
          onResetProgress={handleResetProgress}
        />
      )}

      {isAchievementsOpen && (
        <AchievementsModal
          state={state}
          onClose={() => setIsAchievementsOpen(false)}
        />
      )}

      {sessionSummaryStats && (
        <SessionSummaryModal
          stats={sessionSummaryStats}
          onPlayAgain={() => {
            setSessionSummaryStats(null);
            setInQuizMode(true);
          }}
          onGoHome={() => {
            setSessionSummaryStats(null);
            setActiveTab('home');
          }}
        />
      )}

      {isOutOfHeartsOpen && (
        <OutOfHeartsModal
          onGoHome={() => {
            setIsOutOfHeartsOpen(false);
            setActiveTab('home');
          }}
          onRefill={handleRefillLives}
        />
      )}

      {isNamePromptOpen && (
        <NamePromptModal
          onSaveName={handleSaveName}
        />
      )}
    </div>
  );
}
