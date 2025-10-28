export type FileAttachmentStatus = 'uploading' | 'done' | 'error';

export type FileAttachment = {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  status: FileAttachmentStatus;
  error?: string;
  previewUrl?: string;
  fileId?: string;
  downloadUrl?: string;
  publicPath?: string;
};
