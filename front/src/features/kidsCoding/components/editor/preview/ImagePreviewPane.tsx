import type { FileEntry } from '@/features/kidsCoding/types/editor';

interface ImagePreviewPaneProps {
  entry: FileEntry;
}

export function ImagePreviewPane({ entry }: ImagePreviewPaneProps) {
  const src = `data:${entry.mime || 'image/png'};base64,${entry.content ?? ''}`;
  return (
    <div className="h-full w-full flex items-center justify-center bg-slate-900/80">
      <img src={src} alt={entry.name} className="max-h-full max-w-full object-contain rounded-lg shadow-lg" />
    </div>
  );
}
