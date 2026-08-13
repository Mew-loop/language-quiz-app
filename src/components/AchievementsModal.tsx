import React from 'react';
import { X, Award, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { ACHIEVEMENTS, getLiveAchievementStats } from '../data/achievements';
import { UserState } from '../types';
import { playClickSound } from '../utils/sound';

interface AchievementsModalProps {
  state: UserState;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  state,
  onClose
}) => {
  const unlockedCount = ACHIEVEMENTS.filter(a => getLiveAchievementStats(a.id, state).isUnlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-sm max-h-[85vh] rounded-3xl bg-[#121224] border border-white/[0.1] shadow-2xl p-5 flex flex-col gap-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-base font-extrabold text-white font-['Space_Grotesk']">
                All Achievements
              </h3>
              <p className="text-[11px] text-slate-400">
                {unlockedCount} of {ACHIEVEMENTS.length} unlocked
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Badges List */}
        <div className="flex flex-col gap-2.5 overflow-y-auto pr-1 no-scrollbar max-h-[55vh]">
          {ACHIEVEMENTS.map(ach => {
            const live = getLiveAchievementStats(ach.id, state);

            return (
              <div
                key={ach.id}
                className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 ${
                  live.isUnlocked
                    ? 'bg-[#18182f] border-purple-500/40 shadow-md shadow-purple-950/30'
                    : 'bg-white/[0.02] border-white/[0.05]'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                      live.isUnlocked
                        ? 'bg-gradient-to-tr from-purple-500/30 to-pink-500/30 border border-purple-400/50 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                        : 'bg-slate-800 border border-slate-700 grayscale'
                    }`}>
                      <span>{ach.icon}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                        {ach.name}
                        {live.isUnlocked && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {ach.desc}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end">
                    {live.isUnlocked ? (
                      <span className="text-[11px] font-extrabold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/20">
                        +{ach.xpReward} XP
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 bg-white/[0.04] px-2 py-0.5 rounded-lg border border-white/[0.08]">
                        {live.progressLabel}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar for locked achievements */}
                {!live.isUnlocked && (
                  <div className="w-full bg-white/[0.05] h-1.5 rounded-full overflow-hidden border border-white/[0.05]">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${live.progressPct}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
