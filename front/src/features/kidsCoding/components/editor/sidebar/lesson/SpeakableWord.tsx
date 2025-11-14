import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { createPortal } from 'react-dom';
import { Volume2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import clsx from 'clsx';
import { getVocabularyCard } from '@/features/kidsCoding/data/vocabulary';
import { VocabularyCard } from './VocabularyCard';

interface SpeakableWordProps {
  word: string;
  isDark: boolean;
  panelRef?: RefObject<HTMLElement | null>;
}

export function SpeakableWord({ word, isDark, panelRef }: SpeakableWordProps) {
  const containerRef = useRef<HTMLSpanElement | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [panelWidth, setPanelWidth] = useState<number>();
  const [cardTop, setCardTop] = useState(0);
  const [cardLeft, setCardLeft] = useState(0);
  const cardContent = useMemo(() => getVocabularyCard(word), [word]);

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'zh-CN';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const updateCardMetrics = useCallback(() => {
    const host = panelRef?.current ?? null;
    if (host && containerRef.current) {
      const nextWidth = host.clientWidth * 0.9;
      setPanelWidth(nextWidth);
      setCardLeft((host.clientWidth - nextWidth) / 2);
      const wordRect = containerRef.current.getBoundingClientRect();
      const hostRect = host.getBoundingClientRect();
      setCardTop(wordRect.bottom - hostRect.top + host.scrollTop - 6);
    } else if (containerRef.current) {
      setPanelWidth(undefined);
      setCardLeft(0);
      setCardTop(containerRef.current.getBoundingClientRect().height - 6);
    }
  }, [panelRef]);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = window.setTimeout(() => {
      hideTimerRef.current = null;
      setIsActive(false);
    }, 200);
  }, [clearHideTimer]);

  useEffect(() => {
    updateCardMetrics();
  }, [updateCardMetrics]);

  useEffect(() => {
    return () => {
      clearHideTimer();
    };
  }, [clearHideTimer]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleMetricsChange = () => {
      updateCardMetrics();
    };

    const host = panelRef?.current ?? null;
    window.addEventListener('resize', handleMetricsChange);
    window.addEventListener('orientationchange', handleMetricsChange);
    host?.addEventListener('scroll', handleMetricsChange);
    window.addEventListener('scroll', handleMetricsChange, true);

    let observer: ResizeObserver | null = null;
    if (host && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => handleMetricsChange());
      observer.observe(host);
    }

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', handleMetricsChange);
      window.removeEventListener('orientationchange', handleMetricsChange);
      host?.removeEventListener('scroll', handleMetricsChange);
      window.removeEventListener('scroll', handleMetricsChange, true);
    };
  }, [panelRef, updateCardMetrics]);

  const overlayStyle: CSSProperties = panelWidth
    ? { width: `${panelWidth}px`, left: `${cardLeft}px`, top: cardTop }
    : { width: 'min(420px, 90vw)', left: '50%', top: cardTop, transform: 'translateX(-50%)' };

  const overlay =
    cardContent && isActive ? (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.15 }}
        className="absolute z-40"
        style={overlayStyle}
        onMouseEnter={() => {
          clearHideTimer();
          setIsActive(true);
        }}
        onMouseLeave={() => scheduleHide()}
      >
        <VocabularyCard content={cardContent} isDark={isDark} onSpeak={handleSpeak} />
      </motion.div>
    ) : null;

  const overlayTree = <AnimatePresence>{overlay}</AnimatePresence>;
  const portalTarget = panelRef?.current ?? null;

  return (
    <>
      <span
        ref={containerRef}
        className="inline-flex flex-col items-center"
        onMouseEnter={() => {
          clearHideTimer();
          setIsActive(true);
          updateCardMetrics();
        }}
        onMouseLeave={() => {
          scheduleHide();
        }}
        onFocus={() => {
          clearHideTimer();
          setIsActive(true);
          updateCardMetrics();
        }}
        onBlur={() => {
          scheduleHide();
        }}
      >
        <button
          type="button"
          onClick={handleSpeak}
          className={clsx(
            'inline-flex items-center gap-1 rounded-full underline decoration-dotted decoration-2 px-2 py-0.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70',
            isDark ? 'text-emerald-200 hover:bg-emerald-500/20' : 'text-emerald-700 hover:bg-emerald-100',
          )}
        >
          <span>{word}</span>
          <Volume2 size={14} />
        </button>
      </span>
      {portalTarget ? createPortal(overlayTree, portalTarget) : overlayTree}
    </>
  );
}
