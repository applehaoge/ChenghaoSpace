import { useCallback, useMemo, useState } from 'react';
import type { DragEvent, HTMLAttributes } from 'react';
import type { FlattenedFileTreeNode } from '@/features/kidsCoding/core/buildFileTree';

type DragProps = Pick<HTMLAttributes<HTMLDivElement>, 'draggable' | 'onDragStart' | 'onDragEnd'>;
type DropProps = Pick<HTMLAttributes<HTMLDivElement>, 'onDragEnter' | 'onDragLeave' | 'onDragOver' | 'onDrop'>;
type DropZoneProps = Pick<HTMLAttributes<HTMLDivElement>, 'onDragEnter' | 'onDragLeave' | 'onDragOver' | 'onDrop'>;

interface UseFileDragAndDropOptions {
  nodes: FlattenedFileTreeNode[];
  onMoveEntry: (entryId: string, targetFolderId: string | null) => void;
  onEnsureFolderExpanded?: (folderId: string) => void;
}

interface UseFileDragAndDropResult {
  getRowDragProps: (node: FlattenedFileTreeNode) => DragProps;
  getFolderDropProps: (node: FlattenedFileTreeNode) => DropProps | undefined;
  rootDropZoneProps: DropZoneProps;
  dropTargetId: string | null;
}

export function useFileDragAndDrop({
  nodes,
  onMoveEntry,
  onEnsureFolderExpanded,
}: UseFileDragAndDropOptions): UseFileDragAndDropResult {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);

  const nodeById = useMemo(() => {
    const map = new Map<string, FlattenedFileTreeNode>();
    nodes.forEach(node => map.set(node.id, node));
    return map;
  }, [nodes]);

  const resetDragState = useCallback(() => {
    setDraggingId(null);
    setDropTargetId(null);
  }, []);

  const getRowDragProps = useCallback(
    (node: FlattenedFileTreeNode): DragProps => ({
      draggable: true,
      onDragStart: event => {
        event.stopPropagation();
        event.dataTransfer?.setData('text/plain', node.id);
        if (event.dataTransfer) {
          event.dataTransfer.effectAllowed = 'move';
        }
        setDraggingId(node.id);
      },
      onDragEnd: () => {
        resetDragState();
      },
    }),
    [resetDragState],
  );

  const canDropOnFolder = useCallback(
    (folderId: string) => {
      if (!draggingId) {
        return false;
      }
      const source = nodeById.get(draggingId);
      const target = nodeById.get(folderId);
      if (!source || !target) {
        return false;
      }
      if (target.type !== 'folder' || source.id === target.id) {
        return false;
      }
      if (target.path && source.path && target.path.startsWith(`${source.path}/`)) {
        // 不允许把文件夹拖入自己的子层，避免形成循环父子结构
        return false;
      }
      return true;
    },
    [draggingId, nodeById],
  );

  const getFolderDropProps = useCallback(
    (node: FlattenedFileTreeNode) => {
      if (node.type !== 'folder') {
        return undefined;
      }
      const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
        event.stopPropagation();
        const nextTarget = event.relatedTarget as Node | null;
        if (nextTarget && event.currentTarget.contains(nextTarget)) {
          return;
        }
        if (dropTargetId === node.id) {
          setDropTargetId(null);
        }
      };
      return {
        onDragEnter: event => {
          if (!canDropOnFolder(node.id)) {
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          setDropTargetId(node.id);
        },
        onDragOver: event => {
          if (!canDropOnFolder(node.id)) {
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          if (event.dataTransfer) {
            event.dataTransfer.dropEffect = 'move';
          }
          setDropTargetId(node.id);
        },
        onDragLeave: handleDragLeave,
        onDrop: event => {
          event.preventDefault();
          event.stopPropagation();
          if (!canDropOnFolder(node.id) || !draggingId) {
            return;
          }
          onMoveEntry(draggingId, node.id);
          onEnsureFolderExpanded?.(node.id);
          resetDragState();
        },
      };
    },
    [canDropOnFolder, draggingId, dropTargetId, onEnsureFolderExpanded, onMoveEntry, resetDragState],
  );

  const rootDropZoneProps: DropZoneProps = {
    onDragEnter: event => {
      if (!draggingId) {
        return;
      }
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
      }
      setDropTargetId(null);
    },
    onDragOver: event => {
      if (!draggingId) {
        return;
      }
      event.preventDefault();
      if (event.dataTransfer) {
        event.dataTransfer.dropEffect = 'move';
      }
    },
    onDragLeave: () => {
      setDropTargetId(null);
    },
    onDrop: event => {
      if (!draggingId) {
        return;
      }
      event.preventDefault();
      onMoveEntry(draggingId, null);
      resetDragState();
    },
  };

  return {
    getRowDragProps,
    getFolderDropProps,
    rootDropZoneProps,
    dropTargetId,
  };
}
