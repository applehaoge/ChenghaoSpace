import type { FileEntry } from '@/features/kidsCoding/types/editor';

interface BinaryInfoPaneProps {
  entry: FileEntry;
}

const formatSize = (size?: number) => {
  if (!size) return '未知大小';
  if (size < 1024) return `${size} B`;
  const kb = size / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

const describeType = (entry: FileEntry) => {
  if (entry.mime) return entry.mime;
  if (entry.extension) return entry.extension;
  return '未知类型';
};

export function BinaryInfoPane({ entry }: BinaryInfoPaneProps) {
  return (
    <div className="h-full w-full flex items-center justify-center bg-slate-900/70">
      <div className="max-w-lg w-full bg-slate-800/80 text-slate-100 rounded-2xl shadow-xl p-6 space-y-3 border border-slate-700">
        <div className="text-lg font-semibold truncate">{entry.name}</div>
        <div className="text-sm text-slate-200">大小：{formatSize(entry.size)}</div>
        <div className="text-sm text-slate-200">类型：{describeType(entry)}</div>
        <div className="text-sm text-slate-300 leading-relaxed">
          这是二进制文件，当前暂不支持在编辑器中直接查看内容。
        </div>
      </div>
    </div>
  );
}
