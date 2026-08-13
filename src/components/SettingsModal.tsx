import React from 'react';
import { X, Volume2, VolumeX, Mic, RotateCcw, Keyboard, Trash2, Smartphone, ShieldCheck, Sparkles } from 'lucide-react';
import { UserState } from '../types';
import { playClickSound, triggerHaptic } from '../utils/sound';

interface SettingsModalProps {
  state: UserState;
  onUpdateState: (updater: (prev: UserState) => UserState) => void;
  onClose: () => void;
  onResetProgress: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  state,
  onUpdateState,
  onClose,
  onResetProgress
}) => {
  const toggleSound = () => {
    playClickSound();
    onUpdateState(prev => ({ ...prev, soundOn: !prev.soundOn }));
  };

  const toggleTTS = () => {
    playClickSound();
    onUpdateState(prev => ({ ...prev, ttsOn: !prev.ttsOn }));
  };

  const toggleReverse = () => {
    playClickSound();
    onUpdateState(prev => ({ ...prev, isReverseMode: !prev.isReverseMode }));
  };

  const toggleListening = () => {
    playClickSound();
    onUpdateState(prev => ({ ...prev, isListeningMode: !prev.isListeningMode }));
  };

  const toggleTyping = () => {
    playClickSound();
    onUpdateState(prev => ({ ...prev, typingMode: !prev.typingMode }));
  };

  const toggleHaptics = () => {
    playClickSound();
    onUpdateState(prev => ({ ...prev, hapticsOn: !prev.hapticsOn }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#121224] border border-white/[0.1] shadow-2xl p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
          <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
            Preferences & Settings
          </h3>
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

        {/* Options Toggles */}
        <div className="flex flex-col gap-2.5">
          {/* Sound FX */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                {state.soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Sound Effects</span>
                <span className="text-[10px] text-slate-400">Audio chimes & feedback</span>
              </div>
            </div>
            <button
              onClick={toggleSound}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors ${state.soundOn ? 'bg-purple-600' : 'bg-slate-700'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${state.soundOn ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* TTS Audio */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                <Mic className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Pronunciation (TTS)</span>
                <span className="text-[10px] text-slate-400">Auto-speak vocabulary words</span>
              </div>
            </div>
            <button
              onClick={toggleTTS}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors ${state.ttsOn ? 'bg-cyan-600' : 'bg-slate-700'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${state.ttsOn ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Reverse Mode */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Reverse Mode</span>
                <span className="text-[10px] text-slate-400">Ask in Persian, choose English</span>
              </div>
            </div>
            <button
              onClick={toggleReverse}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors ${state.isReverseMode ? 'bg-pink-600' : 'bg-slate-700'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${state.isReverseMode ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Listening Mode Only */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <Volume2 className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Blind Listening Mode</span>
                <span className="text-[10px] text-slate-400">Hide text, listen to audio</span>
              </div>
            </div>
            <button
              onClick={toggleListening}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors ${state.isListeningMode ? 'bg-amber-600' : 'bg-slate-700'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${state.isListeningMode ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Haptic Vibrations */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">Haptic Vibrations</span>
                <span className="text-[10px] text-slate-400">Telegram vibration feedback</span>
              </div>
            </div>
            <button
              onClick={toggleHaptics}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors ${state.hapticsOn ? 'bg-emerald-600' : 'bg-slate-700'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${state.hapticsOn ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* Reset Progress Button */}
        <button
          onClick={() => {
            if (confirm('Are you sure you want to reset your score, streak, and local cache?')) {
              playClickSound();
              onResetProgress();
            }
          }}
          className="w-full py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 active:scale-98 border border-rose-500/30 text-rose-400 font-bold text-xs flex items-center justify-center gap-2 transition-all mt-1"
        >
          <Trash2 className="w-4 h-4" />
          <span>Reset All Progress Data</span>
        </button>
      </div>
    </div>
  );
};
