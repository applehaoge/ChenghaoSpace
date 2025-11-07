import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { RefObject } from 'react';

import {
  ACTION_LINK_CLASS,
  SECTION_HEADER_CLASS,
  SECTION_LABEL_CLASS,
} from '@/features/kidsCoding/constants/learningCenter';

const CODE_SAMPLE = `# AI 国度修复计划 - 任务 01：认识你的 AI 助手
# 欢迎来到 AI 国度！这个世界需要你的帮助来修复损坏的 AI 系统
class AIAssistant:
    def __init__(self, name):
        self.name = name
        self.energy = 100
        self.knowledge = 0

    def greet(self):
        print(f"你好，我是 {self.name}，你的 AI 助手。")
        print("很高兴能和你一起修复 AI 国度！")

    def learn(self, points):
        self.knowledge += points
        print(f"我学到了新知识！当前知识值：{self.knowledge}")

    def work(self):
        if self.energy > 0:
            self.energy -= 10
            print(f"{self.name} 正在努力工作……")
            print(f"剩余能量：{self.energy}")
        else:
            print(f"{self.name} 太累啦，需要休息！")

    def rest(self):
        self.energy = min(100, self.energy + 20)
        print(f"{self.name} 充好电啦！当前能量：{self.energy}")

assistant = AIAssistant("小智")
assistant.greet()
assistant.learn(15)
assistant.work()
assistant.rest()
`;

const CONSOLE_SAMPLE = `你好，我是 小智，你的 AI 助手。
很高兴能和你一起修复 AI 国度！
我学到了新知识！当前知识值：15
小智 正在努力工作……
剩余能量：90
小智 充好电啦！当前能量：100`;

interface CodePanelProps {
  isRunning: boolean;
  isConsoleOpen: boolean;
  consoleRef: RefObject<HTMLDivElement>;
  onToggleConsole: () => void;
  onRunCode: () => void;
  onReset: () => void;
  onSave: () => void;
  onFormat: () => void;
  onOpenAssistant: () => void;
}

export function CodePanel({
  isRunning,
  isConsoleOpen,
  consoleRef,
  onToggleConsole,
  onRunCode,
  onReset,
  onSave,
  onFormat,
  onOpenAssistant,
}: CodePanelProps) {
  return (
    <>
      <div className={clsx(SECTION_HEADER_CLASS, 'gap-3 lg:px-5')}>
        <div className="flex flex-wrap items-center gap-3">
          <span className={SECTION_LABEL_CLASS}>代码编辑器</span>
          <button type="button" onClick={onToggleConsole} className={ACTION_LINK_CLASS}>
            {isConsoleOpen ? '隐藏控制台' : '查看控制台'}
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onSave}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <i className="fa-solid fa-floppy-disk me-2" />
            保存进度
          </button>
          <button
            type="button"
            onClick={onFormat}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <i className="fa-solid fa-wand-magic-sparkles me-2" />
            自动格式化
          </button>
          <button
            type="button"
            onClick={onOpenAssistant}
            className="rounded-xl border border-blue-200 px-4 py-2 text-sm text-blue-600 transition hover:bg-blue-50 dark:border-blue-900/40 dark:text-blue-400 dark:hover:bg-blue-900/20"
          >
            <i className="fa-solid fa-robot me-2" />
            编程助手
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-hidden px-5 pb-4 pt-4">
        <div className="relative flex-1 min-h-0 overflow-auto rounded-2xl bg-slate-950/95 shadow-inner scrollbar-hidden">
          <pre className="h-full rounded-2xl bg-transparent p-6 pb-28 text-[13px] leading-relaxed text-green-200">
            {CODE_SAMPLE}
          </pre>
          <ConsoleOverlay isOpen={isConsoleOpen} consoleRef={consoleRef} />
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col gap-3 px-5 py-4 text-xs text-slate-500 dark:text-slate-400 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <span>
                <i className="fa-solid fa-shield-halved me-1 text-emerald-500" />
                通过 2 项安全检查
              </span>
              <span>
                <i className="fa-solid fa-sparkles me-1 text-amber-400" />
                使用注释记录关键点
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onReset}
                className="rounded-xl px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                重置
              </button>
              <button
                type="button"
                onClick={onRunCode}
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                disabled={isRunning}
              >
                <i className="fa-solid fa-play" />
                {isRunning ? '运行中…' : '运行代码'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

interface ConsoleOverlayProps {
  isOpen: boolean;
  consoleRef: RefObject<HTMLDivElement>;
}

function ConsoleOverlay({ isOpen, consoleRef }: ConsoleOverlayProps) {
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
            <pre>{CONSOLE_SAMPLE}</pre>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
