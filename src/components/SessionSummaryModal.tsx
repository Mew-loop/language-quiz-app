import React from 'react';
import { Award, Sparkles, CheckCircle2, XCircle, ArrowRight, RotateCcw, Home } from 'lucide-react';
import { playClickSound, triggerHaptic } from '../utils/sound';

interface SessionSummaryModalProps {
  stats: { correct: number; wrong: number; totalXP: number };
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  stats,
  onPlayAgain,
  onGoHome
}) => {
  const total = stats.correct + stats.wrong || 20;
  const accuracy = Math.round((stats.correct / total) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#191533] via-[#120f26] to-[#0d0b1a] border border-purple-500/30 shadow-2xl p-6 flex flex-col items-center text-center gap-5">
        {/* Celebration Trophy */}
        <div className="relative">
          <div className="absolute -inset-3 rounded-full bg-purple-600/30 blur-2xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-400 p-[2px] shadow-xl shadow-purple-500/30">
            <div className="w-full h-full rounded-[22px] bg-[#0c0a1a] flex items-center justify-center text-4xl">
              🏆
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight">
            Session Completed!
          </h3>
          <p className="text-xs text-purple-300 font-medium mt-1">
            Great practice session. Keep the momentum going!
          </p>
        </div>

        {/* 3 Stats Grid */}
        <div className="grid grid-cols-3 gap-2 w-full">
          <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex flex-col items-center">
            <span className="text-xs font-semibold text-slate-400 mb-0.5">Accuracy</span>
            <span className="text-base font-extrabold text-white font-['Space_Grotesk']">{accuracy}%</span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center">
            <span className="text-xs font-semibold text-emerald-400 mb-0.5">Correct</span>
            <span className="text-base font-extrabold text-emerald-300 font-['Space_Grotesk']">{stats.correct}</span>
          </div>

          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center">
            <span className="text-xs font-semibold text-amber-400 mb-0.5">XP Earned</span>
            <span className="text-base font-extrabold text-amber-300 font-['Space_Grotesk']">+{stats.totalXP}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 w-full mt-2">
          <button
            onClick={() => {
              playClickSound();
              triggerHaptic('medium');
              onPlayAgain();
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:from-purple-500 hover:to-rose-400 active:scale-[0.98] text-white font-extrabold text-sm shadow-lg shadow-purple-600/30 transition-all font-['Space_Grotesk'] flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Next Round</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              onGoHome();
            }}
            className="w-full py-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-[0.98] border border-white/[0.08] text-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
