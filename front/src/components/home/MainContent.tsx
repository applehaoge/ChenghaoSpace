import { useState, useEffect, useRef, useCallback } from 'react';
import type { KeyboardEvent } from 'react';
import { toast } from 'sonner';
import { aiService } from '@/api/aiService';
import { AttachmentBadge, useFileUploader } from '@/components/attachments';
import type { UploadedAttachment } from '@/pages/home/types';
import { ProjectCard } from './ProjectCard';

export type MainContentProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  inputText: string;
  setInputText: (value: string) => void;
  onSendMessage?: (message: string, attachments?: UploadedAttachment[]) => void;
};

const tabs = ['写作', 'PPT', '设计', 'Excel', '网页', '播客'] as const;
const primaryMaxWidth =
  'clamp(760px, calc(100vw - var(--sidebar-width) - 2 * var(--layout-gap)), 1320px)';
const secondaryMaxWidth =
  'clamp(780px, calc(100vw - var(--sidebar-width) - 2 * var(--layout-gap)), 1340px)';

export function MainContent({
  activeTab,
  setActiveTab,
  inputText,
  setInputText,
  onSendMessage,
}: MainContentProps) {
  const [inspiration, setInspiration] = useState('创新思维，高效创作');
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

  const handlePracticeCategory = (category: string) => {
    toast.info(`已切换到 ${category} 分类`);
  };

  const disableHomeSend =
    !inputText.trim() || homeHasUploading || homeAttachments.some(item => item.status === 'error');

  return (
    <main className="flex min-h-full flex-1 min-w-0 flex-col border-l border-gray-100 bg-white">
      <header
        className="flex items-center justify-between pt-8 pb-6"
        style={{ paddingInline: 'var(--layout-gap)' }}
      >
        <h1 className="text-2xl font-bold text-gray-800">
          <span className="text-blue-500">智能助手</span>，一键生成
        </h1>
        <div className="hidden md:block">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-700">
            <i className="fas fa-lightbulb"></i>
            <span>今日灵感：{inspiration}</span>
          </div>
        </div>
      </header>

      <div
        className="mb-8 flex flex-wrap justify-center gap-3"
        style={{ paddingInline: 'var(--layout-gap)' }}
      >
        {tabs.map(tab => (
          <button
            key={tab}
            type="button"
            className={`rounded-full border px-4 py-2 text-sm transition-all duration-300 ${
              activeTab === tab
                ? 'border-blue-400 bg-gradient-to-r from-blue-400 to-indigo-400 text-white shadow-sm'
                : 'border-gray-200 bg-white text-gray-600 hover:bg-blue-50'
            }`}
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

      <div
        className="flex flex-col gap-8 pb-10"
        style={{ paddingInline: 'var(--layout-gap)' }}
      >
        <section
          className="mx-auto w-full rounded-xl border border-gray-100 bg-white px-5 py-6 shadow-sm sm:px-6 lg:px-8 2xl:px-10"
          style={{ maxWidth: primaryMaxWidth }}
        >
          <div className="mb-4 flex items-start gap-2.5">
            <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-500">
              {activeTab}
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
          className="mx-auto w-full rounded-3xl border border-gray-100/70 bg-white/80 px-5 py-6 shadow-sm ring-1 ring-gray-100/60 backdrop-blur sm:px-6 lg:px-8 2xl:px-10"
          style={{ maxWidth: secondaryMaxWidth }}
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 lg:px-6">
            <h3 className="m-0 text-lg font-bold text-gray-800">最佳实践</h3>
            <div className="flex flex-wrap gap-1 text-sm">
              <button
                type="button"
                className="px-3 py-1 text-gray-700 transition-colors hover:text-blue-600"
                onClick={() => handlePracticeCategory('网页宣发')}
              >
                网页宣发
              </button>
              <button
                type="button"
                className="px-3 py-1 text-gray-700 transition-colors hover:text-blue-600"
                onClick={() => handlePracticeCategory('教育工具')}
              >
                教育工具
              </button>
              <button
                type="button"
                className="px-3 py-1 text-gray-700 transition-colors hover:text-blue-600"
                onClick={() => handlePracticeCategory('趣味游戏')}
              >
                趣味游戏
              </button>
              <button
                type="button"
                className="px-3 py-1 text-gray-700 transition-colors hover:text-blue-600"
                onClick={() => handlePracticeCategory('营销推广')}
              >
                营销推广
              </button>
            </div>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 justify-items-center 2xl:gap-6">
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
        </section>
      </div>
    </main>
  );
}
