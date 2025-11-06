
import { useContext, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { useKidsCodingTheme } from '@/features/kidsCoding/hooks/useTheme';
import { KidsCodingAuthContext } from '@/features/kidsCoding/contexts/authContext';
import { ProgrammingAssistantModal } from '@/features/kidsCoding/components/ProgrammingAssistantModal';

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

type AiChatMessage = {
  id: number;
  text: string;
  isAI: boolean;
};

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

type MobileSection = 'mission' | 'code' | 'results';
type ResultFocus = 'visualization' | 'ai';

const getInitialWidth = () => (typeof window !== 'undefined' ? window.innerWidth : 1280);

export function KidsCodingEditorPage() {
  const { theme, toggleTheme } = useKidsCodingTheme();
  const { userInfo, logout } = useContext(KidsCodingAuthContext);
  const consoleRef = useRef<HTMLDivElement>(null);

  const [screenWidth, setScreenWidth] = useState(getInitialWidth);
  const [mobileSection, setMobileSection] = useState<MobileSection>('code');
  const [activeMobileResult, setActiveMobileResult] = useState<ResultFocus>('visualization');
  const [aiMessages, setAiMessages] = useState<AiChatMessage[]>(() => [...INITIAL_CHAT]);
  const [aiInput, setAiInput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [showAssistantModal, setShowAssistantModal] = useState(false);

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

  const missionVisible = showFullLayout || mobileSection === 'mission';
  const codeVisible = showFullLayout || mobileSection === 'code';
  const resultVisible = showFullLayout || mobileSection === 'results';

  const renderConsoleOverlay = () => (
    <AnimatePresence initial={false}>
      {isConsoleOpen ? (
        <motion.div
          key="console-overlay"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="pointer-events-auto absolute inset-x-0 bottom-0 overflow-hidden border-t border-slate-800 bg-slate-950/95"
        >
          <div className="flex items-center justify-between px-5 py-3 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-terminal text-emerald-400" />
              <span>控制台输出</span>
            </div>
            <button
              type="button"
              onClick={() => setIsConsoleOpen(false)}
              className="rounded-lg px-3 py-1 transition hover:bg-white/10"
            >
              收起
            </button>
          </div>
          <div ref={consoleRef} className="max-h-60 overflow-auto px-5 pb-5 text-[12px] text-green-200">
            <pre>{CONSOLE_SAMPLE}</pre>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  const renderVisualization = () => (
    <div className="overflow-hidden rounded-2xl bg-slate-950/90 p-5 text-white shadow-inner">
      <div className="flex items-center justify-between text-sm text-slate-300">
        <span>
          <i className="fa-solid fa-cubes me-2 text-blue-400" />
          可视化演示
        </span>
        <button
          type="button"
          onClick={() => toast.info('全屏演示模式即将上线')}
          className="rounded-lg px-3 py-1 text-xs text-slate-300 transition hover:bg-white/10"
        >
          <i className="fa-solid fa-up-right-and-down-left-from-center me-1" />
          全屏
        </button>
      </div>
      <div className="mt-6 flex h-full min-h-[220px] flex-col items-center justify-center gap-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-500 text-3xl font-bold shadow-lg shadow-blue-700/40">
          AI
        </div>
        <p className="max-w-xs text-center text-sm text-blue-100">
          小智正在依次执行问候、学习、工作、休息技能，运行时动画和状态条会同步刷新。
        </p>
        <div className="flex w-full max-w-xs justify-center gap-3 text-xs text-slate-200">
          <span>
            <i className="fa-solid fa-bolt me-1 text-amber-300" />
            能量 90%
          </span>
          <span>
            <i className="fa-solid fa-brain me-1 text-emerald-300" />
            知识 35%
          </span>
        </div>
      </div>
    </div>
  );

  const renderAiAssistant = () => (
    <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-inner dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 text-sm dark:border-slate-800">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-robot text-blue-500" />
          <span className="font-medium text-slate-800 dark:text-slate-100">AI 编程助手</span>
        </div>
        <button
          type="button"
          onClick={() => setShowAssistantModal(true)}
          className="rounded-lg px-3 py-1 text-xs text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
        >
          查看教学资料
        </button>
      </div>
      <div className="flex-1 space-y-3 overflow-auto px-4 py-4 text-sm">
        {aiMessages.map(message => (
          <div key={message.id} className={clsx('flex', message.isAI ? 'justify-start' : 'justify-end')}>
            <div
              className={clsx(
                'max-w-[80%] rounded-2xl px-3 py-2',
                message.isAI
                  ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  : 'bg-blue-600 text-white',
              )}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-800">
        <div className="flex gap-2">
          <input
            value={aiInput}
            onChange={event => setAiInput(event.target.value)}
            placeholder="向 AI 助手提问：例如“帮我优化能量恢复逻辑”"
            className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-blue-400 dark:focus:ring-blue-900/40"
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
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      

      <main className="flex flex-1 flex-col py-6">
        <div className="mx-auto flex h-full w-full max-w-7xl flex-col gap-6 px-4">
          {!showFullLayout ? (
            <div className="flex gap-2 rounded-2xl bg-white p-2 shadow-sm dark:bg-slate-900">
              {[
                { key: 'mission', label: '任务', icon: 'fa-map' },
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

          <div
            className={clsx(
              'grid flex-1 items-stretch gap-4',
              showFullLayout ? 'grid-cols-[320px_minmax(0,1fr)_380px] gap-6' : 'grid-cols-1',
            )}
          >
            {missionVisible ? (
              <aside className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                  <div>
                    <p className="text-xs uppercase text-blue-500">任务说明</p>
                    <h2 className="text-lg font-semibold">{MISSION_CONTENT.title}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.info('任务列表功能开发中，敬请期待。')}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <i className="fa-solid fa-arrows-rotate" />
                  </button>
                </div>
                <div className="flex-1 space-y-6 overflow-auto px-4 py-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  <section>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                      <i className="fa-solid fa-book-open text-blue-500" />
                      任务剧情
                    </h3>
                    <p className="mt-2">{MISSION_CONTENT.story}</p>
                  </section>
                  <section>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                      <i className="fa-solid fa-bullseye text-emerald-500" />
                      任务目标
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {MISSION_CONTENT.objectives.map(objective => (
                        <li key={objective} className="flex items-start gap-2">
                          <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-xs text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300">
                            <i className="fa-solid fa-check" />
                          </span>
                          <span>{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
                      <i className="fa-solid fa-lightbulb text-amber-500" />
                      学习提示
                    </h3>
                    <ul className="mt-3 space-y-2">
                      {MISSION_CONTENT.hints.map(hint => (
                        <li key={hint} className="flex items-start gap-2">
                          <span className="mt-0.5 text-amber-500">
                            <i className="fa-solid fa-star" />
                          </span>
                          <span>{hint}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
                <div className="border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>
                      <i className="fa-solid fa-clock me-2 text-blue-500" />
                      今日学习时长 12 分钟
                    </span>
                    <button
                      type="button"
                      onClick={() => toast.info('已加入复盘清单')}
                      className="rounded-lg px-3 py-1 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      加入复盘
                    </button>
                  </div>
                </div>
              </aside>
            ) : null}
            {codeVisible ? (
              <section className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-xs uppercase text-blue-500">代码编辑器</p>
                      <h2 className="text-lg font-semibold">AI 助手核心逻辑</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSave}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <i className="fa-solid fa-floppy-disk me-2" />
                        保存进度
                      </button>
                      <button
                        type="button"
                        onClick={handleFormat}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        <i className="fa-solid fa-wand-magic-sparkles me-2" />
                        自动格式化
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAssistantModal(true)}
                        className="rounded-xl border border-blue-200 px-4 py-2 text-sm text-blue-600 transition hover:bg-blue-50 dark:border-blue-900/40 dark:text-blue-400 dark:hover:bg-blue-900/20"
                      >
                        <i className="fa-solid fa-robot me-2" />
                        编程助手
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span>
                      <i className="fa-solid fa-code me-2" />
                      Python 3.11
                    </span>
                    <span>
                      <i className="fa-solid fa-circle-nodes me-2 text-emerald-500" />
                      AI 纠错已开启
                    </span>
                    <span>
                      <i className="fa-solid fa-cloud-arrow-up me-2 text-blue-500" />
                      自动保存每 30 秒
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="relative flex-1 overflow-hidden bg-slate-950/95">
                    <pre className="h-full overflow-auto p-6 pb-36 text-[13px] leading-relaxed text-green-200">{CODE_SAMPLE}</pre>
                    {renderConsoleOverlay()}
                  </div>
                  <div className="border-t border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col gap-3 px-5 py-4 text-xs text-slate-500 dark:text-slate-400 lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex flex-wrap items-center gap-4">
                        <span>
                          <i className="fa-solid fa-shield-halved me-1 text-emerald-500" />
                          已通过 2 项安全检查
                        </span>
                        <span>
                          <i className="fa-solid fa-sparkles me-1 text-amber-400" />
                          使用注释记录调试要点
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsConsoleOpen(previous => !previous)}
                          className="rounded-xl px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          {isConsoleOpen ? '收起控制台' : '查看控制台'}
                        </button>
                        <button
                          type="button"
                          onClick={handleReset}
                          className="rounded-xl px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          重置
                        </button>
                        <button
                          type="button"
                          onClick={handleRunCode}
                          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                          disabled={isRunning}
                        >
                          <i className="fa-solid fa-play" />
                          {isRunning ? '运行中…' : '运行代码'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            ) : null}
            {resultVisible ? (
              <aside className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col border-b border-slate-200 px-4 py-3 text-sm dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs uppercase text-blue-500">运行结果</p>
                    <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">可视化 + AI 助手</h2>
                  </div>
                  {!showFullLayout ? (
                    <div className="mt-3 flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-300 lg:mt-0">
                      {[
                        { key: 'visualization', label: '可视化', icon: 'fa-display' },
                        { key: 'ai', label: 'AI 助手', icon: 'fa-robot' },
                      ].map(option => (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => setActiveMobileResult(option.key as ResultFocus)}
                          className={clsx(
                            'flex items-center gap-1 rounded-lg px-3 py-1 transition',
                            activeMobileResult === option.key
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-500 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700',
                          )}
                        >
                          <i className={`fa-solid ${option.icon}`} />
                          {option.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-1 flex-col gap-3 overflow-hidden px-4 pb-4 pt-3">
                  {(showFullLayout || activeMobileResult === 'visualization') ? renderVisualization() : null}
                  {(showFullLayout || activeMobileResult === 'ai') ? renderAiAssistant() : null}
                </div>
              </aside>
            ) : null}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showAssistantModal ? (
          <ProgrammingAssistantModal onClose={() => setShowAssistantModal(false)} />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

