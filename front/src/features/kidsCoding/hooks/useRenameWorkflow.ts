import { useCallback, useEffect, useState } from 'react';
import type { FileEntry } from '@/features/kidsCoding/types/editor';

interface PendingRenameRequest {
  entryId: string;
  fallbackName?: string;
  createdAt: number;
}

interface RenameWorkflowOptions {
  files: FileEntry[];
  onRename: (entryId: string, name: string) => void;
}

interface RenameWorkflowResult {
  editingEntryId: string | null;
  editingValue: string;
  requestRename: (entryId: string, fallbackName?: string) => void;
  beginRenameNow: (entry: FileEntry) => void;
  updateEditingValue: (value: string) => void;
  commitEditing: () => void;
  cancelEditing: () => void;
}

const MAX_PENDING_MS = 1500; // 超过 1.5s 还没渲染成功就丢弃，防止队列阻塞

export function useRenameWorkflow({ files, onRename }: RenameWorkflowOptions): RenameWorkflowResult {
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [queue, setQueue] = useState<PendingRenameRequest[]>([]);

  useEffect(() => {
    if (editingEntryId || !queue.length) {
      return;
    }

    const [next] = queue;
    const entry = files.find(file => file.id === next.entryId);
    if (!entry) {
      const expired = Date.now() - next.createdAt > MAX_PENDING_MS;
      if (expired) {
        setQueue(current => current.slice(1));
      }
      return;
    }

    setQueue(current => current.slice(1));
    setEditingEntryId(entry.id);
    setEditingValue(entry.name ?? next.fallbackName ?? '');
  }, [editingEntryId, queue, files]);

  const beginRenameNow = useCallback((entry: FileEntry) => {
    setQueue(current => current.filter(item => item.entryId !== entry.id));
    setEditingEntryId(entry.id);
    setEditingValue(entry.name);
  }, []);

  const requestRename = useCallback((entryId: string, fallbackName?: string) => {
    setQueue(current => {
      const nextQueue = current.filter(item => item.entryId !== entryId);
      nextQueue.push({ entryId, fallbackName, createdAt: Date.now() });
      return nextQueue;
    });
  }, []);

  const commitEditing = useCallback(() => {
    if (!editingEntryId) {
      return;
    }
    const trimmed = editingValue.trim();
    if (trimmed) {
      onRename(editingEntryId, trimmed);
    }
    setEditingEntryId(null);
    setEditingValue('');
  }, [editingEntryId, editingValue, onRename]);

  const cancelEditing = useCallback(() => {
    setEditingEntryId(null);
    setEditingValue('');
  }, []);

  const updateEditingValue = useCallback((value: string) => {
    setEditingValue(value);
  }, []);

  return {
    editingEntryId,
    editingValue,
    requestRename,
    beginRenameNow,
    updateEditingValue,
    commitEditing,
    cancelEditing,
  };
}
