import { useState, useEffect, useRef, useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { toast } from 'sonner';
import { aiService } from '@/api/aiService';

type ChatBubble = {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: string;
  provider?: string;
  sources?: Array<{ id: string; text: string; score?: number }>;
  error?: string;
  isStreaming?: boolean;
};


type MainContentProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  inputText: string;
  setInputText: (value: string) => void;
  onSendMessage?: (message: string) => void;
};

type TaskConversation = {
  id: string;
  name: string;
  icon: string;
  color: string;
  isBrand?: boolean;
  messages: ChatBubble[];
  createdAt: string;
  updatedAt: string;
  sessionId: string;
};

const TASK_STORAGE_KEY = 'chspace_tasks_v1';

const createSessionId = () => `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const normalizeMessages = (messages: ChatBubble[]): ChatBubble[] =>
  messages.map(message => ({
    ...message,
    timestamp: message.timestamp || new Date().toISOString(),
    isStreaming: message.isStreaming ? false : message.isStreaming,
  }));

const loadStoredTasks = (): TaskConversation[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(TASK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as TaskConversation[];
    const filtered = parsed.filter(task => {
      if (!task || typeof task !== 'object') return false;
      const id = task.id ?? '';
      if (!id) return false;
      const messages = Array.isArray(task.messages) ? task.messages : [];
      const isPlaceholder = /^task_\d+$/.test(id);
      if (isPlaceholder && messages.length === 0) {
        return false;
      }
      return true;
    });

    return filtered.map(task => ({
      ...task,
      messages: normalizeMessages(task.messages ?? []),
      createdAt: task.createdAt || new Date().toISOString(),
      updatedAt: task.updatedAt || new Date().toISOString(),
      sessionId: task.sessionId || createSessionId(),
    }));
  } catch (error) {
    console.error('读取本地任务记录失败:', error);
    return [];
  }
};

const summarizeMessage = (text: string, limit = 24) => {
  const compact = text.replace(/\s+/g, ' ').trim();
  if (!compact) return '';
  return compact.length > limit ? `${compact.slice(0, limit)}...` : compact;
};

const isPlaceholderName = (name: string) => {
  if (!name) return true;
  const trimmed = name.trim();
  if (!trimmed) return true;
  return /^(新聊天|未命名对话|AI对话|AI 对话|快速对话|待命名对话)/.test(trimmed);
};

const deriveConversationTitle = (messages: ChatBubble[], currentName: string) => {
  const firstUserMessage = messages.find(msg => msg.sender === 'user' && msg.content?.trim());
  if (!firstUserMessage) {
    return currentName;
  }

  const firstLine = firstUserMessage.content.split(/\r?\n+/)[0]?.trim() ?? '';
  if (!firstLine) {
    return currentName;
  }

  const cleaned = firstLine.replace(/^[#>*\-\d\.\)\(]+\s*/, '').trim();
  if (!cleaned) {
    return currentName;
  }

  const candidate = summarizeMessage(cleaned, 20);
  if (!candidate) {
    return currentName;
  }

  if (isPlaceholderName(currentName) || candidate !== currentName) {
    return candidate;
  }

  return currentName;
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
  code: ({ inline, className, children, ...props }) =>
    inline ? (
      <code className="px-1 py-0.5 bg-gray-100 rounded text-sm" {...props}>
        {children}
      </code>
    ) : (
      <pre className="mb-2 rounded-lg bg-gray-900 text-gray-100 p-3 overflow-auto text-sm" {...props}>
        <code>{children}</code>
      </pre>
    ),
};

// 项目卡片组件
function ProjectCard({ title, imageUrl, bgColor, projectId }) {
  const handleClick = async () => {
    try {
      // 显示加载状态
      const loadingToast = toast.loading(`正在加载${title}项目详情...`);
      
      // 调用API获取项目详情
      const response = await aiService.getProjectDetails(projectId);
      
      // 关闭加载状态
      toast.dismiss(loadingToast);
      
      if (response.success && response.project) {
        toast.success(`成功加载${title}项目详情`);
        // 这里可以添加跳转到项目详情页的逻辑
        console.log('项目详情:', response.project);
      } else {
        toast.error(response.error || '加载项目详情失败');
      }
    } catch (error) {
      console.error('项目卡片点击错误:', error);
      toast.error('加载项目详情时发生错误');
    }
  };

  return (
    <div 
      className="h-[180px] rounded-lg overflow-hidden relative border border-gray-200 shadow-sm bg-gray-100 group cursor-pointer transition-all duration-300 hover:shadow-md"
      onClick={handleClick}
    >
      <div 
        className="h-full flex items-center justify-center" 
        style={{ backgroundColor: bgColor }}
      >
        <img 
          src={imageUrl} 
          alt={title} 
          className="max-w-[90%] max-h-[90%] object-contain transition-transform duration-300 group-hover:scale-105" 
        />
      </div>
      <h4 className="absolute bottom-4 left-4 right-4 m-0 p-2 bg-black/60 text-white text-sm rounded">
        {title}
      </h4>
    </div>
  );
}

type ChatInterfaceProps = {
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

// 聊天界面组件
function ChatInterface({
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
  const [messages, setMessages] = useState<ChatBubble[]>(() => initialMessages);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const lastInitialMessageRef = useRef<{ conversationId: string | null; message: string | null }>({
    conversationId: null,
    message: null,
  });
  const streamingTimersRef = useRef<Record<string, number>>({});
  const sessionIdRef = useRef<string>(sessionId ?? '');
  const lastConversationIdRef = useRef<string | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const adjustTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const minHeight = 56;
    const maxHeight = 220;
    el.style.height = 'auto';
    const targetHeight = Math.min(maxHeight, el.scrollHeight);
    el.style.height = `${Math.max(minHeight, targetHeight)}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [newMessage, adjustTextareaHeight]);

  const clearStreamingTimer = useCallback((id?: string) => {
    if (id) {
      const timer = streamingTimersRef.current[id];
      if (timer) {
        window.clearInterval(timer);
        delete streamingTimersRef.current[id];
      }
      return;
    }
    Object.values(streamingTimersRef.current).forEach(timer => window.clearInterval(timer));
    streamingTimersRef.current = {};
  }, []);

  const resetSession = useCallback(() => {
    const next = createSessionId();
    sessionIdRef.current = next;
    onSessionChange(conversationId, next);
  }, [conversationId, onSessionChange]);

  const startStreaming = useCallback((fullText: string, messageId: string) => {
    clearStreamingTimer(messageId);

    if (!fullText) {
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, content: '', isStreaming: false } : msg
        )
      );
      return;
    }

    const totalLength = fullText.length;
    const chunkSize = Math.max(1, Math.floor(totalLength / 80));
    let index = 0;

    const pushUpdate = () => {
      index = Math.min(index + chunkSize, totalLength);
      const nextContent = fullText.slice(0, index);
      const finished = index >= totalLength;

      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, content: nextContent, isStreaming: !finished } : msg
        )
      );

      if (finished) {
        clearStreamingTimer(messageId);
      }
    };

    pushUpdate();

    if (index < totalLength) {
      const timer = window.setInterval(pushUpdate, 30);
      streamingTimersRef.current[messageId] = timer;
    }
  }, [clearStreamingTimer]);

  const fetchAssistantReply = useCallback(async (userMessage: string) => {
    setIsLoading(true);
    try {
      const response = await aiService.sendAIRequest('聊天', userMessage, {
        sessionId: sessionIdRef.current,
        conversationId,
        userMessage,
      });
      const text = response.answer || response.result || '';

      const assistantMessage: ChatBubble = {
        id: `msg_${Date.now()}_ai`,
        content: '',
        sender: 'ai',
        timestamp: new Date().toISOString(),
        provider: response.provider,
        sources: response.sources,
        error: response.success ? undefined : response.error,
        isStreaming: true
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (!response.success || !text) {
        clearStreamingTimer(assistantMessage.id);
        setMessages(prev =>
          prev.map(msg =>
            msg.id === assistantMessage.id
              ? {
                  ...msg,
                  content: response.error || '抱歉，本次未获取到回复，请稍后重试。',
                  isStreaming: false
                }
              : msg
          )
        );
        toast.error(response.error || '内容生成失败，请稍后重试');
        return;
      }

      startStreaming(text, assistantMessage.id);
    } catch (error) {
      clearStreamingTimer();
      console.error('调用聊天接口失败:', error);
      setMessages(prev => [
        ...prev,
        {
          id: `msg_${Date.now()}_ai_error`,
          content: '抱歉，生成过程中出现错误，请稍后重试。',
          sender: 'ai',
          timestamp: new Date().toISOString(),
          error: (error as Error)?.message
        }
      ]);
      toast.error('调用后端接口失败');
    } finally {
      setIsLoading(false);
    }
  }, [startStreaming, clearStreamingTimer]);

  const handleCopy = useCallback(async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('已复制到剪贴板');
    } catch (error) {
      console.error('复制失败:', error);
      toast.error('复制失败，请手动复制');
    }
  }, []);

  useEffect(() => {
    onConversationUpdate(conversationId, normalizeMessages(messages));
  }, [conversationId, messages, onConversationUpdate]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    return () => {
      clearStreamingTimer();
    };
  }, [clearStreamingTimer]);

  useEffect(() => {
    if (lastConversationIdRef.current === conversationId) {
      return;
    }

    lastConversationIdRef.current = conversationId;
    clearStreamingTimer();
    setMessages(initialMessages);
    setNewMessage('');
    lastInitialMessageRef.current = { conversationId, message: null };
  }, [conversationId, clearStreamingTimer, initialMessages]);

  useEffect(() => {
    sessionIdRef.current = sessionId ?? '';
    if (!sessionIdRef.current) {
      resetSession();
    }
  }, [conversationId, sessionId, resetSession]);

  useEffect(() => {
    const trimmed = initialMessage.trim();
    const lastHandled = lastInitialMessageRef.current;

    if (!trimmed) {
      if (lastHandled.conversationId === conversationId) {
        lastInitialMessageRef.current = { conversationId, message: null };
      }
      return;
    }

    if (
      lastHandled.conversationId === conversationId &&
      lastHandled.message === trimmed
    ) {
      return;
    }
    lastInitialMessageRef.current = { conversationId, message: trimmed };
    onInitialMessageHandled?.();
    resetSession();

    const first: ChatBubble = {
      id: `msg_${Date.now()}_user`,
      content: trimmed,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    clearStreamingTimer();
    setMessages([first]);
    setNewMessage('');
    void fetchAssistantReply(trimmed);
  }, [conversationId, initialMessage, fetchAssistantReply, clearStreamingTimer, resetSession, onInitialMessageHandled]);

  const handleSendMessage = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed || isLoading) return;

    const userBubble: ChatBubble = {
      id: `msg_${Date.now()}_user`,
      content: trimmed,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    const nextConversation = [...messages, userBubble];
    setMessages(nextConversation);
    setNewMessage('');
    await fetchAssistantReply(trimmed);
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  const handleFileUpload = () => {
    toast.info('文件上传功能即将上线');
  };

  return (
    <main className="flex-1 w-[calc(100%-260px)] bg-white border-l border-gray-100 flex flex-col min-h-0">
      {/* 聊天头部 - 固定在顶部 */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            onClick={onBack}
          >
            <i className="fas fa-arrow-left text-gray-500"></i>
          </button>
          <h2 className="text-lg font-medium text-gray-800">{title || 'AI对话机器人'}</h2>
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

      {/* 聊天内容区域 */}
      <div className="flex-1 overflow-y-auto p-5 bg-gray-50 chat-window min-h-0">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex mb-6 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
                <i className="fas fa-robot text-blue-500"></i>
              </div>
            )}
              <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-1' : 'order-2'} group`}>
                <div
                  className={`relative rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  } p-4`}
                >
                  {message.sender === 'ai' ? (
                    <div className="text-sm leading-relaxed space-y-2">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                        {message.content}
                      </ReactMarkdown>
                      {message.isStreaming && (
                        <span className="inline-block w-2 h-4 bg-blue-400 rounded-sm animate-pulse"></span>
                      )}
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap leading-relaxed text-sm">
                      {message.content}
                    </div>
                  )}
                </div>
                {message.sender === 'ai' && (
                  <div className="flex mt-2">
                    <button
                      type="button"
                      className="h-8 w-8 flex items-center justify-center rounded-md border border-gray-200 bg-white text-gray-500 hover:text-gray-700 focus-visible:text-gray-700 shadow-sm transition-all duration-150 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                      onClick={() => handleCopy(message.content)}
                      aria-label="复制该条消息"
                    >
                      <i className="fas fa-copy text-base leading-none"></i>
                    </button>
                  </div>
                )}
                {message.sender !== 'ai' && (
                  <div
                    className={`flex mt-2 ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <button
                      type="button"
                      className="h-8 w-8 flex items-center justify-center rounded-md border border-blue-200 bg-white text-blue-600 hover:bg-blue-50 focus-visible:bg-blue-50 shadow-sm text-sm transition-all duration-150 opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
                      onClick={() => handleCopy(message.content)}
                      aria-label="复制该条消息"
                    >
                      <i className="fas fa-copy text-base leading-none"></i>
                    </button>
                  </div>
                )}
              </div>
            {message.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ml-2 flex-shrink-0 order-3">
                <i className="fas fa-user text-gray-600"></i>
              </div>
            )}
          </div>
        ))}

        {/* 加载状态 */}
        {isLoading && (
          <div className="flex justify-start mb-6">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
              <i className="fas fa-robot text-blue-500"></i>
            </div>
            <div className="bg-white border border-gray-200 text-gray-800 p-4 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div className="p-5 border-t border-gray-100">
        <div className="flex gap-2.5 mb-3">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <i className="fas fa-microphone text-gray-500"></i>
          </button>
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            onClick={handleFileUpload}
          >
            <i className="fas fa-paperclip text-gray-500"></i>
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <i className="fas fa-smile text-gray-500"></i>
          </button>
        </div>
        <div className="flex gap-2.5">
          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            onInput={adjustTextareaHeight}
            className="flex-1 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
            placeholder="我指的是……"
            rows={2}
            style={{ minHeight: 56, maxHeight: 220 }}
          />
          <button
            className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white flex items-center justify-center hover:shadow-md transition-all disabled:opacity-50"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isLoading}
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </main>
  );
}
// 主内容区组件
function MainContent({ activeTab, setActiveTab, inputText, setInputText, onSendMessage }: MainContentProps) {
  const tabs = ['写作', 'PPT', '设计', 'Excel', '网页', '播客'];
  const [inspiration, setInspiration] = useState('创新思维，高效创作');
  const homeTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const adjustHomeTextareaHeight = useCallback(() => {
    const el = homeTextareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const minHeight = 56;
    const maxHeight = 220;
    const nextHeight = Math.min(Math.max(el.scrollHeight, minHeight), maxHeight);
    el.style.height = `${nextHeight}px`;
    el.style.overflowY = nextHeight >= maxHeight ? 'auto' : 'hidden';
  }, []);

  useEffect(() => {
    adjustHomeTextareaHeight();
  }, [inputText, adjustHomeTextareaHeight]);

  
  // 获取今日灵感
  useEffect(() => {
    const fetchInspiration = async () => {
      try {
        const response = await aiService.getInspiration();
        if (response.success && response.inspiration) {
          setInspiration(response.inspiration);
        }
      } catch (error) {
        console.error('获取灵感失败:', error);
      }
    };
    
    fetchInspiration();
  }, []);
  
  // 处理发送按钮点击
  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) {
      toast.warning('请输入您的需求');
      return;
    }

    onSendMessage?.(trimmed);
    setInputText('');
  };

  const handleHomeKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  // 处理一键优化按钮点击
  const handleOptimize = async () => {
    if (!inputText.trim()) {
      toast.warning('请输入需要优化的内容');
      return;
    }
    
    try {
      // 显示加载状态
      const loadingToast = toast.loading('正在优化内容...');
      
      // 调用优化API
      const response = await aiService.optimizeContent(inputText);
      
      // 关闭加载状态
      toast.dismiss(loadingToast);
      
      if (response.success && response.optimizedContent) {
        // 更新输入框内容为优化后的内容
        setInputText(response.optimizedContent);
        
        // 显示优化建议
        if (response.suggestions && response.suggestions.length > 0) {
          const suggestionsText = response.suggestions.join('\n- ');
          toast.success(`内容优化成功\n- ${suggestionsText}`);
        } else {
          toast.success('内容优化成功');
        }
      } else {
        toast.error(response.error || '内容优化失败');
      }
    } catch (error) {
      console.error('优化内容失败:', error);
      toast.error('内容优化时发生错误');
    }
  };
  
  // 处理文件上传按钮点击
  const handleFileUpload = () => {
    toast.info('文件上传功能即将上线');
  };
  
  // 处理格式设置按钮点击
  const handleFormatSettings = () => {
    toast.info('格式设置功能即将上线');
  };
  
  // 处理实践分类按钮点击
  const handlePracticeCategory = (category) => {
    toast.info(`已切换到${category}分类`);
  };

  return (
      <main className="flex-1 bg-white border-l border-gray-100">
      <div className="flex items-center justify-between pt-8 pb-6 px-8 relative">
        <h1 className="text-2xl font-bold text-gray-800">
          <span className="text-blue-500">智能助手</span>，一键生成
        </h1>
        <div className="hidden md:block">
          <div className="bg-blue-50 px-4 py-2 rounded-full text-sm text-blue-700 flex items-center">
            <i className="fas fa-lightbulb mr-1"></i>
            <span>今日灵感: {inspiration}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-3 mb-8 flex-wrap">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 rounded-full text-sm transition-colors ${
              activeTab === tab
                ? 'bg-gradient-to-r from-blue-400 to-indigo-400 text-white border-blue-400 shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-blue-50'
            } border transition-all duration-300`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === '写作' && <i className="fas fa-pen-to-square mr-1"></i>}
            {tab === 'PPT' && <i className="fas fa-file-powerpoint mr-1"></i>}
            {tab === '设计' && <i className="fas fa-paint-brush mr-1"></i>}
            {tab === 'Excel' && <i className="fas fa-file-excel mr-1"></i>}
            {tab === '网页' && <i className="fas fa-globe mr-1"></i>}
            {tab === '播客' && <i className="fas fa-podcast mr-1"></i>}
            {tab}
          </button>
        ))}
      </div>

      <div className="max-w-[800px] mx-auto p-6 bg-white rounded-xl border border-gray-100 mb-10 shadow-sm">
        <div className="flex items-start mb-4 gap-2.5">
          <span className="px-2 py-1 bg-blue-50 text-blue-500 rounded-full text-xs font-medium">
            {activeTab}
          </span>
          <textarea
            ref={homeTextareaRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onInput={adjustHomeTextareaHeight}
            onKeyDown={handleHomeKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 resize-none"
            placeholder="请告诉我您的需求，我会为您提供专业的AI帮助..."
            rows={1}
            style={{ minHeight: 56, maxHeight: 220 }}
          />
        </div>
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex gap-2.5">
            <button 
              className="p-1.5 bg-transparent border-none cursor-pointer hover:bg-gray-200 rounded transition-colors"
              onClick={handleFileUpload}
            >
              <i className="fas fa-paperclip text-gray-500"></i>
            </button>
            <button 
              className="p-1.5 bg-transparent border-none cursor-pointer hover:bg-gray-200 rounded transition-colors"
              onClick={handleFormatSettings}
            >
              <i className="fas fa-font text-gray-500"></i>
            </button>
          </div>
          <div className="flex gap-2.5">
            <button 
              className="px-3 py-1.5 rounded border border-gray-300 bg-white text-gray-600 text-xs hover:bg-gray-50 transition-colors"
              onClick={handleOptimize}
            >
              一键优化
            </button>
            <button 
              className="w-11 h-11 rounded-lg border-none bg-gradient-to-r from-blue-400 to-indigo-400 text-white cursor-pointer hover:shadow-lg transition-all flex items-center justify-center"
              onClick={handleSend}
            >
               <i className="fas fa-paper-plane"></i>
             </button>
          </div>
        </div>
      </div>

       <div className="max-w-[800px] mx-auto px-5 pb-10">
        <div className="flex justify-between items-center mb-5 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg">
          <h3 className="text-lg font-bold text-gray-800 m-0">
            最佳实践
          </h3>
          <div className="flex">
            <button 
              className="px-3 py-1 bg-transparent border-none text-gray-700 text-sm hover:text-blue-600 transition-colors"
              onClick={() => handlePracticeCategory('网页宣发')}
            >
              网页宣发
            </button>
            <button 
              className="px-3 py-1 bg-transparent border-none text-gray-700 text-sm hover:text-blue-600 transition-colors"
              onClick={() => handlePracticeCategory('教育工具')}
            >
              教育工具
            </button>
            <button 
              className="px-3 py-1 bg-transparent border-none text-gray-700 text-sm hover:text-blue-600 transition-colors"
              onClick={() => handlePracticeCategory('趣味游戏')}
            >
              趣味游戏
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
           <ProjectCard 
             title="AI智能写作助手" 
             imageUrl="https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=AI%20assistant%20concept%20illustration%2C%20modern%20flat%20design%2C%20blue%20color%20scheme&sign=28ebbd06cb141c1a009017f1f8d41227"
             bgColor="#eff6ff"
             projectId="project_ai_writing"
           />
           <ProjectCard 
             title="智能数据分析工具" 
             imageUrl="https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=Data%20visualization%20dashboard%2C%20modern%20design%2C%20blue%20and%20indigo%20colors&sign=ed4909d7a10fe86967a5aa6a0afaa434"
             bgColor="#e0e7ff"
             projectId="project_data_analysis"
           />
           <ProjectCard 
             title="个性化学习平台" 
             imageUrl="https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=AI%20learning%20platform%20concept%2C%20interactive%20interface%2C%20blue%20colors&sign=0eba131c9b66799399b3e86f510476a7"
             bgColor="#dbeafe"
             projectId="project_learning_platform"
           />
        </div>
      </div>
    </main>
  );
}

