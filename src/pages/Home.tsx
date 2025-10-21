import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { aiService } from '@/api/aiService';

type ResultState = {
  content: string;
  provider?: string;
  sources?: Array<{ id: string; text: string; score?: number }>;
};

type ProjectInfo = {
  id: string;
  title: string;
  imageUrl: string;
  bgColor: string;
};

const TABS = ['写作', 'PPT', '设计', 'Excel', '网页', '播客'] as const;

const PROJECTS: ProjectInfo[] = [
  {
    id: 'project_ai_writing',
    title: 'AI 智能写作助手',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=AI%20assistant%20concept%20illustration%2C%20modern%20flat%20design%2C%20blue%20color%20scheme&sign=28ebbd06cb141c1a009017f1f8d41227',
    bgColor: '#eff6ff'
  },
  {
    id: 'project_data_analysis',
    title: '智能数据分析工具',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=Data%20visualization%20dashboard%2C%20modern%20design%2C%20blue%20and%20indigo%20colors&sign=ed4909d7a10fe86967a5aa6a0afaa434',
    bgColor: '#e0e7ff'
  },
  {
    id: 'project_learning_platform',
    title: '个性化学习平台',
    imageUrl: 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=AI%20learning%20platform%20concept%2C%20interactive%20interface%2C%20blue%20colors&sign=0eba131c9b66799399b3e86f510476a7',
    bgColor: '#dbeafe'
  }
];

const MENU_GROUPS = [
  {
    title: '快捷入口',
    items: [
      { icon: 'fas fa-robot', label: 'AI 专家' },
      { icon: 'fas fa-plane', label: 'DeepTrip 旅行专家' },
      { icon: 'fas fa-chart-line', label: '华泰 A 股观察助手' },
      { icon: 'fas fa-newspaper', label: '舆情分析专家' }
    ]
  },
  {
    title: '任务',
    items: [
      { icon: 'fas fa-code', label: '少儿编程科技营' },
      { icon: 'fas fa-chart-bar', label: 'QuantumLeap 业绩洞察' },
      { icon: 'fab fa-python', label: 'AI Python 小精灵' },
      { icon: 'fas fa-file-alt', label: '根据文稿编写网页' },
      { icon: 'fas fa-project-diagram', label: '分析文件并共创策划书' }
    ]
  }
];

function ProjectCard({ title, imageUrl, bgColor, projectId }: ProjectInfo & { projectId: string }) {
  const handleClick = async () => {
    const loading = toast.loading(`正在加载 ${title} 项目详情...`);
    try {
      const response = await aiService.getProjectDetails(projectId);
      toast.dismiss(loading);
      if (response.success && response.project) {
        toast.success(`成功加载「${title}」项目`);
        console.log('项目详情', response.project);
      } else {
        toast.error(response.error || '加载项目详情失败');
      }
    } catch (error) {
      toast.dismiss(loading);
      console.error('项目卡片点击错误:', error);
      toast.error('加载项目详情时发生错误');
    }
  };

  return (
    <div
      className="h-[180px] rounded-lg overflow-hidden relative border border-gray-200 shadow-sm bg-gray-100 group cursor-pointer transition-all duration-300 hover:shadow-md"
      onClick={handleClick}
    >
      <div className="h-full flex items-center justify-center" style={{ backgroundColor: bgColor }}>
        <img
          src={imageUrl}
          alt={title}
          className="max-w-[90%] max-h-[90%] object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <h4 className="absolute bottom-4 left-4 right-4 m-0 p-2 bg-black/60 text-white text-sm rounded">
        {title}
      </h4>
    </div>
  );
}

