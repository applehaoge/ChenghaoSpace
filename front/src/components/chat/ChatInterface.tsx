import { useEffect, useCallback, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { toast } from 'sonner';
import { AttachmentBadge, useFileUploader } from '@/components/attachments';
import type { ChatBubble, UploadedAttachment } from '@/pages/home/types';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { useConversationController } from '@/components/chat/useConversationController';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { VoiceInputButton } from '@/components/home/VoiceInputButton';

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
    scrollToLatest,
    setAutoScrollEnabled,
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

  const [isAtBottom, setIsAtBottom] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - (scrollTop + clientHeight) <= 48;
      setIsAtBottom(isNearBottom);
      setAutoScrollEnabled(isNearBottom);
    };

    handleScroll();
    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [setAutoScrollEnabled]);

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

    setAutoScrollEnabled(true);
    setIsAtBottom(true);
    scrollToLatest();

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
    scrollToLatest,
    setAutoScrollEnabled,
    setIsAtBottom,
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

  const {
    status: speechStatus,
    start: startSpeech,
    stop: stopSpeech,
    isSupported: isSpeechSupported,
  } = useSpeechToText({
    onResult: transcript => {
      setComposerValue(prev => {
        if (!prev) return transcript;
        const needsSpace = /\S$/.test(prev);
        return `${prev}${needsSpace ? ' ' : ''}${transcript}`;
      });
      toast.success('语音识别完成，已填入输入框');
    },
    onError: message => {
      toast.error(message);
    },
  });

  const contentStyle = {
    width: '100%',
    maxWidth: '92vw',
  } as const;

  return (
    <main className="flex-1 bg-white border-l border-gray-100 flex flex-col min-h-0">
      <div className="sticky top-0 z-10 border-b border-gray-100 bg-white px-5 py-5">
        <div className="flex w-full items-center justify-between gap-3" style={contentStyle}>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" onClick={onBack}>
              <i className="fas fa-arrow-left text-gray-500"></i>
            </button>
            <h2 className="text-lg font-medium text-gray-800">{title || 'AI对话助手'}</h2>
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
            <button className="group flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-100 bg-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-200 hover:border-rose-200 hover:shadow-md active:translate-y-px">
              <i className="fas fa-ellipsis text-lg bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-600 bg-clip-text text-transparent transition-all group-hover:from-orange-400 group-hover:via-pink-500 group-hover:to-rose-500"></i>
            </button>
          </div>
        </div>
      </div>

      <div className="relative flex-1 min-h-0">
        <div
          ref={scrollContainerRef}
          className="h-full overflow-y-auto bg-gray-50 chat-window px-5 py-5 sm:px-6 lg:px-8"
        >
          <div className="w-full" style={contentStyle}>
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
        </div>

        {!isAtBottom && (
          <button
            type="button"
            aria-label="回到最新消息"
            className="absolute bottom-6 right-6 h-12 w-12 rounded-full bg-white text-gray-600 shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors z-10"
            onClick={() => {
              setAutoScrollEnabled(true);
              setIsAtBottom(true);
              scrollToLatest();
            }}
          >
            <i className="fas fa-arrow-down"></i>
          </button>
        )}
      </div>

      <div className="border-t border-gray-100 bg-white px-5 py-5">
        <div className="w-full" style={contentStyle}>
          <div className="flex items-center gap-3 mb-3">
            <VoiceInputButton
              status={speechStatus}
              onStart={startSpeech}
              onStop={stopSpeech}
              disabled={!isSpeechSupported || chatHasUploading}
            />
            <button
              className="group flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-100 bg-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-200 hover:border-rose-200 hover:shadow-md active:translate-y-px"
              onClick={openChatFileDialog}
            >
              <i className="fas fa-paperclip text-lg bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-600 bg-clip-text text-transparent transition-all group-hover:from-orange-400 group-hover:via-pink-500 group-hover:to-rose-500"></i>
            </button>
            <button className="group flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-100 bg-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-200 hover:border-rose-200 hover:shadow-md active:translate-y-px">
              <i className="fas fa-smile text-lg bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-600 bg-clip-text text-transparent transition-all group-hover:from-orange-400 group-hover:via-pink-500 group-hover:to-rose-500"></i>
            </button>
            {speechStatus === 'recording' ? (
              <span className="flex items-center gap-1 text-xs font-medium text-red-500">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></span>
                正在录音...
              </span>
            ) : null}
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
              placeholder="我想说的是..."
              rows={2}
              style={{ minHeight: 56, maxHeight: 220 }}
            />
            <button
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-600 text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-200 hover:from-orange-400 hover:via-pink-500 hover:to-rose-500 hover:shadow-lg hover:brightness-110 hover:scale-105 active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
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
    </main>
  );
}



