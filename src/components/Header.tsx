import React from 'react';
import { Menu, Bell, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { LANGUAGES } from '../data/languages';
import { playClickSound } from '../utils/sound';

interface HeaderProps {
  sourceLangId: number;
  targetLangId: number;
  soundOn: boolean;
  onToggleSound: () => void;
  onOpenDrawer: () => void;
  onOpenNotifications: () => void;
  onOpenLanguageModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sourceLangId,
  targetLangId,
  soundOn,
  onToggleSound,
  onOpenDrawer,
  onOpenNotifications,
  onOpenLanguageModal
}) => {
  const sourceLang = LANGUAGES.find(l => l.id === sourceLangId) || LANGUAGES[1];
  const targetLang = LANGUAGES.find(l => l.id === targetLangId) || LANGUAGES[0];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#0a0a14]/80 backdrop-blur-xl border-b border-white/[0.07]">
      {/* Left: Hamburger menu */}
      <button
        id="btn-drawer-toggle"
        onClick={() => {
          playClickSound();
          onOpenDrawer();
        }}
        className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/[0.08] active:scale-95 transition-all"
        title="Bot Menu & Settings"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Center: Title & Pro Badge */}
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-bold tracking-tight text-white font-['Space_Grotesk'] flex items-center gap-1.5">
          <span>LangQuiz</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 font-extrabold text-sm px-1.5 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20">
            PRO
          </span>
        </h1>
      </div>

      {/* Right: Sound toggle + Language Pair Pill + Notification Bell */}
      <div className="flex items-center gap-2">
        {/* Language selector button */}
        <button
          id="btn-lang-selector"
          onClick={() => {
            playClickSound();
            onOpenLanguageModal();
          }}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/[0.08] active:scale-95 transition-all"
          title="Change Languages"
        >
          <span>{sourceLang.emoji}</span>
          <span className="text-[10px] text-slate-500">➔</span>
          <span>{targetLang.emoji}</span>
        </button>

        {/* Notifications button */}
        <button
          id="btn-notifications"
          onClick={() => {
            playClickSound();
            onOpenNotifications();
          }}
          className="relative w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/[0.08] active:scale-95 transition-all"
          title="Notifications & Daily Rewards"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0a0a14] animate-pulse" />
        </button>
      </div>
    </header>
  );
};
