import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import type { FileEntry } from '@/features/kidsCoding/types/editor';
import { buildFileTree, flattenFileTree } from '@/features/kidsCoding/core/buildFileTree';
import { useFileDragAndDrop } from '@/features/kidsCoding/components/editor/sidebar/hooks/useFileDragAndDrop';
import { FileTreeRow } from '@/features/kidsCoding/components/editor/sidebar/FileTreeRow';

interface FileListPanelProps {
  isDark: boolean;
  files: FileEntry[];
  editingEntryId?: string | null;
  editingValue?: string;
  onEditingValueChange?: (value: string) => void;
  onCommitEditing?: () => void;
  onCancelEditing?: () => void;
  onRequestRename?: (entry: FileEntry) => void;
  onRemoveEntry?: (entry: FileEntry) => void;
  selectedEntryId?: string | null;
  expandedFolderIds: Set<string>;
  onFolderClick?: (entry: FileEntry) => void;
  onFileClick?: (entry: FileEntry) => void;
  onBlankAreaClick?: () => void;
  onMoveEntry: (entryId: string, targetFolderId: string | null) => void;
  onEnsureFolderExpanded?: (folderId: string) => void;
}

export function FileListPanel({
  isDark,
  files,
  editingEntryId,
  editingValue = '',
  onEditingValueChange,
  onCommitEditing,
  onCancelEditing,
  onRequestRename,
  onRemoveEntry,
  selectedEntryId,
  expandedFolderIds,
  onFolderClick,
  onFileClick,
  onBlankAreaClick,
  onMoveEntry,
  onEnsureFolderExpanded,
}: FileListPanelProps) {
  const treeRoots = useMemo(() => buildFileTree(files), [files]);
  const flattenedNodes = useMemo(() => flattenFileTree(treeRoots, expandedFolderIds), [treeRoots, expandedFolderIds]);
  const { getRowDragProps, getFolderDropProps, rootDropZoneProps, dropTargetId } = useFileDragAndDrop({
    nodes: flattenedNodes,
    onMoveEntry,
    onEnsureFolderExpanded,
  });

  if (!files.length) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-3 px-2.5 py-1.5" onClick={onBlankAreaClick}>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}>
          <Clock size={36} className={isDark ? 'text-gray-600' : 'text-blue-200'} />
        </motion.div>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-blue-300'}`}>点击上方 “+” 按钮创建新条目</p>
      </div>
    );
  }

  return (
    <div
      className="flex h-full min-h-0 flex-col gap-0.5 px-1 py-1.5 overflow-x-hidden overflow-y-auto"
      onClick={onBlankAreaClick}
      {...rootDropZoneProps}
    >
      {flattenedNodes.map(node => {
        const isEditing = node.id === editingEntryId;
        const dragProps = !isEditing ? getRowDragProps(node) : undefined;
        const dropProps = node.type === 'folder' ? getFolderDropProps(node) : undefined;
        return (
          <FileTreeRow
            key={node.id}
            node={node}
            isDark={isDark}
            isEditing={isEditing}
            isSelected={node.id === selectedEntryId}
            editingValue={editingValue}
            onEditingValueChange={onEditingValueChange}
            onCommitEditing={onCommitEditing}
            onCancelEditing={onCancelEditing}
            onRequestRename={onRequestRename}
            onRemoveEntry={onRemoveEntry}
            onFolderClick={onFolderClick}
            onFileClick={onFileClick}
            dragProps={dragProps}
            dropProps={dropProps}
            isDropTarget={dropTargetId === node.id}
          />
        );
      })}
    </div>
  );
}