// 左侧导航栏组件
interface SidebarProps {
  onCreateNewTask: () => Promise<void>;
  tasks: Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
    isBrand?: boolean;
    lastMessagePreview?: string;
  }>;
  activeTaskId?: string | null;
  onSelectTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
}

function Sidebar({ onCreateNewTask, tasks, activeTaskId, onSelectTask, onDeleteTask }: SidebarProps) {
  // 处理创建新聊天按钮点击
  const handleCreateNewTask = onCreateNewTask;
  
   // 处理侧边栏菜单项点击
  const handleMenuItemClick = (itemName: string) => {
    toast.info(`已切换到${itemName}`);
    console.log(`切换到${itemName}`);
  };
  
  // 处理通知按钮点击
  const handleNotificationClick = () => {
    toast.info('您有新的通知');
  };

  return (
      <aside className="w-[260px] h-full bg-white border-r border-gray-100 shadow-sm overflow-hidden">
       <div className="flex justify-between items-center p-[15px_20px] bg-gradient-to-r from-blue-400 to-indigo-400 text-white rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-blue-500 font-bold text-lg">
            橙
          </div>
          <span className="text-xl font-bold">橙浩空间</span>
          <span className="text-xs bg-white/30 px-1.5 py-0.5 rounded">BETA</span>
        </div>
        <div className="relative">
          <div 
            className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-blue-500 cursor-pointer"
            onClick={handleNotificationClick}
          >
            <i className="fas fa-paper-plane"></i>
          </div>
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>
      </div>

      <button className="w-[calc(100%-40px)] h-11 mx-[20px] my-5 bg-gradient-to-r from-blue-400 to-indigo-400 text-white rounded-xl border-none text-sm font-medium flex items-center justify-center gap-1 shadow-sm hover:shadow-md transition-shadow"
        onClick={handleCreateNewTask}
      >
        <i className="fas fa-plus-circle"></i>
        <span>开启新聊天</span>
        <span className="text-xs bg-white/30 px-1.5 py-0.5 rounded">Ctrl</span>
      </button>

      <ul className="p-[0_20px] mb-5 list-none">
        <li 
          className="flex items-center gap-2.5 p-3 mb-2 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors border-l-4 border-blue-400"
          onClick={() => handleMenuItemClick('AI专家')}
        >
          <i className="fas fa-robot text-blue-400"></i>
          <span className="text-sm text-gray-800">AI专家</span>
        </li>
        <li 
          className="flex items-center gap-2.5 p-3 mb-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={() => handleMenuItemClick('DeepTrip旅行专家')}
        >
          <i className="fas fa-plane text-green-500"></i>
          <span className="text-sm text-gray-800">DeepTrip旅行专家</span>
        </li>
        <li 
          className="flex items-center gap-2.5 p-3 mb-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={() => handleMenuItemClick('华泰A股观察助手')}
        >
          <i className="fas fa-chart-line text-red-500"></i>
          <span className="text-sm text-gray-800">华泰A股观察助手</span>
        </li>
        <li 
          className="flex items-center gap-2.5 p-3 mb-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={() => handleMenuItemClick('舆情分析专家')}
        >
          <i className="fas fa-newspaper text-purple-500"></i>
          <span className="text-sm text-gray-800">舆情分析专家</span>
        </li>
      </ul>

      <div className="p-[0_20px_10px] text-xs text-gray-500">聊天</div>
      <div className="p-[0_20px] max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
        <ul className="list-none">
          {tasks.map((task, index) => (
            <li 
              key={task.id}
              className={`flex items-center gap-2.5 p-3 mb-2 rounded-md cursor-pointer transition-colors ${index === tasks.length - 1 ? 'mb-0' : ''} ${
                activeTaskId === task.id ? 'bg-blue-50 border border-blue-200 text-blue-600' : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => onSelectTask?.(task.id)}
            >
              {task.isBrand ? (
                <i className={`fab fa-${task.icon} text-${task.color}`}></i>
              ) : (
                <i className={`fas fa-${task.icon} text-${task.color}`}></i>
              )}
              <div className="flex flex-col flex-1 min-w-0">
                <span
                  className={`text-sm truncate ${
                    activeTaskId === task.id ? 'text-blue-700 font-medium' : 'text-gray-800'
                  }`}
                >
                  {task.name}
                </span>
                {task.lastMessagePreview ? (
                  <span
                    className={`text-xs truncate ${
                      activeTaskId === task.id ? 'text-blue-500' : 'text-gray-500'
                    }`}
                  >
                    {task.lastMessagePreview}
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                className="ml-2 text-gray-400 hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded"
                aria-label="删除聊天"
                onClick={event => {
                  event.stopPropagation();
                  onDeleteTask?.(task.id);
                }}
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

// 浮动帮助按钮组件 - 仅在首页显示
function FloatingHelpButton({ show = true }) {
  const handleHelpClick = () => {
    toast.info('客服团队将很快与您联系');
  };

  if (!show) return null;

  return (
      <button 
        className="fixed bottom-7 right-7 w-[54px] h-[54px] rounded-full border-2 border-white bg-gradient-to-r from-blue-400 to-indigo-400 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-10"
        onClick={handleHelpClick}
      >
        <i className="fas fa-headset text-lg"></i>
      </button>
  );
}

// AI智能体前端页面
export default function Home() {
  const [activeTab, setActiveTab] = useState('AI专家');
  const [inputText, setInputText] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [initialChatMessage, setInitialChatMessage] = useState('');
  const [tasks, setTasks] = useState<TaskConversation[]>(() => {
    const stored = loadStoredTasks();
    if (stored.length) {
      return stored;
    }
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify([]));
      } catch (error) {
        console.error('初始化任务列表失败:', error);
      }
    }
    return [];
  });
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

   
  // 创建新聊天的处理函数
  const handleCreateNewTask = async () => {
    try {
      const loadingToast = toast.loading('正在开启新聊天...');

      const response = await aiService.createNewTask('general', '');

      toast.dismiss(loadingToast);

      if (response.success && response.taskId) {
        const icons = ['lightbulb', 'edit', 'file', 'clipboard', 'calendar', 'list-check', 'target'];
        const colors = ['blue-500', 'green-500', 'indigo-500', 'purple-500', 'pink-500', 'red-500', 'orange-500'];
        const randomIcon = icons[Math.floor(Math.random() * icons.length)];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const newTaskId = response.taskId;
        const now = new Date().toISOString();

        setTasks(prevTasks => {
          const name = `新聊天 ${prevTasks.length + 1}`;
          const nextTask: TaskConversation = {
            id: newTaskId,
            name,
            icon: randomIcon,
            color: randomColor,
            messages: [],
            createdAt: now,
            updatedAt: now,
            sessionId: createSessionId(),
          };
          return [nextTask, ...prevTasks];
        });

        setActiveTaskId(newTaskId);
        setInitialChatMessage('');
        setShowChat(false);

        toast.success(response.message || '新聊天开启成功');
        console.log('新聊天ID:', response.taskId);
      } else {
        toast.error(response.message || '开启新聊天失败');
      }
    } catch (error) {
      console.error('开启新聊天失败:', error);
      toast.error('开启新聊天时发生错误');
    }
  };

  useEffect(() => {
    if (!activeTaskId && tasks.length) {
      setActiveTaskId(tasks[0].id);
    }
  }, [activeTaskId, tasks]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('保存任务记录失败:', error);
    }
  }, [tasks]);

  const handleConversationUpdate = useCallback(
    (conversationId: string, nextMessages: ChatBubble[]) => {
      setTasks(prevTasks => {
        let hasChange = false;
        const next = prevTasks.map(task => {
          if (task.id !== conversationId) return task;
          hasChange = true;
          const normalized = normalizeMessages(nextMessages);
          const updatedAt =
            normalized.length > 0
              ? normalized[normalized.length - 1].timestamp
              : task.updatedAt || new Date().toISOString();
          const nextName = deriveConversationTitle(normalized, task.name);

          return {
            ...task,
            messages: normalized,
            updatedAt,
            name: nextName,
          };
        });

        if (!hasChange) {
          return prevTasks;
        }

        return next
          .slice()
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      });
    },
    []
  );

  const handleSessionChange = useCallback((conversationId: string, nextSessionId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === conversationId
          ? {
              ...task,
              sessionId: nextSessionId,
            }
          : task
      )
    );
  }, []);

  const handleSelectTask = (taskId: string) => {
    setActiveTaskId(taskId);
    setInitialChatMessage('');
    setShowChat(true);
  };

  const handleInitialMessageHandled = useCallback(() => {
    setInitialChatMessage('');
  }, []);

  const handleDeleteTask = useCallback(
    (taskId: string) => {
      const outcome = { deleted: false };

      setTasks(prevTasks => {
        let deleted = false;
        const nextTasks = prevTasks.filter(task => {
          if (task.id === taskId) {
            deleted = true;
            return false;
          }
          return true;
        });

        if (!deleted) {
          return prevTasks;
        }

        outcome.deleted = true;

        if (activeTaskId === taskId) {
          const fallbackTask = nextTasks[0] ?? null;
          if (fallbackTask) {
            setActiveTaskId(fallbackTask.id);
          } else {
            setActiveTaskId(null);
            setShowChat(false);
          }
          setInitialChatMessage('');
        }

        return nextTasks;
      });

      if (outcome.deleted) {
        toast.success('聊天已删除');
      } else {
        toast.error('找不到聊天或已删除');
      }
    },
    [activeTaskId]
  );

  const handleStartConversationFromPrompt = (message: string) => {
    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    const newTaskId = `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();

    setTasks(prevTasks => {
      const title = `新聊天 ${prevTasks.length + 1}`;
      const nextTask: TaskConversation = {
        id: newTaskId,
        name: title,
        icon: 'comments',
        color: 'blue-500',
        messages: [],
        createdAt: now,
        updatedAt: now,
        sessionId: createSessionId(),
      };
      return [nextTask, ...prevTasks];
    });

    setActiveTaskId(newTaskId);
    setInitialChatMessage(trimmed);
    setShowChat(true);
  };

  useEffect(() => {
    const baseWidth = 1440;
    const maxScale = 1.35;

    const updateScale = () => {
      const width = window.innerWidth || baseWidth;
      const nextScale = width > baseWidth ? Math.min(width / baseWidth, maxScale) : 1;
      setScale(Number(nextScale.toFixed(3)));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  const activeTask = tasks.find(task => task.id === activeTaskId) || null;
  const isChatting = showChat && Boolean(activeTask);
  const sidebarTasks = tasks.map(task => {
    const lastMessage = task.messages.length > 0 ? task.messages[task.messages.length - 1] : undefined;
    return {
      id: task.id,
      name: task.name,
      icon: task.icon,
      color: task.color,
      isBrand: task.isBrand,
      lastMessagePreview: lastMessage ? summarizeMessage(lastMessage.content, 22) : undefined,
    };
  });

  const scaledSize = Number((100 / scale).toFixed(3));
  const scaleStyle = {
    transform: `scale(${scale})`,
    transformOrigin: 'top center',
    width: `${scaledSize}%`,
    minHeight: `${scaledSize}vh`,
    transition: 'transform 0.3s ease, width 0.3s ease, min-height 0.3s ease'
  } as const;

  // 渲染主页面
  const layoutClass = isChatting ? 'h-screen overflow-hidden' : 'min-h-screen overflow-x-hidden overflow-y-auto';
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden flex justify-center">
      <div className={`flex flex-row bg-gray-50 font-sans ${layoutClass} ${isChatting ? '' : 'home-page'}`}
        style={scaleStyle}>
      {/* 左侧导航栏 */}
      <Sidebar 
        onCreateNewTask={handleCreateNewTask} 
        tasks={sidebarTasks} 
        activeTaskId={activeTaskId} 
        onSelectTask={handleSelectTask}
        onDeleteTask={handleDeleteTask}
      />
      
      {/* 内容区域 - 根据状态显示主内容或聊天界面 */}
      {isChatting && activeTask ? (
        <ChatInterface 
          conversationId={activeTask.id}
          title={activeTask.name}
          initialMessage={initialChatMessage} 
          initialMessages={activeTask.messages}
          sessionId={activeTask.sessionId}
          onBack={() => {
            setShowChat(false);
            setInitialChatMessage('');
          }} 
          onConversationUpdate={handleConversationUpdate}
          onSessionChange={handleSessionChange}
          onInitialMessageHandled={handleInitialMessageHandled}
        />
      ) : (
        <MainContent 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          inputText={inputText}
          setInputText={setInputText}
          onSendMessage={handleStartConversationFromPrompt}
        />
      )}
      
      {/* 浮动帮助按钮 - 仅在首页显示 */}
      <FloatingHelpButton show={!isChatting} />
      </div>
    </div>
  );
}
