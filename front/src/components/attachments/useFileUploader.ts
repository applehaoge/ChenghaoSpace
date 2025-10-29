import { useState, useEffect, useRef, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import { toast } from 'sonner';
import { aiService } from '@/api/aiService';
import type { FileAttachment } from './types';

type UseFileUploaderResult = {
  attachments: FileAttachment[];
  hasUploading: boolean;
  triggerFileDialog: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void;
  removeAttachment: (id: string) => void;
  clearAttachments: () => void;
  restoreAttachments: (items: FileAttachment[]) => void;
};

export function useFileUploader(): UseFileUploaderResult {
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const latestRef = useRef<FileAttachment[]>([]);

  useEffect(() => {
    latestRef.current = attachments;
  }, [attachments]);

  useEffect(() => {
    return () => {
      latestRef.current.forEach(att => {
        if (att.previewUrl) {
          URL.revokeObjectURL(att.previewUrl);
        }
      });
    };
  }, []);

  const removeAttachment = useCallback((id: string) => {
    setAttachments(prev => {
      const target = prev.find(item => item.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter(item => item.id !== id);
    });
  }, []);

  const clearAttachments = useCallback(() => {
    setAttachments(prev => {
      prev.forEach(item => {
        if (item.previewUrl) {
          URL.revokeObjectURL(item.previewUrl);
        }
      });
      return [];
    });
  }, []);

  const restoreAttachments = useCallback((items: FileAttachment[]) => {
    setAttachments(items.map(item => ({ ...item })));
  }, []);

  const startUpload = useCallback(async (attachmentId: string, file: File) => {
    const result = await aiService.uploadFile(file);
    if (!result.success) {
      const message = result.error || '上传失败';
      setAttachments(prev =>
        prev.map(item =>
          item.id === attachmentId ? { ...item, status: 'error', error: message } : item
        )
      );
      toast.error(`${file.name} 上传失败: ${message}`);
      return;
    }

    setAttachments(prev =>
      prev.map(item => {
        if (item.id !== attachmentId) return item;

        const remoteUrl = result.downloadUrl || result.url;
        const next = {
          ...item,
          status: 'done' as const,
          name: result.fileName || item.name,
          size: result.size ?? item.size,
          mimeType: result.mimeType || item.mimeType,
          fileId: result.fileId,
          downloadUrl: remoteUrl ?? item.downloadUrl,
          publicPath: result.publicPath ?? item.publicPath,
        };

        if (remoteUrl && file.type.startsWith('image/')) {
          if (item.previewUrl && item.previewUrl.startsWith('blob:') && item.previewUrl !== remoteUrl) {
            URL.revokeObjectURL(item.previewUrl);
          }
          next.previewUrl = remoteUrl;
        } else if (!next.previewUrl && remoteUrl) {
          next.previewUrl = remoteUrl;
        }

        return next;
      })
    );
    toast.success(`${file.name} 上传成功`, { id: `upload-success-${result.fileId || attachmentId}` });
  }, []);

  const queueFiles = useCallback(
    (files: File[]) => {
      if (!files.length) return;

      const tasks = files.map(file => {
        const id = `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const previewUrl = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
        return {
          attachment: {
            id,
            name: file.name,
            size: file.size,
            mimeType: file.type || 'application/octet-stream',
            status: 'uploading' as const,
            previewUrl,
          },
          file,
        };
      });

      setAttachments(prev => [...prev, ...tasks.map(task => task.attachment)]);

      tasks.forEach(task => {
        void startUpload(task.attachment.id, task.file);
      });
    },
    [startUpload]
  );

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const fileList = event.target.files;
      const files = fileList ? Array.from(fileList) : [];
      queueFiles(files);
      if (event.target) {
        event.target.value = '';
      }
    },
    [queueFiles]
  );

  const triggerFileDialog = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return {
    attachments,
    hasUploading: attachments.some(item => item.status === 'uploading'),
    triggerFileDialog,
    fileInputRef,
    handleInputChange,
    removeAttachment,
    clearAttachments,
    restoreAttachments,
  };
}
