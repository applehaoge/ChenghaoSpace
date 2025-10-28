import type { UploadedAttachment } from '@/pages/home/types';
import {
  detectAttachmentCategory,
  formatFileSize,
  getAttachmentVisual,
} from '@/components/attachments';

type MessageAttachmentsProps = {
  attachments: UploadedAttachment[];
  align: 'left' | 'right';
  onPreview?: (attachment: UploadedAttachment) => void;
  onDownload?: (attachment: UploadedAttachment) => void;
};

export function MessageAttachments({
  attachments,
  align,
  onPreview,
  onDownload,
}: MessageAttachmentsProps) {
  if (!attachments.length) return null;

  const containerAlignment =
    align === 'right' ? 'items-end text-right' : 'items-start text-left';
  const itemAlignmentClass = align === 'right' ? 'self-end' : 'self-start';

  const resolveUrl = (attachment: UploadedAttachment) =>
    attachment.downloadUrl || attachment.previewUrl;

  const handlePreview = (attachment: UploadedAttachment) => {
    if (onPreview) {
      onPreview(attachment);
      return;
    }
    const targetUrl = resolveUrl(attachment);
    if (targetUrl && typeof window !== 'undefined') {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDownload = (attachment: UploadedAttachment) => {
    if (onDownload) {
      onDownload(attachment);
      return;
    }
    const targetUrl = resolveUrl(attachment);
    if (targetUrl && typeof window !== 'undefined') {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`flex flex-col gap-3 w-full ${containerAlignment}`}>
      {attachments.map(attachment => {
        const category = detectAttachmentCategory(attachment.mimeType, attachment.name);
        const visual = getAttachmentVisual(attachment.mimeType, attachment.name);
        const href = resolveUrl(attachment);
        const sizeText = attachment.size ? formatFileSize(attachment.size) : undefined;
        const sharedCardClass =
          'w-full max-w-[280px] rounded-2xl border border-gray-200 bg-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 transition-shadow hover:shadow-md cursor-pointer';
        const cardBody = (
          <div className="px-4 py-3 flex items-center gap-3 text-left">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${visual.accentClass} flex-shrink-0`}
            >
              <i className={`${visual.icon} text-lg`}></i>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-gray-800 truncate">{attachment.name}</div>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <span>{visual.label}</span>
                {sizeText ? (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{sizeText}</span>
                  </>
                ) : null}
              </div>
            </div>
            <i className="fas fa-arrow-up-right-from-square text-gray-400"></i>
          </div>
        );

        const imageUrl = category === 'image' ? attachment.previewUrl || attachment.downloadUrl : null;

        if (imageUrl) {
          return (
            <button
              type="button"
              key={attachment.fileId || href || attachment.name}
              onClick={() => handlePreview(attachment)}
              className={`${sharedCardClass} ${itemAlignmentClass} overflow-hidden`}
              aria-label={`Preview image ${attachment.name}`}
            >
              <img
                src={imageUrl}
                alt={attachment.name}
                className="w-full h-full max-h-[340px] object-contain"
                loading="lazy"
              />
            </button>
          );
        }

        if (href) {
          return (
            <a
              key={attachment.fileId || href || attachment.name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              download={attachment.name}
              onClick={() => onDownload?.(attachment)}
              className={`${sharedCardClass} ${itemAlignmentClass}`}
              aria-label={`Open ${attachment.name}`}
            >
              {cardBody}
            </a>
          );
        }

        return (
          <div
            key={attachment.fileId || attachment.name}
            className={`${sharedCardClass} ${itemAlignmentClass}`}
            role="button"
            tabIndex={0}
            onClick={() => handleDownload(attachment)}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleDownload(attachment);
              }
            }}
            aria-label={`查看附件 ${attachment.name}`}
          >
            {cardBody}
          </div>
        );
      })}
    </div>
  );
}
