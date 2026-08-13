export interface Language {
  id: number;
  code: string;
  name: string;
  nativeName: string;
  emoji: string;
  ttsCode: string;
  isRTL?: boolean;
}

export type GameMode = 'word' | 'sentence' | 'listening' | 'review' | 'typing' | 'speed';
export type ReviewSubMode = 'normal' | 'srs' | 'mistakes' | 'favorites';
export type AppTab = 'home' | 'quiz' | 'quests' | 'stats' | 'profile';

export interface WordItem {
  id: number;
  translations: Record<number, string>; // Language.id -> string
  phonetic?: string;
  partOfSpeech?: string;
  example?: string;
  difficulty: 'Easy' | 'Normal' | 'Hard';
  category: string;
  tags?: string[];
}

export interface Quest {
  id: string;
  title: string;
  desc?: string;
  target: number;
  current: number;
  rewardXP: number;
  completed: boolean;
  claimed: boolean;
  icon: string;
}

export interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  color: 'ember' | 'gold' | 'cyan' | 'purple' | 'green' | 'pink';
  xpReward: number;
  condition: string;
}

export interface RankLevel {
  level: number;
  title: string;
  xpRequired: number;
  icon: string;
  badge: string;
  color: string;
}

export interface SRSItem {
  interval: number; // in days
  repetitions: number;
  ef: number; // easiness factor (2.5 default)
  nextReview: number; // timestamp
}

export interface WeakWord {
  id: number;
  word: string;
  meaning: string;
  missedCount: number;
  lastMissed: number;
}

export interface DayUsage {
  day: string; // 'Mon', 'Tue', etc.
  date: string; // YYYY-MM-DD
  questions: number;
  accuracy: number;
  xp: number;
}

export interface UserState {
  user: {
    id: string | number;
    name: string;
    username?: string;
    avatar: string;
    bio?: string;
    hasProvidedName?: boolean;
  };
  score: number; // Total XP
  level: number;
  streak: number;
  bestStreak: number;
  lives: number;
  maxLives: number;
  lastLifeUpdate: number | null;
  sourceLang: number; // e.g. 1 = English
  targetLang: number; // e.g. 0 = Persian
  activeMode: GameMode;
  reviewMode: ReviewSubMode;
  selectedCategory: string;
  
  // Settings & Toggles
  isReverseMode: boolean;
  isListeningMode: boolean;
  typingMode: boolean;
  soundOn: boolean;
  ttsOn: boolean;
  hapticsOn: boolean;
  
  // Progression & Stats
  dailyQuests: {
    date: string;
    quests: Quest[];
  };
  achievements: Record<string, number>; // id -> timestamp
  srsData: Record<number, SRSItem>;
  mistakeBank: number[]; // word ids
  favorites: number[]; // word ids
  weakWords: WeakWord[];
  weeklyActivity: DayUsage[];
  totalQuestionsAnswered: number;
  totalCorrect: number;
  totalWrong: number;
  
  // Powerups & Social
  streakFreezes: number;
  hintTokens: number;
  referralCode: string;
  friendsInvited: number;
  lastLoginDate: string;
}

export interface QuizQuestion {
  wordItem: WordItem;
  questionText: string;
  displayQuestion: string;
  correctAnswer: string;
  options: {
    id: string; // 'A', 'B', 'C', 'D'
    text: string;
    isCorrect: boolean;
  }[];
  ttsText: string;
  ttsCode: string;
  difficulty: 'Easy' | 'Normal' | 'Hard';
  phonetic?: string;
  partOfSpeech?: string;
}
