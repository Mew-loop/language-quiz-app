import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Flame, Zap, Award, BookOpen, Sparkles, TrendingUp, CheckCircle, RefreshCw, Trophy, Users } from 'lucide-react';
import { UserState } from '../types';
import { ACHIEVEMENTS, getLiveAchievementStats } from '../data/achievements';
import { fetchSheetLeaderboard, SheetUser } from '../utils/api';
import { playClickSound, triggerHaptic } from '../utils/sound';

interface StatsScreenProps {
  state: UserState;
  onReviewWeakWords: () => void;
  onOpenAchievementsModal: () => void;
}

export const StatsScreen: React.FC<StatsScreenProps> = ({
  state,
  onReviewWeakWords,
  onOpenAchievementsModal
}) => {
  const [timeFilter, setTimeFilter] = useState<'This Week' | 'This Month' | 'All Time'>('This Week');
  const [selectedWeakWord, setSelectedWeakWord] = useState<typeof state.weakWords[0] | null>(null);

  // Live Leaderboard state from Google Sheets
  const [leaderboard, setLeaderboard] = useState<SheetUser[]>([]);
  const [isLeaderboardLoading, setIsLeaderboardLoading] = useState(false);

  const loadLeaderboard = async () => {
    setIsLeaderboardLoading(true);
    const data = await fetchSheetLeaderboard();
    setLeaderboard(data);
    setIsLeaderboardLoading(false);
  };

  useEffect(() => {
    loadLeaderboard();
  }, [state.score]);

  // Stats calculation
  const total = state.totalQuestionsAnswered || 1;
  const correct = state.totalCorrect || 0;
  const accuracy = Math.min(100, Math.round((correct / total) * 100));

  // SVG Chart points for Mon - Sun (Weekly usage)
  const chartPoints = [
    { day: 'Mon', val: 70, y: 72 },
    { day: 'Tue', val: 78, y: 64 },
    { day: 'Wed', val: 74, y: 68 },
    { day: 'Thu', val: 86, y: 50 },
    { day: 'Fri', val: 82, y: 56 },
    { day: 'Sat', val: 88, y: 44 },
    { day: 'Sun', val: 95, y: 28, isPeak: true } // Peak Sunday 95%
  ];

  // SVG Path generation
  const svgWidth = 240;
  const svgHeight = 90;
  const stepX = svgWidth / (chartPoints.length - 1);
  const pathD = chartPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${i * stepX} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`;

  return (
    <div className="flex flex-col gap-4 pb-28 animate-fadeIn">
      {/* 1. Header with Time Filter Dropdown */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-2xl font-extrabold text-white tracking-tight font-['Space_Grotesk']">
          Your Progress
        </h2>

        {/* Time Filter Pill */}
        <div className="relative">
          <button
            onClick={() => {
              playClickSound();
              setTimeFilter(f => f === 'This Week' ? 'This Month' : f === 'This Month' ? 'All Time' : 'This Week');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-xs font-bold text-slate-200 hover:bg-white/[0.08] active:scale-95 transition-all"
          >
            <span>{timeFilter}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* 2. Main Progress Card (Radial Accuracy + Weekly Trend Chart + 4 Stats Grid) */}
      <div className="rounded-3xl p-5 bg-gradient-to-b from-[#141428] via-[#0f0f20] to-[#0b0b18] border border-white/[0.08] shadow-xl">
        {/* Upper Row: Radial Gauge & Smooth Spline Chart */}
        <div className="flex items-center justify-between gap-2 pb-5 border-b border-white/[0.06]">
          {/* Circular Radial Accuracy Progress Gauge */}
          <div className="relative flex flex-col items-center justify-center shrink-0 w-24 h-24">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="38"
                className="stroke-white/[0.08]"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="48"
                cy="48"
                r="38"
                className="stroke-purple-500 shadow-[0_0_12px_rgba(168,85,247,0.8)] transition-all duration-700"
                strokeWidth="7"
                strokeDasharray="238"
                strokeDashoffset={238 - (238 * (accuracy / 100))}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-lg font-extrabold text-white font-['Space_Grotesk'] leading-none">
                {accuracy}%
              </span>
              <span className="text-[10px] font-semibold text-purple-300/80 mt-0.5">
                Accuracy
              </span>
            </div>
          </div>

          {/* Weekly Interactive Line & Area Chart */}
          <div className="flex-1 relative flex flex-col items-end">
            {/* Peak Milestone Badge */}
            <div className="mb-1 mr-1 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-500/15 border border-purple-400/30 text-[10px] font-extrabold text-purple-300">
              <span>Best Day!</span>
              <span className="text-amber-300">🎉 95%</span>
            </div>

            {/* SVG Trend Line */}
            <div className="w-full h-20 relative">
              <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${svgWidth} ${svgHeight}`} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b7fff" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#8b7fff" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path d={areaD} fill="url(#chartGradient)" />
                <path d={pathD} fill="none" stroke="#8b7fff" strokeWidth="2.5" strokeLinecap="round" />
                
                {/* Data Points */}
                {chartPoints.map((p, i) => (
                  <circle
                    key={p.day}
                    cx={i * stepX}
                    cy={p.y}
                    r={p.isPeak ? 4.5 : 3}
                    className={p.isPeak ? "fill-cyan-300 stroke-purple-900 stroke-2 animate-pulse" : "fill-purple-300"}
                  />
                ))}
              </svg>
            </div>

            {/* Day Labels (Mon, Tue, Wed, Thu, Fri, Sat, Sun) */}
            <div className="w-full flex justify-between text-[10px] font-medium text-slate-500 mt-1 px-1">
              {chartPoints.map(p => (
                <span key={p.day} className={p.isPeak ? "text-purple-300 font-bold" : ""}>
                  {p.day}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Lower Row: 4 Metric Cards Grid */}
        <div className="grid grid-cols-4 gap-2 pt-4 text-center">
          {/* Questions */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
              Questions
            </span>
            <span className="text-base font-extrabold text-white font-['Space_Grotesk']">
              {state.totalQuestionsAnswered || (state.totalCorrect + state.totalWrong) || 0}
            </span>
          </div>

          {/* Correct */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
              Correct
            </span>
            <span className="text-base font-extrabold text-emerald-400 font-['Space_Grotesk']">
              {state.totalCorrect || 0}
            </span>
          </div>

          {/* XP Gained */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
              XP Gained
            </span>
            <span className="text-base font-extrabold text-white font-['Space_Grotesk']">
              {state.score.toLocaleString()}
            </span>
          </div>

          {/* Streak */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">
              Streak
            </span>
            <span className="text-base font-extrabold text-amber-400 font-['Space_Grotesk'] flex items-center justify-center gap-0.5">
              🔥 {state.streak}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Achievements Section (Glowing Hexagonal Badges) */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
            Achievements
          </h3>
          <button
            onClick={() => {
              playClickSound();
              onOpenAchievementsModal();
            }}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-0.5"
          >
            View All <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Hexagonal glowing achievement cards in a row with live real-time progress */}
        <div className="grid grid-cols-4 gap-2.5">
          {ACHIEVEMENTS.slice(0, 4).map(ach => {
            const live = getLiveAchievementStats(ach.id, state);
            return (
              <button
                key={ach.id}
                onClick={() => {
                  playClickSound();
                  onOpenAchievementsModal();
                }}
                className={`flex flex-col items-center text-center p-2 rounded-2xl border transition-all shadow-md group ${
                  live.isUnlocked
                    ? 'bg-[#14142d] border-amber-500/40 shadow-amber-500/10'
                    : 'bg-[#121224] border-white/[0.06] hover:border-purple-400/30'
                }`}
              >
                <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center text-xl transition-transform group-hover:scale-105 mb-1 ${
                  live.isUnlocked
                    ? 'bg-gradient-to-tr from-amber-500/30 to-rose-500/20 border-amber-400/50 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : 'bg-white/[0.03] border-white/[0.08] grayscale'
                }`}>
                  <span>{ach.icon}</span>
                </div>
                <span className="text-[11px] font-bold text-slate-200 tracking-tight leading-tight truncate w-full">
                  {ach.name}
                </span>
                <span className={`text-[9px] font-semibold mt-0.5 ${
                  live.isUnlocked ? 'text-amber-400' : 'text-slate-400'
                }`}>
                  {live.progressLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Weak Words Section */}
      <div className="rounded-3xl p-5 bg-[#121224] border border-white/[0.08] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
              Weak Words
            </h3>
            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
              {state.weakWords.length} to practice
            </span>
          </div>

          <button
            id="btn-review-weak-words"
            onClick={() => {
              playClickSound();
              triggerHaptic('medium');
              onReviewWeakWords();
            }}
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <span>Review Now</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Horizontal word pill chips */}
        <div className="flex flex-wrap gap-2">
          {state.weakWords.map(w => (
            <button
              key={w.id}
              onClick={() => {
                playClickSound();
                setSelectedWeakWord(w);
              }}
              className="px-3.5 py-2 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:border-purple-400/40 hover:bg-white/[0.07] text-xs font-mono text-slate-200 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span>{w.word}</span>
              <span className="text-[10px] text-rose-400/80">({w.missedCount}x)</span>
            </button>
          ))}
        </div>

        {/* Selected weak word detail box */}
        {selectedWeakWord && (
          <div className="mt-2 p-3 rounded-2xl bg-purple-950/30 border border-purple-400/30 flex items-center justify-between text-xs animate-fadeIn">
            <div>
              <span className="font-bold text-white mr-2">{selectedWeakWord.word}</span>
              <span className="text-slate-300 font-sans">→ {selectedWeakWord.meaning}</span>
            </div>
            <button
              onClick={() => {
                playClickSound();
                onReviewWeakWords();
              }}
              className="px-2.5 py-1 rounded-lg bg-purple-600 text-white font-bold text-[11px] shadow-sm hover:bg-purple-500 active:scale-95 transition-all"
            >
              Practice
            </button>
          </div>
        )}
      </div>
      {/* 5. Live Leaderboard */}
      <div className="rounded-3xl p-5 bg-gradient-to-b from-[#161330] via-[#110e24] to-[#0c0a1a] border border-purple-500/20 flex flex-col gap-3.5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
              Live Global Leaderboard
            </h3>
          </div>

          <button
            onClick={() => {
              playClickSound();
              loadLeaderboard();
            }}
            className="p-1.5 rounded-xl bg-white/[0.05] border border-white/[0.08] text-slate-300 hover:text-white active:scale-95 transition-all flex items-center gap-1 text-[11px]"
            title="Refresh Leaderboard"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLeaderboardLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {isLeaderboardLoading && leaderboard.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 font-mono">
            Loading leaderboard...
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            No players logged yet. Be the first!
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {leaderboard.slice(0, 10).map((user, idx) => {
              const rank = idx + 1;
              const isCurrentUser = String(user.userId) === String(state.user.id);
              
              let rankBadge = `${rank}`;
              let rankColor = 'text-slate-400 bg-white/[0.05] border-white/[0.08]';
              if (rank === 1) {
                rankBadge = '🥇';
                rankColor = 'bg-amber-400/20 text-amber-300 border-amber-400/40 shadow-[0_0_10px_rgba(251,191,36,0.3)]';
              } else if (rank === 2) {
                rankBadge = '🥈';
                rankColor = 'bg-slate-300/20 text-slate-200 border-slate-300/40';
              } else if (rank === 3) {
                rankBadge = '🥉';
                rankColor = 'bg-amber-700/20 text-amber-400 border-amber-600/40';
              }

              return (
                <div
                  key={user.userId || idx}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                    isCurrentUser
                      ? 'bg-purple-900/40 border-purple-400/60 shadow-lg shadow-purple-950/50'
                      : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-xl border flex items-center justify-center text-xs font-bold font-['Space_Grotesk'] ${rankColor}`}>
                      {rankBadge}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{user.username || `User #${user.userId}`}</span>
                        {isCurrentUser && (
                          <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-1.5 py-0.2 rounded font-mono">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Strikes: {user.strikes}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-xl">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-extrabold text-white font-['Space_Grotesk']">
                      {user.xp.toLocaleString()} XP
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
