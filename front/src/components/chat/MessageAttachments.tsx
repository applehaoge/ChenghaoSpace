import type { UploadedAttachment } from '@/pages/home/types';
import {
  detectAttachmentCategory,
  formatFileSize,
  getAttachmentVisual,
} from '@/components/attachments';

type MessageAttachmentsProps = {
  attachments: UploadedAttachment[];
  align: 'left' | 'right';
};

export function MessageAttachments({ attachments, align }: MessageAttachmentsProps) {
  if (!attachments.length) return null;

  const containerAlignment =
    align === 'right' ? 'items-end text-right' : 'items-start text-left';

  return (
    <div className={`flex flex-col gap-3 w-full ${containerAlignment}`}>
      {attachments.map(attachment => {
        const category = detectAttachmentCategory(attachment.mimeType, attachment.name);
        const visual = getAttachmentVisual(attachment.mimeType, attachment.name);
        const href = attachment.downloadUrl || attachment.previewUrl;
        const sizeText = attachment.size ? formatFileSize(attachment.size) : undefined;

        if (category === 'image' && attachment.previewUrl) {
          return (
            <div
              key={attachment.fileId || attachment.downloadUrl || attachment.previewUrl || attachment.name}
              className="w-full max-w-[280px] rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden"
            >
              <img
                src={attachment.previewUrl}
                alt={attachment.name}
                className="w-full h-full max-h-[340px] object-contain bg-gray-50"
                loading="lazy"
              />
            </div>
          );
        }

        const card = (
          <div
            className="w-full max-w-[280px] rounded-2xl border border-gray-200 bg-white shadow-sm px-4 py-3 flex items-center gap-3 hover:shadow-md transition-shadow"
          >
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${visual.accentClass} flex-shrink-0`}
            >
              <i className={`${visual.icon} text-lg`}></i>
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="text-sm font-medium text-gray-800 truncate">{attachment.name}</div>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <span>{visual.label}</span>
                {sizeText ? <span>· {sizeText}</span> : null}
              </div>
            </div>
            <i className="fas fa-arrow-up-right-from-square text-gray-400"></i>
          </div>
        );

        if (href) {
          return (
            <a
              key={attachment.fileId || href || attachment.name}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-2xl"
            >
              {card}
            </a>
          );
        }

        return (
          <div
            key={attachment.fileId || attachment.name}
            className="w-full max-w-[280px]"
          >
            {card}
          </div>
        );
      })}
    </div>
  );
}
