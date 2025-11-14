import { Volume2 } from 'lucide-react';
import clsx from 'clsx';

interface SpeakableWordProps {
  word: string;
  isDark: boolean;
}

export function SpeakableWord({ word, isDark }: SpeakableWordProps) {
  const handleSpeak = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'zh-CN';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      type="button"
      onClick={handleSpeak}
      className={clsx(
        'inline-flex items-center gap-1 rounded-full underline decoration-dotted decoration-2 px-2 py-0.5 text-xs font-semibold',
        isDark ? 'text-emerald-200 hover:bg-emerald-500/20' : 'text-emerald-700 hover:bg-emerald-100',
      )}
    >
      <span>{word}</span>
      <Volume2 size={14} />
    </button>
  );
}
