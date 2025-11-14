import type { ReactNode } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { Plus, Upload, Download, ClipboardList, Folder, FileText } from 'lucide-react';
import type { SidebarView } from '@/features/kidsCoding/components/editor/sidebar/types';
import type { LessonSummary } from '@/features/kidsCoding/data/lessons';

interface SidebarToolbarProps {
  isDark: boolean;
  activeView: SidebarView;
  onToggleView: () => void;
  lessons: LessonSummary[];
  activeLessonId: string;
  onLessonChange: (lessonId: string) => void;
}

export function SidebarToolbar({
  isDark,
  activeView,
  onToggleView,
  lessons,
  activeLessonId,
  onLessonChange,
}: SidebarToolbarProps) {
  const isTaskView = activeView === 'tasks';

  return (
    <div
      className={`px-3 py-2 flex justify-between items-center border-b ${
        isDark ? 'border-gray-700' : 'border-blue-200'
      }`}
    >
      <div className="flex items-center space-x-2">
        {isTaskView ? (
          <LessonSelector
            isDark={isDark}
            lessons={lessons}
            activeLessonId={activeLessonId}
            onLessonChange={onLessonChange}
          />
        ) : (
          <>
            <SidebarIconButton isDark={isDark} icon={<FileText size={16} />} title="main.py" />
            <button
              type="button"
              onClick={onToggleView}
              className={clsx(
                'flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-300',
                isDark
                  ? 'bg-blue-900/40 text-blue-200 hover:bg-blue-800/60'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200',
              )}
              title="切换到任务视图"
            >
              <ClipboardList size={15} />
              查看任务
            </button>
          </>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {isTaskView ? (
          <SidebarReturnButton isDark={isDark} onClick={onToggleView} />
        ) : (
          <>
            <SidebarIconButton isDark={isDark} icon={<Plus size={16} />} motionButton title="新建文件" />
            <SidebarIconButton isDark={isDark} icon={<Upload size={16} />} motionButton title="上传" />
            <SidebarIconButton isDark={isDark} icon={<Download size={16} />} motionButton title="下载" />
          </>
        )}
      </div>
    </div>
  );
}

function LessonSelector({
  isDark,
  lessons,
  activeLessonId,
  onLessonChange,
}: {
  isDark: boolean;
  lessons: LessonSummary[];
  activeLessonId: string;
  onLessonChange: (lessonId: string) => void;
}) {
  return (
    <div
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold',
        isDark ? 'bg-blue-900/50 text-blue-100' : 'bg-blue-100 text-blue-700',
      )}
    >
      <ClipboardList size={16} />
      <select
        className={clsx(
          'bg-transparent text-sm font-semibold focus:outline-none cursor-pointer',
          isDark ? 'text-blue-100' : 'text-blue-700',
        )}
        value={activeLessonId}
        onChange={event => onLessonChange(event.target.value)}
      >
        {lessons.map(lesson => (
          <option key={lesson.id} value={lesson.id} className="text-slate-800">
            {lesson.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SidebarReturnButton({ isDark, onClick }: { isDark: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'flex h-10 w-10 items-center justify-center rounded-full shadow transition-colors',
        isDark ? 'bg-blue-700/60 text-blue-100 hover:bg-blue-600/70' : 'bg-blue-500 text-white hover:bg-blue-600',
      )}
      title="回到文件"
      aria-label="回到文件"
    >
      <Folder size={15} />
    </button>
  );
}

interface SidebarIconButtonProps {
  isDark: boolean;
  icon: ReactNode;
  motionButton?: boolean;
  title?: string;
}

function SidebarIconButton({ isDark, icon, motionButton = false, title }: SidebarIconButtonProps) {
  const baseClasses = `p-1.5 rounded-full transition-colors duration-300 ${
    isDark ? 'hover:bg-gray-700' : 'hover:bg-blue-100'
  }`;

  if (motionButton) {
    return (
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={baseClasses} title={title}>
        {icon}
      </motion.button>
    );
  }

  return (
    <button className={baseClasses} title={title}>
      {icon}
    </button>
  );
}
