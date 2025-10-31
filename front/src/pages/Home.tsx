import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { ChatInterface } from '@/components/chat/ChatInterface';
import type { UploadedAttachment } from '@/pages/home/types';
import {
  MainContent,
  Sidebar,
  FloatingHelpButton,
  type SidebarTask,
} from '@/components/home';
import {
  TASK_STORAGE_KEY,
  createSessionId,
  loadStoredTasks,
  summarizeMessage,
  normalizeMessages,
  deriveConversationTitle,
} from '@/pages/home/taskUtils';
import type { ChatBubble, TaskConversation } from '@/pages/home/types';

const BASE_WIDTH = 1440;
const MAX_SCALE = 1.6;

const TASK_ICON_CANDIDATES = ['lightbulb', 'edit', 'file', 'clipboard', 'calendar', 'list-check', 'target'];
const TASK_COLOR_CANDIDATES = ['blue-500', 'green-500', 'indigo-500', 'purple-500', 'pink-500', 'red-500', 'orange-500'];

export default function Home() {
  const [activeTab, setActiveTab] = useState('AI专家');
  const [inputText, setInputText] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [initialChatMessage, setInitialChatMessage] = useState('');
  const [initialChatAttachments, setInitialChatAttachments] = useState<UploadedAttachment[]>([]);
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
  const [hasInitializedTask, setHasInitializedTask] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const body = document.body;
    const root = document.documentElement;
    const prevBodyOverflow = body.style.overflow;
    const prevRootOverflow = root.style.overflow;
    body.classList.add('app-no-scrollbar');
    root.classList.add('app-no-scrollbar');
    body.style.overflow = 'hidden';
    root.style.overflow = 'hidden';
    return () => {
      body.classList.remove('app-no-scrollbar');
      root.classList.remove('app-no-scrollbar');
      body.style.overflow = prevBodyOverflow;
      root.style.overflow = prevRootOverflow;
    };
  }, []);

  const handleCreateNewTask = useCallback(() => {
    setShowChat(false);
    setActiveTaskId(null);
    setInitialChatMessage('');
    setInitialChatAttachments([]);
    toast.info('已准备新的聊天，请输入内容后发送。', { id: 'prepare-new-chat' });
  }, []);

  useEffect(() => {
    if (tasks.length === 0) {
      if (activeTaskId) {
        setActiveTaskId(null);
      }
      if (hasInitializedTask) {
        setHasInitializedTask(false);
      }
      return;
    }
    if (!hasInitializedTask) {
      setActiveTaskId(tasks[0].id);
      setHasInitializedTask(true);
    }
  }, [tasks, activeTaskId, hasInitializedTask]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('保存任务记录失败:', error);
    }
  }, [tasks]);

  useEffect(() => {
    const updateScale = () => {
      const width = typeof window !== 'undefined' ? window.innerWidth : BASE_WIDTH;
      const nextScale = width > BASE_WIDTH ? Math.min(width / BASE_WIDTH, MAX_SCALE) : 1;
      setScale(Number(nextScale.toFixed(3)));
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

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

  const handleSelectTask = useCallback((taskId: string) => {
    setActiveTaskId(taskId);
    setInitialChatMessage('');
    setShowChat(true);
  }, []);

  const handleInitialMessageHandled = useCallback(() => {
    setInitialChatMessage('');
  }, []);

  const handleDeleteTask = useCallback(
    (taskId: string) => {
      const outcome = { deleted: false };

      setTasks(prevTasks => {
        const nextTasks = prevTasks.filter(task => {
          if (task.id !== taskId) {
            return true;
          }
          outcome.deleted = true;
          return false;
        });

        if (!outcome.deleted) {
          return prevTasks;
        }

        if (activeTaskId === taskId) {
          const fallback = nextTasks[0]?.id ?? null;
          setActiveTaskId(fallback);
          setShowChat(Boolean(fallback));
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

  const handleStartConversationFromPrompt = useCallback((message: string, attachments: UploadedAttachment[] = []) => {
    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }

    setInitialChatAttachments(attachments);

    const newTaskId = `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const now = new Date().toISOString();
    const randomIcon = TASK_ICON_CANDIDATES[Math.floor(Math.random() * TASK_ICON_CANDIDATES.length)];
    const randomColor = TASK_COLOR_CANDIDATES[Math.floor(Math.random() * TASK_COLOR_CANDIDATES.length)];

    setTasks(prevTasks => {
      const title = `新聊天 ${prevTasks.length + 1}`;
      const nextTask: TaskConversation = {
        id: newTaskId,
        name: title,
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
    setInitialChatMessage(trimmed);
    setShowChat(true);
  }, []);

  const activeTask = tasks.find(task => task.id === activeTaskId) || null;
  const isChatting = showChat && Boolean(activeTask);
  const sidebarTasks: SidebarTask[] = tasks.map(task => {
    const lastMessage =
      task.messages.length > 0 ? task.messages[task.messages.length - 1] : undefined;
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
  const baseScaledHeight = `${scaledSize}vh`;
  const containerStyle = {
    transform: `scale(${scale})`,
    transformOrigin: 'top center',
    width: `${scaledSize}%`,
    height: baseScaledHeight,
    minHeight: baseScaledHeight,
    overflowY: 'hidden',
    transition: 'transform 0.3s ease, width 0.3s ease, height 0.3s ease, min-height 0.3s ease',
  } as const;

  const layoutClass = 'min-h-screen overflow-x-hidden overflow-y-auto';

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden flex justify-center">
      <div
        className={`flex bg-gray-50 font-sans ${layoutClass} ${isChatting ? '' : 'home-page'}`}
        style={containerStyle}
      >
        <div className="flex-shrink-0 w-[260px] lg:w-[280px] xl:w-[300px] 2xl:w-[320px]">
          <Sidebar
            onCreateNewTask={handleCreateNewTask}
            tasks={sidebarTasks}
            activeTaskId={activeTaskId}
            onSelectTask={handleSelectTask}
            onDeleteTask={handleDeleteTask}
          />
        </div>

        {isChatting && activeTask ? (
          <ChatInterface
            conversationId={activeTask.id}
            title={activeTask.name}
            initialMessage={initialChatMessage}
            initialMessages={activeTask.messages}
            sessionId={activeTask.sessionId}
            initialAttachments={initialChatAttachments}
            onBack={() => {
              setShowChat(false);
              setInitialChatMessage('');
              setInitialChatAttachments([]);
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

        <FloatingHelpButton show={!isChatting} />
      </div>
    </div>
  );
}
