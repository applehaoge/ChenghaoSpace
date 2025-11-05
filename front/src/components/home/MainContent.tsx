import { useState, useEffect, useRef, useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import { toast } from 'sonner';
import { aiService } from '@/api/aiService';
import { AttachmentBadge, useFileUploader } from '@/components/attachments';
import type { UploadedAttachment } from '@/pages/home/types';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import { DailyProgressPanel } from './DailyProgressPanel';
import { FORTUNE_BAD_ACTIVITIES, FORTUNE_GOOD_ACTIVITIES, FORTUNE_LEVELS } from './fortuneConfig';
import { VoiceInputButton } from './VoiceInputButton';

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
  { label: 'CSP-J/S 2026 第一场', date: '2026-09-20' },
  { label: 'NOIP 2025', date: '2025-11-28' },
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

  const { status: speechStatus, start: startSpeech, stop: stopSpeech, isSupported: isSpeechSupported } =
    useSpeechToText({
      onResult: transcript => {
        setInputText(prev => {
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

  return (
    <main className="flex min-h-full h-full flex-1 min-w-0 flex-col border-l border-gray-100 bg-white overflow-y-auto home-main-scroll">
      <header className="flex items-center justify-between px-6 pt-4 pb-5 sm:px-8 sm:pt-5 sm:pb-5 lg:px-12 lg:pt-6 lg:pb-6 2xl:px-16 2xl:pt-7">
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
          进入编程学习课堂
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
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="group flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-100 bg-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-200 hover:border-rose-200 hover:shadow-md active:translate-y-px"
                onClick={handleFileUpload}
                aria-label="上传附件"
              >
                <i className="fas fa-paperclip text-lg bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-600 bg-clip-text text-transparent transition-all group-hover:from-orange-400 group-hover:via-pink-500 group-hover:to-rose-500"></i>
              </button>
              <button
                type="button"
                className="group flex h-10 w-10 items-center justify-center rounded-2xl border border-blue-100 bg-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-200 hover:border-rose-200 hover:shadow-md active:translate-y-px"
                onClick={handleFormatSettings}
                aria-label="格式设置"
              >
                <i className="fas fa-font text-lg bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-600 bg-clip-text text-transparent transition-all group-hover:from-orange-400 group-hover:via-pink-500 group-hover:to-rose-500"></i>
              </button>
              <VoiceInputButton
                status={speechStatus}
                onStart={startSpeech}
                onStop={stopSpeech}
                disabled={homeHasUploading && speechStatus !== 'recording'}
              />
              {speechStatus === 'recording' ? (
                <span className="flex items-center gap-1 text-xs font-medium text-red-500">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></span>
                  正在录音...
                </span>
              ) : null}
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
                className="flex h-11 w-11 items-center justify-center rounded-xl border-none bg-gradient-to-r from-blue-500 via-indigo-500 to-indigo-600 text-white transition-all focus:outline-none focus:ring-2 focus:ring-blue-200 hover:from-orange-400 hover:via-pink-500 hover:to-rose-500 hover:shadow-lg hover:brightness-110 hover:scale-105 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
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

        <DailyProgressPanel
          defaultStudentName={DEFAULT_STUDENT_NAME}
          hasCheckedInToday={hasCheckedInToday}
          onCheckIn={handleCheckIn}
          checkInStreak={checkInRecord.streak}
          monthLabel={monthLabel}
          weekdayLabel={weekdayLabel}
          dayNumber={dayNumber}
          upcomingCountdowns={upcomingCountdowns}
          fortuneLevel={fortuneLevel}
          fortuneGood={fortuneGood}
          fortuneBad={fortuneBad}
        />
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
