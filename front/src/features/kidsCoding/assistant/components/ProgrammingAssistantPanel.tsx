import { AnimatePresence, motion } from 'framer-motion';
import { BookOpenCheck, ClipboardList, GraduationCap, PlayCircle, Search } from 'lucide-react';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAssistantResources } from '../hooks/useAssistantResources';
import { TaskBriefPanel } from './TaskBriefPanel';
import { ResourceLibraryPanel } from './ResourceLibraryPanel';
import { PracticeHubPanel } from './PracticeHubPanel';
import { KnowledgeSearchPanel } from './KnowledgeSearchPanel';

type AssistantTab = 'tasks' | 'resources' | 'practice' | 'knowledge';

const tabs: Array<{ id: AssistantTab; label: string; icon: React.ReactNode }> = [
  { id: 'tasks', label: '任务提示', icon: <ClipboardList size={16} /> },
  { id: 'resources', label: '教学资源', icon: <PlayCircle size={16} /> },
  { id: 'practice', label: '练习题', icon: <BookOpenCheck size={16} /> },
  { id: 'knowledge', label: '知识点', icon: <GraduationCap size={16} /> },
];

interface ProgrammingAssistantPanelProps {
  isDark: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export function ProgrammingAssistantPanel({ isDark, isOpen, onClose }: ProgrammingAssistantPanelProps) {
  const [activeTab, setActiveTab] = useState<AssistantTab>('tasks');
  const { data, isLoading, error, refresh } = useAssistantResources();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={clsx(
            'pointer-events-auto fixed right-10 top-28 z-[999] flex w-[360px] flex-col rounded-3xl border shadow-2xl',
            isDark ? 'border-blue-900/60 bg-gray-900/95' : 'border-blue-100 bg-white/95',
          )}
        >
          <header
            className={clsx(
              'flex items-center justify-between rounded-t-3xl px-5 py-4',
              isDark ? 'bg-gray-800/70' : 'bg-blue-50/70',
            )}
          >
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-blue-400">Assistant</p>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">编程助手</h2>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ rotate: 20 }}
                className={clsx(
                  'rounded-full border px-3 py-1 text-xs font-medium',
                  isDark ? 'border-blue-800 text-blue-200' : 'border-blue-200 text-blue-600',
                )}
                onClick={refresh}
              >
                刷新
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                className={clsx(
                  'rounded-full px-2 py-1 text-sm font-medium',
                  isDark ? 'text-slate-200 hover:bg-gray-700/80' : 'text-slate-500 hover:bg-blue-100',
                )}
                onClick={onClose}
              >
                关闭
              </motion.button>
            </div>
          </header>

          <div className="border-b px-4 py-2">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={clsx(
                    'inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? isDark
                        ? 'bg-blue-600/40 text-blue-50'
                        : 'bg-blue-600 text-white'
                      : isDark
                        ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
            {error && (
              <div
                className={clsx(
                  'rounded-2xl border px-3 py-2 text-sm',
                  isDark ? 'border-rose-500/30 bg-rose-500/10 text-rose-200' : 'border-rose-200 bg-rose-50 text-rose-600',
                )}
              >
                加载内容失败：{error.message}
              </div>
            )}
            {activeTab === 'tasks' && (
              <TaskBriefPanel tasks={data?.tasks ?? []} isDark={isDark} isLoading={isLoading} />
            )}
            {activeTab === 'resources' && (
              <ResourceLibraryPanel resources={data?.resources ?? []} isDark={isDark} isLoading={isLoading} />
            )}
            {activeTab === 'practice' && (
              <PracticeHubPanel practice={data?.practice ?? []} isDark={isDark} isLoading={isLoading} />
            )}
            {activeTab === 'knowledge' && (
              <KnowledgeSearchPanel notes={data?.knowledge ?? []} isDark={isDark} isLoading={isLoading} />
            )}
            {!isLoading && !data && !error && (
              <div className="text-sm text-slate-500 dark:text-slate-300">暂无可用的编程助手资源。</div>
            )}
          </div>

          <footer
            className={clsx(
              'flex items-center justify-between rounded-b-3xl px-5 py-3 text-xs',
              isDark ? 'bg-gray-800/70 text-slate-300' : 'bg-blue-50/70 text-slate-600',
            )}
          >
            <span className="inline-flex items-center gap-1">
              <Search size={14} />
              支持搜索函数/知识点
            </span>
            <span>可上传图文 · 音乐 · 视频</span>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
