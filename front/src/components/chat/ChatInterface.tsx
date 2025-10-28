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
    if (!trimmed || isLoading) return;
    if (chatHasUploading) {
      toast.info('\u8bf7\u7b49\u5f85\u6587\u4ef6\u4e0a\u4f20\u5b8c\u6210');
      return;
    }
    if (chatAttachments.some(item => item.status === 'error')) {
      toast.error('\u8bf7\u5148\u79fb\u9664\u4e0a\u4f20\u5931\u8d25\u7684\u9644\u4ef6');
      return;
    }
    if (hasAttachmentMetadataIssue) {
      toast.error('\u9644\u4ef6\u4fe1\u606f\u4e0d\u5b8c\u6574\uff0c\u8bf7\u91cd\u65b0\u4e0a\u4f20\u6587\u4ef6');
      return;
    }

    const succeeded = await sendMessage(trimmed, completedAttachments);
    if (succeeded) {
      clearChatAttachments();
    }
  }, [
    chatAttachments,
    chatHasUploading,
    clearChatAttachments,
    completedAttachments,
    composerValue,
    hasAttachmentMetadataIssue,
    isLoading,
    sendMessage,
  ]);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        if (chatHasUploading) {
          toast.info('\u8bf7\u7b49\u5f85\u6587\u4ef6\u4e0a\u4f20\u5b8c\u6210');
          return;
        }
        void handleSendMessage();
      }
    },
    [chatHasUploading, handleSendMessage]
  );

  const disableSend =
    !composerValue.trim() ||
    isLoading ||
    chatHasUploading ||
    chatAttachments.some(item => item.status === 'error');

  return (
    <main className="flex-1 w-[calc(100%-260px)] bg-white border-l border-gray-100 flex flex-col min-h-0">
      <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" onClick={onBack}>
            <i className="fas fa-arrow-left text-gray-500"></i>
          </button>
          <h2 className="text-lg font-medium text-gray-800">{title || 'AI\u5bf9\u8bdd\u52a9\u624b'}</h2>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <i className="fas fa-clock-rotate-left text-gray-500"></i>
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <i className="fas fa-share-nodes text-gray-500"></i>
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <i className="fas fa-file-export text-gray-500"></i>
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <i className="fas fa-ellipsis text-gray-500"></i>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 bg-gray-50 chat-window min-h-0">
        {messages.map(message => (
          <ChatMessage key={message.id} message={message} onCopy={handleCopy} />
        ))}

        {isLoading && (
          <div className="flex justify-start mb-6">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
              <i className="fas fa-robot text-blue-500"></i>
            </div>
            <div className="bg-white border border-gray-200 text-gray-800 p-4 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-5 border-t border-gray-100">
        <div className="flex gap-2.5 mb-3">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <i className="fas fa-microphone text-gray-500"></i>
          </button>
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            onClick={openChatFileDialog}
          >
            <i className="fas fa-paperclip text-gray-500"></i>
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <i className="fas fa-smile text-gray-500"></i>
          </button>
        </div>

        {chatAttachments.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-3">
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
            className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            placeholder="\u6211\u60f3\u8bf4\u7684\u662f..."
            rows={2}
            style={{ minHeight: 56, maxHeight: 220 }}
          />
          <button
            className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center hover:shadow-md transition-all disabled:opacity-50"
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
    </main>
  );
}
