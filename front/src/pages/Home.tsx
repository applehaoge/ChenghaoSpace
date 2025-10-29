import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { aiService } from '@/api/aiService';
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

const MAX_SCALE = 1.35;
const BASE_WIDTH = 1440;

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

  const handleCreateNewTask = useCallback(async () => {
    const loadingToast = toast.loading('正在开启新聊天...');
    try {
      const response = await aiService.createNewTask('general', '');

      if (response.success && response.taskId) {
        const icons = ['lightbulb', 'edit', 'file', 'clipboard', 'calendar', 'list-check', 'target'];
        const colors = [
          'blue-500',
          'green-500',
          'indigo-500',
          'purple-500',
          'pink-500',
          'red-500',
          'orange-500',
        ];
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
        setInitialChatAttachments([]);
        setShowChat(false);

        toast.success(response.message || '新聊天开启成功');
        console.log('新聊天ID:', response.taskId);
      } else {
        toast.error(response.message || '开启新聊天失败');
      }
    } catch (error) {
      console.error('开启新聊天失败:', error);
      toast.error('开启新聊天时发生错误');
    } finally {
      toast.dismiss(loadingToast);
    }
  }, []);

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
  }, []);

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
  const scaleStyle = {
    transform: `scale(${scale})`,
    transformOrigin: 'top center',
    width: `${scaledSize}%`,
    minHeight: `${scaledSize}vh`,
    transition: 'transform 0.3s ease, width 0.3s ease, min-height 0.3s ease',
  } as const;

  const layoutClass = isChatting
    ? 'h-screen overflow-hidden'
    : 'min-h-screen overflow-x-hidden overflow-y-auto';

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden flex justify-center">
      <div
        className={`flex flex-row bg-gray-50 font-sans ${layoutClass} ${isChatting ? '' : 'home-page'}`}
        style={scaleStyle}
      >
        <Sidebar
          onCreateNewTask={handleCreateNewTask}
          tasks={sidebarTasks}
          activeTaskId={activeTaskId}
          onSelectTask={handleSelectTask}
          onDeleteTask={handleDeleteTask}
        />

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
