import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Brain, Lightbulb, Medal, Sparkles, Trophy, Video } from 'lucide-react';

const LESSON_CARD = {
  id: 'mission-astro-weather',
  title: '任务 05 · 建造 AI 气象站',
  subtitle: '把温度传感器数据绘制成趋势图，让同学们随时掌握天气变化。',
  coverImage:
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=60',
  story:
    '你的队伍需要在 20 分钟内完成气象站的可视化面板。孩子需要整理数据、绘制折线图，并给出 AI 提示，帮助老师快速判断是否需要发布降温提醒。',
  objectives: ['读取 csv 数据', '使用循环整理温度', '绘制折线图', '输出 AI 建议'],
  tips: ['图表要有标题和轴标签', '温度单位统一成 ℃', 'AI 建议需要提到安全提醒'],
  videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  poster:
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=60',
  timeEstimate: '约 18 分钟',
};

export const LESSON_VIDEO_META = {
  title: LESSON_CARD.title,
  videoUrl: LESSON_CARD.videoUrl,
  poster: LESSON_CARD.poster,
};

const QUIZ_CARD = {
  question: '在绘制折线图时，哪段代码负责设置折线颜色？',
  options: [
    { id: 'a', label: 'A', text: 'plt.title(\"AI 气象站\")' },
    { id: 'b', label: 'B', text: 'plt.plot(x, y, color=\"#3B82F6\")' },
    { id: 'c', label: 'C', text: 'plt.xlabel(\"时间\")' },
  ],
  correctOptionId: 'b',
  reward: 5,
};

interface LessonTaskPanelProps {
  isDark: boolean;
  onRequestVideo: () => void;
}

type Slide = 'mission' | 'quiz';

export function LessonTaskPanel({ isDark, onRequestVideo }: LessonTaskPanelProps) {
  const [activeSlide, setActiveSlide] = useState<Slide>('mission');
  const [tCoins, setTCoins] = useState(120);
  const [quizState, setQuizState] = useState<'idle' | 'correct' | 'incorrect'>('idle');

  const handleNextSlide = () => setActiveSlide('quiz');
  const handlePreviousSlide = () => setActiveSlide('mission');

  const handleSelectOption = (optionId: string) => {
    if (quizState === 'correct') return;
    if (optionId === QUIZ_CARD.correctOptionId) {
      setQuizState('correct');
      setTCoins(prev => prev + QUIZ_CARD.reward);
    } else {
      setQuizState('incorrect');
    }
  };

  const missionView = (
    <MissionSlide key="mission" isDark={isDark} onRequestVideo={onRequestVideo} />
  );
  const quizView = (
    <QuizSlide key="quiz" isDark={isDark} quizState={quizState} onSelectOption={handleSelectOption} />
  );

  return (
    <div className="flex flex-col gap-3">
      <TokenBalanceCard isDark={isDark} balance={tCoins} />

      <AnimatePresence mode="wait">
        {activeSlide === 'mission' ? missionView : quizView}
      </AnimatePresence>

      <SlideControls
        isDark={isDark}
        activeSlide={activeSlide}
        onNext={handleNextSlide}
        onPrev={handlePreviousSlide}
        quizState={quizState}
      />
    </div>
  );
}

function TokenBalanceCard({ isDark, balance }: { isDark: boolean; balance: number }) {
  return (
    <div
      className={clsx(
        'flex items-center justify-between rounded-2xl border px-4 py-3 text-sm shadow transition-colors',
        isDark ? 'border-blue-800/60 bg-blue-900/40 text-blue-100' : 'border-blue-100 bg-white text-slate-700',
      )}
    >
      <div>
        <p
          className={clsx(
            'text-xs uppercase tracking-[0.3em]',
            isDark ? 'text-blue-300' : 'text-blue-500',
          )}
        >
          T币余额
        </p>
        <p className={clsx('text-2xl font-semibold', isDark ? 'text-yellow-300' : 'text-amber-500')}>
          {balance}
          <span className={clsx('text-sm ms-1', isDark ? 'text-blue-200' : 'text-blue-500/80')}>Token</span>
        </p>
      </div>
      <div className="text-right">
        <p className={clsx('text-xs', isDark ? 'text-blue-200' : 'text-blue-500/70')}>AI 功能消耗 T币</p>
        <button
          type="button"
          className={clsx(
            'mt-1 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold shadow',
            isDark ? 'bg-blue-700/80 text-blue-50' : 'bg-blue-50 text-blue-700',
          )}
        >
          <Sparkles size={14} />
          AI 小智
        </button>
      </div>
    </div>
  );
}

