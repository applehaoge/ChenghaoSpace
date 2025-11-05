import { useState, useEffect, useRef, useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import { toast } from 'sonner';
import { aiService } from '@/api/aiService';
import { AttachmentBadge, useFileUploader } from '@/components/attachments';
import type { UploadedAttachment } from '@/pages/home/types';

export type MainContentProps = {
  inputText: string;
  setInputText: (value: string) => void;
  onSendMessage?: (message: string, attachments?: UploadedAttachment[]) => void;
};

const KIDS_CODING_URL = (import.meta.env.VITE_KIDS_CODING_URL as string | undefined) ?? '';
const HOME_BADGE_LABEL = 'AI 问答';
const DEFAULT_STUDENT_NAME = (import.meta.env.VITE_STUDENT_NAME as string | undefined) ?? '同学';
const CHECK_IN_STORAGE_KEY = 'home.dailyCheckIn';
const UPCOMING_EVENTS = [
  { label: 'CSP-J/S 2026 第一轮', date: '2026-09-20' },
  { label: 'NOIP 2025', date: '2025-11-28' },
] as const;
const FORTUNE_LEVELS = ['大吉', '中吉', '小吉', '平顺'] as const;

type FortuneActivity = {
  title: string;
  description: string;
};

const FORTUNE_GOOD_ACTIVITIES: readonly FortuneActivity[] = [
  { title: '玩网游', description: '犹如神助，所向披靡' },
  { title: '出行', description: '一路顺风，畅通无阻' },
  { title: '学算法', description: '触类旁通，效率爆棚' },
  { title: '分享心得', description: '妙语连珠，收获掌声' },
  { title: '调试项目', description: '灵感闪现，Bug 自动消失' },
] as const;

const FORTUNE_BAD_ACTIVITIES: readonly FortuneActivity[] = [
  { title: '写作文', description: '不知所云，容易跑题' },
  { title: '刷短视频', description: '一刷就停不下来' },
  { title: '拖延作业', description: '灵感流失，效率低下' },
  { title: '熬夜肝项目', description: '第二天精神不济' },
  { title: '临时抱佛脚', description: '记忆混乱，效果不佳' },
] as const;

type CheckInRecord = {
  lastCheckInDate: string;
  streak: number;
};

export function MainContent({
  inputText,
  setInputText,
  onSendMessage,
}: MainContentProps) {
  const [inspiration, setInspiration] = useState('创新思维，高效创作');
  const [checkInRecord, setCheckInRecord] = useState<CheckInRecord>({
    lastCheckInDate: '',
    streak: 0,
  });
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const homeTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const {
    attachments: homeAttachments,
    hasUploading: homeHasUploading,
    triggerFileDialog: openHomeFileDialog,
    fileInputRef: homeFileInputRef,
    handleInputChange: handleHomeFileInputChange,
    removeAttachment: removeHomeAttachment,
    clearAttachments: clearHomeAttachments,
  } = useFileUploader();

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(CHECK_IN_STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as CheckInRecord;
      setCheckInRecord(parsed);
      if (parsed.lastCheckInDate === formatDateKey(new Date())) {
        setHasCheckedInToday(true);
      }
    } catch (error) {
      console.error('加载打卡记录失败:', error);
    }
  }, []);

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

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed) {
      toast.warning('请输入您的需求');
      return;
    }
    if (homeHasUploading) {
      toast.info('请等待文件上传完成');
      return;
    }
    if (homeAttachments.some(item => item.status === 'error')) {
      toast.error('请先移除上传失败的附件');
      return;
    }

    const completedAttachments = homeAttachments
      .filter(item => item.status === 'done' && item.fileId)
      .map(item => {
        const remoteUrl = item.downloadUrl || item.previewUrl;
        const previewUrl =
          item.previewUrl && !item.previewUrl.startsWith('blob:') ? item.previewUrl : remoteUrl;
        return {
          fileId: item.fileId as string,
          name: item.name,
          mimeType: item.mimeType,
          size: item.size,
          previewUrl: previewUrl || undefined,
          downloadUrl: remoteUrl || undefined,
          publicPath: item.publicPath,
        };
      });

    const hasInvalidMetadata = homeAttachments.some(item => item.status === 'done' && !item.fileId);
    if (hasInvalidMetadata) {
      toast.error('附件信息不完整，请重新上传文件');
      return;
    }

    onSendMessage?.(trimmed, completedAttachments);
    setInputText('');
    clearHomeAttachments();
  };

  const handleHomeKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleOptimize = async () => {
    if (!inputText.trim()) {
      toast.warning('请输入需要优化的内容');
      return;
    }

    try {
      const loadingToast = toast.loading('正在优化内容...');
      const response = await aiService.optimizeContent(inputText);
      toast.dismiss(loadingToast);

      if (response.success && response.optimizedContent) {
        setInputText(response.optimizedContent);
        if (response.suggestions && response.suggestions.length > 0) {
          const suggestionsText = response.suggestions.map(item => `- ${item}`).join('\n');
          toast.success(`内容优化成功\n${suggestionsText}`);
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

  const handleFileUpload = () => {
    openHomeFileDialog();
  };

  const handleFormatSettings = () => {
    toast.info('格式设置功能即将上线');
  };

  const handleOpenKidsCoding = () => {
    if (!KIDS_CODING_URL) {
      toast.info('少儿编程课堂链接即将上线');
      return;
    }
    window.open(KIDS_CODING_URL, '_blank', 'noopener,noreferrer');
  };

  const today = new Date();
  const monthLabel = today.toLocaleString('zh-CN', { month: 'long' });
  const dayNumber = today.getDate().toString().padStart(2, '0');
  const weekdayLabel = today.toLocaleString('zh-CN', { weekday: 'long' });
  const upcomingCountdowns = UPCOMING_EVENTS.map(event => ({
    ...event,
    daysRemaining: calculateDaysRemaining(event.date, today),
  }));
  const fortuneSeed = generateFortuneSeed(today);
  const fortuneLevel = FORTUNE_LEVELS[fortuneSeed % FORTUNE_LEVELS.length];
  const fortuneGood = pickFortuneItems(FORTUNE_GOOD_ACTIVITIES, fortuneSeed, 2);
  const fortuneBad = pickFortuneItems(FORTUNE_BAD_ACTIVITIES, fortuneSeed + 7, 2);

  const handleCheckIn = () => {
    if (hasCheckedInToday) {
      toast.info('今天已经打过卡啦，继续保持好状态！');
      return;
    }
    const todayKey = formatDateKey(today);
    const yesterdayKey = formatDateKey(new Date(today.getTime() - 24 * 60 * 60 * 1000));
    const nextStreak =
      checkInRecord.lastCheckInDate === yesterdayKey ? checkInRecord.streak + 1 : 1;
    const nextRecord: CheckInRecord = {
      lastCheckInDate: todayKey,
      streak: nextStreak,
    };
    setCheckInRecord(nextRecord);
    setHasCheckedInToday(true);

    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(CHECK_IN_STORAGE_KEY, JSON.stringify(nextRecord));
      } catch (error) {
        console.error('保存打卡记录失败:', error);
      }
    }
    toast.success('打卡成功！继续努力练习少儿编程！');
  };

  const disableHomeSend =
    !inputText.trim() || homeHasUploading || homeAttachments.some(item => item.status === 'error');

  const adPanel = (
    <div className="order-2 flex w-full flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white/70 p-6 text-center text-sm text-gray-500 shadow-inner lg:order-1 lg:w-[300px] lg:min-h-[250px] lg:flex-none">
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-3">
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
          AD · 300×250
        </span>
        <span className="text-base font-medium text-gray-600">预留广告位</span>
        <span className="text-xs text-gray-400">
          适配常见 Medium Rectangle 素材尺寸
        </span>
      </div>
    </div>
  );

  const checkInCard = (
    <div className="order-1 flex flex-1 flex-col gap-4 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 p-6 text-white shadow-md lg:order-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/80">欢迎回来！</p>
          <p className="text-2xl font-semibold">{DEFAULT_STUDENT_NAME}</p>
        </div>
        <div className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium uppercase tracking-widest">
          每日打卡
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-6">
        <div className="flex flex-col items-center text-white/90">
          <span className="text-base">{monthLabel}</span>
          <span className="text-lg">{weekdayLabel}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-6xl font-black leading-none">{dayNumber}</span>
          <span className="text-lg font-medium text-white/90">日</span>
        </div>
      </div>
      <ul className="space-y-1 text-sm text-white/90">
        {upcomingCountdowns.map(event => (
          <li key={event.label} className="flex items-center gap-2">
            <i className="fas fa-flag text-white/70"></i>
            <span>
              距 {event.label} 还剩{' '}
              <span className="font-semibold text-white">{event.daysRemaining}</span> 天
            </span>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={handleCheckIn}
        disabled={hasCheckedInToday}
        className={`mt-2 inline-flex items-center justify-center rounded-xl px-5 py-3 text-base font-semibold transition-all ${
          hasCheckedInToday
            ? 'cursor-not-allowed bg-white/20 text-white/70'
            : 'bg-white text-indigo-600 shadow-lg hover:-translate-y-0.5 hover:shadow-xl'
        }`}
      >
        {hasCheckedInToday ? '今日已打卡' : '点击打卡'}
      </button>
      <p className="text-xs text-white/80">
        {hasCheckedInToday
          ? `你已经连续打卡 ${checkInRecord.streak} 天，坚持就是成功的秘诀！`
          : `连续打卡可以累计学习成就，当前连续 ${checkInRecord.streak} 天`}
      </p>
    </div>
  );

  const fortuneCard = (
    <div className="order-1 flex flex-1 flex-col items-center gap-8 rounded-3xl bg-white/95 px-6 py-8 text-center shadow-md sm:px-10 sm:py-10 lg:order-2 lg:px-14">
      <div className="flex flex-col items-center gap-2">
        <span className="text-sm font-medium uppercase tracking-widest text-blue-500">今日运势</span>
        <h3 className="m-0 text-2xl font-semibold text-gray-800">
          {DEFAULT_STUDENT_NAME} 的运势
        </h3>
      </div>
      <div className="flex items-center gap-6 text-5xl font-black tracking-[0.15em] text-rose-500 sm:text-6xl">
        <span className="text-4xl sm:text-5xl">§</span>
        <span>{fortuneLevel}</span>
        <span className="text-4xl sm:text-5xl">§</span>
      </div>
      <div className="grid w-full gap-6 text-left md:grid-cols-2">
        <div className="rounded-2xl border border-rose-100 bg-rose-50/80 p-6 shadow-sm">
          <div className="flex items-center gap-2 text-xl font-semibold text-rose-500">
            <i className="fas fa-circle-check"></i>
            宜
          </div>
          <ul className="mt-4 space-y-4 text-base leading-tight text-gray-700">
            {fortuneGood.map(item => (
              <li key={item.title} className="flex flex-col gap-1">
                <span className="font-semibold text-rose-500">{item.title}</span>
                <span className="text-sm text-gray-500">{item.description}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-xl font-semibold text-gray-800">
            <i className="fas fa-ban text-rose-400"></i>
            忌
          </div>
          <ul className="mt-4 space-y-4 text-base leading-tight text-gray-700">
            {fortuneBad.map(item => (
              <li key={item.title} className="flex flex-col gap-1">
                <span className="font-semibold text-gray-800">{item.title}</span>
                <span className="text-sm text-gray-500">{item.description}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex w-full flex-col items-center gap-3 text-sm text-gray-600">
        <div className="w-full rounded-xl bg-blue-50 px-5 py-3 text-blue-600">
          <i className="fas fa-lightbulb mr-2"></i>
          今日贴士：保持好奇心，多动手实践，你就是下一位少儿编程高手！
        </div>
        <p className="text-base text-gray-700">
          你已经连续打卡{' '}
          <span className="font-semibold text-gray-900">{checkInRecord.streak}</span> 天，继续保持！
        </p>
      </div>
    </div>
  );

  return (
    <main className="flex min-h-full h-full flex-1 min-w-0 flex-col border-l border-gray-100 bg-white overflow-y-auto home-main-scroll">
      <header className="flex items-center justify-between px-6 pt-8 pb-6 sm:px-8 sm:pt-9 sm:pb-6 lg:px-12 lg:pt-10 lg:pb-7 2xl:px-16 2xl:pt-11">
        <h1 className="text-2xl font-bold text-gray-800">
          <span className="text-blue-500">智能助手</span>，一键生成
        </h1>
        <div className="hidden md:block">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm text-blue-600 shadow-sm">
            <i className="fas fa-lightbulb"></i>
            <span>今日灵感：{inspiration}</span>
          </div>
        </div>
      </header>

      <div className="mb-6 flex flex-wrap justify-center gap-3 px-4 sm:px-6 lg:px-12 2xl:px-16">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm text-blue-600 shadow-sm">
          <i className="fas fa-robot"></i>
          <span>基础 AI 问答功能随时支持你的学习</span>
        </div>
        <button
          type="button"
          className="inline-flex items-center rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-300 hover:bg-blue-600"
          onClick={handleOpenKidsCoding}
        >
          <i className="fas fa-code mr-2"></i>
          进入少儿编程课堂
        </button>
      </div>

      <div className="flex flex-col gap-6 px-4 pb-10 sm:px-6 lg:px-12 2xl:px-16">
        <section
          className="mx-auto w-full rounded-xl border border-gray-100 bg-white px-5 py-5 shadow-sm sm:px-6 lg:px-8 2xl:px-10"
          style={{ maxWidth: 'clamp(760px, 68vw, 1280px)' }}
        >
          <div className="mb-4 flex items-start gap-2.5">
            <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-500">
              {HOME_BADGE_LABEL}
            </span>
            <textarea
              ref={homeTextareaRef}
              value={inputText}
              onChange={event => setInputText(event.target.value)}
              onInput={adjustHomeTextareaHeight}
              onKeyDown={handleHomeKeyDown}
              className="flex-1 resize-none border-none bg-transparent text-sm text-gray-800 outline-none"
              placeholder="请告诉我您的需求，我会为您提供专业的 AI 帮助..."
              rows={1}
              style={{ minHeight: 56, maxHeight: 220 }}
            />
          </div>

          {homeAttachments.length > 0 ? (
            <div className="mb-4 ml-12 flex flex-wrap gap-3">
              {homeAttachments.map(item => (
                <AttachmentBadge key={item.id} attachment={item} onRemove={removeHomeAttachment} />
              ))}
            </div>
          ) : null}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2.5">
              <button
                type="button"
                className="rounded p-1.5 transition-colors hover:bg-gray-100"
                onClick={handleFileUpload}
                aria-label="上传附件"
              >
                <i className="fas fa-paperclip text-gray-500"></i>
              </button>
              <button
                type="button"
                className="rounded p-1.5 transition-colors hover:bg-gray-100"
                onClick={handleFormatSettings}
                aria-label="格式设置"
              >
                <i className="fas fa-font text-gray-500"></i>
              </button>
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-50"
                onClick={handleOptimize}
              >
                一键优化
              </button>
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-lg border-none bg-gradient-to-r from-blue-400 to-indigo-400 text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleSend}
                disabled={disableHomeSend}
                aria-label="发送"
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>

          <input
            ref={homeFileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleHomeFileInputChange}
          />
        </section>

        <section
          className="mx-auto w-full max-w-4xl rounded-3xl border border-gray-100/70 bg-white/90 px-5 py-6 shadow-sm ring-1 ring-blue-100/50 backdrop-blur sm:px-6 lg:px-8 2xl:px-10"
          style={{ maxWidth: 'clamp(820px, 70vw, 1320px)' }}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
            {adPanel}
            {hasCheckedInToday ? fortuneCard : checkInCard}
          </div>
        </section>
      </div>
    </main>
  );
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calculateDaysRemaining(targetDate: string, baseDate: Date) {
  const target = new Date(targetDate);
  const startOfToday = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate()).getTime();
  const startOfTarget = new Date(target.getFullYear(), target.getMonth(), target.getDate()).getTime();
  const diff = Math.max(0, startOfTarget - startOfToday);
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

function generateFortuneSeed(date: Date) {
  const numeric = Number(formatDateKey(date).replace(/-/g, ''));
  const randomish = Math.sin(numeric) * 10000;
  return Math.abs(Math.floor(randomish));
}

function pickFortuneItems<T>(source: readonly T[], seed: number, count: number) {
  if (source.length <= count) {
    return [...source];
  }
  const selected: T[] = [];
  let currentSeed = seed;
  const used = new Set<number>();
  while (selected.length < count) {
    const index = currentSeed % source.length;
    if (!used.has(index)) {
      selected.push(source[index]);
      used.add(index);
    }
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
  }
  return selected;
}
