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

    onSendMessage?.(trimmed);
    setInputText('');
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
    toast.info(`已切换到${category}分类`);
  };

  const disableHomeSend =
    !inputText.trim() ||
    homeHasUploading ||
    homeAttachments.some(item => item.status === 'error');

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
        {tabs.map(tab => (
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
            onChange={event => setInputText(event.target.value)}
            onInput={adjustHomeTextareaHeight}
            onKeyDown={handleHomeKeyDown}
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 resize-none"
            placeholder="请告诉我您的需求，我会为您提供专业的AI帮助..."
            rows={1}
            style={{ minHeight: 56, maxHeight: 220 }}
          />
        </div>
        {homeAttachments.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4 ml-12">
            {homeAttachments.map(item => (
              <AttachmentBadge key={item.id} attachment={item} onRemove={removeHomeAttachment} />
            ))}
          </div>
        )}
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
              className="w-11 h-11 rounded-lg border-none bg-gradient-to-r from-blue-400 to-indigo-400 text-white transition-all flex items-center justify-center hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleSend}
              disabled={disableHomeSend}
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
      </div>

      <div className="max-w-[800px] mx-auto px-5 pb-10">
        <div className="flex justify-between items-center mb-5 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg">
          <h3 className="text-lg font-bold text-gray-800 m-0">最佳实践</h3>
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
