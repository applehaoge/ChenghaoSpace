import type { FileAttachment } from './types';

const formatFileSize = (size: number) => {
  if (!Number.isFinite(size) || size <= 0) return '';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let index = 0;
  let next = size;

  while (next >= 1024 && index < units.length - 1) {
    next /= 1024;
    index += 1;
  }

  return `${next.toFixed(next >= 10 || index === 0 ? 0 : 1)}${units[index]}`;
};

const detectCategory = (mimeType: string, name: string) => {
  const lowerMime = mimeType.toLowerCase();
  const lowerName = name.toLowerCase();

  if (lowerMime.startsWith('image/')) return 'image';
  if (lowerMime.startsWith('video/')) return 'video';
  if (lowerMime.startsWith('audio/')) return 'audio';
  if (lowerMime === 'application/pdf' || lowerName.endsWith('.pdf')) return 'pdf';
  if (
    lowerMime.includes('word') ||
    lowerMime.includes('msword') ||
    lowerMime.includes('officedocument.word') ||
    lowerName.endsWith('.doc') ||
    lowerName.endsWith('.docx')
  ) {
    return 'word';
  }
  if (
    lowerMime.includes('excel') ||
    lowerMime.includes('spreadsheet') ||
    lowerName.endsWith('.xls') ||
    lowerName.endsWith('.xlsx')
  ) {
    return 'excel';
  }
  if (
    lowerMime.includes('powerpoint') ||
    lowerName.endsWith('.ppt') ||
    lowerName.endsWith('.pptx')
  ) {
    return 'ppt';
  }
  if (lowerMime.includes('text') || lowerName.endsWith('.txt') || lowerName.endsWith('.md')) {
    return 'text';
  }
  return 'generic';
};

const getAttachmentVisual = (mimeType: string, name: string) => {
  switch (detectCategory(mimeType, name)) {
    case 'image':
      return { icon: 'fas fa-image', accentClass: 'bg-blue-500', label: '图片' };
    case 'video':
      return { icon: 'fas fa-video', accentClass: 'bg-purple-500', label: '视频' };
    case 'audio':
      return { icon: 'fas fa-music', accentClass: 'bg-pink-500', label: '音频' };
    case 'pdf':
      return { icon: 'fas fa-file-pdf', accentClass: 'bg-red-500', label: 'PDF' };
    case 'word':
      return { icon: 'fas fa-file-word', accentClass: 'bg-blue-600', label: '文档' };
    case 'excel':
      return { icon: 'fas fa-file-excel', accentClass: 'bg-green-600', label: '表格' };
    case 'ppt':
      return { icon: 'fas fa-file-powerpoint', accentClass: 'bg-orange-500', label: '演示' };
    case 'text':
      return { icon: 'fas fa-file-lines', accentClass: 'bg-slate-500', label: '文本' };
    default:
      return { icon: 'fas fa-file', accentClass: 'bg-gray-500', label: '附件' };
  }
};

type AttachmentBadgeProps = {
  attachment: FileAttachment;
  onRemove: (id: string) => void;
};

export function AttachmentBadge({ attachment, onRemove }: AttachmentBadgeProps) {
  const visual = getAttachmentVisual(attachment.mimeType, attachment.name);
  const isErrored = attachment.status === 'error';
  const isUploading = attachment.status === 'uploading';

  return (
    <div className="flex items-center gap-3 pr-3 pl-2 py-2 rounded-2xl border border-gray-200 bg-white shadow-sm max-w-full">
      <div className="relative flex-shrink-0">
        {attachment.previewUrl && !isErrored ? (
          <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
            <img
              src={attachment.previewUrl}
              alt={attachment.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${visual.accentClass}`}
          >
            <i className={`${visual.icon} text-lg`}></i>
          </div>
        )}
        {isUploading && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center animate-pulse">
            <i className="fas fa-spinner animate-spin"></i>
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-gray-800 truncate">{attachment.name}</div>
        <div
          className={`text-xs mt-0.5 ${isErrored ? 'text-red-500' : 'text-gray-500'} flex items-center gap-1`}
        >
          <span>{formatFileSize(attachment.size)}</span>
          <span>·</span>
          <span>
            {isUploading ? '上传中...' : isErrored ? attachment.error || '上传失败' : '上传完成'}
          </span>
        </div>
      </div>
      <button
        type="button"
        className="ml-2 w-6 h-6 rounded-full bg-black/80 text-white flex items-center justify-center text-xs hover:bg-black focus-visible:bg-black transition-colors"
        onClick={() => onRemove(attachment.id)}
        aria-label={`移除 ${attachment.name}`}
      >
        <i className="fas fa-xmark"></i>
      </button>
    </div>
  );
}
