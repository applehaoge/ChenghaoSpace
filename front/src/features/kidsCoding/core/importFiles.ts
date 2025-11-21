import { toast } from 'sonner';

type ImportOptions = {
  parentPath?: string;
  createFile: (options: { path: string; content: string; language?: string }) => { id: string } | null;
  buildUniquePath: (candidatePath: string) => string;
  setActiveFile: (fileId: string) => void;
};

const MAX_FILE_SIZE = 200 * 1024;

const normalizeDirectoryPath = (input?: string) => {
  if (!input) return '';
  return input.replace(/\\/g, '/').replace(/\/+/g, '/').replace(/^\/|\/$/g, '');
};

const isValidName = (name: string) => {
  if (!name || !name.trim()) return false;
  return !(name.includes('/') || name.includes('\\') || name.includes('..'));
};

const isLikelyBinary = (name: string) => /\.(png|jpe?g|gif|bmp|webp|svg|mp3|wav|ogg|mp4|mov|avi|zip|rar|7z|pdf)$/i.test(name);

const joinPath = (parentPath: string, name: string) => {
  return parentPath ? `${parentPath}/${name}` : name;
};

const detectLanguage = (name: string) => {
  return name.toLowerCase().endsWith('.py') ? 'python' : undefined;
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
    if (isLikelyBinary(file.name)) {
      toast.error(`${file.name} 不是文本文件`);
      continue;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error(`${file.name} 超过大小限制（最多 200KB）`);
      continue;
    }

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

    const candidatePath = joinPath(safeParent, file.name.trim());
    const uniquePath = buildUniquePath(candidatePath);
    const entry = createFile({
      path: uniquePath,
      content: text,
      language: detectLanguage(file.name),
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
