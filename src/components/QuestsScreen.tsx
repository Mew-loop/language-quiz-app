import React from 'react';
import { Award, CheckCircle2, Clock, Gift, Sparkles, Zap, Flame, Shield } from 'lucide-react';
import { UserState, Quest } from '../types';
import { playChestOpenSound, playClickSound, triggerHaptic } from '../utils/sound';
import confetti from 'canvas-confetti';

interface QuestsScreenProps {
  state: UserState;
  onClaimQuest: (questId: string) => void;
  onStartQuestQuiz: () => void;
}

export const QuestsScreen: React.FC<QuestsScreenProps> = ({
  state,
  onClaimQuest,
  onStartQuestQuiz
}) => {
  const quests = state.dailyQuests.quests;
  const completedCount = quests.filter(q => q.completed).length;

  const handleClaim = (quest: Quest) => {
    if (!quest.completed || quest.claimed) return;
    playChestOpenSound();
    triggerHaptic('success');
    
    // Reward confetti
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#ffc13d', '#8b7fff', '#ff3d77', '#2fe6a0']
    });

    onClaimQuest(quest.id);
  };

  return (
    <div className="flex flex-col gap-4 pb-28 animate-fadeIn">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-3xl p-5 bg-gradient-to-r from-purple-950/40 via-[#16122c] to-[#120e24] border border-purple-500/25 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-300 flex items-center gap-1 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Daily Challenges
            </span>
            <h2 className="text-2xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight">
              Quests & Rewards
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Resets in <span className="text-purple-300 font-bold font-['Space_Grotesk']">14h 28m</span>
            </p>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-2xl font-extrabold text-amber-300 font-['Space_Grotesk']">
              {completedCount} / {quests.length}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase">
              Completed
            </span>
          </div>
        </div>
      </div>

      {/* 2. Quests List */}
      <div className="flex flex-col gap-3">
        {quests.map(quest => {
          const progress = Math.min(100, (quest.current / quest.target) * 100);
          const isReadyToClaim = quest.completed && !quest.claimed;

          return (
            <div
              key={quest.id}
              className={`rounded-3xl p-4.5 border transition-all duration-300 flex flex-col gap-3 ${
                isReadyToClaim
                  ? 'bg-gradient-to-r from-[#1c183b] via-[#171330] to-[#130f28] border-amber-400/40 shadow-lg shadow-amber-500/10'
                  : quest.claimed
                  ? 'bg-white/[0.02] border-white/[0.04] opacity-60'
                  : 'bg-[#111122] border-white/[0.08]'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-2xl shrink-0">
                    {quest.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-tight">
                      {quest.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {quest.desc || 'Complete target objective'}
                    </p>
                  </div>
                </div>

                {/* Reward pill */}
                <div className="shrink-0 flex flex-col items-end">
                  <span className="text-xs font-extrabold text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-xl border border-amber-400/20 font-['Space_Grotesk']">
                    +{quest.rewardXP} XP
                  </span>
                </div>
              </div>

              {/* Progress and Claim button */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1 font-['Space_Grotesk']">
                    <span>Progress</span>
                    <span>{quest.current} / {quest.target}</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-amber-400 transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Action button */}
                {isReadyToClaim ? (
                  <button
                    onClick={() => handleClaim(quest)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/30 animate-pulse transition-all shrink-0"
                  >
                    Claim! 🎁
                  </button>
                ) : quest.claimed ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-4 h-4" /> Claimed
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      playClickSound();
                      onStartQuestQuiz();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-bold text-slate-300 hover:bg-white/[0.08] active:scale-95 transition-all shrink-0"
                  >
                    Play
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Weekly Mystery Chest Section */}
      <div className="rounded-3xl p-5 bg-gradient-to-r from-[#171330] to-[#0f0c22] border border-purple-500/25 flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
            Weekly Reward
          </span>
          <h4 className="text-base font-extrabold text-white font-['Space_Grotesk'] mt-1.5">
            Legendary Chest
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Complete 15 daily quests to unlock +500 XP & 3 Streak Freezes!
          </p>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-400/40 flex items-center justify-center text-3xl shrink-0 shadow-lg shadow-purple-600/30 animate-float">
          <span>🏆</span>
        </div>
      </div>
    </div>
  );
};
