import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
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
  onImportFiles: (files: File[], parentPath?: string) => void;
  currentDirectoryPath?: string;
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
  onImportFiles,
  currentDirectoryPath,
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
            <UploadDropdown
              isDark={isDark}
              onImportFiles={onImportFiles}
              currentDirectoryPath={currentDirectoryPath}
            />
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

interface UploadDropdownProps {
  isDark: boolean;
  onImportFiles: (files: File[], parentPath?: string) => void;
  currentDirectoryPath?: string;
}

function UploadDropdown({ isDark, onImportFiles, currentDirectoryPath }: UploadDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files ? Array.from(event.target.files) : [];
    if (selectedFiles.length) {
      onImportFiles(selectedFiles, currentDirectoryPath);
    }
    event.target.value = '';
    setIsOpen(false);
  };

  const handleUploadFiles = () => {
    fileInputRef.current?.click();
  };

  const handleUploadFolder = () => {
    // webkitdirectory 可能一次返回大量文件，单独 input 避免重复触发
    folderInputRef.current?.click();
  };

  const menuClasses = clsx(
    'absolute right-0 mt-2 w-32 rounded-xl border shadow-lg py-1 text-sm z-10',
    isDark ? 'bg-gray-800 border-gray-700 text-blue-100' : 'bg-white border-blue-200 text-blue-900',
  );

  const menuItemClasses = clsx(
    'w-full text-left px-3 py-2 flex items-center gap-2 rounded-lg transition-colors',
    isDark ? 'hover:bg-gray-700' : 'hover:bg-blue-50',
  );

  return (
    <div className="relative" ref={containerRef}>
      <SidebarIconButton
        isDark={isDark}
        icon={<Upload size={16} />}
        motionButton
        title="上传"
        onClick={() => setIsOpen(prev => !prev)}
      />
      {isOpen ? (
        <div className={menuClasses} role="menu">
          <button type="button" className={menuItemClasses} onClick={handleUploadFiles} role="menuitem">
            上传文件
          </button>
          <button type="button" className={menuItemClasses} onClick={handleUploadFolder} role="menuitem">
            上传文件夹
          </button>
        </div>
      ) : null}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
        aria-hidden
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        webkitdirectory="true"
        className="hidden"
        onChange={handleFileChange}
        aria-hidden
      />
    </div>
  );
}
