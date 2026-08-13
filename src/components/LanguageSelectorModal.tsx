import React, { useState } from 'react';
import { X, Check, Globe, ArrowRight } from 'lucide-react';
import { LANGUAGES } from '../data/languages';
import { playClickSound, triggerHaptic } from '../utils/sound';

interface LanguageSelectorModalProps {
  sourceLangId: number;
  targetLangId: number;
  onSelectLanguages: (sourceId: number, targetId: number) => void;
  onClose: () => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  sourceLangId,
  targetLangId,
  onSelectLanguages,
  onClose
}) => {
  const [source, setSource] = useState(sourceLangId);
  const [target, setTarget] = useState(targetLangId);
  const [activeStep, setActiveStep] = useState<'source' | 'target'>('source');

  const handleSave = () => {
    playClickSound();
    triggerHaptic('success');
    onSelectLanguages(source, target);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#121224] border border-white/[0.1] shadow-2xl p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white font-['Space_Grotesk']">
              Language Settings
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

        {/* Step Switcher (Source vs Target) */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
          <button
            onClick={() => {
              playClickSound();
              setActiveStep('source');
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              activeStep === 'source'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            I Speak: {LANGUAGES.find(l => l.id === source)?.nativeName}
          </button>

          <button
            onClick={() => {
              playClickSound();
              setActiveStep('target');
            }}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              activeStep === 'target'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            I Learn: {LANGUAGES.find(l => l.id === target)?.nativeName}
          </button>
        </div>

        {/* Language Grid */}
        <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1 no-scrollbar">
          {LANGUAGES.map(lang => {
            const isSelected = activeStep === 'source' ? source === lang.id : target === lang.id;
            const isOpposite = activeStep === 'source' ? target === lang.id : source === lang.id;

            return (
              <button
                key={lang.id}
                disabled={isOpposite}
                onClick={() => {
                  playClickSound();
                  triggerHaptic('light');
                  if (activeStep === 'source') {
                    setSource(lang.id);
                    setActiveStep('target');
                  } else {
                    setTarget(lang.id);
                  }
                }}
                className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-purple-600/20 border-purple-400 text-white shadow-md shadow-purple-600/20'
                    : isOpposite
                    ? 'opacity-30 bg-slate-900 border-transparent text-slate-600 pointer-events-none'
                    : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{lang.emoji}</span>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white">{lang.name}</span>
                    <span className="text-[10px] text-slate-400">{lang.nativeName}</span>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-purple-400" />}
              </button>
            );
          })}
        </div>

        {/* Action Button */}
        <button
          onClick={handleSave}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 active:scale-[0.98] text-white font-extrabold text-sm shadow-lg shadow-purple-600/30 transition-all font-['Space_Grotesk']"
        >
          Confirm Languages
        </button>
      </div>
    </div>
  );
};
