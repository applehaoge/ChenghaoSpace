import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { Copy } from 'lucide-react';

interface ResizableConsoleProps {
  isDark: boolean;
  isOpen: boolean;
  height: number;
  onHeightChange: (nextHeight: number) => void;
  onClose: () => void;
  output: string;
  statusLabel?: string;
  statusTone?: 'default' | 'info' | 'success' | 'warning' | 'error';
  statusHint?: string;
  statusState?: 'idle' | 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  onAskAssistant?: (payload: { text: string }) => void;
  minHeight?: number;
  maxHeight?: number;
}

const DEFAULT_MIN_HEIGHT = 140;
const DEFAULT_MAX_HEIGHT = 420;
const SEPARATOR_HEIGHT = 8;
const debugLog = (...args: unknown[]) => {
  // 一律输出，方便排查鼠标事件是否触发（后续可以按需要再关闭）
  // eslint-disable-next-line no-console
  console.debug('[ResizableConsole]', ...args);
};

export function ResizableConsole({
  isDark,
  isOpen,
  height,
  onHeightChange,
  onClose,
  output,
  statusLabel,
  statusTone = 'default',
  statusHint,
  statusState = 'idle',
  onAskAssistant,
  minHeight = DEFAULT_MIN_HEIGHT,
  maxHeight = DEFAULT_MAX_HEIGHT,
}: ResizableConsoleProps) {
  const dragStateRef = useRef<{ startY: number; startHeight: number } | null>(null);
  const copyResetRef = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const constrainedHeight = useMemo(
    () => Math.max(minHeight, Math.min(maxHeight, height)),
    [height, maxHeight, minHeight],
  );
  const indicatorConfigs = useMemo(() => getIndicatorPalette(statusState, isDark), [isDark, statusState]);
  const idleIndicatorColor = isDark ? 'rgba(84, 97, 120, 0.55)' : 'rgba(107, 114, 128, 0.5)';
  const isIndicatorActive = statusState !== 'idle';

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragStateRef.current = {
      startY: event.clientY,
      startHeight: constrainedHeight,
    };
    debugLog('mouse down on separator', { y: event.clientY });
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) {
      dragStateRef.current = null;
      return;
    }

    debugLog('drag start', dragStateRef.current);

    const handleMouseMove = (event: MouseEvent) => {
      if (!dragStateRef.current) return;
      const deltaY = event.clientY - dragStateRef.current.startY;
      const nextHeight = Math.max(
        minHeight,
        Math.min(maxHeight, dragStateRef.current.startHeight - deltaY),
      );
      debugLog('drag move', { clientY: event.clientY, deltaY, nextHeight });
      onHeightChange(nextHeight);
    };

    const handleMouseUp = () => {
      debugLog('drag end');
      setIsDragging(false);
    };

    const previousUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = 'none';

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = previousUserSelect;
    };
  }, [isDragging, maxHeight, minHeight, onHeightChange]);
  useEffect(() => {
    debugLog('isDragging state change', isDragging);
  }, [isDragging]);
  useEffect(() => {
    debugLog('console height update', constrainedHeight);
  }, [constrainedHeight]);

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(output);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = output;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setIsCopied(true);
      if (copyResetRef.current) window.clearTimeout(copyResetRef.current);
      copyResetRef.current = window.setTimeout(() => setIsCopied(false), 1500);
    } catch (error) {
      console.error('[ResizableConsole] copy failed', error);
    }
  };

  useEffect(
    () => () => {
      if (copyResetRef.current) window.clearTimeout(copyResetRef.current);
    },
    [],
  );

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="kids-console"
          initial={{ opacity: 0, y: 24, height: 0 }}
          animate={{ opacity: 1, y: 0, height: constrainedHeight + SEPARATOR_HEIGHT }}
          exit={{ opacity: 0, y: 24, height: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="flex-none flex flex-col"
          style={{ height: constrainedHeight + SEPARATOR_HEIGHT }}
        >
          <div
            role="separator"
            aria-orientation="horizontal"
            aria-label="调整控制台高度"
            onMouseDown={handleMouseDown}
            onMouseEnter={event => debugLog('separator hover', { type: 'enter', y: event.clientY })}
            onMouseLeave={event => debugLog('separator hover', { type: 'leave', y: event.clientY })}
            className={clsx(
              'w-full flex items-center justify-center cursor-ns-resize select-none transition-colors border-t z-10',
              isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-blue-100',
            )}
            style={{ height: SEPARATOR_HEIGHT }}
          >
            <span
              className={clsx(
                'h-1 w-12 rounded-full',
                isDark ? 'bg-gray-600' : 'bg-blue-300',
                isDragging && (isDark ? 'bg-emerald-300' : 'bg-blue-500'),
              )}
            />
          </div>

          <div
            className={clsx(
              'flex-1 overflow-hidden border-t shadow-2xl shadow-black/20 flex flex-col',
              isDark
                ? 'bg-gradient-to-b from-gray-900/95 via-gray-900 to-gray-950/95 border-gray-800 text-emerald-100'
                : 'bg-gradient-to-b from-white via-blue-50 to-blue-100/80 border-blue-100 text-slate-700',
            )}
            style={{ height: constrainedHeight }}
          >
            <div
              className={clsx(
                'px-4 py-2.5 border-b',
                isDark ? 'border-gray-800' : 'border-blue-100/70',
              )}
            >
              <div className="flex items-center justify-between text-[12px] font-medium tracking-wide">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1.5">
                    {indicatorConfigs.map((config, index) => {
                      const indicatorStyle: IndicatorStyle = {};
                      if (statusState === 'running') {
                        indicatorStyle.background = config.base;
                        indicatorStyle.boxShadow = `0 0 8px ${config.base}`;
                        indicatorStyle.animationDelay = `${index * 0.18}s`;
                        indicatorStyle['--indicator-base'] = config.base;
                        indicatorStyle['--indicator-active'] = config.active;
                      } else if (isIndicatorActive) {
                        indicatorStyle.background = config.base;
                        indicatorStyle.boxShadow = `0 0 12px ${config.base}`;
                      } else {
                        indicatorStyle.background = idleIndicatorColor;
                        indicatorStyle.boxShadow = `0 0 4px ${idleIndicatorColor}`;
                      }
                      return (
                        <span
                          key={`${statusState}-${index}`}
                          className={clsx(
                            'h-2 w-2 rounded-full shadow-sm transition-all duration-300',
                            statusState === 'running'
                              ? 'kids-console-indicator'
                              : isIndicatorActive
                                ? 'kids-console-indicator-active'
                                : 'kids-console-indicator-idle',
                            isDark ? 'shadow-black/30' : 'shadow-white/40',
                          )}
                          style={indicatorStyle}
                        />
                      );
                    })}
                  </div>
                  <span className="uppercase tracking-[0.2em]">Console</span>
                  {statusLabel && (
                    <span
                      className={clsx(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] border',
                        getStatusToneClass(statusTone, isDark),
                      )}
                    >
                      {statusLabel}
                    </span>
                  )}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={handleCopy}
                    className={clsx(
                      'inline-flex items-center space-x-1.5 rounded-full px-3 py-0.5 text-[12px] border transition-colors',
                      isDark
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-400/20'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
                    )}
                  >
                    <Copy size={14} />
                    <span>{isCopied ? '已复制' : '复制'}</span>
                  </motion.button>
                </div>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={onClose}
                  className={clsx(
                    'rounded-full px-3 py-0.5 transition-colors border text-[12px]',
                    isDark
                      ? 'border-gray-700/70 bg-gray-800/80 text-blue-200 hover:bg-gray-700'
                      : 'border-blue-200 bg-white text-blue-700 hover:bg-blue-50',
                  )}
                >
                  收起
                </motion.button>
              </div>
              {statusHint && (
                <p
                  className={clsx(
                    'mt-1 text-[11px]',
                    statusTone === 'error'
                      ? isDark
                        ? 'text-rose-200'
                        : 'text-rose-600'
                      : isDark
                        ? 'text-blue-200'
                        : 'text-blue-600',
                  )}
                >
                  {statusHint}
                </p>
              )}
            </div>

            <div
              className={clsx(
                'font-mono text-[12px] px-0 pb-4 flex-1 overflow-y-auto',
                isDark ? 'bg-black/10' : 'bg-white/60',
              )}
              style={{ position: 'relative' }}
            >
              <pre
                className={clsx(
                  'w-full h-full whitespace-pre-wrap px-5 py-4 leading-relaxed tracking-wide rounded-none border-0 m-0',
                  isDark ? 'bg-gray-950/80 text-emerald-200' : 'bg-white text-slate-700 shadow-inner',
                )}
              >
                {output}
              </pre>
              {onAskAssistant && output.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => onAskAssistant({ text: output })}
                  className={clsx(
                    'absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-medium shadow transition-colors',
                    isDark
                      ? 'border-blue-500/40 bg-blue-900/60 text-blue-100 hover:bg-blue-800/80'
                      : 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100',
                  )}
                >
                  向 AI 追问
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const getStatusToneClass = (tone: ResizableConsoleProps['statusTone'], isDark: boolean) => {
  switch (tone) {
    case 'success':
      return isDark ? 'bg-emerald-500/10 text-emerald-200 border-emerald-400/60' : 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'warning':
      return isDark ? 'bg-amber-500/10 text-amber-200 border-amber-400/60' : 'bg-amber-50 text-amber-700 border-amber-200';
    case 'error':
      return isDark ? 'bg-rose-500/10 text-rose-200 border-rose-400/60' : 'bg-rose-50 text-rose-700 border-rose-200';
    case 'info':
      return isDark ? 'bg-blue-500/10 text-blue-200 border-blue-400/70' : 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return isDark ? 'bg-gray-800/80 text-gray-200 border-gray-700/80' : 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

type IndicatorStyle = CSSProperties & {
  '--indicator-base'?: string;
  '--indicator-active'?: string;
};

interface IndicatorConfig {
  base: string;
  active: string;
}

const getIndicatorPalette = (state: ResizableConsoleProps['statusState'], isDark: boolean): IndicatorConfig[] => {
  const palette = (light: string[], dark: string[]): IndicatorConfig[] =>
    (isDark ? dark : light).map((color, idx) => ({
      base: color,
      active: lighten(color, isDark ? 0.35 : 0.2, isDark),
    }));

  switch (state) {
    case 'running':
      return palette(
        ['#2E31A6', '#4338CA', '#4F46E5'],
        ['#4338CA', '#6366F1', '#A5B4FC'],
      );
    case 'queued':
      return palette(
        ['#B45309', '#D97706', '#F97316'],
        ['#D97706', '#F59E0B', '#FCD34D'],
      );
    case 'failed':
    case 'cancelled':
      return palette(
        ['#DC2626', '#E11D48', '#BE185D'],
        ['#F43F5E', '#E879F9', '#C084FC'],
      );
    case 'succeeded':
      return palette(
        ['#0E7490', '#0EA5E9', '#2563EB'],
        ['#0EA5E9', '#3B82F6', '#A78BFA'],
      );
    default:
      return palette(
        ['#475569', '#64748B', '#94A3B8'],
        ['#64748B', '#818CF8', '#94A3B8'],
      );
  }
};

const lighten = (hex: string, delta: number, isDark: boolean) => {
  const factor = isDark ? delta * 0.7 : delta;
  const num = Number.parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + factor * 255));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + factor * 255));
  const b = Math.min(255, Math.max(0, (num & 0xff) + factor * 255));
  return `rgb(${r.toFixed(0)}, ${g.toFixed(0)}, ${b.toFixed(0)})`;
};
