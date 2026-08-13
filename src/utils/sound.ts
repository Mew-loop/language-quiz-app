// Web Audio API Synthesizer & TTS Engine

let audioContext: AudioContext | null = null;
let currentTTSAudio: HTMLAudioElement | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioContext) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) {
      audioContext = new AudioCtx();
    }
  }
  if (audioContext && audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
}

export function playClickSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.04);
    
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.04);
  } catch {
    // ignore
  }
}

export function playCorrectSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // 2-tone melodic harmonic chime (E5 -> B5)
    [
      { freq: 659.25, time: 0, dur: 0.18 },
      { freq: 987.77, time: 0.08, dur: 0.25 },
      { freq: 1318.51, time: 0.16, dur: 0.35 }
    ].forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + time);
      
      gain.gain.setValueAtTime(0.12, now + time);
      gain.gain.exponentialRampToValueAtTime(0.001, now + time + dur);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  } catch {
    // ignore
  }
}

export function playWrongSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.22);
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.22);
  } catch {
    // ignore
  }
}

export function playLevelUpSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Victory fanfare arpeggio: C5, E5, G5, C6
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      
      gain.gain.setValueAtTime(0.15, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.4);
    });
  } catch {
    // ignore
  }
}

export function playChestOpenSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    // Sparkle chime
    const freqs = [880, 1108.73, 1318.51, 1760];
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + i * 0.06);
      gain.gain.setValueAtTime(0.12, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + i * 0.06 + 0.35);
    });
  } catch {
    // ignore
  }
}

// Telegram WebApp Haptic Feedback
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error') {
  try {
    const tg = (window as unknown as { Telegram?: { WebApp?: { HapticFeedback?: {
      impactOccurred: (style: string) => void;
      notificationOccurred: (type: string) => void;
    }} }}).Telegram?.WebApp?.HapticFeedback;

    if (!tg) return;

    if (type === 'light' || type === 'medium' || type === 'heavy') {
      tg.impactOccurred(type);
    } else {
      tg.notificationOccurred(type);
    }
  } catch {
    // fallback ignore
  }
}

// Text to Speech playback with radar ripple trigger
export function playTTSAudio(
  text: string,
  langCode: string,
  onStart?: () => void,
  onEnd?: () => void
) {
  if (!text) return;

  // Clean text from syntax asterisks
  const clean = text.replace(/\*/g, '').trim();

  // Stop any active audio
  if (currentTTSAudio) {
    try {
      currentTTSAudio.pause();
      currentTTSAudio.currentTime = 0;
    } catch {}
    currentTTSAudio = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }

  onStart?.();

  // Google Translate TTS URL
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=gtx&tl=${encodeURIComponent(langCode || 'en')}&q=${encodeURIComponent(clean)}`;
  const audio = new Audio(url);
  currentTTSAudio = audio;

  let hasEnded = false;
  const finish = () => {
    if (hasEnded) return;
    hasEnded = true;
    currentTTSAudio = null;
    onEnd?.();
  };

  const timer = setTimeout(fallbackToSpeechSynthesis, 3000);

  function fallbackToSpeechSynthesis() {
    clearTimeout(timer);
    if (hasEnded) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const u = new SpeechSynthesisUtterance(clean);
        u.lang = langCode === 'fa' ? 'fa-IR' : langCode === 'ja' ? 'ja-JP' : langCode === 'zh' ? 'zh-CN' : langCode === 'de' ? 'de-DE' : langCode === 'es' ? 'es-ES' : langCode === 'ar' ? 'ar-SA' : langCode === 'ru' ? 'ru-RU' : 'en-US';
        u.rate = 0.9;
        u.onend = finish;
        u.onerror = finish;
        window.speechSynthesis.speak(u);
      } catch {
        finish();
      }
    } else {
      finish();
    }
  }

  audio.oncanplay = () => {
    clearTimeout(timer);
  };

  audio.onended = () => {
    clearTimeout(timer);
    finish();
  };

  audio.onerror = () => {
    clearTimeout(timer);
    fallbackToSpeechSynthesis();
  };

  try {
    const p = audio.play();
    if (p !== undefined) {
      p.catch(() => {
        clearTimeout(timer);
        fallbackToSpeechSynthesis();
      });
    }
  } catch {
    clearTimeout(timer);
    fallbackToSpeechSynthesis();
  }
}
