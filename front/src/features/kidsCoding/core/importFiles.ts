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
  buildUniquePath: (candidatePath: string) => string;
  setActiveFile: (fileId: string) => void;
};

const MAX_FILE_SIZE = 200 * 1024;
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

const isValidName = (name: string) => {
  if (!name || !name.trim()) return false;
  return !(name.includes('/') || name.includes('\\') || name.includes('..'));
};

const joinPath = (parentPath: string, name: string) => {
  return parentPath ? `${parentPath}/${name}` : name;
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
  const { parentPath, createFile, buildUniquePath, setActiveFile } = options;
  const safeParent = normalizeDirectoryPath(parentPath);
  const createdIds: string[] = [];

  for (const file of files) {
    if (!isValidName(file.name)) {
      toast.error(`${file.name || '文件'} 名称不合法`);
      continue;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`${file.name} 超过大小限制（最多 200KB）`);
      continue;
    }
    const isText = isTextFile(file.name);
    const isImage = isImageFile(file.name);
    const isAudio = isAudioFile(file.name);
    const isBinary = isBinaryFile(file.name);
    if (!isText && !isImage && !isAudio && !isBinary) {
      toast.error(`${file.name} 类型不支持`);
      continue;
    }

    const candidatePath = joinPath(safeParent, file.name.trim());
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
