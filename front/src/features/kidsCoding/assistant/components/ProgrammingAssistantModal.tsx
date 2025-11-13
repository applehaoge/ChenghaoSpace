import { AnimatePresence, motion } from 'framer-motion';
import { X, Sparkles, BookOpenCheck, GraduationCap, Pencil } from 'lucide-react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useProgrammingAssistant } from '../hooks/useProgrammingAssistant';
import { AssistantTaskBoard } from './AssistantTaskBoard';

interface ProgrammingAssistantModalProps {
  isDark: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export function ProgrammingAssistantModal({ isDark, isOpen, onClose }: ProgrammingAssistantModalProps) {
  const { data, isLoading } = useProgrammingAssistant();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'task' | 'knowledge' | 'practice'>('task');

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/60 backdrop-blur"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={clsx(
              'relative h-[min(620px,90vh)] w-[min(960px,92vw)] overflow-hidden rounded-[28px] border p-5 shadow-[0_25px_60px_rgba(15,23,42,0.35)]',
              isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100',
            )}
          >
            <div
              className={clsx(
                'flex items-center justify-between rounded-[18px] border px-4 py-2',
                isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-slate-50 text-slate-900',
              )}
            >
              <div>
                <p
                  className={clsx(
                    'flex items-center gap-2 text-[11px] uppercase tracking-[0.4em]',
                    isDark ? 'text-blue-200' : 'text-blue-500',
                  )}
                >
                  <Sparkles size={14} />
                  Programming Assistant
                </p>
                <h1 className="text-xl font-semibold">任务指引</h1>
                <p className="text-xs opacity-70">一步步完成，随时可切换知识点 / 练习。</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={clsx(
                  'rounded-full border p-2',
                  isDark ? 'border-slate-700 text-white hover:bg-slate-700' : 'border-slate-300 text-slate-500 hover:bg-slate-100',
                )}
              >
                <X size={20} />
              </button>
            </div>

            <nav
              className={clsx(
                'mt-3 flex gap-2 overflow-x-auto rounded-[16px] border px-2 py-1 text-sm',
                isDark ? 'border-slate-700 bg-slate-800 text-white' : 'border-slate-200 bg-slate-50 text-slate-700',
              )}
            >
              {[
                { id: 'task', label: '任务指引', icon: <BookOpenCheck size={16} />, disabled: false },
                { id: 'knowledge', label: '知识点', icon: <GraduationCap size={16} />, disabled: true },
                { id: 'practice', label: '练习答题', icon: <Pencil size={16} />, disabled: true },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    if (tab.disabled) return;
                    setActiveTab(tab.id as typeof activeTab);
                  }}
                  title={tab.disabled ? '即将上线' : undefined}
                  className={clsx(
                    'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition',
                    activeTab === tab.id
                      ? isDark
                        ? 'bg-slate-700 text-white shadow'
                        : 'bg-white text-slate-900 shadow'
                      : tab.disabled
                        ? 'text-slate-400 cursor-not-allowed'
                        : isDark
                          ? 'text-slate-200 hover:bg-slate-700/50'
                          : 'text-slate-500 hover:bg-white',
                  )}
                  disabled={tab.disabled}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </nav>

            <div
              className={clsx(
                'mt-3 h-[calc(100%-170px)] overflow-hidden rounded-[20px] border px-4 py-3',
                isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white',
              )}
            >
              {isLoading || !data ? (
                <div className="flex h-full items-center justify-center text-slate-500">正在加载素材...</div>
              ) : activeTab === 'task' ? (
                <AssistantTaskBoard hero={data.hero} gallery={data.gallery.slice(0, 2)} highlights={data.highlights} />
              ) : (
                <div className={clsx('flex h-full flex-col items-center justify-center gap-2', isDark ? 'text-slate-200' : 'text-slate-500')}>
                  <Sparkles size={28} />
                  <p>该板块即将上线，敬请期待～</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
