import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { importTextFiles } from '@/features/kidsCoding/core/importFiles';
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
    encoding: 'utf8',
  },
];

export interface CreateEntryOptions {
  name?: string;
  parentPath?: string;
}

export interface ProjectFilesState {
  files: FileEntry[];
  activeFileId: string;
  activeFile?: FileEntry;
  selectFile: (entryId: string) => void;
  updateFileContent: (entryId: string, content: string) => void;
  createFile: (options: { path: string; content: string; language?: string; encoding?: FileEntry['encoding']; mime?: string; size?: number }) => FileEntry | null;
  createPythonFile: (options?: CreateEntryOptions) => FileEntry;
  createFolder: (options?: CreateEntryOptions) => FileEntry;
  renameEntry: (entryId: string, name: string) => void;
  removeEntry: (entryId: string) => void;
  moveEntry: (entryId: string, targetFolderId: string | null) => void;
  importFiles: (files: File[], parentPath?: string) => void;
}

export function useProjectFiles(initialFiles: FileEntry[] = FALLBACK_FILES): ProjectFilesState {
  const prepared = useRef(normalizeInitialFiles(initialFiles));
  const [files, setFiles] = useState<FileEntry[]>(prepared.current.files);
  const filesSnapshotRef = useRef<FileEntry[]>(prepared.current.files);
  const [activeFileId, setActiveFileId] = useState<string>(prepared.current.activeId);

  useEffect(() => {
    filesSnapshotRef.current = files;
  }, [files]);

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

  const createFile = useCallback(
    (options: {
      path: string;
      content: string;
      language?: string;
      encoding?: FileEntry['encoding'];
      mime?: string;
      size?: number;
    }): FileEntry | null => {
      const targetPath = normalizePathInput(options.path);
      if (!targetPath) return null;
      const name = getBaseName(targetPath);
      const extension = inferExtension(name);
      const entry: FileEntry = {
        id: createEntryId(),
        name,
        path: targetPath,
        kind: 'file',
        extension,
        language: options.language ?? (extension === 'py' ? 'python' : undefined),
        content: options.content ?? '',
        encoding: options.encoding ?? 'utf8',
        mime: options.mime,
        size: options.size,
      };
      const nextFiles = [...filesSnapshotRef.current, entry];
      filesSnapshotRef.current = nextFiles;
      setFiles(nextFiles);
      setActiveFileId(entry.id);
      return entry;
    },
    [],
  );

  const createPythonFile = useCallback((options?: CreateEntryOptions): FileEntry => {
    const { name: requestedName, parentPath } = options ?? {};
    const snapshot = filesSnapshotRef.current;
    const existingPaths = snapshot.map(file => file.path ?? file.name);
    const resolvedParent = normalizeDirectoryPath(parentPath);
    const candidateName = buildCandidateName(requestedName, { extension: 'py', fallbackBase: '\u65b0\u7684\u4ee3\u7801' });
    const targetPath = joinParentPath(resolvedParent, candidateName);
    const nextPath = buildUniquePath(existingPaths, targetPath);
    const nextName = getBaseName(nextPath);
    const created: FileEntry = {
      id: createEntryId(),
      name: nextName,
      path: nextPath,
      kind: 'file',
      extension: 'py',
      language: 'python',
      content: '',
      encoding: 'utf8',
    };
    const nextFiles = [...snapshot, created];
    filesSnapshotRef.current = nextFiles; // 先同步快照，避免连续创建时仍读到旧命名
    setFiles(nextFiles);
    setActiveFileId(created.id);
    return created;
  }, []);

  const createFolder = useCallback((options?: CreateEntryOptions): FileEntry => {
    const { name: requestedName, parentPath } = options ?? {};
    const snapshot = filesSnapshotRef.current;
    const existingPaths = snapshot.map(file => file.path ?? file.name);
    const resolvedParent = normalizeDirectoryPath(parentPath);
    const candidateName = buildCandidateName(requestedName, { fallbackBase: '\u65b0\u5efa\u6587\u4ef6\u5939' });
    const targetPath = joinParentPath(resolvedParent, candidateName);
    const nextPath = buildUniquePath(existingPaths, targetPath);
    const nextName = getBaseName(nextPath);
    const created: FileEntry = {
      id: createEntryId(),
      name: nextName,
      path: nextPath,
      kind: 'folder',
    };
    const nextFiles = [...snapshot, created];
    filesSnapshotRef.current = nextFiles; // 文件夹也需同步快照，避免连续创建导致命名冲突
    setFiles(nextFiles);
    return created;
  }, []);

  const renameEntry = useCallback((entryId: string, requestedName: string) => {
    setFiles(prev => {
      const target = prev.find(file => file.id === entryId);
      if (!target) {
        return prev;
      }
      const normalizedName = normalizeSegmentName(requestedName, target.extension);
      if (!normalizedName) {
        return prev;
      }
      const currentPath = target.path ?? target.name ?? '';
      if (!currentPath) {
        return prev;
      }
      const { dir: parentDir } = splitPath(currentPath);
      const candidatePath = joinParentPath(parentDir, normalizedName);
      const otherPaths = prev.filter(file => file.id !== entryId).map(file => file.path ?? file.name);
      const nextPath = buildUniquePath(otherPaths, candidatePath);
      const nextName = getBaseName(nextPath);
      const updatedFiles = prev.map(file => {
        if (file.id === entryId) {
          const nextExtension =
            file.kind === 'file' ? inferExtension(nextName) ?? file.extension : file.extension;
          return {
            ...file,
            name: nextName,
            path: nextPath,
            extension: nextExtension,
            language: nextExtension === 'py' ? 'python' : file.language,
          };
        }
        if (target.kind === 'folder') {
          const entryPath = file.path ?? file.name ?? '';
          if (entryPath && isDescendantPath(entryPath, currentPath)) {
            const relative = entryPath.slice(currentPath.length);
            const safeRelative = relative.startsWith('/') ? relative.slice(1) : relative;
            const recalculatedPath = nextPath ? `${nextPath}/${safeRelative}` : safeRelative;
            return {
              ...file,
              path: recalculatedPath,
              name: getBaseName(recalculatedPath),
            };
          }
        }
        return file;
      });
      filesSnapshotRef.current = updatedFiles;
      return updatedFiles;
    });
  }, []);

  const moveEntry = useCallback((entryId: string, targetFolderId: string | null) => {
    setFiles(prev => {
      const target = prev.find(file => file.id === entryId);
      if (!target) {
        return prev;
      }
      const sourcePath = getEntryPath(target);
      if (!sourcePath) {
        return prev;
      }
      const destinationFolder =
        targetFolderId ? prev.find(file => file.id === targetFolderId && file.kind === 'folder') : undefined;
      const destinationPath = destinationFolder ? getEntryPath(destinationFolder) : '';
      if (destinationFolder && destinationPath && isDescendantOrSelf(destinationPath, sourcePath)) {
        // 永远不允许把文件夹拖进自己的子节点，避免构成死循环
        return prev;
      }
      const { base } = splitPath(sourcePath);
      const otherPaths = prev
        .filter(file => !isDescendantOrSelf(getEntryPath(file), sourcePath))
        .map(file => getEntryPath(file));
      const candidatePath = joinParentPath(destinationPath, base);
      const nextPath = buildUniquePath(otherPaths, candidatePath);
      if (nextPath === sourcePath) {
        return prev;
      }
      const previousPrefix = `${sourcePath}/`;
      const nextPrefix = `${nextPath}/`;
      return prev.map(file => {
        const filePath = getEntryPath(file);
        if (!filePath) {
          return file;
        }
        if (file.id === entryId) {
          return {
            ...file,
            path: nextPath,
            name: getBaseName(nextPath),
          };
        }
        if (isDescendantPath(filePath, sourcePath)) {
          const relative = filePath.slice(previousPrefix.length);
          const updatedPath = `${nextPrefix}${relative}`;
          return {
            ...file,
            path: updatedPath,
          };
        }
        return file;
      });
    });
  }, []);

  const removeEntry = useCallback((entryId: string) => {
    setFiles(prev => {
      const target = prev.find(file => file.id === entryId);
      if (!target) {
        return prev;
      }
      const targetPath = target.path ?? target.name ?? '';
      const removedIds = new Set<string>();
      const nextFiles =
        target.kind === 'folder'
          ? prev.filter(file => {
              const entryPath = file.path ?? file.name ?? '';
              const shouldRemove = entryPath && isDescendantOrSelf(entryPath, targetPath);
              if (shouldRemove) {
                removedIds.add(file.id);
              }
              return !shouldRemove;
            })
          : prev.filter(file => {
              if (file.id === entryId) {
                removedIds.add(file.id);
                return false;
              }
              return true;
            });
      filesSnapshotRef.current = nextFiles;
      setActiveFileId(currentActive => {
        if (!currentActive || !removedIds.has(currentActive)) {
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
    createFile,
    createPythonFile,
    createFolder,
    renameEntry,
    removeEntry,
    moveEntry,
    importFiles: useCallback(
      (filesToImport: File[], parentPath?: string) => {
        const existingPaths = filesSnapshotRef.current.map(file => getEntryPath(file));
        importTextFiles(filesToImport, {
          parentPath,
          createFile,
          buildUniquePath: candidatePath => {
            const nextPath = buildUniquePath(existingPaths, candidatePath);
            existingPaths.push(nextPath);
            return nextPath;
          },
          setActiveFile: setActiveFileId,
        });
      },
      [createFile],
    ),
  };
}

function normalizeInitialFiles(seed: FileEntry[]) {
  const base = seed.length ? seed : FALLBACK_FILES;
  const normalized = base.map(file => {
    const resolvedPath = normalizePathInput(file.path ?? file.name ?? '');
    const safePath = resolvedPath || `${sanitizePathSegment(file.name ?? 'file')}-${createEntryId()}`;
    const extension = file.extension ?? inferExtension(safePath);
    return {
      ...file,
      id: file.id ?? createEntryId(),
      kind: file.kind ?? 'file',
      name: file.name ?? getBaseName(safePath),
      path: safePath,
      extension,
      language: file.language ?? (extension === 'py' ? 'python' : undefined),
      content: file.content ?? '',
      encoding: file.encoding ?? 'utf8',
    };
  });
  const firstFile = normalized.find(file => file.kind !== 'folder');
  return {
    files: normalized,
    activeId: firstFile?.id ?? normalized[0]?.id ?? '',
  };
}

function buildCandidateName(requestedName: string | undefined, options: { extension?: string; fallbackBase: string }) {
  const normalized = normalizeSegmentName(requestedName ?? options.fallbackBase, options.extension);
  if (normalized) {
    return normalized;
  }
  return options.extension ? `${options.fallbackBase}.${options.extension}` : options.fallbackBase;
}

function buildUniquePath(existingPaths: string[], candidatePath: string) {
  if (!existingPaths.includes(candidatePath)) {
    return candidatePath;
  }
  const { dir, base } = splitPath(candidatePath);
  const { base: segmentBase, ext } = splitName(base);
  let counter = 2;
  while (true) {
    const nextBase = `${segmentBase}-${counter}${ext}`;
    const nextPath = dir ? `${dir}/${nextBase}` : nextBase;
    if (!existingPaths.includes(nextPath)) {
      return nextPath;
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

function splitPath(input: string) {
  const slashIndex = input.lastIndexOf('/');
  if (slashIndex >= 0) {
    return { dir: input.slice(0, slashIndex), base: input.slice(slashIndex + 1) };
  }
  return { dir: '', base: input };
}

function getBaseName(path: string) {
  return path.split('/').pop() ?? path;
}

function joinParentPath(parentPath: string, segment: string) {
  if (!parentPath) {
    return segment;
  }
  return segment ? `${parentPath}/${segment}` : parentPath;
}

function normalizeDirectoryPath(input?: string) {
  const trimmed = normalizePathInput(input ?? '');
  return trimmed;
}

function normalizePathInput(input: string) {
  const cleaned = input.replace(/\\/g, '/').replace(/\/+/g, '/').replace(/^\/|\/$/g, '');
  return cleaned;
}

function sanitizePathSegment(value: string) {
  return value.replace(/[\\/]+/g, '').trim();
}

function normalizeSegmentName(input: string, extension?: string) {
  const sanitized = sanitizePathSegment(input);
  if (!sanitized) {
    return '';
  }
  if (!extension) {
    return sanitized;
  }
  const dotIndex = sanitized.lastIndexOf('.');
  if (dotIndex > 0) {
    return sanitized;
  }
  return `${sanitized}.${extension}`;
}

function isDescendantPath(entryPath: string, folderPath: string) {
  if (!folderPath) {
    return false;
  }
  if (entryPath === folderPath) {
    return false;
  }
  return entryPath.startsWith(`${folderPath}/`);
}

function isDescendantOrSelf(entryPath: string, folderPath: string) {
  return entryPath === folderPath || entryPath.startsWith(`${folderPath}/`);
}

function getEntryPath(entry: FileEntry) {
  return (entry.path ?? entry.name ?? '').trim();
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
