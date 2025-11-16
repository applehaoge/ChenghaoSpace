import { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { FILE_PANEL_COLLAPSED_WIDTH, FILE_PANEL_WIDTH } from '@/features/kidsCoding/constants/editorLayout';
import type { FileEntry } from '@/features/kidsCoding/types/editor';
import { SidebarToolbar } from '@/features/kidsCoding/components/editor/sidebar/SidebarToolbar';
import { FileListPanel } from '@/features/kidsCoding/components/editor/sidebar/FileListPanel';
import { LessonTaskPanel } from '@/features/kidsCoding/components/editor/sidebar/lesson';
import { TaskVideoDialog } from '@/features/kidsCoding/components/editor/sidebar/TaskVideoDialog';
import type { SidebarView } from '@/features/kidsCoding/components/editor/sidebar/types';
import { useLessonSlides } from '@/features/kidsCoding/hooks/useLessonSlides';

export type { SidebarView };

interface FileSidebarProps {
  isDark: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
  files: FileEntry[];
  activeFileId?: string;
  onSelectFile: (entryId: string) => void;
  onCreatePythonFile: (name?: string) => FileEntry;
  onCreateFolder: (name?: string) => FileEntry;
  onRenameEntry: (entryId: string, name: string) => void;
  onRemoveEntry: (entryId: string) => void;
  onEarnTokens?: (amount: number) => void;
}

export function FileSidebar({
  isDark,
  isCollapsed,
  onToggle,
  files,
  activeFileId,
  onSelectFile,
  onCreatePythonFile,
  onCreateFolder,
  onRenameEntry,
  onRemoveEntry,
  onEarnTokens,
}: FileSidebarProps) {
  const [activeView, setActiveView] = useState<SidebarView>('tasks');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const {
    lesson,
    lessonId,
    lessons,
    activeSlide,
    quizState,
    quizQuestion,
    quizQuestionIndex,
    quizQuestionTotal,
    quizQuestionState,
    goToNextSlide,
    goToPreviousSlide,
    goToNextQuestion,
    goToPreviousQuestion,
    markCurrentQuestion,
    changeLesson,
    isVideoOpen,
    openVideo,
    closeVideo,
  } = useLessonSlides({ onEarnTokens });

  const handleToggleView = () => {
    setActiveView(prev => (prev === 'tasks' ? 'files' : 'tasks'));
  };

  const beginEditing = useCallback((entry: FileEntry) => {
    setEditingEntryId(entry.id);
    setEditingValue(entry.name);
  }, []);

  const handleCommitEditing = useCallback(() => {
    if (!editingEntryId) return;
    const trimmed = editingValue.trim();
    if (trimmed) {
      onRenameEntry(editingEntryId, trimmed);
    }
    setEditingEntryId(null);
    setEditingValue('');
  }, [editingEntryId, editingValue, onRenameEntry]);

  const handleCancelEditing = useCallback(() => {
    setEditingEntryId(null);
    setEditingValue('');
  }, []);
  const handleRemoveEntry = useCallback(
    (entry: FileEntry) => {
      if (editingEntryId === entry.id) {
        handleCancelEditing();
      }
      onRemoveEntry(entry.id);
    },
    [editingEntryId, handleCancelEditing, onRemoveEntry],
  );

  const handleRequestRename = useCallback(
    (entry: FileEntry) => {
      if (editingEntryId && editingEntryId !== entry.id) {
        handleCommitEditing();
      }
      beginEditing(entry);
    },
    [beginEditing, editingEntryId, handleCommitEditing],
  );

  const handleCreatePythonEntry = useCallback(() => {
    if (editingEntryId) {
      handleCommitEditing();
    }
    const entry = onCreatePythonFile();
    beginEditing(entry);
  }, [beginEditing, editingEntryId, handleCommitEditing, onCreatePythonFile]);

  const handleCreateFolderEntry = useCallback(() => {
    if (editingEntryId) {
      handleCommitEditing();
    }
    const entry = onCreateFolder();
    beginEditing(entry);
  }, [beginEditing, editingEntryId, handleCommitEditing, onCreateFolder]);

  const handleSelectEntry = useCallback(
    (entry: FileEntry) => {
      if (entry.kind === 'folder') return;
      if (editingEntryId && editingEntryId !== entry.id) {
        handleCommitEditing();
      }
      onSelectFile(entry.id);
    },
    [editingEntryId, handleCommitEditing, onSelectFile],
  );

  return (
    <>
      <motion.div
        initial={false}
        animate={{
          opacity: isCollapsed ? 0.85 : 1,
          scale: isCollapsed ? 0.98 : 1,
        }}
        transition={{ duration: 0.4 }}
        className={`relative flex flex-col border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white/90 border-blue-200'
        } backdrop-blur-sm shadow-xl rounded-3xl overflow-hidden`}
        data-file-panel-root="files-panel"
        style={{ width: isCollapsed ? FILE_PANEL_COLLAPSED_WIDTH : FILE_PANEL_WIDTH }}
      >
        <CollapseHandle isDark={isDark} isCollapsed={isCollapsed} onToggle={onToggle} />

        <div
          className={`flex flex-1 min-h-0 flex-col transition-all duration-300 ${
            isCollapsed ? 'pointer-events-none opacity-0 h-0 overflow-hidden' : 'opacity-100'
          }`}
          aria-hidden={isCollapsed}
        >
          <SidebarToolbar
            isDark={isDark}
            activeView={activeView}
            onToggleView={handleToggleView}
            lessons={lessons}
            activeLessonId={lessonId}
            onLessonChange={changeLesson}
            onCreatePythonFile={handleCreatePythonEntry}
            onCreateFolder={handleCreateFolderEntry}
          />

          <div className="flex-1 min-h-0">
            {activeView === 'tasks' ? (
              <LessonTaskPanel
                lesson={lesson}
                isDark={isDark}
                activeSlide={activeSlide}
                quizState={quizState}
                quizQuestion={quizQuestion}
                quizQuestionIndex={quizQuestionIndex}
                quizQuestionTotal={quizQuestionTotal}
                quizQuestionState={quizQuestionState}
                onQuestionResult={markCurrentQuestion}
                onNextQuestion={goToNextQuestion}
                onNext={goToNextSlide}
                onPrev={goToPreviousSlide}
                onRequestVideo={openVideo}
              />
            ) : (
              <FileListPanel
                isDark={isDark}
                files={files}
                editingEntryId={editingEntryId}
                editingValue={editingValue}
                onEditingValueChange={setEditingValue}
                onCommitEditing={handleCommitEditing}
                onCancelEditing={handleCancelEditing}
                onRequestRename={handleRequestRename}
                onRemoveEntry={handleRemoveEntry}
                activeEntryId={activeFileId}
                onSelectEntry={handleSelectEntry}
              />
            )}
          </div>
        </div>
      </motion.div>

      <TaskVideoDialog
        isOpen={isVideoOpen}
        isDark={isDark}
        onClose={closeVideo}
        title={lesson.mission.title}
        videoUrl={lesson.mission.videoUrl}
        poster={lesson.mission.poster}
      />
    </>
  );
}

function CollapseHandle({
  isDark,
  isCollapsed,
  onToggle,
}: {
  isDark: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  const buttonColors = isDark
    ? 'bg-gray-900/85 text-blue-200 border-blue-500/30 hover:bg-gray-800'
    : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50';

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        aria-label={isCollapsed ? '展开文件面板' : '收起文件面板'}
        aria-expanded={!isCollapsed}
        className={`absolute top-1/2 ${isCollapsed ? '-right-3' : '-right-5'} flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border shadow-lg transition-colors ${buttonColors}`}
      >
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full ${
            isDark ? 'bg-blue-800/40' : 'bg-blue-100'
          }`}
        >
          {isCollapsed ? <ArrowRight size={15} strokeWidth={2.5} /> : <ArrowLeft size={15} strokeWidth={2.5} />}
        </span>
      </button>
      <div
        className={`absolute inset-y-5 -right-0.5 w-px rounded-full transition-opacity duration-200 ${
          isDark ? 'bg-blue-400/60' : 'bg-blue-500/60'
        } ${isCollapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />
    </>
  );
}
