import React from 'react';
import { Sparkles, Zap, Heart, Flame, ChevronRight, Volume2, Quote, BookOpen, Star, HelpCircle } from 'lucide-react';
import { UserState, GameMode } from '../types';
import { calculateLevelFromXP } from '../data/ranks';
import { CATEGORIES } from '../data/languages';
import { playClickSound, triggerHaptic } from '../utils/sound';

interface HomeScreenProps {
  state: UserState;
  onStartQuiz: (mode: GameMode, category?: string, level?: number) => void;
  onOpenQuests: () => void;
  onOpenStats: () => void;
  onOpenProfile: () => void;
  onOpenLanguageModal: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  state,
  onStartQuiz,
  onOpenQuests,
  onOpenStats,
  onOpenProfile,
  onOpenLanguageModal
}) => {
  const activeDailyQuest = state.dailyQuests.quests.find(q => !q.claimed) || state.dailyQuests.quests[0];
  const questProgress = activeDailyQuest ? Math.min(100, (activeDailyQuest.current / activeDailyQuest.target) * 100) : 0;

  // Fully dynamic Level & XP calculation from Google Sheets live score!
  const levelInfo = calculateLevelFromXP(state.score);

  return (
    <div className="flex flex-col gap-4 pb-28 animate-fadeIn">
      {/* 1. Welcome Greeting Banner */}
      <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-br from-[#1c1c38]/90 via-[#131326]/95 to-[#0e0e1c] border border-white/[0.09] shadow-xl">
        {/* Background ambient lighting */}
        <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-pink-600/15 blur-2xl pointer-events-none" />

        <div className="relative flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <h2 className="text-xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight">
                Hey, {state.user.name}!
              </h2>
              <span className="text-lg">👋</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Ready to level up your language?
            </p>
          </div>

          {/* Cyber Avatar with glowing aura */}
          <div 
            onClick={() => {
              playClickSound();
              onOpenProfile();
            }}
            className="relative cursor-pointer group"
          >
            <div className="relative w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-purple-500 via-pink-500 to-cyan-400 group-hover:scale-105 transition-transform duration-300 shadow-lg shadow-purple-500/25">
              <div className="w-full h-full rounded-full overflow-hidden bg-[#0a0a14] flex items-center justify-center">
                {/* Robot / Cyber avatar visual from reference */}
                <div className="relative w-full h-full bg-gradient-to-b from-[#1c173b] to-[#0d0a21] flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center">
                    <div className="w-6 h-4 rounded-md bg-purple-900 border border-purple-400/60 flex items-center justify-around px-1 shadow-[0_0_8px_rgba(168,85,247,0.6)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#111122] border border-purple-400/50 flex items-center justify-center text-[10px] font-bold text-purple-300">
              {levelInfo.level}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Quiz Modes (Positioned directly below greeting section) */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Interactive Quiz Modes
          </h3>
          <span className="text-[11px] text-purple-400 font-medium">Select Mode</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* 1. Word Quiz (Blue Tile) */}
          <button
            id="btn-mode-word"
            onClick={() => {
              playClickSound();
              triggerHaptic('medium');
              onStartQuiz('word');
            }}
            className="relative overflow-hidden text-left p-4 rounded-3xl bg-gradient-to-br from-blue-950/40 via-[#10152b] to-[#0c1022] border border-blue-500/25 hover:border-blue-400/50 shadow-lg shadow-blue-950/40 hover:shadow-blue-500/20 active:scale-[0.98] transition-all group"
          >
            <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-400/40 flex items-center justify-center text-blue-400 mb-3 shadow-[0_0_12px_rgba(59,130,246,0.3)] group-hover:scale-110 transition-transform">
              <span className="font-extrabold text-lg font-['Space_Grotesk']">A</span>
            </div>
            <h4 className="text-base font-extrabold text-white tracking-tight mb-0.5">
              Word Quiz
            </h4>
            <p className="text-xs text-slate-400 font-medium">
              Expand vocabulary
            </p>
          </button>

          {/* 2. Sentence Quiz (Pink/Wine Tile) */}
          <button
            id="btn-mode-sentence"
            onClick={() => {
              playClickSound();
              triggerHaptic('medium');
              onStartQuiz('sentence');
            }}
            className="relative overflow-hidden text-left p-4 rounded-3xl bg-gradient-to-br from-pink-950/40 via-[#22101e] to-[#150a13] border border-pink-500/25 hover:border-pink-400/50 shadow-lg shadow-pink-950/40 hover:shadow-pink-500/20 active:scale-[0.98] transition-all group"
          >
            <div className="w-11 h-11 rounded-2xl bg-pink-600/20 border border-pink-400/40 flex items-center justify-center text-pink-400 mb-3 shadow-[0_0_12px_rgba(244,63,94,0.3)] group-hover:scale-110 transition-transform">
              <Quote className="w-5 h-5 fill-pink-400/30" />
            </div>
            <h4 className="text-base font-extrabold text-white tracking-tight mb-0.5">
              Sentence Quiz
            </h4>
            <p className="text-xs text-slate-400 font-medium">
              Learn in context
            </p>
          </button>

          {/* 3. Listening Mode (Purple Tile) */}
          <button
            id="btn-mode-listening"
            onClick={() => {
              playClickSound();
              triggerHaptic('medium');
              onStartQuiz('listening');
            }}
            className="relative overflow-hidden text-left p-4 rounded-3xl bg-gradient-to-br from-purple-950/40 via-[#18112c] to-[#100b1e] border border-purple-500/25 hover:border-purple-400/50 shadow-lg shadow-purple-950/40 hover:shadow-purple-500/20 active:scale-[0.98] transition-all group"
          >
            <div className="w-11 h-11 rounded-2xl bg-purple-600/20 border border-purple-400/40 flex items-center justify-center text-purple-400 mb-3 shadow-[0_0_12px_rgba(168,85,247,0.3)] group-hover:scale-110 transition-transform">
              <Volume2 className="w-5 h-5" />
            </div>
            <h4 className="text-base font-extrabold text-white tracking-tight mb-0.5">
              Listening
            </h4>
            <p className="text-xs text-slate-400 font-medium">
              Train your ears
            </p>
          </button>

          {/* 4. Review / SRS (Amber/Gold Tile) */}
          <button
            id="btn-mode-review"
            onClick={() => {
              playClickSound();
              triggerHaptic('medium');
              onStartQuiz('review');
            }}
            className="relative overflow-hidden text-left p-4 rounded-3xl bg-gradient-to-br from-amber-950/40 via-[#22170b] to-[#150e06] border border-amber-500/25 hover:border-amber-400/50 shadow-lg shadow-amber-950/40 hover:shadow-amber-500/20 active:scale-[0.98] transition-all group"
          >
            <div className="w-11 h-11 rounded-2xl bg-amber-600/20 border border-amber-400/40 flex items-center justify-center text-amber-400 mb-3 shadow-[0_0_12px_rgba(245,158,11,0.3)] group-hover:scale-110 transition-transform">
              <Star className="w-5 h-5 fill-amber-400/30" />
            </div>
            <h4 className="text-base font-extrabold text-white tracking-tight mb-0.5">
              Review
            </h4>
            <p className="text-xs text-slate-400 font-medium">
              Spaced repetition
            </p>
          </button>
        </div>
      </div>

      {/* 2. Quick Stat Trio Card (XP, Streak, Lives) */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* XP Card */}
        <div 
          onClick={() => {
            playClickSound();
            onOpenStats();
          }}
          className="relative overflow-hidden rounded-2xl p-3.5 bg-gradient-to-b from-white/[0.05] to-white/[0.015] bg-[#101020] border border-white/[0.08] flex items-center gap-3 cursor-pointer hover:border-blue-400/30 transition-all active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0 shadow-[0_0_12px_rgba(59,130,246,0.2)]">
            <span className="font-['Space_Grotesk'] font-extrabold">XP</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-extrabold text-white font-['Space_Grotesk'] tracking-tight truncate">
              {state.score.toLocaleString()}
            </span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              Total XP
            </span>
          </div>
        </div>

        {/* Streak Card */}
        <div 
          onClick={() => {
            playClickSound();
            onOpenStats();
          }}
          className="relative overflow-hidden rounded-2xl p-3.5 bg-gradient-to-b from-white/[0.05] to-white/[0.015] bg-[#101020] border border-white/[0.08] flex items-center gap-3 cursor-pointer hover:border-amber-400/30 transition-all active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
            <Flame className="w-5 h-5 fill-amber-400 text-amber-400 animate-pulse" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-extrabold text-white font-['Space_Grotesk'] tracking-tight truncate">
              {state.streak}
            </span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              Streak
            </span>
          </div>
        </div>

        {/* Lives Card */}
        <div 
          onClick={() => {
            playClickSound();
          }}
          className="relative overflow-hidden rounded-2xl p-3.5 bg-gradient-to-b from-white/[0.05] to-white/[0.015] bg-[#101020] border border-white/[0.08] flex items-center gap-3 cursor-pointer hover:border-rose-400/30 transition-all active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-400/30 flex items-center justify-center text-rose-400 shrink-0 shadow-[0_0_12px_rgba(244,63,94,0.2)]">
            <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-extrabold text-white font-['Space_Grotesk'] tracking-tight truncate">
              {state.lives}
            </span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              Lives
            </span>
          </div>
        </div>
      </div>

      {/* 3. Fully Dynamic Level & XP Progress Banner */}
      <div 
        onClick={() => {
          playClickSound();
          onOpenProfile();
        }}
        className="rounded-2xl p-4 bg-[#111124] border border-white/[0.08] flex items-center gap-3.5 cursor-pointer hover:border-purple-400/30 transition-all"
      >
        {/* Level badge */}
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-700 flex flex-col items-center justify-center text-white shrink-0 shadow-lg shadow-purple-600/30 border border-purple-400/40">
          <span className="text-[9px] uppercase font-bold tracking-wider text-purple-200">Level</span>
          <span className="text-sm font-extrabold font-['Space_Grotesk'] leading-none">{levelInfo.level}</span>
        </div>

        {/* Progress bar and details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-bold text-slate-200">{levelInfo.rankTitle}</span>
            <span className="text-[11px] text-slate-400 font-medium font-['Space_Grotesk']">
              {state.score.toLocaleString()} / {levelInfo.nextLevelXP.toLocaleString()} XP
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden p-[1px]">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400 shadow-[0_0_10px_rgba(236,72,153,0.5)] transition-all duration-500"
              style={{ width: `${levelInfo.progress}%` }}
            />
          </div>
        </div>

        {/* Next level pill */}
        <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-xs font-bold text-slate-400 font-['Space_Grotesk']">
          {levelInfo.level + 1}
        </div>
      </div>

      {/* 4. Daily Quest Preview Card with Chest */}
      {activeDailyQuest && (
        <div 
          onClick={() => {
            playClickSound();
            onOpenQuests();
          }}
          className="relative overflow-hidden rounded-3xl p-4 bg-gradient-to-r from-[#171530] via-[#141228] to-[#1a1435] border border-purple-500/20 shadow-lg cursor-pointer group hover:border-purple-400/40 transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                Daily Quest
              </span>
            </div>
            <span className="text-xs font-semibold text-purple-300 flex items-center gap-1">
              View All <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">
              <p className="text-sm font-bold text-white mb-2">
                {activeDailyQuest.title}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full bg-white/[0.08] overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-400 transition-all duration-500"
                    style={{ width: `${questProgress}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-400 font-['Space_Grotesk']">
                  {activeDailyQuest.current} / {activeDailyQuest.target}
                </span>
              </div>
            </div>

            {/* Glowing Chest Box */}
            <div className="relative shrink-0 flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-400/40 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
                <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(216,180,254,0.6)]">🎁</span>
              </div>
              <span className="mt-1 text-[10px] font-extrabold text-amber-300 bg-amber-400/10 px-1.5 py-0.2 rounded border border-amber-400/20">
                +{activeDailyQuest.rewardXP} XP
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 6. Category Filter Chips */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Vocabulary Categories
          </span>
          <span className="text-[11px] text-slate-500">{CATEGORIES.length} Topics</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map(cat => {
            const isSelected = state.selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  playClickSound();
                  onStartQuiz(state.activeMode, cat.id);
                }}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 border border-purple-400/50'
                    : 'bg-white/[0.04] text-slate-300 border border-white/[0.08] hover:bg-white/[0.08]'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
