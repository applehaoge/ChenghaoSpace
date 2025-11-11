import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/hooks/useTheme';
import { KidsCodingEditorHeader } from '@/features/kidsCoding/components/editor/KidsCodingEditorHeader';
import { FileSidebar } from '@/features/kidsCoding/components/editor/FileSidebar';
import { CodeWorkspace } from '@/features/kidsCoding/components/editor/CodeWorkspace';
import { InsightsSidebar } from '@/features/kidsCoding/components/editor/InsightsSidebar';
import { useFileSidebar } from '@/features/kidsCoding/hooks/useFileSidebar';
import { useInsightsSidebar } from '@/features/kidsCoding/hooks/useInsightsSidebar';
import { useRunJob } from '@/features/kidsCoding/hooks/useRunJob';

import type { FileEntry } from '@/features/kidsCoding/types/editor';

const FILES: FileEntry[] = [{ id: 'main', name: 'main.py' }];

const DEFAULT_CODE = [
  'import matplotlib.pyplot as plt',
  'import numpy as np',
  '',
  '# 一个一元二次函数',
  'x = np.arange(-5, 5, 0.01)',
  'y = (x ** 2)',
  '',
  '# 画图',
  'plt.plot(x, y)',
  'plt.show()',
].join('\n');

export function KidsCodingEditorPage() {
  const { toggleTheme, isDark } = useTheme();
  const [zoomLevel, setZoomLevel] = useState(100);
  const [codeValue, setCodeValue] = useState(DEFAULT_CODE);
  const [showTutorialHint, setShowTutorialHint] = useState(true);
  const { isCollapsed, toggleSidebar } = useFileSidebar();
  const { isCollapsed: isInsightsCollapsed, toggleSidebar: toggleInsightsSidebar } = useInsightsSidebar();
  const { runCode, runState, isRunning } = useRunJob();

  useEffect(() => {
    const timer = setTimeout(() => setShowTutorialHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 10, 60));

  const handleRunCode = (source: string) => {
    runCode(source).catch(error => {
      toast.error('运行任务提交失败', {
        description: error instanceof Error ? error.message : '请稍后再试',
        duration: 4000,
        className: 'rounded-xl shadow-lg',
      });
    });
  };

  const monacoTheme = isDark ? 'vs-dark' : 'vs-light';

  return (
    <div
      className={`kids-coding-editor flex flex-col h-screen overflow-hidden transition-colors duration-300 ${
        isDark ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 to-blue-100'
      } relative`}
    >
      <FloatingDeco delay={0} duration={5}>
        <Star size={16} className={`absolute top-[15%] left-[5%] ${isDark ? 'text-yellow-300' : 'text-yellow-500'}`} />
      </FloatingDeco>
      <FloatingDeco delay={1} duration={7}>
        <Sparkles
          size={14}
          className={`absolute top-[30%] right-[8%] ${isDark ? 'text-blue-300' : 'text-blue-500'}`}
        />
      </FloatingDeco>
      <FloatingDeco delay={2} duration={6}>
        <Trophy
          size={18}
          className={`absolute bottom-[20%] left-[10%] ${isDark ? 'text-amber-300' : 'text-amber-500'}`}
        />
      </FloatingDeco>
      <ShootingStar isDark={isDark} top="18%" left="22%" delay={1.5} length={64} yTravel={140} />
      <ShootingStar isDark={isDark} top="65%" left="55%" delay={4} duration={3} repeatDelay={9} length={72} yTravel={160} />

      <KidsCodingEditorHeader isDark={isDark} toggleTheme={toggleTheme} />

      <div className="relative flex flex-1 overflow-hidden pt-4 gap-3 xl:gap-4 min-w-0">
        <FileSidebar isDark={isDark} isCollapsed={isCollapsed} onToggle={toggleSidebar} files={FILES} />
        <div className="flex flex-1 gap-3 xl:gap-4 min-w-0">
          <CodeWorkspace
            isDark={isDark}
            zoomLevel={zoomLevel}
            codeValue={codeValue}
            onCodeChange={setCodeValue}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onRunCode={handleRunCode}
            editorTheme={monacoTheme}
            runState={runState}
            isRunBusy={isRunning}
          />
          <InsightsSidebar
            isDark={isDark}
            isCollapsed={isInsightsCollapsed}
            onToggle={toggleInsightsSidebar}
          />
        </div>
      </div>

      {showTutorialHint && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`absolute bottom-28 left-4 max-w-xs p-4 rounded-2xl shadow-2xl ${
            isDark ? 'bg-blue-900/90 text-blue-100' : 'bg-blue-500/95 text-white'
          } backdrop-blur-sm`}
        >
          <div className="flex items-start space-x-3">
            <Sparkles size={20} className="mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">?? 提示</h3>
              <p className="text-sm opacity-90">编写完代码后，点击底部的“运行代码”按钮可以看到你的程序效果哦～</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function FloatingDeco({
  children,
  delay = 0,
  duration = 6,
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none opacity-70"
      initial={{ y: 0 }}
      animate={{ y: [0, -10, 0] }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: 'reverse',
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}

function ShootingStar({
  top,
  left,
  delay = 0,
  duration = 2.6,
  repeatDelay = 8,
  isDark,
  angleClass = 'rotate-15',
  length = 60,
  yTravel = 130,
}: {
  top: string;
  left: string;
  delay?: number;
  duration?: number;
  repeatDelay?: number;
  isDark: boolean;
  angleClass?: string;
  length?: number;
  yTravel?: number;
}) {
  const trailColor = isDark ? 'from-blue-200/60 to-transparent' : 'from-white/90 to-transparent';
  const headColor = isDark ? 'bg-blue-100' : 'bg-white';

  return (
    <motion.div
      className={`absolute pointer-events-none ${angleClass}`}
      style={{ top, left }}
      initial={{ opacity: 0, x: -120, y: -60 }}
      animate={{ opacity: [0, 1, 0], x: 260, y: yTravel }}
      transition={{
        duration,
        repeat: Infinity,
        repeatType: 'loop',
        repeatDelay,
        ease: 'easeInOut',
        delay,
      }}
    >
      <div
        className={`relative h-0.5 rounded-full bg-gradient-to-r ${trailColor}`}
        style={{ width: `${length}px` }}
      >
        <span className={`absolute right-0 -top-0.5 h-1 w-1 rounded-full shadow ${headColor}`} />
      </div>
    </motion.div>
  );
}








