import React, { useState, useEffect } from 'react';
import { Heart, Clock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { playClickSound, triggerHaptic } from '../utils/sound';

interface OutOfHeartsModalProps {
  onGoHome: () => void;
  onRefill: () => void;
}

export const OutOfHeartsModal: React.FC<OutOfHeartsModalProps> = ({
  onGoHome,
  onRefill
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState(1800); // 30 mins

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-3xl bg-gradient-to-b from-[#1c121e] via-[#140c17] to-[#0d0710] border border-rose-500/30 shadow-2xl p-6 flex flex-col items-center text-center gap-5">
        {/* Broken Heart Icon */}
        <div className="relative">
          <div className="absolute -inset-3 rounded-full bg-rose-600/30 blur-2xl animate-pulse" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-rose-500 to-pink-600 p-[2px] shadow-xl shadow-rose-500/30">
            <div className="w-full h-full rounded-[22px] bg-[#0d0710] flex items-center justify-center text-4xl">
              💔
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight">
            Out of Hearts!
          </h3>
          <p className="text-xs text-rose-300/80 font-medium mt-1">
            Hearts regenerate automatically every 30 minutes.
          </p>
        </div>

        {/* Countdown Box */}
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex flex-col items-center w-full">
          <span className="text-xs font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-rose-400" />
            Next Heart in
          </span>
          <span className="text-2xl font-black text-white font-['Space_Grotesk'] tracking-widest text-amber-300">
            {timeFormatted}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2.5 w-full mt-2">
          <button
            onClick={() => {
              playClickSound();
              triggerHaptic('success');
              onRefill();
            }}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 active:scale-[0.98] text-white font-extrabold text-xs shadow-lg shadow-rose-500/30 transition-all font-['Space_Grotesk'] flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Instant Refill (+5 ❤️)</span>
          </button>

          <button
            onClick={() => {
              playClickSound();
              onGoHome();
            }}
            className="w-full py-3 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] active:scale-[0.98] border border-white/[0.08] text-slate-300 font-bold text-xs transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