function MissionSlide({ isDark, onRequestVideo }: { isDark: boolean; onRequestVideo: () => void }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className={clsx(
        'rounded-2xl border px-4 py-4 shadow-inner space-y-3',
        isDark ? 'border-blue-800/50 bg-gray-900/60' : 'border-blue-100 bg-blue-50/60',
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.35em] text-blue-400">今日任务</p>
          <h3 className={clsx('text-base font-semibold', isDark ? 'text-white/90' : 'text-slate-900')}>
            {LESSON_CARD.title}
          </h3>
          <p className={clsx('text-xs', isDark ? 'text-blue-200/80' : 'text-slate-500')}>{LESSON_CARD.subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onRequestVideo}
          className="inline-flex items-center gap-1 rounded-full bg-blue-600/80 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-blue-500/80"
        >
          <Video size={14} />
          观看视频
        </button>
      </header>

      <div className="overflow-hidden rounded-2xl border border-blue-700/40">
        <img src={LESSON_CARD.coverImage} alt={LESSON_CARD.title} className="h-32 w-full object-cover" />
      </div>

      <p className={clsx('text-sm leading-relaxed', isDark ? 'text-blue-50/90' : 'text-slate-600')}>
        {LESSON_CARD.story}
      </p>

      <div
        className={clsx(
          'grid gap-3 rounded-2xl border px-3 py-3 text-sm',
          isDark ? 'border-blue-800 bg-blue-950/50 text-blue-100' : 'border-blue-100 bg-white text-slate-700',
        )}
      >
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-400">
          <Trophy size={14} />
          任务目标
        </div>
        <ul className="space-y-2 text-sm">
          {LESSON_CARD.objectives.map(objective => (
            <li key={objective} className="flex items-start gap-2">
              <span
                className={clsx(
                  'mt-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                  isDark ? 'bg-blue-600/30 text-blue-100' : 'bg-blue-100 text-blue-700',
                )}
              >
                ✓
              </span>
              <span>{objective}</span>
            </li>
          ))}
        </ul>
      </div>

      <div
        className={clsx(
          'rounded-2xl px-3 py-2 text-xs',
          isDark ? 'bg-blue-500/10 text-blue-100' : 'bg-blue-100 text-blue-800',
        )}
      >
        <span className={clsx('inline-flex items-center gap-1 font-semibold', isDark ? 'text-blue-200' : 'text-blue-700')}>
          <Lightbulb size={14} />
          提示
        </span>
        <div className="mt-2 space-y-1.5">
          {LESSON_CARD.tips.map(tip => (
            <p key={tip} className="flex items-start gap-2">
              <span>•</span>
              {tip}
            </p>
          ))}
        </div>
      </div>

      <p className={clsx('text-xs', isDark ? 'text-blue-200/80' : 'text-slate-500')}>
        建议完成时间：{LESSON_CARD.timeEstimate}
      </p>
    </motion.section>
  );
}

