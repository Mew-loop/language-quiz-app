import { RankLevel } from '../types';

export const RANK_LEVELS: RankLevel[] = [
  { level: 1, title: 'Novice', xpRequired: 0, icon: '🌱', badge: 'Tier 1', color: 'from-emerald-500 to-teal-400' },
  { level: 5, title: 'Scout', xpRequired: 300, icon: '🧭', badge: 'Tier 2', color: 'from-cyan-500 to-blue-400' },
  { level: 10, title: 'Pathfinder', xpRequired: 800, icon: '⚡', badge: 'Tier 3', color: 'from-blue-500 to-indigo-400' },
  { level: 15, title: 'Vanguard', xpRequired: 1500, icon: '🛡️', badge: 'Tier 4', color: 'from-indigo-500 to-purple-400' },
  { level: 20, title: 'Apprentice', xpRequired: 2200, icon: '🔮', badge: 'Tier 5', color: 'from-purple-500 to-fuchsia-400' },
  { level: 21, title: 'Warrior', xpRequired: 2580, icon: '⚔️', badge: 'Tier 6', color: 'from-fuchsia-500 to-pink-500' },
  { level: 22, title: 'Guardian', xpRequired: 3500, icon: '👑', badge: 'Tier 7', color: 'from-pink-500 to-rose-500' },
  { level: 23, title: 'Champion', xpRequired: 5000, icon: '🏆', badge: 'Tier 8', color: 'from-amber-500 to-orange-500' },
  { level: 24, title: 'Legend', xpRequired: 7000, icon: '🌟', badge: 'Tier 9', color: 'from-yellow-400 to-amber-500' },
  { level: 25, title: 'Grandmaster', xpRequired: 10000, icon: '💎', badge: 'Tier 10', color: 'from-cyan-400 to-fuchsia-500' },
  { level: 30, title: 'Immortal Polyglot', xpRequired: 20000, icon: '🌌', badge: 'Elite', color: 'from-purple-400 via-pink-500 to-amber-400' }
];

export function getRankForLevel(level: number): RankLevel {
  const match = RANK_LEVELS.slice().reverse().find(r => level >= r.level);
  return match || RANK_LEVELS[0];
}

export function getNextRank(level: number): RankLevel | null {
  const next = RANK_LEVELS.find(r => r.level > level);
  return next || null;
}

export function calculateLevelFromXP(xp: number): { level: number; rankTitle: string; currentLevelXP: number; nextLevelXP: number; progress: number } {
  const safeXP = Math.max(0, xp);

  // Find corresponding rank bracket
  for (let i = RANK_LEVELS.length - 1; i >= 0; i--) {
    const current = RANK_LEVELS[i];
    if (safeXP >= current.xpRequired) {
      const next = RANK_LEVELS[i + 1];
      if (!next) {
        // Max rank achieved
        return {
          level: current.level,
          rankTitle: current.title,
          currentLevelXP: safeXP,
          nextLevelXP: current.xpRequired * 1.5,
          progress: 100
        };
      }

      const span = next.xpRequired - current.xpRequired;
      const prog = Math.min(100, Math.max(0, ((safeXP - current.xpRequired) / span) * 100));
      return {
        level: current.level,
        rankTitle: current.title,
        currentLevelXP: safeXP,
        nextLevelXP: next.xpRequired,
        progress: Math.round(prog)
      };
    }
  }

  // Fallback for 0-299 XP
  const nextXP = 300;
  const prog = Math.min(100, Math.max(0, (safeXP / nextXP) * 100));
  return {
    level: Math.max(1, Math.floor(safeXP / 60) + 1),
    rankTitle: 'Novice',
    currentLevelXP: safeXP,
    nextLevelXP: nextXP,
    progress: Math.round(prog)
  };
}
