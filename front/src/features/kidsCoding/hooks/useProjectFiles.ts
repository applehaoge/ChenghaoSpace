import { useCallback, useState } from 'react';
import type { FileEntry } from '@/features/kidsCoding/types/editor';

const DEFAULT_FILES: FileEntry[] = [
  {
    id: 'main',
    name: 'main.py',
    kind: 'file',
    extension: 'py',
  },
];

export function useProjectFiles(initialFiles: FileEntry[] = DEFAULT_FILES) {
  const [files, setFiles] = useState<FileEntry[]>(initialFiles);

  const createPythonFile = useCallback(
    (requestedName?: string): FileEntry => {
      let createdEntry: FileEntry | undefined;
      setFiles(prev => {
        const nextName = buildUniqueName(
          prev.map(item => item.name),
          buildCandidateName(requestedName, { extension: 'py', fallbackBase: '新的代码' }),
        );
        createdEntry = {
          id: createEntryId(),
          name: nextName,
          kind: 'file',
          extension: 'py',
        };
        return [...prev, createdEntry];
      });
      if (!createdEntry) {
        throw new Error('Failed to create Python file');
      }
      return createdEntry;
    },
    [],
  );

  const createFolder = useCallback(
    (requestedName?: string): FileEntry => {
      let createdEntry: FileEntry | undefined;
      setFiles(prev => {
        const nextName = buildUniqueName(
          prev.map(item => item.name),
          buildCandidateName(requestedName, { fallbackBase: '新建文件夹' }),
        );
        createdEntry = {
          id: createEntryId(),
          name: nextName,
          kind: 'folder',
        };
        return [...prev, createdEntry];
      });
      if (!createdEntry) {
        throw new Error('Failed to create folder');
      }
      return createdEntry;
    },
    [],
  );

  const renameEntry = useCallback((entryId: string, requestedName: string) => {
    setFiles(prev => {
      const target = prev.find(file => file.id === entryId);
      if (!target) {
        return prev;
      }
      const normalized = normalizeName(requestedName, target.extension);
      if (!normalized) {
        return prev;
      }
      const otherNames = prev.filter(file => file.id !== entryId).map(file => file.name);
      const nextName = buildUniqueName(otherNames, normalized);
      return prev.map(file => (file.id === entryId ? { ...file, name: nextName } : file));
    });
  }, []);

  const removeEntry = useCallback((entryId: string) => {
    setFiles(prev => prev.filter(file => file.id !== entryId));
  }, []);

  return {
    files,
    createPythonFile,
    createFolder,
    renameEntry,
    removeEntry,
  };
}

function buildCandidateName(
  requestedName: string | undefined,
  options: { extension?: string; fallbackBase: string },
): string {
  const normalized = normalizeName(requestedName ?? options.fallbackBase, options.extension);
  if (normalized) {
    return normalized;
  }
  return options.extension ? `${options.fallbackBase}.${options.extension}` : options.fallbackBase;
}

function normalizeName(input: string, extension?: string) {
  const trimmed = input.trim();
  if (!trimmed) {
    return '';
  }
  if (!extension) {
    return trimmed;
  }
  return trimmed.endsWith(`.${extension}`) ? trimmed : `${trimmed}.${extension}`;
}

function buildUniqueName(existingNames: string[], candidate: string) {
  if (!existingNames.includes(candidate)) {
    return candidate;
  }

  const { base, ext } = splitName(candidate);
  let counter = 2;
  while (true) {
    const next = `${base}-${counter}${ext}`;
    if (!existingNames.includes(next)) {
      return next;
    }
    counter += 1;
  }
}

function splitName(input: string) {
  const dotIndex = input.lastIndexOf('.');
  if (dotIndex > 0) {
    return { base: input.slice(0, dotIndex), ext: input.slice(dotIndex) };
  }
  return { base: input, ext: '' };
}

const createEntryId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};
