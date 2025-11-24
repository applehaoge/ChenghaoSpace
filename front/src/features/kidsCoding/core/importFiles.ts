import { toast } from 'sonner';
import type { FileEntry } from '@/features/kidsCoding/types/editor';
import { MAX_BINARY_FILE_SIZE_BYTES, MAX_TEXT_FILE_SIZE_BYTES } from '@/features/kidsCoding/core/fileSizeLimits';

type ImportOptions = {
  parentPath?: string;
  createFileEntry: (options: {
    path: string;
    content: string;
    language?: string;
    encoding?: 'utf8' | 'base64';
    mime?: string;
    size?: number;
  }) => FileEntry | null;
  createFolderEntry: (path: string) => FileEntry | null;
  buildUniquePath: (candidatePath: string) => string;
};

const MAX_CONCURRENCY = 3;
const TEXT_MAX = 2 * 1024 * 1024;
const IMAGE_MAX = 5 * 1024 * 1024;
const AUDIO_MAX = 10 * 1024 * 1024;
const BINARY_MAX = 20 * 1024 * 1024;
const DIRECTORY_TOTAL_MAX = 50 * 1024 * 1024;
const TEXT_EXTENSIONS = [
  '.md',
  '.yaml',
  '.yml',
  '.xml',
  '.html',
  '.css',
  '.scss',
  '.sass',
  '.less',
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.py',
  '.java',
  '.c',
  '.cpp',
  '.h',
  '.hpp',
  '.cs',
  '.json',
  '.jsonc',
  '.csv',
  '.tsv',
  '.ini',
  '.conf',
  '.config',
  '.properties',
  '.toml',
  '.vue',
  '.svelte',
  '.sh',
  '.bash',
  '.zsh',
  '.fish',
  '.r',
  '.go',
  '.php',
  '.rb',
  '.swift',
  '.kt',
  '.rs',
  '.txt',
  '.log',
];
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.gif', '.svg'];
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg'];
const BINARY_EXTENSIONS = [
  '.zip',
  '.rar',
  '.7z',
  '.tar',
  '.gz',
  '.tgz',
  '.npy',
  '.npz',
  '.bin',
  '.dat',
  '.pkl',
  '.pt',
  '.pth',
  '.onnx',
  '.tflite',
  '.pb',
  '.ckpt',
  '.h5',
  '.glb',
  '.gltf',
  '.obj',
  '.stl',
  '.dae',
  '.ply',
  '.fbx',
];

const normalizeDirectoryPath = (input?: string) => {
  if (!input) return '';
  return input.replace(/\\/g, '/').replace(/\/+/g, '/').replace(/^\/|\/$/g, '');
};

const normalizeRelativePath = (input: string) => {
  const cleaned = input.replace(/\\/g, '/').replace(/\/+/g, '/').trim();
  const trimmed = cleaned.replace(/^\/+|\/+$/g, '');
  if (!trimmed) return '';
  if (/^[a-zA-Z]:/.test(trimmed) || trimmed.startsWith('/')) return '';
  if (trimmed.includes('..')) return '';
  const segments = trimmed
    .split('/')
    .map(segment => segment.trim())
    .filter(Boolean);
  if (!segments.length) return '';
  return segments.join('/');
};

const isValidName = (name: string) => {
  if (!name || !name.trim()) return false;
  return !(name.includes('/') || name.includes('\\') || name.includes('..'));
};

const LANGUAGE_BY_EXTENSION: Record<string, string> = {
  '.md': 'markdown',
  '.yaml': 'yaml',
  '.yml': 'yaml',
  '.xml': 'xml',
  '.html': 'html',
  '.css': 'css',
  '.scss': 'css',
  '.sass': 'css',
  '.less': 'css',
  '.js': 'javascript',
  '.jsx': 'javascriptreact',
  '.ts': 'typescript',
  '.tsx': 'typescriptreact',
  '.json': 'json',
  '.jsonc': 'json',
  '.ini': 'ini',
  '.conf': 'ini',
  '.config': 'ini',
  '.properties': 'ini',
  '.toml': 'toml',
  '.vue': 'vue',
  '.svelte': 'svelte',
  '.sh': 'shell',
  '.bash': 'shell',
  '.zsh': 'shell',
  '.fish': 'shell',
  '.c': 'c',
  '.cpp': 'cpp',
  '.h': 'c',
  '.hpp': 'cpp',
  '.cs': 'csharp',
  '.java': 'java',
  '.py': 'python',
  '.php': 'php',
  '.rb': 'ruby',
  '.swift': 'swift',
  '.kt': 'kotlin',
  '.rs': 'rust',
  '.go': 'go',
  '.r': 'r',
  '.txt': 'plaintext',
  '.log': 'plaintext',
};

