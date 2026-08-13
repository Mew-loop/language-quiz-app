import { Language } from '../types';

export const LANGUAGES: Language[] = [
  { id: 0, code: 'fa', name: 'Persian', nativeName: 'فارسی', emoji: '🇮🇷', ttsCode: 'fa', isRTL: true },
  { id: 1, code: 'en', name: 'English', nativeName: 'English', emoji: '🇬🇧', ttsCode: 'en' },
  { id: 2, code: 'ja', name: 'Japanese', nativeName: '日本語', emoji: '🇯🇵', ttsCode: 'ja' },
  { id: 3, code: 'zh', name: 'Chinese', nativeName: '中文', emoji: '🇨🇳', ttsCode: 'zh' },
  { id: 4, code: 'de', name: 'German', nativeName: 'Deutsch', emoji: '🇩🇪', ttsCode: 'de' },
  { id: 5, code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', emoji: '🇮🇳', ttsCode: 'hi' },
  { id: 6, code: 'es', name: 'Spanish', nativeName: 'Español', emoji: '🇪🇸', ttsCode: 'es' },
  { id: 7, code: 'ar', name: 'Arabic', nativeName: 'العربية', emoji: '🇸🇦', ttsCode: 'ar', isRTL: true },
  { id: 8, code: 'ru', name: 'Russian', nativeName: 'Русский', emoji: '🇷🇺', ttsCode: 'ru' }
];

export const CATEGORIES = [
  { id: 'all', name: 'All Words', icon: '✨' },
  { id: 'General', name: 'Core Essentials', icon: '💎' },
  { id: 'Travel', name: 'Travel & City', icon: '✈️' },
  { id: 'Business', name: 'Work & Business', icon: '💼' },
  { id: 'Tech', name: 'Tech & Modern', icon: '💻' },
  { id: 'Daily Life', name: 'Daily Life', icon: '☕' },
  { id: 'Emotions', name: 'Feelings & Traits', icon: '🧠' },
  { id: 'Slang', name: 'Slang & Idioms', icon: '🔥' },
];
