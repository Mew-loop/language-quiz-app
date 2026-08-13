import { Achievement, UserState } from '../types';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'streak_master',
    name: 'Streak Master',
    desc: '7-day daily study streak',
    icon: '🔥',
    color: 'ember',
    xpReward: 300,
    condition: 'Maintain a 7-day login streak'
  },
  {
    id: 'speed_demon',
    name: 'Speed Demon',
    desc: 'Answer in under 2 seconds',
    icon: '⚡',
    color: 'gold',
    xpReward: 150,
    condition: 'Submit a correct answer in < 2.0s'
  },
  {
    id: 'perfectionist',
    name: 'Perfectionist',
    desc: '20 correct answers in a row',
    icon: '💎',
    color: 'cyan',
    xpReward: 500,
    condition: 'Reach a 20-answer combo streak'
  },
  {
    id: 'word_collector',
    name: 'Word Collector',
    desc: 'Master 100 total words',
    icon: '📚',
    color: 'purple',
    xpReward: 750,
    condition: 'Review & answer 100 question items'
  },
  {
    id: 'polyglot',
    name: 'Polyglot',
    desc: 'Practice across 3+ language pairs',
    icon: '🌎',
    color: 'green',
    xpReward: 250,
    condition: 'Switch language pairings 3 times'
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    desc: 'Study past midnight (00:00 - 05:00)',
    icon: '🦉',
    color: 'pink',
    xpReward: 100,
    condition: 'Complete a quiz session at night'
  },
  {
    id: 'first_blood',
    name: 'First Blood',
    desc: 'First correct answer in LangQuiz',
    icon: '🎯',
    color: 'ember',
    xpReward: 50,
    condition: 'Score your first correct question'
  },
  {
    id: 'quest_champion',
    name: 'Quest Champion',
    desc: 'Complete all daily quests in 1 day',
    icon: '👑',
    color: 'gold',
    xpReward: 400,
    condition: 'Claim 3 daily quests in a single day'
  }
];

export function getLiveAchievementStats(achId: string, state: UserState): {
  isUnlocked: boolean;
  current: number;
  target: number;
  progressPct: number;
  progressLabel: string;
} {
  const isUnlockedInState = Boolean(state.achievements[achId]);
  let current = 0;
  let target = 1;

  switch (achId) {
    case 'streak_master':
      current = Math.max(state.streak, state.bestStreak || 0);
      target = 7;
      break;
    case 'speed_demon':
      current = state.totalCorrect;
      target = 10;
      break;
    case 'perfectionist':
      current = Math.max(state.streak, state.bestStreak || 0);
      target = 20;
      break;
    case 'word_collector':
      current = state.totalQuestionsAnswered;
      target = 100;
      break;
    case 'polyglot':
      current = state.totalCorrect;
      target = 15;
      break;
    case 'night_owl':
      current = state.totalQuestionsAnswered;
      target = 10;
      break;
    case 'first_blood':
      current = state.totalCorrect;
      target = 1;
      break;
    case 'quest_champion':
      current = state.dailyQuests.quests.filter(q => q.claimed).length;
      target = 3;
      break;
    default:
      current = state.totalCorrect;
      target = 5;
  }

  const isUnlocked = isUnlockedInState || current >= target;
  const clampedCurrent = Math.min(target, current);
  const progressPct = Math.min(100, Math.round((clampedCurrent / target) * 100));

  return {
    isUnlocked,
    current: clampedCurrent,
    target,
    progressPct,
    progressLabel: isUnlocked ? 'Unlocked!' : `${clampedCurrent}/${target}`
  };
}