function QuizSlide({
  isDark,
  quizState,
  onSelectOption,
}: {
  isDark: boolean;
  quizState: 'idle' | 'correct' | 'incorrect';
  onSelectOption: (id: string) => void;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className={clsx(
        'rounded-2xl border px-4 py-4 shadow-inner space-y-4',
        isDark ? 'border-indigo-800/60 bg-slate-900/70' : 'border-indigo-100 bg-white',
      )}
    >
      <div className="flex items-center justify-between">
        <div
          className={clsx(
            'flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em]',
            isDark ? 'text-indigo-300' : 'text-indigo-500',
          )}
        >
          <Brain size={14} />
          测试题
        </div>
        <span
          className={clsx(
            'rounded-full px-2 py-0.5 text-[11px] font-semibold',
            isDark ? 'bg-indigo-500/10 text-indigo-200' : 'bg-indigo-100 text-indigo-600',
          )}
        >
          +{QUIZ_CARD.reward} T币
        </span>
      </div>
      <p className={clsx('text-sm font-medium', isDark ? 'text-indigo-50' : 'text-slate-700')}>{QUIZ_CARD.question}</p>
      <ul className="space-y-2">
        {QUIZ_CARD.options.map(option => {
          const isCorrect = quizState === 'correct' && option.id === QUIZ_CARD.correctOptionId;
          const isWrong = quizState === 'incorrect' && option.id !== QUIZ_CARD.correctOptionId;
          return (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => onSelectOption(option.id)}
                className={clsx(
                  'flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition',
                  isDark ? 'border-indigo-800 bg-indigo-900/40 text-indigo-50' : 'border-indigo-100 bg-indigo-50/70 text-indigo-900',
                  isCorrect && 'border-emerald-300 bg-emerald-500/20 text-emerald-50',
                  quizState === 'incorrect' && option.id === QUIZ_CARD.correctOptionId && 'border-emerald-300',
                  isWrong && 'opacity-70',
                )}
              >
                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold">{option.label}</span>
                <span>{option.text}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <AnimatePresence>
        {quizState === 'correct' ? (
          <RewardBadge key="reward" reward={QUIZ_CARD.reward} isDark={isDark} />
        ) : quizState === 'incorrect' ? (
          <motion.p
            key="retry"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={clsx('text-xs', isDark ? 'text-amber-200' : 'text-amber-600')}
          >
            再想想：颜色设置通常放在 `plt.plot` 中。
          </motion.p>
        ) : null}
      </AnimatePresence>
    </motion.section>
  );
}

function RewardBadge({ reward, isDark }: { reward: number; isDark: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={clsx(
        'flex items-center justify-between rounded-2xl border px-3 py-2 text-sm font-semibold',
        isDark
          ? 'border-emerald-300/60 bg-emerald-500/20 text-emerald-100'
          : 'border-emerald-200 bg-emerald-50 text-emerald-600',
      )}
    >
      <div className="flex items-center gap-2">
        <Medal size={16} />
        回答正确！奖励
      </div>
      <span className="text-base">+{reward} T币</span>
    </motion.div>
  );
}

function SlideControls({
  isDark,
  activeSlide,
  onNext,
  onPrev,
  quizState,
}: {
  isDark: boolean;
  activeSlide: Slide;
  onNext: () => void;
  onPrev: () => void;
  quizState: 'idle' | 'correct' | 'incorrect';
}) {
  const dots = useMemo(
    () => [
      { id: 'mission', label: '任务', active: activeSlide === 'mission' },
      { id: 'quiz', label: '测验', active: activeSlide === 'quiz' },
    ],
    [activeSlide],
  );

  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-1.5">
        {dots.map(dot => (
          <span
            key={dot.id}
            className={clsx(
              'h-2.5 rounded-full transition-all',
              dot.active ? 'w-6 bg-blue-400' : 'w-2.5 bg-blue-400/30',
            )}
            title={dot.label}
          />
        ))}
      </div>

      {activeSlide === 'mission' ? (
        <button
          type="button"
          onClick={onNext}
          className={clsx(
            'inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium text-white shadow',
            isDark ? 'bg-blue-600/90' : 'bg-blue-500',
          )}
        >
          下一页
          <ArrowRight size={14} />
        </button>
      ) : (
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={onPrev}
            className={clsx(
              'inline-flex items-center gap-1 rounded-full border px-3 py-1',
              isDark ? 'border-blue-800/60 text-blue-200' : 'border-blue-200 text-blue-600',
            )}
          >
            <ArrowLeft size={14} />
            返回任务
          </button>
          <span
            className={clsx(
              'rounded-full px-2 py-1 text-[11px]',
              quizState === 'correct'
                ? isDark
                  ? 'bg-emerald-500/20 text-emerald-100'
                  : 'bg-emerald-50 text-emerald-600'
                : isDark
                  ? 'bg-blue-500/10 text-blue-100'
                  : 'bg-blue-100 text-blue-600',
            )}
          >
            回答 {quizState === 'correct' ? '完成' : '待完成'}
          </span>
        </div>
      )}
    </div>
  );
}
