import React from 'react';
import { X, Play, BookOpen, Quote, Volume2, Star, BarChart3, Award, Settings, MessageSquare, Terminal, RefreshCw, HelpCircle, Shield, Share2 } from 'lucide-react';
import { AppTab, GameMode } from '../types';
import { playClickSound, triggerHaptic } from '../utils/sound';

interface BotMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: AppTab) => void;
  onStartMode: (mode: GameMode) => void;
  onOpenSettings: () => void;
  onOpenLanguages: () => void;
}

export const BotMenuDrawer: React.FC<BotMenuDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onStartMode,
  onOpenSettings,
  onOpenLanguages
}) => {
  if (!isOpen) return null;

  const botCommands = [
    { cmd: '/quiz', label: 'Start Fast Word Quiz', icon: Play, color: 'text-blue-400', action: () => onStartMode('word') },
    { cmd: '/sentence', label: 'Sentence Context Quiz', icon: Quote, color: 'text-pink-400', action: () => onStartMode('sentence') },
    { cmd: '/listening', label: 'Listening Audio Quiz', icon: Volume2, color: 'text-purple-400', action: () => onStartMode('listening') },
    { cmd: '/srs', label: 'Spaced Repetition Review', icon: Star, color: 'text-amber-400', action: () => onStartMode('review') },
    { cmd: '/stats', label: 'View Accuracy & Weekly Stats', icon: BarChart3, color: 'text-cyan-400', action: () => onNavigateTab('stats') },
    { cmd: '/quests', label: 'Daily & Weekly Quests', icon: Award, color: 'text-emerald-400', action: () => onNavigateTab('quests') },
    { cmd: '/lang', label: 'Change Target Languages', icon: MessageSquare, color: 'text-indigo-400', action: onOpenLanguages },
    { cmd: '/settings', label: 'Audio, TTS & Quiz Modes', icon: Settings, color: 'text-slate-300', action: onOpenSettings }
  ];

  return (
    <div className="fixed inset-0 z-50 flex justify-start bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-4/5 max-w-xs h-full bg-[#0d0d1b] border-r border-white/[0.08] shadow-2xl p-5 flex flex-col justify-between overflow-y-auto">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-extrabold text-white font-['Space_Grotesk']">
                Bot Commands
              </h3>
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

          {/* Bot Profile Info */}
          <div className="flex items-center gap-3 my-4 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-400/40 flex items-center justify-center text-xl">
              🤖
            </div>
            <div>
              <h4 className="text-sm font-bold text-white leading-tight">LangQuiz Pro Bot</h4>
              <p className="text-[11px] text-slate-400">@LangQuizProBot</p>
            </div>
          </div>

          {/* Command list */}
          <div className="flex flex-col gap-1.5 mt-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1 px-1">
              Inline Action Menu
            </span>
            {botCommands.map(cmd => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.cmd}
                  onClick={() => {
                    playClickSound();
                    triggerHaptic('light');
                    onClose();
                    cmd.action();
                  }}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.06] active:scale-95 text-left transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                    <Icon className={`w-4 h-4 ${cmd.color}`} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-white font-mono">
                      {cmd.cmd}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate">
                      {cmd.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-white/[0.06] text-[11px] text-slate-500 text-center">
          LangQuiz Pro v2.4 • Telegram Mini App
        </div>
      </div>
    </div>
  );
};
