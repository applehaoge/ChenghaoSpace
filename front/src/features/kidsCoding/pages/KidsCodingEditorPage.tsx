
import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ProgrammingAssistantModal } from '@/features/kidsCoding/components/ProgrammingAssistantModal';
import { CodePanel } from '@/features/kidsCoding/components/learningCenter/CodePanel';
import { ResultPanel } from '@/features/kidsCoding/components/learningCenter/ResultPanel';
import { CollapsedPanelRail } from '@/features/kidsCoding/components/learningCenter/CollapsedPanelRail';
import { EditorNavbar } from '@/features/kidsCoding/components/learningCenter/EditorNavbar';
import { MissionDrawer } from '@/features/kidsCoding/components/learningCenter/MissionDrawer';
import { RESPONSIVE_PANEL_HEIGHT_CLASS } from '@/features/kidsCoding/constants/learningCenter';
import { usePanelCollapse } from '@/features/kidsCoding/hooks/usePanelCollapse';
import { AiChatMessage, MissionContent, ResultFocus } from '@/features/kidsCoding/types/learningCenter';

const CODE_SAMPLE = `# AI 国度修复计划 - 任务 01：认识你的 AI 助手
# 欢迎来到 AI 国度！这个世界需要你的帮助来修复损坏的 AI 系统
class AIAssistant:
    def __init__(self, name):
        self.name = name
        self.energy = 100
        self.knowledge = 0

    def greet(self):
        print(f"你好！我是 {self.name}，你的 AI 助手。")
        print("很高兴能和你一起修复 AI 国度！")

    def learn(self, points):
        self.knowledge += points
        print(f"我学到了新知识！当前知识值：{self.knowledge}")

    def work(self):
        if self.energy > 0:
            self.energy -= 10
            print(f"{self.name} 正在努力工作……")
            print(f"剩余能量：{self.energy}")
        else:
            print(f"{self.name} 太累啦，需要休息！")

    def rest(self):
        self.energy = min(100, self.energy + 20)
        print(f"{self.name} 充好电啦！当前能量：{self.energy}")

assistant = AIAssistant("小智")
assistant.greet()
assistant.learn(15)
assistant.work()
assistant.rest()
`;

const CONSOLE_SAMPLE = `你好！我是 小智，你的 AI 助手。
很高兴能和你一起修复 AI 国度！
我学到了新知识！当前知识值：15
小智 正在努力工作……
剩余能量：90
小智 充好电啦！当前能量：100`;

const INITIAL_CHAT: AiChatMessage[] = [
  { id: 1, text: '你好，我是 AI 编程助手小智，随时准备陪伴你完成挑战。', isAI: true },
  { id: 2, text: '我想知道怎么让 AI 助手记录知识值。', isAI: false },
  {
    id: 3,
    text: '可以在 learn 方法里累加知识值，并在控制台输出提示语句，我们等下可以一起验证。',
    isAI: true,
  },
];

const MISSION_CONTENT = {
  title: 'AI 国度修复计划 · 第 1 课',
  story:
    '欢迎来到 AI 国度！一次能源风暴让核心系统宕机，你需要和 AI 助手小智并肩作战，重建基础模块，让城市重新运转。',
  objectives: ['理解 Python 类与对象', '实现 AI 助手四项基础能力', '运行代码观察能量与知识值变化', '记录调试心得并准备提交作业'],
  hints: ['类（class）是创建对象的蓝图', '__init__ 会在实例化时自动执行', '在方法中通过 self 访问和修改属性', '逐步运行代码，关注控制台输出'],
};

type MobileSection = 'code' | 'results';
const getInitialWidth = () => (typeof window !== 'undefined' ? window.innerWidth : 1280);

