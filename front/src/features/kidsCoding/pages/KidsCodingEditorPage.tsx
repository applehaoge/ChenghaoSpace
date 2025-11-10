import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Star, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '@/hooks/useTheme';
import { KidsCodingEditorHeader } from '@/features/kidsCoding/components/editor/KidsCodingEditorHeader';
import { FileSidebar } from '@/features/kidsCoding/components/editor/FileSidebar';
import { CodeWorkspace } from '@/features/kidsCoding/components/editor/CodeWorkspace';
import { useFileSidebar } from '@/features/kidsCoding/hooks/useFileSidebar';
import type { CodeLineItem, FileEntry } from '@/features/kidsCoding/types/editor';

const FILES: FileEntry[] = [{ id: 'main', name: 'main.py' }];

const DEFAULT_CODE_LINES: CodeLineItem[] = [
  { id: 1, content: 'import matplotlib.pyplot as plt', type: 'code' },
  { id: 2, content: 'import numpy as np', type: 'code' },
  { id: 3, content: '', type: 'empty' },
  { id: 4, content: '# 一个一元二次函数', type: 'comment' },
  { id: 5, content: 'x = np.arange(-5, 5, 0.01)', type: 'code' },
  { id: 6, content: 'y = (x ** 2)', type: 'code' },
  { id: 7, content: '# 画图', type: 'comment' },
  { id: 8, content: 'plt.plot(x, y)', type: 'code' },
  { id: 9, content: 'plt.show()', type: 'code' },
];

export function KidsCodingEditorPage() {
  const { toggleTheme, isDark } = useTheme();
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [showTutorialHint, setShowTutorialHint] = useState(true);
  const { isCollapsed, toggleSidebar } = useFileSidebar();

  useEffect(() => {
    const timer = setTimeout(() => setShowTutorialHint(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 10, 150));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 10, 60));

  const handleRunCode = () => {
    toast.success('代码正在运行中！', {
      description: '这是一个少儿版编辑器，实际运行功能需要后端支持哦～',
      duration: 3000,
      className: 'rounded-xl shadow-lg',
    });
  };

  const handleLineHover = (id: number) => setActiveLine(id);
  const handleLineLeave = () => setActiveLine(null);

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

      <KidsCodingEditorHeader isDark={isDark} toggleTheme={toggleTheme} />

      <div className="relative flex flex-1 overflow-hidden pt-4 gap-4">
        <FileSidebar isDark={isDark} isCollapsed={isCollapsed} onToggle={toggleSidebar} files={FILES} />
        <CodeWorkspace
          isDark={isDark}
          zoomLevel={zoomLevel}
          activeLine={activeLine}
          codeLines={DEFAULT_CODE_LINES}
          onLineHover={handleLineHover}
          onLineLeave={handleLineLeave}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onRunCode={handleRunCode}
        />
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
              <h3 className="font-semibold mb-1">💡 提示</h3>
              <p className="text-sm opacity-90">编写完代码后，点击底部的“运行代码”按钮可以看到你的程序效果哦！</p>
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
