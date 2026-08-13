import { UserState } from '../types';

const STORAGE_KEY = 'langquiz_pro_state_v2';
const HEART_REGEN_TIME_MS = 30 * 60 * 1000; // 30 mins per heart

export const DEFAULT_USER_STATE: UserState = {
  user: {
    id: 'user_tg_9921',
    name: 'Learner',
    username: '@lang_champion',
    avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=160&auto=format&fit=crop&q=80',
    bio: 'Language enthusiast on a quest to master 5 languages! 🚀'
  },
  score: 12580,
  level: 21,
  streak: 37,
  bestStreak: 48,
  lives: 4,
  maxLives: 5,
  lastLifeUpdate: Date.now() - 12 * 60 * 1000,
  sourceLang: 1, // English
  targetLang: 0, // Persian
  activeMode: 'word',
  reviewMode: 'normal',
  selectedCategory: 'all',

  isReverseMode: false,
  isListeningMode: false,
  typingMode: false,
  soundOn: true,
  ttsOn: true,
  hapticsOn: true,

  dailyQuests: {
    date: new Date().toISOString().split('T')[0],
    quests: [
      {
        id: 'quest_1',
        title: 'Answer 20 questions correctly',
        desc: 'Test your vocabulary precision',
        target: 20,
        current: 14,
        rewardXP: 100,
        completed: false,
        claimed: false,
        icon: '📦'
      },
      {
        id: 'quest_2',
        title: 'Score a 10-streak combo',
        desc: 'Chain consecutive correct answers',
        target: 10,
        current: 10,
        rewardXP: 150,
        completed: true,
        claimed: false,
        icon: '🔥'
      },
      {
        id: 'quest_3',
        title: 'Review 5 weak SRS words',
        desc: 'Reinforce memory retention',
        target: 5,
        current: 3,
        rewardXP: 200,
        completed: false,
        claimed: false,
        icon: '⭐'
      }
    ]
  },

  achievements: {
    'streak_master': Date.now() - 86400000 * 2,
    'speed_demon': Date.now() - 86400000 * 5,
    'perfectionist': Date.now() - 86400000 * 10,
    'word_collector': Date.now() - 86400000 * 1
  },

  srsData: {
    1: { interval: 3, repetitions: 2, ef: 2.5, nextReview: Date.now() + 86400000 },
    3: { interval: 1, repetitions: 1, ef: 2.3, nextReview: Date.now() - 3600000 },
    4: { interval: 1, repetitions: 1, ef: 2.4, nextReview: Date.now() - 7200000 },
    5: { interval: 2, repetitions: 2, ef: 2.5, nextReview: Date.now() - 100000 }
  },

  mistakeBank: [3, 4, 5, 6],
  favorites: [1, 5, 8],
  
  weakWords: [
    { id: 6, word: 'abandon', meaning: 'ترک کردن / رها کردن', missedCount: 3, lastMissed: Date.now() - 3600000 },
    { id: 4, word: 'benevolent', meaning: 'خیرخواه / مهربان', missedCount: 2, lastMissed: Date.now() - 7200000 },
    { id: 5, word: 'serendipity', meaning: 'خوش‌اقبالی غیرمنتظره', missedCount: 4, lastMissed: Date.now() - 10800000 },
    { id: 3, word: 'diligent', meaning: 'کوشا / سخت‌کوش', missedCount: 2, lastMissed: Date.now() - 14400000 }
  ],

  weeklyActivity: [
    { day: 'Mon', date: '2026-08-06', questions: 20, accuracy: 82, xp: 210 },
    { day: 'Tue', date: '2026-08-07', questions: 24, accuracy: 78, xp: 260 },
    { day: 'Wed', date: '2026-08-08', questions: 16, accuracy: 85, xp: 180 },
    { day: 'Thu', date: '2026-08-09', questions: 30, accuracy: 88, xp: 340 },
    { day: 'Fri', date: '2026-08-10', questions: 38, accuracy: 84, xp: 420 },
    { day: 'Sat', date: '2026-08-11', questions: 22, accuracy: 80, xp: 250 },
    { day: 'Sun', date: '2026-08-12', questions: 45, accuracy: 95, xp: 580 } // Peak Day 95%
  ],

  totalQuestionsAnswered: 126,
  totalCorrect: 107,
  totalWrong: 19,

  streakFreezes: 2,
  hintTokens: 5,
  referralCode: 'LANG-PRO-9921',
  friendsInvited: 3,
  lastLoginDate: new Date().toISOString().split('T')[0]
};

export function loadUserState(): UserState {
  if (typeof window === 'undefined') return DEFAULT_USER_STATE;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_USER_STATE;
    const parsed = JSON.parse(saved);
    
    // Check heart regen on load
    const state = { 
      ...DEFAULT_USER_STATE, 
      ...parsed,
      user: {
        ...DEFAULT_USER_STATE.user,
        ...(parsed.user || {})
      }
    };
    if (state.lives < state.maxLives && state.lastLifeUpdate) {
      const elapsed = Date.now() - state.lastLifeUpdate;
      const regained = Math.floor(elapsed / HEART_REGEN_TIME_MS);
      if (regained > 0) {
        state.lives = Math.min(state.maxLives, state.lives + regained);
        state.lastLifeUpdate = state.lives >= state.maxLives ? null : state.lastLifeUpdate + (regained * HEART_REGEN_TIME_MS);
      }
    }
    return state;
  } catch {
    return DEFAULT_USER_STATE;
  }
}

export function saveUserState(state: UserState) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}
