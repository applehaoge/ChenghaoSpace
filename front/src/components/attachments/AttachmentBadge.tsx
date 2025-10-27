import type { FileAttachment } from './types';
import { formatFileSize, getAttachmentVisual } from './utils';

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
