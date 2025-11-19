import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { FILE_PANEL_COLLAPSED_WIDTH, FILE_PANEL_WIDTH } from '@/features/kidsCoding/constants/editorLayout';
import type { FileEntry } from '@/features/kidsCoding/types/editor';
import type { CreateEntryOptions } from '@/features/kidsCoding/hooks/useProjectFiles';
import { SidebarToolbar } from '@/features/kidsCoding/components/editor/sidebar/SidebarToolbar';
import { FileListPanel } from '@/features/kidsCoding/components/editor/sidebar/FileListPanel';
import { LessonTaskPanel } from '@/features/kidsCoding/components/editor/sidebar/lesson';
import { TaskVideoDialog } from '@/features/kidsCoding/components/editor/sidebar/TaskVideoDialog';
import type { SidebarView } from '@/features/kidsCoding/components/editor/sidebar/types';
import { useLessonSlides } from '@/features/kidsCoding/hooks/useLessonSlides';
import { useRenameWorkflow } from '@/features/kidsCoding/hooks/useRenameWorkflow';
import {
  collectAncestorPaths,
  getEntryPath,
  getParentDirectoryPath,
} from '@/features/kidsCoding/core/buildFileTree';

export type { SidebarView };

interface FileSidebarProps {
  isDark: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
  files: FileEntry[];
  activeFileId?: string;
  onSelectFile: (entryId: string) => void;
  onCreatePythonFile: (options?: CreateEntryOptions) => FileEntry;
  onCreateFolder: (options?: CreateEntryOptions) => FileEntry;
  onRenameEntry: (entryId: string, name: string) => void;
  onRemoveEntry: (entryId: string) => void;
  onMoveEntry: (entryId: string, targetFolderId: string | null) => void;
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
  onMoveEntry,
  onEarnTokens,
}: FileSidebarProps) {
  const [activeView, setActiveView] = useState<SidebarView>('tasks');
  const knownEntryIdsRef = useRef(new Set(files.map(file => file.id)));
  const pendingAutoRenameRef = useRef(0);
  const {
    editingEntryId,
    editingValue,
    requestRename,
    beginRenameNow,
    updateEditingValue,
    commitEditing,
    cancelEditing,
  } = useRenameWorkflow({ files, onRename: onRenameEntry });
  const [currentDirectoryPath, setCurrentDirectoryPath] = useState('');
  const [currentDirectoryEntryId, setCurrentDirectoryEntryId] = useState<string | null>(null);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [expandedFolderIds, setExpandedFolderIds] = useState<Set<string>>(() => new Set());
  const entryById = useMemo(() => {
    const map = new Map<string, FileEntry>();
    files.forEach(file => map.set(file.id, file));
    return map;
  }, [files]);
  const folderIdByPath = useMemo(() => {
    const map = new Map<string, string>();
    files.forEach(file => {
      if (file.kind === 'folder') {
        const path = file.path ?? file.name ?? '';
        map.set(path, file.id);
      }
    });
    return map;
  }, [files]);
  const expandAncestors = useCallback(
    (path: string) => {
      if (!path) return;
      const ancestors = collectAncestorPaths(path);
      if (!ancestors.length) return;
      setExpandedFolderIds(prev => {
        let changed = false;
        const next = new Set(prev);
        ancestors.forEach(ancestorPath => {
          const folderId = folderIdByPath.get(ancestorPath);
          if (folderId && !next.has(folderId)) {
            next.add(folderId);
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    },
    [folderIdByPath],
  );
  useEffect(() => {
    if (selectedEntryId && !entryById.has(selectedEntryId)) {
      setSelectedEntryId(null);
    }
  }, [selectedEntryId, entryById]);
  useEffect(() => {
    setExpandedFolderIds(prev => {
      let changed = false;
      const next = new Set<string>();
      prev.forEach(id => {
        if (entryById.has(id)) {
          next.add(id);
        } else {
          changed = true;
        }
      });
      return changed ? next : prev;
    });
  }, [entryById]);
  useEffect(() => {
    if (!currentDirectoryEntryId) {
      return;
    }
    const entry = entryById.get(currentDirectoryEntryId);
    if (!entry) {
      setCurrentDirectoryEntryId(null);
      setCurrentDirectoryPath('');
      return;
    }
    const entryPath = getEntryPath(entry);
    if (entryPath !== currentDirectoryPath) {
      setCurrentDirectoryPath(entryPath);
    }
  }, [currentDirectoryEntryId, entryById, currentDirectoryPath]);
  const previousActiveFileIdRef = useRef<string | undefined>();
  useEffect(() => {
    if (!activeFileId) {
      previousActiveFileIdRef.current = activeFileId;
      return;
    }
    if (previousActiveFileIdRef.current === activeFileId) {
      return;
    }
    previousActiveFileIdRef.current = activeFileId;
    const entry = entryById.get(activeFileId);
    if (!entry || entry.kind === 'folder') {
      return;
    }
    const entryPath = getEntryPath(entry);
    setSelectedEntryId(entry.id);
    const parentPath = getParentDirectoryPath(entryPath);
    setCurrentDirectoryPath(parentPath);
    setCurrentDirectoryEntryId(parentPath ? folderIdByPath.get(parentPath) ?? null : null);
    expandAncestors(entryPath);
  }, [activeFileId, entryById, folderIdByPath, expandAncestors]);
  useEffect(() => {
    const previousIds = knownEntryIdsRef.current;
    const newEntries = files.filter(file => !previousIds.has(file.id));
    if (newEntries.length && pendingAutoRenameRef.current > 0) {
      let remaining = pendingAutoRenameRef.current;
      const toProcess: FileEntry[] = [];
      for (const entry of newEntries) {
        if (remaining <= 0) {
          break;
        }
        toProcess.push(entry);
        remaining -= 1;
      }
      pendingAutoRenameRef.current = remaining;
      toProcess.forEach(entry => requestRename(entry.id, entry.name)); // 新建完毕后再触发默认改名，避免焦点丢失
    }
    knownEntryIdsRef.current = new Set(files.map(file => file.id));
  }, [files, requestRename]);
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

  const handleCommitEditing = useCallback(() => {
    commitEditing();
  }, [commitEditing]);

  const handleCancelEditing = useCallback(() => {
    cancelEditing();
  }, [cancelEditing]);
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
      beginRenameNow(entry);
    },
    [beginRenameNow, editingEntryId, handleCommitEditing],
  );

  const handleCreatePythonEntry = useCallback(() => {
    if (editingEntryId) {
      handleCommitEditing();
    }
    pendingAutoRenameRef.current += 1;
    try {
      const created = onCreatePythonFile({
        parentPath: currentDirectoryPath || undefined,
      });
      setSelectedEntryId(created.id);
      expandAncestors(getEntryPath(created));
    } catch (error) {
      console.error(error);
    }
    setActiveView('files');
  }, [editingEntryId, handleCommitEditing, onCreatePythonFile, currentDirectoryPath, expandAncestors]);

  const handleCreateFolderEntry = useCallback(() => {
    if (editingEntryId) {
      handleCommitEditing();
    }
    pendingAutoRenameRef.current += 1;
    try {
      const created = onCreateFolder({
        parentPath: currentDirectoryPath || undefined,
      });
      setSelectedEntryId(created.id);
      expandAncestors(getEntryPath(created));
    } catch (error) {
      console.error(error);
    }
    setActiveView('files');
  }, [editingEntryId, handleCommitEditing, onCreateFolder, currentDirectoryPath, expandAncestors]);

  const handleFolderClick = useCallback(
    (entry: FileEntry) => {
      if (editingEntryId && editingEntryId !== entry.id) {
        handleCommitEditing();
      }
      const entryPath = getEntryPath(entry);
      setSelectedEntryId(entry.id);
      setCurrentDirectoryPath(entryPath);
      setCurrentDirectoryEntryId(entry.id);
      setExpandedFolderIds(prev => {
        const next = new Set(prev);
        if (next.has(entry.id)) {
          next.delete(entry.id);
        } else {
          next.add(entry.id);
        }
        return next;
      });
    },
    [editingEntryId, handleCommitEditing],
  );

  const handleFileClick = useCallback(
    (entry: FileEntry) => {
      if (entry.kind === 'folder') return;
      if (editingEntryId && editingEntryId !== entry.id) {
        handleCommitEditing();
      }
      const entryPath = getEntryPath(entry);
      const parentPath = getParentDirectoryPath(entryPath);
      const parentFolderId = parentPath ? folderIdByPath.get(parentPath) ?? null : null;
      setSelectedEntryId(entry.id);
      setCurrentDirectoryPath(parentPath);
      setCurrentDirectoryEntryId(parentFolderId);
      expandAncestors(entryPath);
      onSelectFile(entry.id);
    },
    [editingEntryId, handleCommitEditing, folderIdByPath, expandAncestors, onSelectFile],
  );

  const handleBlankAreaClick = useCallback(() => {
    if (selectedEntryId) {
      setSelectedEntryId(null);
    }
    if (currentDirectoryPath) {
      setCurrentDirectoryPath('');
    }
    if (currentDirectoryEntryId) {
      setCurrentDirectoryEntryId(null);
    }
  }, [selectedEntryId, currentDirectoryPath, currentDirectoryEntryId]);

  const ensureFolderExpanded = useCallback((folderId: string) => {
    setExpandedFolderIds(prev => {
      if (prev.has(folderId)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(folderId);
      return next;
    });
  }, []);

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
                onEditingValueChange={updateEditingValue}
                onCommitEditing={handleCommitEditing}
                onCancelEditing={handleCancelEditing}
                onRequestRename={handleRequestRename}
                onRemoveEntry={handleRemoveEntry}
                selectedEntryId={selectedEntryId}
                expandedFolderIds={expandedFolderIds}
                onFolderClick={handleFolderClick}
                onFileClick={handleFileClick}
                onBlankAreaClick={handleBlankAreaClick}
                onMoveEntry={onMoveEntry}
                onEnsureFolderExpanded={ensureFolderExpanded}
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

