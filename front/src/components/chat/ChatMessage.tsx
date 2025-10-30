import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import type { ReactNode } from 'react';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import type { ChatBubble, UploadedAttachment } from '@/pages/home/types';
import { MessageAttachments } from './MessageAttachments';

const EMPTY_ATTACHMENTS: UploadedAttachment[] = [];

type ChatMessageProps = {
  message: ChatBubble;
  onCopy: (content: string) => void;
  onAttachmentPreview?: (attachment: UploadedAttachment) => void;
  onAttachmentDownload?: (attachment: UploadedAttachment) => void;
};

const markdownComponents: Components = {
  h1: ({ children, ...props }) => (
    <h1 className="text-lg font-semibold mb-2" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-base font-semibold mb-2" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-sm font-semibold mb-2" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p className="mb-2 leading-relaxed" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="mb-2 list-disc pl-5 space-y-1" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="mb-2 list-decimal pl-5 space-y-1" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="leading-relaxed" {...props}>
      {children}
    </li>
  ),
  strong: ({ children, ...props }) => (
    <strong className="font-semibold" {...props}>
      {children}
    </strong>
  ),
  code: ({
    inline,
    className,
    children,
  }: {
    inline?: boolean;
    className?: string;
    children?: ReactNode;
  }) => {
    if (inline) {
      return <code className="px-1 py-0.5 bg-gray-100 rounded text-sm">{children}</code>;
    }

    const raw = Array.isArray(children) ? children.join('') : String(children ?? '');
    const codeText = raw.replace(/\s+$/, '');
    const languageClass = typeof className === 'string' ? className : '';

    const handleCopy = async () => {
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(codeText);
        } else if (typeof document !== 'undefined') {
          const textarea = document.createElement('textarea');
          textarea.value = codeText;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand('copy');
          document.body.removeChild(textarea);
        } else {
          throw new Error('clipboard unavailable');
        }
        toast.success('已复制代码');
      } catch (error) {
        console.error('复制代码失败:', error);
        toast.error('复制失败，请手动复制');
      }
    };

    return (
      <div className="relative mb-2 group">
        <pre className="rounded-lg bg-gray-900 text-gray-100 p-3 pr-12 overflow-auto text-sm">
          <code className={languageClass}>{children}</code>
        </pre>
        <button
          type="button"
          className="absolute top-2 right-2 rounded-md border border-gray-700 bg-gray-800/80 text-gray-200 px-2 py-1 text-xs opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
          onClick={handleCopy}
          aria-label="复制代码"
        >
          <i className="fas fa-copy"></i>
        </button>
      </div>
    );
  },
};

export function ChatMessage({
  message,
  onCopy,
  onAttachmentPreview,
  onAttachmentDownload,
}: ChatMessageProps) {
  const isUser = message.sender === 'user';
  const attachments = message.attachments ?? EMPTY_ATTACHMENTS;
  const hasTextContent = typeof message.content === 'string' && message.content.trim().length > 0;
  const showBubble = hasTextContent || Boolean(message.isStreaming);
  const attachmentNotesNode = useMemo(() => {
    if (!message.attachmentNotes || message.attachmentNotes.length === 0) return null;
    return (
      <div
        className={`max-w-full rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-xs leading-relaxed px-3 py-2 ${
          isUser ? 'self-end text-right' : 'self-start text-left'
        }`}
      >
        {message.attachmentNotes.map((note, index) => (
          <p key={`${message.id}-note-${index}`} className="mb-1 last:mb-0">
            {note}
          </p>
        ))}
      </div>
    );
  }, [isUser, message.attachmentNotes, message.id]);

  const alignment = useMemo(
    () => ({
      wrapper: isUser ? 'justify-end' : 'justify-start',
      stack: isUser ? 'items-end' : 'items-start',
      order: isUser ? 'order-1' : 'order-2',
      avatarOrder: isUser ? 'order-3' : 'order-0',
    }),
    [isUser]
  );

  const attachmentsNode = useMemo(
    () =>
      attachments.length > 0 ? (
        <MessageAttachments
          attachments={attachments}
          align={isUser ? 'right' : 'left'}
          onPreview={onAttachmentPreview}
          onDownload={onAttachmentDownload}
        />
      ) : null,
    [attachments, isUser, onAttachmentPreview, onAttachmentDownload]
  );

  return (
    <div className={`flex mb-6 ${alignment.wrapper}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
          <i className="fas fa-robot text-blue-500"></i>
        </div>
      )}
      <div
        className={`max-w-full ${alignment.order} flex flex-col ${alignment.stack} gap-3 sm:max-w-[88%] xl:max-w-[82%] 2xl:max-w-[78%]`}
      >
        {attachmentsNode}
        {attachmentNotesNode}
        {showBubble ? (
          <div
            className={`group flex flex-col gap-2 max-w-full ${
              isUser ? 'self-end items-end' : 'self-start items-start'
            }`}
          >
            <div
              className={`relative inline-flex max-w-full rounded-lg ${
                isUser
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-800'
              } p-4`}
            >
              {message.sender === 'ai' ? (
                <div className="text-base leading-relaxed space-y-2">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                    {message.content}
                  </ReactMarkdown>
                  {message.isStreaming && (
                    <span className="inline-block w-2 h-4 bg-blue-400 rounded-sm animate-pulse"></span>
                  )}
                </div>
              ) : (
                <div className="whitespace-pre-wrap leading-relaxed text-base">{message.content}</div>
              )}
            </div>
            {hasTextContent ? (
              <div
                className={`flex mt-2 ${
                  isUser ? 'justify-end self-end' : 'justify-start self-start'
                } opacity-0 group-hover:opacity-100 transition-opacity`}
              >
                <button
                  type="button"
                  className={`h-8 w-8 flex items-center justify-center rounded-md border ${
                    isUser
                      ? 'border-blue-200 bg-white text-blue-600 hover:bg-blue-50 focus-visible:bg-blue-50'
                      : 'border-gray-200 bg-white text-gray-500 hover:text-gray-700 focus-visible:text-gray-700'
                  } shadow-sm text-sm transition-all duration-150`}
                  onClick={() => onCopy(message.content)}
                  aria-label="复制该条消息"
                >
                  <i className="fas fa-copy text-base leading-none"></i>
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ml-2 flex-shrink-0 order-3">
          <i className="fas fa-user text-gray-600"></i>
        </div>
      )}
    </div>
  );
}
