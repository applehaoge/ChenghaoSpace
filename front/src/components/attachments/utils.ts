export type AttachmentCategory =
  | 'image'
  | 'video'
  | 'audio'
  | 'pdf'
  | 'word'
  | 'excel'
  | 'ppt'
  | 'text'
  | 'generic';

export const detectAttachmentCategory = (mimeType: string, name: string): AttachmentCategory => {
  const lowerMime = (mimeType || '').toLowerCase();
  const lowerName = (name || '').toLowerCase();

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

export const formatFileSize = (size: number) => {
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

export const getAttachmentVisual = (mimeType: string, name: string) => {
  switch (detectAttachmentCategory(mimeType, name)) {
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