export function KidsCodingEditorPage() {
  const consoleRef = useRef<HTMLDivElement>(null);

  const [screenWidth, setScreenWidth] = useState(getInitialWidth);
  const [mobileSection, setMobileSection] = useState<MobileSection>('code');
  const [activeMobileResult, setActiveMobileResult] = useState<ResultFocus>('visualization');
  const [aiMessages, setAiMessages] = useState<AiChatMessage[]>(() => [...INITIAL_CHAT]);
  const [aiInput, setAiInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [showAssistantModal, setShowAssistantModal] = useState(false);
  const [isMissionDrawerOpen, setIsMissionDrawerOpen] = useState(false);
  const { collapsed, togglePanel, setPanelCollapsed } = usePanelCollapse();

  const showFullLayout = screenWidth >= 1280;
  const isLaptop = screenWidth >= 1024;

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isLaptop) {
      setIsConsoleOpen(false);
    }
  }, [isLaptop]);

  useEffect(() => {
    if (!showFullLayout) {
      setPanelCollapsed('results', false);
    }
  }, [showFullLayout, setPanelCollapsed]);

  const handleRunCode = () => {
    if (isRunning) return;
    setIsRunning(true);
    toast.message('正在运行代码…', { description: '请稍等，结果面板会自动刷新。' });
    setTimeout(() => {
      setIsRunning(false);
      toast.success('运行成功，AI 助手状态已更新');
      if (!showFullLayout) {
        setMobileSection('results');
        setActiveMobileResult('visualization');
      }
      setIsConsoleOpen(true);
      if (consoleRef.current) {
        consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
      }
    }, 800);
  };

  const handleSave = () => toast.success('学习进度已保存');
  const handleFormat = () => toast.info('示例代码已格式化');
  const handleReset = () => toast.warning('代码已恢复至示例状态');

  const handleSendAiMessage = () => {
    const trimmed = aiInput.trim();
    if (!trimmed) return;
    const now = Date.now();
    const userMessage: AiChatMessage = { id: now, text: trimmed, isAI: false };
    setAiMessages(prev => [...prev, userMessage]);
    setAiInput('');
    setTimeout(() => {
      setAiMessages(prev => [
        ...prev,
        {
          id: now + 1,
          text: '建议先检查 learn 方法是否正确累加积分，并关注能量值的上下限。',
          isAI: true,
        },
      ]);
    }, 500);
  };

  const codeVisible = showFullLayout || mobileSection === 'code';
  const resultVisible = showFullLayout || mobileSection === 'results';
  const resultCollapsed = showFullLayout && collapsed.results;

  const desktopColumns = (() => {
    if (!showFullLayout) return 'grid-cols-1';
    if (resultCollapsed) return 'grid-cols-1';
    return 'grid-cols-[minmax(0,1fr)_380px]';
  })();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <main className="flex flex-1 flex-col py-6">
        <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-6 px-4">
          <EditorNavbar
            onOpenMission={() => setIsMissionDrawerOpen(true)}
            onSave={handleSave}
            onFormat={handleFormat}
            onOpenAssistant={() => setShowAssistantModal(true)}
          />

          {!showFullLayout ? (
            <div className="flex gap-2 rounded-2xl bg-white p-2 shadow-sm dark:bg-slate-900">
              {[
                { key: 'code', label: '代码', icon: 'fa-code' },
                { key: 'results', label: '结果', icon: 'fa-display' },
              ].map(item => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setMobileSection(item.key as MobileSection)}
                  className={clsx(
                    'flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition',
                    mobileSection === item.key
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
                  )}
                >
                  <i className={`fa-solid ${item.icon}`} />
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}

          <div className={clsx('flex gap-4 lg:gap-6', showFullLayout ? 'items-stretch' : 'flex-col')}>
            <div
              className={clsx(
                'grid flex-1 gap-4 lg:gap-6',
                showFullLayout ? desktopColumns : 'grid-cols-1',
                showFullLayout && 'lg:items-stretch',
              )}
            >
              {codeVisible ? (
                <CodePanel
                  className={clsx(showFullLayout && RESPONSIVE_PANEL_HEIGHT_CLASS)}
                  codeSample={CODE_SAMPLE}
                  consoleSample={CONSOLE_SAMPLE}
                  isRunning={isRunning}
                  isConsoleOpen={isConsoleOpen}
                  consoleRef={consoleRef}
                  onToggleConsole={() => setIsConsoleOpen(previous => !previous)}
                  onRunCode={handleRunCode}
                  onReset={handleReset}
                />
              ) : null}
              {resultVisible && !resultCollapsed ? (
                <ResultPanel
                  className={clsx(showFullLayout && RESPONSIVE_PANEL_HEIGHT_CLASS)}
                  showFullLayout={showFullLayout}
                  activeFocus={activeMobileResult}
                  onFocusChange={setActiveMobileResult}
                  aiMessages={aiMessages}
                  aiInput={aiInput}
                  onAiInputChange={setAiInput}
                  onSendMessage={handleSendAiMessage}
                  onShowAssistantModal={() => setShowAssistantModal(true)}
                  enableCollapse={showFullLayout}
                  onCollapse={() => togglePanel('results')}
                />
              ) : null}
            </div>
            {showFullLayout && resultVisible && resultCollapsed ? (
              <CollapsedPanelRail side="right" label="运行结果" onExpand={() => togglePanel('results')} />
            ) : null}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showAssistantModal ? (
          <ProgrammingAssistantModal onClose={() => setShowAssistantModal(false)} />
        ) : null}
      </AnimatePresence>

      <MissionDrawer
        open={isMissionDrawerOpen}
        onClose={() => setIsMissionDrawerOpen(false)}
        content={MISSION_CONTENT}
      />
    </div>
  );
}

