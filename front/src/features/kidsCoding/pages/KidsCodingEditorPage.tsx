import { useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { useKidsCodingTheme } from '@/features/kidsCoding/hooks/useTheme';
import { KidsCodingAuthContext } from '@/features/kidsCoding/contexts/authContext';
import { ProgrammingAssistantModal } from '@/features/kidsCoding/components/ProgrammingAssistantModal';

const MOCK_CODE = `# AI 国度修复计划 - 任务 01：认识你的 AI 助手

# 欢迎来到 AI 国度！我们先创建一个简单的 AI 助手类
class AIAssistant:
    def __init__(self, name):
        self.name = name
        self.energy = 100
        self.knowledge = 0

    def greet(self):
        print(f"你好！我是 {self.name}，你的 AI 助手～")
        print("很高兴能和你一起修复 AI 国度！")

    def learn(self, points):
        self.knowledge += points
        print(f"我学到了新知识！当前知识值：{self.knowledge}")

    def work(self):
        if self.energy > 0:
            self.energy -= 10
            print(f"{self.name} 正在努力工作...")
            print(f"剩余能量：{self.energy}")
        else:
            print(f"{self.name} 太累啦，需要休息！")

    def rest(self):
        self.energy = min(100, self.energy + 20)
        print(f"{self.name} 充好电啦！当前能量：{self.energy}")

my_assistant = AIAssistant("小智")
my_assistant.greet()
my_assistant.learn(15)
my_assistant.work()
my_assistant.rest()`;

const MOCK_CONSOLE_OUTPUT = `你好！我是 小智，你的 AI 助手～
很高兴能和你一起修复 AI 国度！
我学到了新知识！当前知识值：15
小智 正在努力工作...
剩余能量：90
小智 充好电啦！当前能量：100`;

const MOCK_AI_CHAT_HISTORY = [
  { id: 1, text: '你好！我是你的 AI 编程助手，有什么可以帮你的吗？', isAI: true },
  { id: 2, text: '我想了解如何创建一个 AI 助手类。', isAI: false },
  {
    id: 3,
    text:
      '创建 AI 助手类的关键是使用 class 定义结构，在 __init__ 中初始化属性，然后为助手添加 greet/learn/work/rest 等方法。我们可以一起完善代码！',
    isAI: true,
  },
] as const;

const MOCK_MISSION = {
  title: 'AI 国度修复计划 · 第一章',
  story:
    '欢迎来到 AI 国度！这里的系统因为一场意外而全部宕机。你需要与 AI 助手小智一起，重建关键模块，让王国重新恢复活力。',
  objectives: ['理解 Python 类的概念', '实现 AI 助手的 4 个方法', '运行代码确认逻辑正确', '记录调试心得，准备提交作品'],
  hints: ['类（class）是创建对象的蓝图', '__init__ 方法在实例化时自动执行', '记得让每个方法都以 self 作为第一个参数', '逐步运行、观察能量与知识值是否正确'],
};

type MobileMenu = 'code' | 'mission' | 'result';
type ResultTab = 'visualization' | 'console' | 'ai';

export function KidsCodingEditorPage() {
  const { theme, toggleTheme } = useKidsCodingTheme();
  const { userInfo, logout } = useContext(KidsCodingAuthContext);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [mobileMenu, setMobileMenu] = useState<MobileMenu>('code');
  const [activeTab, setActiveTab] = useState<ResultTab>('visualization');
  const [aiInput, setAiInput] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState(() => [...MOCK_AI_CHAT_HISTORY]);
  const [isRunning, setIsRunning] = useState(false);
  const [showAssistantModal, setShowAssistantModal] = useState(false);
  const [isVisualizationFullscreen, setIsVisualizationFullscreen] = useState(false);
  const consoleRef = useRef<HTMLDivElement>(null);
  const visualizationRef = useRef<HTMLDivElement>(null);
  const [screenWidth, setScreenWidth] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1200));

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
      if (window.innerWidth >= 1024) {
        setIsLeftPanelOpen(true);
        setIsRightPanelOpen(true);
      } else if (window.innerWidth >= 768) {
        setIsLeftPanelOpen(true);
        setIsRightPanelOpen(false);
      } else {
        setIsLeftPanelOpen(false);
        setIsRightPanelOpen(false);
        setMobileMenu('code');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenElement =
        document.fullscreenElement ||
        (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement ||
        (document as unknown as { msFullscreenElement?: Element }).msFullscreenElement;
      if (!fullscreenElement) {
        setIsVisualizationFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleMobileMenuChange = (next: MobileMenu) => {
    setMobileMenu(next);
    if (screenWidth >= 768) return;
    setIsLeftPanelOpen(next === 'mission');
    setIsRightPanelOpen(next === 'result');
  };

  const toggleLeftPanel = () => {
    if (screenWidth < 768) return;
    setIsLeftPanelOpen(prev => !prev);
  };

  const toggleRightPanel = () => {
    if (screenWidth < 768) return;
    setIsRightPanelOpen(prev => !prev);
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      toast.success('代码运行成功，AI 助手状态已更新');
      if (screenWidth < 768) {
        handleMobileMenuChange('result');
      }
      if (consoleRef.current) {
        consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
      }
    }, 900);
  };

  const toggleVisualizationFullscreen = async () => {
    if (!visualizationRef.current) return;
    try {
      if (!isVisualizationFullscreen) {
        const el = visualizationRef.current;
        if (el.requestFullscreen) await el.requestFullscreen();
        else if ((el as any).webkitRequestFullscreen) await (el as any).webkitRequestFullscreen();
        else if ((el as any).msRequestFullscreen) await (el as any).msRequestFullscreen();
        setIsVisualizationFullscreen(true);
        toast.info('已切换到全屏演示视图');
      } else {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if ((document as any).webkitExitFullscreen) await (document as any).webkitExitFullscreen();
        else if ((document as any).msExitFullscreen) await (document as any).msExitFullscreen();
        setIsVisualizationFullscreen(false);
        toast.info('已退出全屏');
      }
    } catch (error) {
      console.error(error);
      toast.error('全屏切换失败，请稍后再试');
    }
  };

  const handleSendAiMessage = () => {
    const text = aiInput.trim();
    if (!text) return;
    const userMessage = { id: Date.now(), text, isAI: false };
    const aiReply = {
      id: Date.now() + 1,
      text: '收到！我们可以先确认一下类的属性，再一起扩展新的方法。',
      isAI: true,
    };
    setAiChatHistory(prev => [...prev, userMessage, aiReply]);
    setAiInput('');
    setActiveTab('ai');
  };

  const shouldRenderLeft = isLeftPanelOpen;
  const shouldRenderRight = isRightPanelOpen;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
            >
              <i className={`fa-solid ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`} />
            </button>
            <h1 className="text-xl font-semibold">AI 国度 · 编程学堂</h1>
          </div>

          {userInfo ? (
            <div className="flex items-center gap-3">
              <img src={userInfo.avatar} alt={userInfo.name} className="h-10 w-10 rounded-full object-cover" />
              <div>
                <p className="text-sm font-medium">{userInfo.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{userInfo.email}</p>
              </div>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg bg-slate-100 px-3 py-1 text-sm text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              >
                退出登录
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <div className="container mx-auto flex flex-col px-4 py-6">
        {screenWidth < 1024 ? (
          <div className="mb-4 flex gap-2 rounded-xl bg-white p-2 shadow-sm dark:bg-slate-900">
            {[
              { key: 'code', label: '编码', icon: 'fa-code' },
              { key: 'mission', label: '任务', icon: 'fa-map' },
              { key: 'result', label: '运行结果', icon: 'fa-display' },
            ].map(item => (
              <button
                key={item.key}
                type="button"
                onClick={() => handleMobileMenuChange(item.key as MobileMenu)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  mobileMenu === item.key ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <i className={`fa-solid ${item.icon}`} />
                {item.label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="flex flex-1 items-start gap-4">
          {screenWidth >= 768 && !shouldRenderLeft ? (
            <motion.button
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleLeftPanel}
              className="hidden h-10 w-10 items-center justify-center rounded-r-lg border border-slate-200 bg-white shadow-md transition dark:border-slate-700 dark:bg-slate-900 md:flex"
            >
              <i className="fa-solid fa-chevron-right text-slate-500 dark:text-slate-300" />
            </motion.button>
          ) : null}
          <AnimatePresence>
            {shouldRenderLeft ? (
              <motion.aside
                key="mission-panel"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-xs flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase text-blue-500">任务进度</p>
                    <h2 className="mt-1 text-lg font-semibold">{MOCK_MISSION.title}</h2>
                  </div>
                  {screenWidth >= 768 ? (
                    <button
                      type="button"
                      onClick={toggleLeftPanel}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    >
                      <i className="fa-solid fa-chevron-left" />
                    </button>
                  ) : null}
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{MOCK_MISSION.story}</p>

                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-300">任务目标</h3>
                  <ul className="mt-2 space-y-2">
                    {MOCK_MISSION.objectives.map((goal, index) => (
                      <li key={goal} className="flex items-start gap-2 rounded-lg bg-blue-50/70 p-2 text-sm text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">{index + 1}</span>
                        {goal}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 rounded-xl bg-slate-100 p-3 dark:bg-slate-800/70">
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300">提示</h3>
                  <ul className="mt-2 space-y-2 text-xs text-slate-500 dark:text-slate-400">
                    {MOCK_MISSION.hints.map(hint => (
                      <li key={hint} className="flex items-start gap-2">
                        <i className="fa-solid fa-lightbulb mt-0.5 text-yellow-400" />
                        {hint}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAssistantModal(true)}
                  className="mt-4 w-full rounded-xl bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  打开教学助手
                </button>
              </motion.aside>
            ) : null}
          </AnimatePresence>

          <div className="flex min-h-[600px] flex-1 flex-col gap-4">
            <div className="flex flex-1 flex-col rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
                <span className="font-medium">main.py</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="rounded-lg px-3 py-1 text-xs text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    onClick={() => toast.info('变量检查功能即将上线')}
                  >
                    变量检查
                  </button>
                  <button
                    type="button"
                    className="rounded-lg px-3 py-1 text-xs text-slate-500 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    onClick={() => toast.info('代码格式化即将上线')}
                  >
                    自动格式化
                  </button>
                </div>
              </div>
              <pre className="flex-1 overflow-auto bg-slate-950/90 p-4 text-xs text-green-200">{MOCK_CODE}</pre>
              <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-800">
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>Python 3.11</span>
                  <span>AI 辅助：开启</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toast.info('代码重置已完成')}
                    className="rounded-lg px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    重置
                  </button>
                  <button
                    type="button"
                    onClick={handleRunCode}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-700"
                    disabled={isRunning}
                  >
                    {isRunning ? '运行中...' : '运行代码'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {shouldRenderRight ? (
              <motion.aside
                key="result-panel"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.2 }}
                className="w-full max-w-md flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    {[
                      { key: 'visualization', label: '可视化', icon: 'fa-cubes' },
                      { key: 'console', label: '控制台', icon: 'fa-terminal' },
                      { key: 'ai', label: 'AI 助手', icon: 'fa-robot' },
                    ].map(tab => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTab(tab.key as ResultTab)}
                        className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs transition ${
                          activeTab === tab.key
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                      >
                        <i className={`fa-solid ${tab.icon}`} />
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  {screenWidth >= 768 ? (
                    <button
                      type="button"
                      onClick={toggleRightPanel}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                    >
                      <i className="fa-solid fa-chevron-right" />
                    </button>
                  ) : null}
                </div>

                <div className="h-full">
                  {activeTab === 'visualization' ? (
                    <div ref={visualizationRef} className="relative aspect-square w-full bg-slate-900/90 p-6 text-white">
                      <div className="absolute right-4 top-4 flex gap-2">
                        <button
                          type="button"
                          onClick={toggleVisualizationFullscreen}
                          className="rounded-lg bg-white/20 px-3 py-1 text-xs"
                        >
                          {isVisualizationFullscreen ? '退出全屏' : '全屏演示'}
                        </button>
                      </div>
                      <div className="flex h-full flex-col items-center justify-center gap-6">
                        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-500 text-3xl font-bold shadow-lg">AI</div>
                        <p className="text-center text-sm text-blue-100">
                          AI 助手小智正在释放「问候」「学习」「工作」「休息」技能，状态条会根据运行结果动态变化。
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {activeTab === 'console' ? (
                    <div ref={consoleRef} className="h-72 overflow-auto bg-slate-950/90 p-4 text-xs text-green-200">
                      <pre>{MOCK_CONSOLE_OUTPUT}</pre>
                    </div>
                  ) : null}

                  {activeTab === 'ai' ? (
                    <div className="flex h-72 flex-col gap-3 p-4">
                      <div className="flex-1 space-y-3 overflow-auto">
                        {aiChatHistory.map(message => (
                          <div
                            key={message.id}
                            className={`flex ${message.isAI ? 'justify-start' : 'justify-end'}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                                message.isAI
                                  ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                                  : 'bg-blue-600 text-white'
                              }`}
                            >
                              {message.text}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={aiInput}
                          onChange={event => setAiInput(event.target.value)}
                          placeholder="向 AI 助手提问，如：帮我优化能量恢复逻辑"
                          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                        />
                        <button
                          type="button"
                          onClick={handleSendAiMessage}
                          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                        >
                          发送
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </motion.aside>
            ) : null}
          </AnimatePresence>
          {screenWidth >= 768 && !shouldRenderRight ? (
            <motion.button
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleRightPanel}
              className="hidden h-10 w-10 items-center justify-center rounded-l-lg border border-slate-200 bg-white shadow-md transition dark:border-slate-700 dark:bg-slate-900 md:flex"
            >
              <i className="fa-solid fa-chevron-left text-slate-500 dark:text-slate-300" />
            </motion.button>
          ) : null}
        </div>
      </div>

      <AnimatePresence>{showAssistantModal ? <ProgrammingAssistantModal onClose={() => setShowAssistantModal(false)} /> : null}</AnimatePresence>
    </div>
  );
}