function ResultPanel({ result }: { result: ResultState | null }) {
  if (!result) return null;

  return (
    <div className="max-w-[800px] mx-auto px-5 pb-6">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800 m-0">生成结果</h3>
          {result.provider && (
            <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded">
              来自 {result.provider}
            </span>
          )}
        </div>
        <div className="whitespace-pre-line text-gray-700 leading-relaxed">
          {result.content}
        </div>
        {result.sources && result.sources.length > 0 && (
          <div className="border-t border-gray-100 pt-3">
            <h4 className="text-sm font-medium text-gray-600 mb-2">相关检索</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-500">
              {result.sources.map((item) => (
                <li key={item.id}>{item.text}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function MainContent({
  activeTab,
  setActiveTab,
  inputText,
  setInputText
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  inputText: string;
  setInputText: (value: string) => void;
}) {
  const [inspiration, setInspiration] = useState('创新思维，高效创意');
  const [result, setResult] = useState<ResultState | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSend = async () => {
    if (!inputText.trim()) {
      toast.warning('请输入您的需求');
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading(`正在生成 ${activeTab} 内容，请稍候...`);

    try {
      const response = await aiService.sendAIRequest(activeTab, inputText);
      if (response && (response.answer || response.result)) {
        const resultText = response.answer || response.result || '';
        setResult({
          content: resultText,
          provider: response.provider,
          sources: response.sources || []
        });
        toast.success('内容生成成功');
      } else {
        setResult(null);
        toast.error(response.error || '内容生成失败');
      }
    } catch (error) {
      console.error('发送请求失败:', error);
      setResult(null);
      toast.error('内容生成时发生错误');
    } finally {
      setIsLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  const handleOptimize = async () => {
    if (!inputText.trim()) {
      toast.warning('请输入需要优化的内容');
      return;
    }

    const loadingToast = toast.loading('正在优化内容...');
    try {
      const response = await aiService.optimizeContent(inputText);
      toast.dismiss(loadingToast);
      if (response.success && response.optimizedContent) {
        setInputText(response.optimizedContent);
        setResult({
          content: response.optimizedContent,
          provider: 'doubao',
          sources: []
        });
        if (response.suggestions && response.suggestions.length > 0) {
          toast.success(`内容优化成功：${response.suggestions.join('、')}`);
        } else {
          toast.success('内容优化成功');
        }
      } else {
        toast.error(response.error || '内容优化失败');
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error('优化内容失败:', error);
      toast.error('内容优化时发生错误');
    }
  };

  const bestPracticeTabs = useMemo(() => ['网页宣发', '教育工具', '趣味游戏'], []);

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50">
      <div className="max-w-[800px] mx-auto px-5 py-6">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-1">橙浩空间 · AI 智能助手</h1>
              <p className="text-sm text-gray-500">今日灵感：{inspiration}</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded-lg bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-100">
                历史记录
              </button>
              <button className="px-3 py-1 rounded-lg bg-blue-500 text-white text-sm hover:bg-blue-600 shadow-sm">
                创建新任务
              </button>
            </div>
          </div>
        </header>

        <div className="flex gap-2 mb-4">
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                tab === activeTab ? 'bg-blue-500 text-white shadow-sm' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-6 space-y-4">
          <textarea
            className="w-full h-40 resize-none border border-gray-200 rounded-xl p-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            placeholder="请输入您的需求…"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <button
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => toast.info('当前版本暂不支持文件上传')}
              >
                <i className="fas fa-paperclip" />
              </button>
              <button
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                onClick={() => toast.info('格式化设置即将上线')}
              >
                <i className="fas fa-font" />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-xs text-gray-600 hover:bg-gray-100 transition-colors"
                onClick={handleOptimize}
              >
                一键优化
              </button>
              <button
                className="w-11 h-11 rounded-lg border-none bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-lg transition-all flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleSend}
                disabled={isLoading}
              >
                {isLoading ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-paper-plane" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ResultPanel result={result} />

      <div className="max-w-[800px] mx-auto px-5 pb-10">
        <div className="flex justify-between items-center mb-5 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg">
          <h3 className="text-lg font-bold text-gray-800 m-0">最佳实践项目</h3>
          <div className="flex gap-2">
            {bestPracticeTabs.map((tab) => (
              <button
                key={tab}
                className="px-3 py-1 bg-transparent border-none text-gray-700 text-sm hover:text-blue-600 transition-colors"
                onClick={() => toast.info(`已切换到 ${tab}`)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {PROJECTS.map((project) => (
            <ProjectCard key={project.id} {...project} projectId={project.id} />
          ))}
        </div>
      </div>
    </main>
  );
}

function Sidebar() {
  const handleCreateNewTask = async () => {
    const loading = toast.loading('正在创建新任务...');
    try {
      const response = await aiService.createNewTask('general', '');
      toast.dismiss(loading);
      if (response.success && response.taskId) {
        toast.success(response.message || '新任务创建成功');
        console.log('新任务 ID:', response.taskId);
      } else {
        toast.error(response.message || '创建新任务失败');
      }
    } catch (error) {
      toast.dismiss(loading);
      console.error('创建新任务失败:', error);
      toast.error('创建新任务时发生错误');
    }
  };

  return (
    <aside className="w-[250px] h-full bg-white border-r border-gray-100 shadow-sm">
      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-2xl rounded-b-2xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-blue-500 font-bold text-lg">
            智
          </div>
          <span className="text-xl font-bold">橙浩空间</span>
          <span className="text-xs bg-white/30 px-1.5 py-0.5 rounded">BETA</span>
        </div>
        <div className="relative">
          <button
            className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-blue-500"
            onClick={() => toast.info('您有新的通知')}
          >
            <i className="fas fa-paper-plane" />
          </button>
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
        </div>
      </div>

      <button
        className="w-[calc(100%-32px)] h-11 mx-4 my-5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl border-none text-sm font-medium flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-shadow"
        onClick={handleCreateNewTask}
      >
        <i className="fas fa-plus-circle" />
        <span>创建新任务</span>
        <span className="text-xs bg-white/30 px-1.5 py-0.5 rounded">Ctrl</span>
      </button>

      {MENU_GROUPS.map((group) => (
        <div key={group.title} className="px-4 mb-5">
          <div className="text-xs text-gray-500 mb-2">{group.title}</div>
          <ul className="space-y-2">
            {group.items.map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-2.5 p-3 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition-colors"
                onClick={() => toast.info(`已切换到 ${item.label}`)}
              >
                <i className={`${item.icon} text-blue-500`} />
                <span className="text-sm text-gray-800">{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  );
}

function FloatingHelpButton() {
  return (
    <button
      className="fixed bottom-7 right-7 w-[54px] h-[54px] rounded-full border-2 border-white bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-10"
      onClick={() => toast.info('客服团队将很快与您联系')}
    >
      <i className="fas fa-headset text-lg" />
    </button>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<string>('写作');
  const [inputText, setInputText] = useState('请告诉我您的需求，我会为您提供专业的 AI 帮助...');

  return (
    <div className="flex flex-row h-screen bg-gray-50 font-sans overflow-hidden">
      <Sidebar />
      <MainContent
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        inputText={inputText}
        setInputText={setInputText}
      />
      <FloatingHelpButton />
    </div>
  );
}
