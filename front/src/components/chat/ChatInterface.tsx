import { useEffect, useCallback, useMemo } from 'react';
import type { KeyboardEvent } from 'react';
import { toast } from 'sonner';
import { AttachmentBadge, useFileUploader } from '@/components/attachments';
import type { ChatBubble, UploadedAttachment } from '@/pages/home/types';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { useConversationController } from '@/components/chat/useConversationController';

export type ChatInterfaceProps = {
  conversationId: string;
  title: string;
  initialMessage: string;
  initialMessages: ChatBubble[];
  sessionId?: string;
  initialAttachments?: UploadedAttachment[];
  onBack: () => void;
  onConversationUpdate: (conversationId: string, messages: ChatBubble[]) => void;
  onSessionChange: (conversationId: string, sessionId: string) => void;
  onInitialMessageHandled?: () => void;
};

export function ChatInterface({
  conversationId,
  title,
  initialMessage,
  initialMessages,
  sessionId,
  initialAttachments,
  onBack,
  onConversationUpdate,
  onSessionChange,
  onInitialMessageHandled,
}: ChatInterfaceProps) {
  const {
    messages,
    composerValue,
    setComposerValue,
    isLoading,
    messagesEndRef,
    textareaRef,
    adjustTextareaHeight,
    sendMessage,
    handleCopy,
  } = useConversationController({
    conversationId,
    initialMessage,
    initialMessages,
    sessionId,
    initialAttachments,
    onConversationUpdate,
    onSessionChange,
    onInitialMessageHandled,
  });

  const {
    attachments: chatAttachments,
    hasUploading: chatHasUploading,
    triggerFileDialog: openChatFileDialog,
    fileInputRef: chatFileInputRef,
    handleInputChange: handleChatFileInputChange,
    removeAttachment: removeChatAttachment,
    clearAttachments: clearChatAttachments,
    restoreAttachments: restoreChatAttachments,
  } = useFileUploader();

  useEffect(() => {
    clearChatAttachments();
  }, [conversationId, clearChatAttachments]);

  const completedAttachments = useMemo(() => {
    return chatAttachments
      .filter(item => item.status === 'done' && item.fileId)
      .map(item => ({
        fileId: item.fileId as string,
        name: item.name,
        mimeType: item.mimeType,
        size: item.size,
        previewUrl: item.previewUrl || item.downloadUrl,
        downloadUrl: item.downloadUrl || item.previewUrl,
        publicPath: item.publicPath,
      })) as UploadedAttachment[];
  }, [chatAttachments]);

  const hasAttachmentMetadataIssue = useMemo(
    () => chatAttachments.some(item => item.status === 'done' && !item.fileId),
    [chatAttachments]
  );

  const handleSendMessage = useCallback(async () => {
    const trimmed = composerValue.trim();
    if ((!trimmed && completedAttachments.length === 0) || isLoading) return;
    if (chatHasUploading) {
      toast.info('请等待文件上传完成');
      return;
    }
    if (chatAttachments.some(item => item.status === 'error')) {
      toast.error('请先移除上传失败的附件');
      return;
    }
    if (hasAttachmentMetadataIssue) {
      toast.error('附件信息不完整，请重新上传文件');
      return;
    }

    const attachmentsSnapshot = chatAttachments.map(item => ({ ...item }));
    clearChatAttachments();
    const succeeded = await sendMessage(trimmed, completedAttachments);
    if (!succeeded) {
      restoreChatAttachments(attachmentsSnapshot);
    }
  }, [
    chatAttachments,
    chatHasUploading,
    clearChatAttachments,
    completedAttachments,
    composerValue,
    hasAttachmentMetadataIssue,
    isLoading,
    restoreChatAttachments,
    sendMessage,
  ]);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        if (chatHasUploading) {
          toast.info('请等待文件上传完成');
          return;
        }
        void handleSendMessage();
      }
    },
    [chatHasUploading, handleSendMessage]
  );

  const hasSendableAttachments = chatAttachments.some(item => item.status === 'done' && item.fileId);
  const disableSend =
    (!composerValue.trim() && !hasSendableAttachments) ||
    isLoading ||
    chatHasUploading ||
    chatAttachments.some(item => item.status === 'error');

  const chatContainerStyle = { maxWidth: 'clamp(760px, 72vw, 1360px)' } as const;
  const chatContentStyle = { maxWidth: 'min(960px, 100%)' } as const;

  return (
    <main className="flex min-h-0 flex-1 flex-col border-l border-gray-100 bg-white">
      <div className="mx-auto flex w-full flex-1 flex-col" style={chatContainerStyle}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-5 sm:px-6 lg:px-8 2xl:px-12">
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full transition-colors hover:bg-gray-100" onClick={onBack}>
              <i className="fas fa-arrow-left text-gray-500"></i>
            </button>
            <h2 className="text-lg font-medium text-gray-800">{title || 'AI对话助手'}</h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full transition-colors hover:bg-gray-100">
              <i className="fas fa-clock-rotate-left text-gray-500"></i>
            </button>
            <button className="p-2 rounded-full transition-colors hover:bg-gray-100">
              <i className="fas fa-share-nodes text-gray-500"></i>
            </button>
            <button className="p-2 rounded-full transition-colors hover:bg-gray-100">
              <i className="fas fa-file-export text-gray-500"></i>
            </button>
            <button className="p-2 rounded-full transition-colors hover:bg-gray-100">
              <i className="fas fa-ellipsis text-gray-500"></i>
            </button>
          </div>
        </div>

        <div className="chat-window flex-1 min-h-0 overflow-y-auto bg-gray-50">
          <div className="mx-auto w-full px-5 py-5 sm:px-6 lg:px-8 2xl:px-12" style={chatContentStyle}>
            {messages.map(message => (
              <ChatMessage key={message.id} message={message} onCopy={handleCopy} />
            ))}

            {isLoading && (
              <div className="mb-6 flex justify-start">
                <div className="mr-2 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
                  <i className="fas fa-robot text-blue-500"></i>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-4 text-gray-800">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                    <div
                      className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                      style={{ animationDelay: '0.4s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t border-gray-100 bg-white">
          <div className="mx-auto w-full px-5 py-5 sm:px-6 lg:px-8 2xl:px-12" style={chatContentStyle}>
            <div className="mb-3 flex gap-2.5">
              <button className="p-2 rounded-full transition-colors hover:bg-gray-100">
                <i className="fas fa-microphone text-gray-500"></i>
              </button>
              <button
                className="p-2 rounded-full transition-colors hover:bg-gray-100"
                onClick={openChatFileDialog}
              >
                <i className="fas fa-paperclip text-gray-500"></i>
              </button>
              <button className="p-2 rounded-full transition-colors hover:bg-gray-100">
                <i className="fas fa-smile text-gray-500"></i>
              </button>
            </div>

            {chatAttachments.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-3">
                {chatAttachments.map(item => (
                  <AttachmentBadge key={item.id} attachment={item} onRemove={removeChatAttachment} />
                ))}
              </div>
            )}

            <div className="flex gap-2.5">
              <textarea
                ref={textareaRef}
                value={composerValue}
                onChange={event => setComposerValue(event.target.value)}
                onKeyDown={handleKeyPress}
                onInput={adjustTextareaHeight}
                className="flex-1 resize-none rounded-lg border border-gray-200 p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="我想说的是..."
                rows={2}
                style={{ minHeight: 56, maxHeight: 220 }}
              />
              <button
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white transition-all hover:shadow-md disabled:opacity-50"
                onClick={handleSendMessage}
                disabled={disableSend}
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>

            <input
              ref={chatFileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleChatFileInputChange}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
