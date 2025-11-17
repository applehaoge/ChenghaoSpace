import type { FileEntry } from '@/features/kidsCoding/types/editor';
import type { RunFileDTO, RunJobDTO } from '@/features/kidsCoding/types/run';

const MAX_FILE_COUNT = 20;
const MAX_FILE_SIZE_BYTES = 100 * 1024;
const textEncoder = new TextEncoder();

const isValidPyFile = (file: FileEntry) => file.kind !== 'folder' && file.path?.toLowerCase().endsWith('.py');

const ensureSafePath = (path: string) => {
  const trimmed = path.trim();
  if (!trimmed) {
    throw new Error('File path cannot be empty');
  }
  if (trimmed.includes('/') || trimmed.includes('\\') || trimmed.includes('..')) {
    throw new Error('File path contains illegal characters');
  }
  return trimmed;
};

export function buildRunJobPayload(files: FileEntry[], activeFileId?: string | null): RunJobDTO {
  const pythonFiles = files.filter(isValidPyFile);
  if (!pythonFiles.length) {
    throw new Error('No Python files available to run');
  }
  if (pythonFiles.length > MAX_FILE_COUNT) {
    throw new Error(`Too many files. Max supported files: ${MAX_FILE_COUNT}`);
  }

  const sanitizedFiles: RunFileDTO[] = [];
  const seenPaths = new Set<string>();
  pythonFiles.forEach(file => {
    const path = ensureSafePath(file.path ?? file.name);
    if (seenPaths.has(path)) {
      throw new Error(`Duplicate file path detected: ${path}`);
    }
    const content = file.content ?? '';
    const byteLength = textEncoder.encode(content).length;
    if (byteLength > MAX_FILE_SIZE_BYTES) {
      throw new Error(`File ${path} exceeds size limit of ${MAX_FILE_SIZE_BYTES} bytes`);
    }
    sanitizedFiles.push({ path, content });
    seenPaths.add(path);
  });

  const entryFile = pythonFiles.find(file => file.id === activeFileId);
  if (!entryFile) {
    throw new Error('Active Python file is required to run the project');
  }
  const entryPath = ensureSafePath(entryFile.path ?? entryFile.name);
  if (!seenPaths.has(entryPath)) {
    throw new Error('Entry file is missing from payload');
  }

  return {
    protocolVersion: 1,
    files: sanitizedFiles,
    entryPath,
  };
}