const detectLanguage = (name: string) => {
  const ext = pickExtension(name);
  return LANGUAGE_BY_EXTENSION[ext];
};

const pickExtension = (name: string) => {
  const lower = name.toLowerCase();
  const dotIndex = lower.lastIndexOf('.');
  return dotIndex >= 0 ? lower.slice(dotIndex) : '';
};

const isTextFile = (name: string) => {
  const ext = pickExtension(name);
  return TEXT_EXTENSIONS.includes(ext);
};

const isImageFile = (name: string) => {
  const ext = pickExtension(name);
  return IMAGE_EXTENSIONS.includes(ext);
};

const isAudioFile = (name: string) => {
  const ext = pickExtension(name);
  return AUDIO_EXTENSIONS.includes(ext);
};

const isBinaryFile = (name: string) => {
  const ext = pickExtension(name);
  return BINARY_EXTENSIONS.includes(ext);
};

const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

export async function importTextFiles(
  files: File[],
  options: ImportOptions,
): Promise<{ entries: FileEntry[]; firstFileId?: string }> {
  if (!files?.length) return;
  const { parentPath, createFileEntry, createFolderEntry, buildUniquePath } = options;
  const safeParent = normalizeDirectoryPath(parentPath);
  const createdFileIds: string[] = [];
  const createdEntries: FileEntry[] = [];
  const folderPathCache = new Map<string, string>();
  const baseExistingPath = safeParent ? `${safeParent}/` : '';
  const totalSize = files.reduce((acc, file) => acc + (file.size || 0), 0);
  if (totalSize > DIRECTORY_TOTAL_MAX) {
    toast.error('上传的目录或文件总大小超过 50MB');
    return;
  }

  const ensureFolderPath = (segments: string[]): string => {
    if (!segments.length) return '';
    const original = segments.join('/');
    const cached = folderPathCache.get(original);
    if (cached !== undefined) return cached;
    const parentSegments = segments.slice(0, -1);
    const parentPathResolved = ensureFolderPath(parentSegments);
    const dirName = segments[segments.length - 1];
    const candidatePath = parentPathResolved ? `${parentPathResolved}/${dirName}` : dirName;
    const pathWithBase = parentPathResolved
      ? candidatePath
      : baseExistingPath
        ? `${baseExistingPath}${candidatePath}`
        : candidatePath;
    const uniquePath = buildUniquePath(pathWithBase);
    const folderEntry = createFolderEntry(uniquePath);
    if (!folderEntry?.id) {
      toast.error(`${candidatePath} 文件夹创建失败`);
      folderPathCache.set(original, '');
      return '';
    }
    createdEntries.push(folderEntry);
    folderPathCache.set(original, uniquePath);
    return uniquePath;
  };

  // 预扫描：标准化路径、判定类型与大小，收集目录
  const preparedFiles: Array<{
    file: File;
    normalizedPath: string;
    fileName: string;
    folderSegments: string[];
    isText: boolean;
    isImage: boolean;
    isAudio: boolean;
    isBinary: boolean;
  }> = [];
  const folderSet = new Set<string>();

  for (const file of files) {
    const relativeRaw = file.webkitRelativePath || file.name;
    const normalized = normalizeRelativePath(relativeRaw);
    if (!normalized) {
      toast.error(`${relativeRaw || '文件'} 路径不合法`);
      continue;
    }
    const segments = normalized.split('/');
    const fileName = segments.pop();
    if (!fileName || !isValidName(fileName)) {
      toast.error(`${relativeRaw || '文件'} 名称不合法`);
      continue;
    }
    const folderSegments = segments.filter(Boolean);
    const isText = isTextFile(file.name);
    const isImage = isImageFile(file.name);
    const isAudio = isAudioFile(file.name);
    const isBinary = isBinaryFile(file.name);
    if (!isText && !isImage && !isAudio && !isBinary) {
      toast.error(`${file.name} 类型不支持`);
      continue;
    }
    const uploadLimit = isText ? MAX_TEXT_FILE_SIZE_BYTES : MAX_BINARY_FILE_SIZE_BYTES;
    if ((file.size || 0) > uploadLimit) {
      toast.error(`${file.name} 超过大小限制（最大 ${uploadLimit} 字节）`);
      continue;
    }
    const sizeLimit = isText
      ? TEXT_MAX
      : isImage
        ? IMAGE_MAX
        : isAudio
          ? AUDIO_MAX
          : BINARY_MAX;
    if (file.size > sizeLimit) {
      const limitMb = Math.floor(sizeLimit / 1024 / 1024);
      toast.error(`${file.name} 超过大小限制（最多 ${limitMb}MB）`);
      continue;
    }
    folderSegments.forEach((_, idx) => {
      const folderPath = folderSegments.slice(0, idx + 1).join('/');
      folderSet.add(folderPath);
    });
    preparedFiles.push({
      file,
      normalizedPath: normalized,
      fileName,
      folderSegments,
      isText,
      isImage,
      isAudio,
      isBinary,
    });
  }

  // 先创建目录（按层级排序，避免重复递归）
  const sortedFolders = Array.from(folderSet).sort((a, b) => a.split('/').length - b.split('/').length);
  for (const folderPath of sortedFolders) {
    const resolved = ensureFolderPath(folderPath.split('/'));
    if (!resolved) {
      // 已提示 toast，继续尝试其他目录
      continue;
    }
  }

  // 简易并发池，限制读取/写入同时进行的任务数
  const pendingTasks: Array<() => Promise<void>> = [];

  for (const prepared of preparedFiles) {
    const { file, fileName, folderSegments, isText, isImage, isAudio, isBinary } = prepared;
    const parentPathResolved = folderSegments.length ? ensureFolderPath(folderSegments) : '';
    const candidatePath = parentPathResolved
      ? `${parentPathResolved}/${fileName}`
      : baseExistingPath
        ? `${baseExistingPath}${fileName}`
        : fileName;
    const uniquePath = buildUniquePath(candidatePath);

    pendingTasks.push(async () => {
      if (isText) {
        let text = '';
        try {
          text = await file.text();
        } catch (error) {
          toast.error(`${file.name} 读取失败`);
          return;
        }

        if (!text.length) {
          toast.error(`${file.name} 为空，无法导入`);
          return;
        }

        const entry = createFileEntry({
          path: uniquePath,
          content: text,
          language: detectLanguage(file.name),
          encoding: 'utf8',
          mime: file.type || 'text/plain',
          size: file.size,
        });

        if (entry?.id) {
          createdFileIds.push(entry.id);
          createdEntries.push(entry);
        } else {
          toast.error(`${file.name} 导入失败`);
        }
        return;
      }

      let base64 = '';
      try {
        const buffer = await file.arrayBuffer();
        base64 = arrayBufferToBase64(buffer);
      } catch (error) {
        toast.error(`${file.name} 读取失败`);
        return;
      }

      if (!base64.length) {
        toast.error(`${file.name} 为空，无法导入`);
        return;
      }

      const entry = createFileEntry({
        path: uniquePath,
        content: base64,
        encoding: 'base64',
        mime: file.type || 'application/octet-stream',
        size: file.size,
      });

      if (entry?.id) {
        createdFileIds.push(entry.id);
        createdEntries.push(entry);
      } else {
        toast.error(`${file.name} 导入失败`);
      }
    });
  }

  const workerPool = async (tasks: Array<() => Promise<void>>, concurrency: number) => {
    const queue = [...tasks];
    const runners: Promise<void>[] = [];
    const runNext = async (): Promise<void> => {
      const task = queue.shift();
      if (!task) return;
      await task();
      return runNext();
    };
    for (let i = 0; i < concurrency; i += 1) {
      runners.push(runNext());
    }
    await Promise.all(runners);
  };

  await workerPool(pendingTasks, MAX_CONCURRENCY);

  return {
    entries: createdEntries,
    firstFileId: createdFileIds[0],
  };
}
