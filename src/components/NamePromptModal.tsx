import React, { useState } from 'react';
import { Sparkles, User, ArrowRight } from 'lucide-react';
import { playClickSound, triggerHaptic } from '../utils/sound';

interface NamePromptModalProps {
  onSaveName: (name: string) => void;
}

export const NamePromptModal: React.FC<NamePromptModalProps> = ({ onSaveName }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    playClickSound();
    triggerHaptic('medium');
    onSaveName(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl p-6 bg-gradient-to-b from-[#181830] via-[#121226] to-[#0c0c1a] border border-purple-500/30 shadow-2xl shadow-purple-950/60">
        {/* Glow Effects */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col items-center text-center">
          {/* Cyber Avatar Header */}
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 via-pink-600 to-cyan-400 p-[2px] shadow-lg shadow-purple-500/30 mb-4 animate-bounce">
            <div className="w-full h-full rounded-3xl bg-[#0a0a14] flex items-center justify-center">
              <span className="text-3xl">👋</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mb-1 text-purple-300 font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>First Time Setup</span>
          </div>

          <h3 className="text-2xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight mb-2">
            Welcome! What's your name?
          </h3>
          <p className="text-xs text-slate-300 mb-6 leading-relaxed max-w-xs font-medium">
            Enter your name to personalize your learning stats and leaderboard position.
          </p>

          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex, Mahdi..."
                autoFocus
                maxLength={25}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/[0.05] border border-purple-400/30 text-white placeholder-slate-500 font-bold text-sm focus:outline-none focus:border-purple-400 focus:bg-white/[0.08] focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              className={`w-full py-3.5 px-5 rounded-2xl font-extrabold text-sm font-['Space_Grotesk'] flex items-center justify-center gap-2 transition-all shadow-lg ${
                name.trim()
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border border-purple-400/60 shadow-purple-600/30 hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-white/[0.05] text-slate-500 border border-white/[0.08] cursor-not-allowed'
              }`}
            >
              <span>Start Learning</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
