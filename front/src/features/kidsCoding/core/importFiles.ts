import { toast } from 'sonner';

type ImportOptions = {
  parentPath?: string;
  createFile: (options: {
    path: string;
    content: string;
    language?: string;
    encoding?: 'utf8' | 'base64';
    mime?: string;
    size?: number;
  }) => { id: string } | null;
  createFolder: (path: string) => { id: string } | null;
  buildUniquePath: (candidatePath: string) => string;
  setActiveFile: (fileId: string) => void;
};

const TEXT_MAX = 2 * 1024 * 1024;
const IMAGE_MAX = 5 * 1024 * 1024;
const AUDIO_MAX = 10 * 1024 * 1024;
const BINARY_MAX = 20 * 1024 * 1024;
const DIRECTORY_TOTAL_MAX = 50 * 1024 * 1024;
const TEXT_EXTENSIONS = ['.py', '.txt', '.json', '.csv'];
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

const detectLanguage = (name: string) => {
  return name.toLowerCase().endsWith('.py') ? 'python' : undefined;
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

export async function importTextFiles(files: File[], options: ImportOptions) {
  if (!files?.length) return;
  const { parentPath, createFile, createFolder, buildUniquePath, setActiveFile } = options;
  const safeParent = normalizeDirectoryPath(parentPath);
  const createdIds: string[] = [];
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
    const folderEntry = createFolder(uniquePath);
    if (!folderEntry?.id) {
      toast.error(`${candidatePath} 文件夹创建失败`);
      folderPathCache.set(original, '');
      return '';
    }
    folderPathCache.set(original, uniquePath);
    return uniquePath;
  };

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
    const parentPathResolved = ensureFolderPath(folderSegments);
    if (folderSegments.length && !parentPathResolved) {
      continue;
    }
    const candidatePath = parentPathResolved
      ? `${parentPathResolved}/${fileName}`
      : baseExistingPath
        ? `${baseExistingPath}${fileName}`
        : fileName;
    // 类型判定必须先声明，避免 TDZ（Temporal Dead Zone）
    const isText = isTextFile(file.name);
    const isImage = isImageFile(file.name);
    const isAudio = isAudioFile(file.name);
    const isBinary = isBinaryFile(file.name);
    // 先有类型，再根据类型选对应大小限制
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
    if (!isText && !isImage && !isAudio && !isBinary) {
      toast.error(`${file.name} 类型不支持`);
      continue;
    }

    const uniquePath = buildUniquePath(candidatePath);

    if (isText) {
      let text = '';
      try {
        text = await file.text();
      } catch (error) {
        toast.error(`${file.name} 读取失败`);
        continue;
      }

      if (!text.length) {
        toast.error(`${file.name} 为空，无法导入`);
        continue;
      }

      const entry = createFile({
        path: uniquePath,
        content: text,
        language: detectLanguage(file.name),
        encoding: 'utf8',
        mime: file.type || 'text/plain',
        size: file.size,
      });

      if (entry?.id) {
        createdIds.push(entry.id);
      } else {
        toast.error(`${file.name} 导入失败`);
      }
      continue;
    }

    let base64 = '';
    try {
      const buffer = await file.arrayBuffer();
      base64 = arrayBufferToBase64(buffer);
    } catch (error) {
      toast.error(`${file.name} 读取失败`);
      continue;
    }

    if (!base64.length) {
      toast.error(`${file.name} 为空，无法导入`);
      continue;
    }

    const entry = createFile({
      path: uniquePath,
      content: base64,
      encoding: 'base64',
      mime: file.type || 'application/octet-stream',
      size: file.size,
    });

    if (entry?.id) {
      createdIds.push(entry.id);
    } else {
      toast.error(`${file.name} 导入失败`);
    }
  }

  if (createdIds.length) {
    setActiveFile(createdIds[0]);
    toast.success(`成功导入 ${createdIds.length} 个文件`);
  }
}
