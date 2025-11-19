import type { ReactNode } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { Upload, ClipboardList, Folder, FileText, FilePlus2, FolderPlus } from 'lucide-react';
import type { SidebarView } from '@/features/kidsCoding/components/editor/sidebar/types';
import type { LessonSummary } from '@/features/kidsCoding/data/lessons';

interface SidebarToolbarProps {
  isDark: boolean;
  activeView: SidebarView;
  onToggleView: () => void;
  lessons: LessonSummary[];
  activeLessonId: string;
  onLessonChange: (lessonId: string) => void;
  onCreatePythonFile: () => void;
  onCreateFolder: () => void;
}

export function SidebarToolbar({
  isDark,
  activeView,
  onToggleView,
  lessons,
  activeLessonId,
  onLessonChange,
  onCreatePythonFile,
  onCreateFolder,
}: SidebarToolbarProps) {
  const isTaskView = activeView === 'tasks';
  const toggleButton = (
    <SidebarViewToggleButton
      isDark={isDark}
      onClick={onToggleView}
      icon={isTaskView ? <Folder size={14} /> : <ClipboardList size={15} />}
      title={isTaskView ? '回到文件' : '查看任务'}
    />
  );

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
          <SidebarIconButton isDark={isDark} icon={<FileText size={16} />} title="main.py" />
        )}
      </div>
      <div className="flex items-center space-x-2">
        {!isTaskView ? (
          <>
            <SidebarIconButton
              isDark={isDark}
              icon={<FilePlus2 size={16} />}
              motionButton
              title="新建 Python 文件"
              onClick={onCreatePythonFile}
            />
            <SidebarIconButton
              isDark={isDark}
              icon={<FolderPlus size={16} />}
              motionButton
              title="新建文件夹"
              onClick={onCreateFolder}
            />
            <SidebarIconButton isDark={isDark} icon={<Upload size={16} />} motionButton title="上传" />
          </>
        ) : null}
        {toggleButton}
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
    <div className="inline-flex items-center gap-1 text-xs font-semibold">
      <select
        className={clsx(
          'bg-transparent focus:outline-none cursor-pointer rounded-full px-2 py-0.5',
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

function SidebarViewToggleButton({
  isDark,
  onClick,
  icon,
  title,
}: {
  isDark: boolean;
  onClick: () => void;
  icon: ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'flex h-8 w-8 items-center justify-center rounded-full transition-colors border',
        isDark
          ? 'border-blue-600 text-blue-200 hover:bg-blue-900/40'
          : 'border-blue-200 text-blue-600 hover:bg-blue-50',
      )}
      title={title}
      aria-label={title}
    >
      {icon}
    </button>
  );
}

interface SidebarIconButtonProps {
  isDark: boolean;
  icon: ReactNode;
  motionButton?: boolean;
  title?: string;
  onClick?: () => void;
}

function SidebarIconButton({ isDark, icon, motionButton = false, title, onClick }: SidebarIconButtonProps) {
  const baseClasses = `p-1.5 rounded-full transition-colors duration-300 ${
    isDark ? 'hover:bg-gray-700' : 'hover:bg-blue-100'
  }`;

  if (motionButton) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={baseClasses}
        title={title}
        onClick={onClick}
        type="button"
      >
        {icon}
      </motion.button>
    );
  }

  return (
    <button className={baseClasses} title={title} onClick={onClick} type="button">
      {icon}
    </button>
  );
}
