import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { RefObject } from 'react';

import { ACTION_LINK_CLASS } from '@/features/kidsCoding/constants/learningCenter';

interface CodePanelProps {
  className?: string;
  codeSample: string;
  consoleSample: string;
  isRunning: boolean;
  isConsoleOpen: boolean;
  consoleRef: RefObject<HTMLDivElement>;
  onToggleConsole: () => void;
  onRunCode: () => void;
  onReset: () => void;
}

export function CodePanel({
  className,
  codeSample,
  consoleSample,
  isRunning,
  isConsoleOpen,
  consoleRef,
  onToggleConsole,
  onRunCode,
  onReset,
}: CodePanelProps) {
  return (
    <section
      className={clsx(
        'flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 text-slate-100 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.9)]',
        className,
      )}
    >
      <div className="flex flex-1 flex-col gap-4 overflow-hidden px-6 pb-5 pt-6">
        <div className="relative flex-1 min-h-0 overflow-auto rounded-2xl bg-slate-950 shadow-inner scrollbar-hidden">
          <pre className="h-full rounded-2xl bg-transparent p-6 pb-28 text-[13px] leading-relaxed text-green-200">
            {codeSample}
          </pre>
          <ConsoleOverlay isOpen={isConsoleOpen} consoleRef={consoleRef} consoleSample={consoleSample} />
        </div>

        <div className="border-t border-white/10 pt-4">
          <div className="flex flex-col gap-3 text-xs text-slate-300 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <span>
                <i className="fa-solid fa-shield-halved me-1 text-emerald-300" />
                通过 2 项安全检查
              </span>
              <span>
                <i className="fa-solid fa-sparkles me-1 text-amber-300" />
                使用注释记录关键点
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onReset}
                className="rounded-xl px-4 py-2 text-sm text-slate-100 transition hover:bg-white/10"
              >
                重置
              </button>
              <div className="flex flex-col items-start gap-1">
                <button
                  type="button"
                  onClick={onRunCode}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-400"
                  disabled={isRunning}
                >
                  <i className="fa-solid fa-play" />
                  {isRunning ? '运行中…' : '运行代码'}
                </button>
                <button type="button" onClick={onToggleConsole} className={ACTION_LINK_CLASS}>
                  {isConsoleOpen ? '隐藏控制台' : '查看控制台'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface ConsoleOverlayProps {
  isOpen: boolean;
  consoleSample: string;
  consoleRef: RefObject<HTMLDivElement>;
}

function ConsoleOverlay({ isOpen, consoleRef, consoleSample }: ConsoleOverlayProps) {
  return (
    <AnimatePresence initial={false}>
      {isOpen ? (
        <motion.div
          key="console-overlay"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-auto absolute inset-x-0 bottom-0 overflow-hidden rounded-t-2xl border-t border-slate-800 bg-slate-950/95"
        >
          <div className="flex items-center gap-2 px-5 py-3 text-xs text-slate-300">
            <i className="fa-solid fa-terminal text-emerald-400" />
            <span>输出控制台</span>
          </div>
          <div ref={consoleRef} className="max-h-60 overflow-auto px-5 pb-5 text-[12px] text-green-200">
            <pre>{consoleSample}</pre>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
