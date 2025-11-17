import { useCallback, useMemo, useRef, useState } from 'react';
import type { FileEntry } from '@/features/kidsCoding/types/editor';

const FALLBACK_FILES: FileEntry[] = [
  {
    id: 'main',
    name: 'main.py',
    path: 'main.py',
    kind: 'file',
    extension: 'py',
    language: 'python',
    content: '',
  },
];

export interface ProjectFilesState {
  files: FileEntry[];
  activeFileId: string;
  activeFile?: FileEntry;
  selectFile: (entryId: string) => void;
  updateFileContent: (entryId: string, content: string) => void;
  createPythonFile: (name?: string) => FileEntry;
  createFolder: (name?: string) => FileEntry;
  renameEntry: (entryId: string, name: string) => void;
  removeEntry: (entryId: string) => void;
}

export function useProjectFiles(initialFiles: FileEntry[] = FALLBACK_FILES): ProjectFilesState {
  const prepared = useRef(normalizeInitialFiles(initialFiles));
  const [files, setFiles] = useState<FileEntry[]>(prepared.current.files);
  const [activeFileId, setActiveFileId] = useState<string>(prepared.current.activeId);

  const activeFile = useMemo(
    () => files.find(file => file.id === activeFileId && file.kind !== 'folder'),
    [files, activeFileId],
  );

  const selectFile = useCallback(
    (entryId: string) => {
      if (files.some(file => file.id === entryId && file.kind !== 'folder')) {
        setActiveFileId(entryId);
      }
    },
    [files],
  );

  const updateFileContent = useCallback((entryId: string, content: string) => {
    setFiles(prev => prev.map(file => (file.id === entryId ? { ...file, content } : file)));
  }, []);

  const createPythonFile = useCallback(
    (requestedName?: string): FileEntry => {
      let created: FileEntry | undefined;
      setFiles(prev => {
        const existingPaths = prev.map(file => file.path ?? file.name);
        const nextName = buildUniqueName(
          existingPaths,
          buildCandidateName(requestedName, { extension: 'py', fallbackBase: '新的代码' }),
        );
        created = {
          id: createEntryId(),
          name: nextName,
          path: nextName,
          kind: 'file',
          extension: 'py',
          language: 'python',
          content: '',
        };
        return [...prev, created];
      });
      if (!created) {
        throw new Error('Failed to create python file');
      }
      setActiveFileId(created.id);
      return created;
    },
    [],
  );

  const createFolder = useCallback(
    (requestedName?: string): FileEntry => {
      let created: FileEntry | undefined;
      setFiles(prev => {
        const existingPaths = prev.map(file => file.path ?? file.name);
        const nextName = buildUniqueName(
          existingPaths,
          buildCandidateName(requestedName, { fallbackBase: '新建文件夹' }),
        );
        created = {
          id: createEntryId(),
          name: nextName,
          path: nextName,
          kind: 'folder',
        };
        return [...prev, created];
      });
      if (!created) {
        throw new Error('Failed to create folder');
      }
      return created;
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
      const otherNames = prev.filter(file => file.id !== entryId).map(file => file.path ?? file.name);
      const nextName = buildUniqueName(otherNames, normalized);
      return prev.map(file =>
        file.id === entryId
          ? {
              ...file,
              name: nextName,
              path: nextName,
              extension: file.kind === 'file' ? inferExtension(nextName) ?? file.extension : file.extension,
            }
          : file,
      );
    });
  }, []);

  const removeEntry = useCallback((entryId: string) => {
    setFiles(prev => {
      const nextFiles = prev.filter(file => file.id !== entryId);
      setActiveFileId(currentActive => {
        if (currentActive !== entryId) {
          return currentActive;
        }
        const nextActive = nextFiles.find(file => file.kind !== 'folder');
        return nextActive?.id ?? '';
      });
      return nextFiles;
    });
  }, []);

  return {
    files,
    activeFileId,
    activeFile,
    selectFile,
    updateFileContent,
    createPythonFile,
    createFolder,
    renameEntry,
    removeEntry,
  };
}

function normalizeInitialFiles(seed: FileEntry[]) {
  const base = seed.length ? seed : FALLBACK_FILES;
  const normalized = base.map(file => {
    const resolvedPath = (file.path ?? file.name ?? '').trim();
    const safePath = resolvedPath || `${file.name ?? 'file'}-${createEntryId()}`;
    const extension = file.extension ?? inferExtension(safePath);
    return {
      ...file,
      id: file.id ?? createEntryId(),
      kind: file.kind ?? 'file',
      name: file.name ?? safePath,
      path: safePath,
      extension,
      language: file.language ?? (extension === 'py' ? 'python' : undefined),
      content: file.content ?? '',
    };
  });
  const firstFile = normalized.find(file => file.kind !== 'folder');
  return {
    files: normalized,
    activeId: firstFile?.id ?? normalized[0]?.id ?? '',
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
  const dotIndex = trimmed.lastIndexOf('.');
  if (dotIndex > 0) {
    return trimmed;
  }
  return `${trimmed}.${extension}`;
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

function inferExtension(name: string | undefined) {
  if (!name) return undefined;
  const dotIndex = name.lastIndexOf('.');
  if (dotIndex > 0 && dotIndex < name.length - 1) {
    return name.slice(dotIndex + 1);
  }
  return undefined;
}

const createEntryId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};
