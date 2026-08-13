import React, { useState } from 'react';
import { Settings, Edit2, Shield, CheckCircle2, Circle, Lock, Share2, Copy, Sparkles, ChevronRight, Award } from 'lucide-react';
import { UserState } from '../types';
import { RANK_LEVELS, calculateLevelFromXP, getRankForLevel } from '../data/ranks';
import { playClickSound, triggerHaptic } from '../utils/sound';

interface ProfileScreenProps {
  state: UserState;
  onOpenSettings: () => void;
  onEditProfile: () => void;
  onShareReferral: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  state,
  onOpenSettings,
  onEditProfile,
  onShareReferral
}) => {
  const [copied, setCopied] = useState(false);
  const levelInfo = calculateLevelFromXP(state.score);
  const currentRank = getRankForLevel(levelInfo.level);

  const handleCopyReferral = () => {
    playClickSound();
    triggerHaptic('success');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`https://t.me/LangQuizProBot?start=${state.referralCode}`);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="flex flex-col gap-4 pb-28 animate-fadeIn">
      {/* 1. Top Bar with Settings and Edit Pencil */}
      <div className="flex items-center justify-between px-1">
        <button
          id="btn-profile-settings"
          onClick={() => {
            playClickSound();
            onOpenSettings();
          }}
          className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/[0.08] active:scale-95 transition-all"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        <button
          id="btn-profile-edit"
          onClick={() => {
            playClickSound();
            onEditProfile();
          }}
          className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/[0.08] active:scale-95 transition-all"
          title="Edit Profile"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Cyber Avatar Hero & Name */}
      <div className="flex flex-col items-center text-center mt-1">
        <div className="relative">
          {/* Outer glowing ambient ring */}
          <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-purple-600 via-pink-600 to-cyan-400 opacity-60 blur-xl animate-pulse" />

          {/* Avatar Ring */}
          <div className="relative w-28 h-28 rounded-full p-1 bg-gradient-to-tr from-purple-500 via-pink-500 to-cyan-400 shadow-2xl shadow-purple-600/40">
            <div className="w-full h-full rounded-full overflow-hidden bg-[#0a0a14] flex items-center justify-center">
              <div className="relative w-full h-full bg-gradient-to-b from-[#1c173b] to-[#0d0a21] flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-purple-950 border border-purple-400/50 flex items-center justify-center relative shadow-[0_0_20px_rgba(168,85,247,0.5)]">
                  <div className="w-10 h-6 rounded-lg bg-[#070512] border border-purple-400/60 flex items-center justify-around px-1.5">
                    <div className="w-2 h-1.5 rounded-sm bg-cyan-300 shadow-[0_0_6px_#22d3ee] animate-pulse" />
                    <div className="w-2 h-1.5 rounded-sm bg-cyan-300 shadow-[0_0_6px_#22d3ee] animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Level Badge in Bottom Right */}
          <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#111124] border-2 border-purple-400 flex items-center justify-center text-xs font-extrabold text-white font-['Space_Grotesk'] shadow-lg shadow-purple-500/40">
            {levelInfo.level}
          </div>
        </div>

        {/* User Name & Bio */}
        <h2 className="text-2xl font-extrabold text-white font-['Space_Grotesk'] tracking-tight mt-3">
          {state.user.name}
        </h2>
        <p className="text-xs text-purple-300/80 font-medium mt-0.5">
          User #{state.user.id}
        </p>
      </div>

      {/* 3. Level Card with Ornate Crest */}
      <div className="rounded-3xl p-5 bg-gradient-to-br from-[#191535] via-[#120f26] to-[#0c0a1a] border border-purple-500/25 shadow-xl flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg font-extrabold text-white font-['Space_Grotesk']">
              Level {levelInfo.level}
            </span>
          </div>
          <p className="text-xs font-bold text-purple-300 mb-3">
            {levelInfo.rankTitle}
          </p>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-1.5 font-['Space_Grotesk']">
            <span>{state.score.toLocaleString()} / {levelInfo.nextLevelXP.toLocaleString()} XP</span>
          </div>

          {/* Glowing XP Progress Bar */}
          <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden p-[1px]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-400 shadow-[0_0_12px_rgba(236,72,153,0.6)]"
              style={{ width: `${levelInfo.progress}%` }}
            />
          </div>
        </div>

        {/* Rank Crest Badge */}
        <div className="relative shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 via-rose-500/15 to-purple-600/20 border border-amber-400/40 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <div className="absolute inset-0 rounded-2xl bg-amber-400/10 blur-sm pointer-events-none" />
          <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(251,191,36,0.7)]">
            {currentRank.icon || '🛡️'}
          </span>
        </div>
      </div>

      {/* 4. Level Roadmap (Matching Screen 4 timeline) */}
      <div className="rounded-3xl p-5 bg-[#121224] border border-white/[0.08] flex flex-col gap-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
            Level Roadmap
          </h3>
          <span className="text-xs font-semibold text-purple-400 flex items-center gap-0.5 cursor-pointer">
            View All <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Timeline roadmap list */}
        <div className="flex flex-col gap-1.5">
          {/* Level 20 - Apprentice (Completed) */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center gap-3">
              <span className="w-6 text-xs font-bold text-slate-500 font-['Space_Grotesk'] text-center">
                20
              </span>
              <div className="w-2 h-2 rounded-full bg-slate-600" />
              <span className="text-xs font-semibold text-slate-400">
                Apprentice
              </span>
            </div>
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Level 21 - Warrior (Active current tier) */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-purple-900/40 via-purple-800/20 to-transparent border border-purple-500/40 shadow-lg shadow-purple-950/40">
            <div className="flex items-center gap-3">
              <span className="w-6 text-xs font-extrabold text-purple-300 font-['Space_Grotesk'] text-center">
                21
              </span>
              <div className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_#a855f7]" />
              <span className="text-xs font-extrabold text-white">
                Warrior
              </span>
            </div>
            <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-md border border-purple-500/30">
              Current
            </span>
          </div>

          {/* Level 22 - Guardian */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center gap-3">
              <span className="w-6 text-xs font-bold text-slate-500 font-['Space_Grotesk'] text-center">
                22
              </span>
              <div className="w-2 h-2 rounded-full bg-slate-700" />
              <span className="text-xs font-semibold text-slate-400">
                Guardian
              </span>
            </div>
            <span className="text-xs text-slate-500 font-['Space_Grotesk'] font-medium">
              3,500 XP
            </span>
          </div>

          {/* Level 23 - Champion */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center gap-3">
              <span className="w-6 text-xs font-bold text-slate-500 font-['Space_Grotesk'] text-center">
                23
              </span>
              <div className="w-2 h-2 rounded-full bg-slate-700" />
              <span className="text-xs font-semibold text-slate-400">
                Champion
              </span>
            </div>
            <span className="text-xs text-slate-500 font-['Space_Grotesk'] font-medium">
              5,000 XP
            </span>
          </div>

          {/* Level 24 - Legend */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <div className="flex items-center gap-3">
              <span className="w-6 text-xs font-bold text-slate-500 font-['Space_Grotesk'] text-center">
                24
              </span>
              <div className="w-2 h-2 rounded-full bg-slate-700" />
              <span className="text-xs font-semibold text-slate-400">
                Legend
              </span>
            </div>
            <span className="text-xs text-slate-500 font-['Space_Grotesk'] font-medium">
              7,000 XP
            </span>
          </div>
        </div>
      </div>

      {/* 5. Referral Link & Social Invite Card */}
      <div className="rounded-3xl p-5 bg-gradient-to-r from-blue-950/30 via-[#10132b] to-[#121633] border border-blue-500/20 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🤝</span>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Invite Friends, Earn XP
              </h4>
              <p className="text-[11px] text-slate-400">
                Get +200 XP for every friend who joins!
              </p>
            </div>
          </div>
          <span className="text-xs font-extrabold text-blue-400 bg-blue-500/10 px-2 py-1 rounded-lg border border-blue-500/20">
            {state.friendsInvited} Invited
          </span>
        </div>

        <div className="flex items-center gap-2 bg-[#090b17] p-1.5 rounded-2xl border border-white/[0.08]">
          <span className="text-xs font-mono text-slate-300 px-3 flex-1 truncate">
            https://t.me/LangQuizProBot?start={state.referralCode}
          </span>
          <button
            onClick={handleCopyReferral}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/30 shrink-0"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
