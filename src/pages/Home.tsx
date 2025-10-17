import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { aiService } from '@/api/aiService';

// 项目卡片组件
function ProjectCard({ title, imageUrl, bgColor, projectId }) {
  const handleClick = async () => {
    try {
      // 显示加载状态
      const loadingToast = toast.loading(`正在加载${title}项目详情...`);
      
      // 调用API获取项目详情
      const response = await aiService.getProjectDetails(projectId);
      
      // 关闭加载状态
      toast.dismiss(loadingToast);
      
      if (response.success && response.project) {
        toast.success(`成功加载${title}项目详情`);
        // 这里可以添加跳转到项目详情页的逻辑
        console.log('项目详情:', response.project);
      } else {
        toast.error(response.error || '加载项目详情失败');
      }
    } catch (error) {
      console.error('项目卡片点击错误:', error);
      toast.error('加载项目详情时发生错误');
    }
  };

  return (
    <div 
      className="h-[180px] rounded-lg overflow-hidden relative border border-gray-200 shadow-sm bg-gray-100 group cursor-pointer transition-all duration-300 hover:shadow-md"
      onClick={handleClick}
    >
      <div 
        className="h-full flex items-center justify-center" 
        style={{ backgroundColor: bgColor }}
      >
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

// 主内容区组件
function MainContent({ activeTab, setActiveTab, inputText, setInputText }) {
  const tabs = ['写作', 'PPT', '设计', 'Excel', '网页', '播客'];
  const [inspiration, setInspiration] = useState('创新思维，高效创作');
  
  // 获取今日灵感
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
  
  // 处理发送按钮点击
  const handleSend = async () => {
    if (!inputText.trim()) {
      toast.warning('请输入您的需求');
      return;
    }
    
    try {
      // 显示加载状态
      const loadingToast = toast.loading(`正在生成${activeTab}内容，请稍候...`);
      
      // 调用AI服务API
      const response = await aiService.sendAIRequest(activeTab, inputText);
      
      // 关闭加载状态
      toast.dismiss(loadingToast);
      
      if (response.success && response.result) {
        // 显示成功消息
        toast.success(`内容生成成功，耗时${response.processingTime}ms`);
        
        // 这里可以根据需要处理生成的结果，比如显示在页面上
        console.log('AI生成结果:', response.result);
        console.log('使用Token数:', response.tokensUsed);
        
        // 例如，可以更新输入框为生成的结果，或者在新区域显示结果
        // setInputText(response.result);
      } else {
        toast.error(response.error || '内容生成失败');
      }
    } catch (error) {
      console.error('发送请求失败:', error);
      toast.error('内容生成时发生错误');
    }
  };
  
  // 处理一键优化按钮点击
  const handleOptimize = async () => {
    if (!inputText.trim()) {
      toast.warning('请输入需要优化的内容');
      return;
    }
    
    try {
      // 显示加载状态
      const loadingToast = toast.loading('正在优化内容...');
      
      // 调用优化API
      const response = await aiService.optimizeContent(inputText);
      
      // 关闭加载状态
      toast.dismiss(loadingToast);
      
      if (response.success && response.optimizedContent) {
        // 更新输入框内容为优化后的内容
        setInputText(response.optimizedContent);
        
        // 显示优化建议
        if (response.suggestions && response.suggestions.length > 0) {
          const suggestionsText = response.suggestions.join('\n- ');
          toast.success(`内容优化成功\n- ${suggestionsText}`);
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
  
  // 处理文件上传按钮点击
  const handleFileUpload = () => {
    toast.info('文件上传功能即将上线');
  };
  
  // 处理格式设置按钮点击
  const handleFormatSettings = () => {
    toast.info('格式设置功能即将上线');
  };
  
  // 处理实践分类按钮点击
  const handlePracticeCategory = (category) => {
    toast.info(`已切换到${category}分类`);
  };

  return (
      <main className="flex-1 w-[calc(100%-260px)] bg-white border-l border-gray-100">
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
        {tabs.map((tab) => (
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
        <div className="flex items-center mb-4 gap-2.5">
          <span className="px-2 py-1 bg-blue-50 text-blue-500 rounded-full text-xs font-medium">
            {activeTab}
          </span>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800"
            placeholder="请输入您的需求..."
          />
        </div>
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
              className="w-11 h-11 rounded-lg border-none bg-gradient-to-r from-blue-400 to-indigo-400 text-white cursor-pointer hover:shadow-lg transition-all flex items-center justify-center"
              onClick={handleSend}
            >
               <i className="fas fa-paper-plane"></i>
             </button>
          </div>
        </div>
      </div>

       <div className="max-w-[800px] mx-auto px-5 pb-10">
        <div className="flex justify-between items-center mb-5 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg">
          <h3 className="text-lg font-bold text-gray-800 m-0">
            最佳实践
          </h3>
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

// 左侧导航栏组件
function Sidebar() {
  // 处理创建新任务按钮点击
  const handleCreateNewTask = async () => {
    try {
      // 显示加载状态
      const loadingToast = toast.loading('正在创建新任务...');
      
      // 调用创建任务API
      const response = await aiService.createNewTask('general', '');
      
      // 关闭加载状态
      toast.dismiss(loadingToast);
      
      if (response.success && response.taskId) {
        toast.success(response.message || '新任务创建成功');
        console.log('新任务ID:', response.taskId);
        // 这里可以添加跳转到新任务页面的逻辑
      } else {
        toast.error(response.message || '创建新任务失败');
      }
    } catch (error) {
      console.error('创建新任务失败:', error);
      toast.error('创建新任务时发生错误');
    }
  };
  
  // 处理侧边栏菜单项点击
  const handleMenuItemClick = (itemName) => {
    toast.info(`已切换到${itemName}`);
    console.log(`切换到${itemName}`);
  };
  
  // 处理通知按钮点击
  const handleNotificationClick = () => {
    toast.info('您有新的通知');
  };

  return (
    <aside className="w-[250px] h-full bg-white border-r border-gray-100 shadow-sm">
      <div className="flex justify-between items-center p-[15px_20px] bg-gradient-to-r from-blue-400 to-indigo-400 text-white rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-blue-500 font-bold text-lg">
            橙
          </div>
          <span className="text-xl font-bold">橙浩空间</span>
          <span className="text-xs bg-white/30 px-1.5 py-0.5 rounded">BETA</span>
        </div>
        <div className="relative">
          <div 
            className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-blue-500 cursor-pointer"
            onClick={handleNotificationClick}
          >
            <i className="fas fa-paper-plane"></i>
          </div>
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>
      </div>

      <button 
        className="w-[calc(100%-40px)] h-11 mx-[20px] my-5 bg-gradient-to-r from-blue-400 to-indigo-400 text-white rounded-xl border-none text-sm font-medium flex items-center justify-center gap-1 shadow-sm hover:shadow-md transition-shadow"
        onClick={handleCreateNewTask}
      >
        <i className="fas fa-plus-circle"></i>
        <span>创建新任务</span>
        <span className="text-xs bg-white/30 px-1.5 py-0.5 rounded">Ctrl</span>
      </button>

      <ul className="p-[0_20px] mb-5 list-none">
        <li 
          className="flex items-center gap-2.5 p-3 mb-2 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors border-l-4 border-blue-400"
          onClick={() => handleMenuItemClick('AI专家')}
        >
          <i className="fas fa-robot text-blue-400"></i>
          <span className="text-sm text-gray-800">AI专家</span>
        </li>
        <li 
          className="flex items-center gap-2.5 p-3 mb-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={() => handleMenuItemClick('DeepTrip旅行专家')}
        >
          <i className="fas fa-plane text-green-500"></i>
          <span className="text-sm text-gray-800">DeepTrip旅行专家</span>
        </li>
        <li 
          className="flex items-center gap-2.5 p-3 mb-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={() => handleMenuItemClick('华泰A股观察助手')}
        >
          <i className="fas fa-chart-line text-red-500"></i>
          <span className="text-sm text-gray-800">华泰A股观察助手</span>
        </li>
        <li 
          className="flex items-center gap-2.5 p-3 mb-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={() => handleMenuItemClick('舆情分析专家')}
        >
          <i className="fas fa-newspaper text-purple-500"></i>
          <span className="text-sm text-gray-800">舆情分析专家</span>
        </li>
      </ul>

      <div className="p-[0_20px_10px] text-xs text-gray-500">任务</div>
      <ul className="p-[0_20px] list-none">
        <li 
          className="flex items-center gap-2.5 p-3 mb-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={() => handleMenuItemClick('少儿编程科技风')}
        >
          <i className="fas fa-code text-indigo-500"></i>
          <span className="text-sm text-gray-800">少儿编程科技风</span>
        </li>
        <li 
          className="flex items-center gap-2.5 p-3 mb-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={() => handleMenuItemClick('QuantumLeap 2023销售业绩')}
        >
          <i className="fas fa-chart-bar text-yellow-500"></i>
          <span className="text-sm text-gray-800">QuantumLeap 2023销售业绩</span>
        </li>
        <li 
          className="flex items-center gap-2.5 p-3 mb-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={() => handleMenuItemClick('AI Python小精灵')}
        >
          <i className="fab fa-python text-blue-500"></i>
          <span className="text-sm text-gray-800">AI Python小精灵</span>
        </li>
        <li 
          className="flex items-center gap-2.5 p-3 mb-2 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={() => handleMenuItemClick('根据文稿编写网页')}
        >
          <i className="fas fa-file-alt text-gray-500"></i>
          <span className="text-sm text-gray-800">根据文稿编写网页</span>
        </li>
        <li 
          className="flex items-center gap-2.5 p-3 bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={() => handleMenuItemClick('分析文件并共创策划书')}
        >
          <i className="fas fa-project-diagram text-green-500"></i>
          <span className="text-sm text-gray-800">分析文件并共创策划书</span>
        </li>
      </ul>
    </aside>
  );
}

// 浮动帮助按钮组件
function FloatingHelpButton() {
  const handleHelpClick = () => {
    toast.info('客服团队将很快与您联系');
  };

  return (
      <button 
        className="fixed bottom-7 right-7 w-[54px] h-[54px] rounded-full border-2 border-white bg-gradient-to-r from-blue-400 to-indigo-400 text-white cursor-pointer shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-10"
        onClick={handleHelpClick}
      >
        <i className="fas fa-headset text-lg"></i>
      </button>
  );
}

// AI智能体前端页面
export default function Home() {
   const [activeTab, setActiveTab] = useState('AI专家');
   const [inputText, setInputText] = useState('请告诉我您的需求，我会为您提供专业的AI帮助...');
   
  // 渲染主页面
  return (
    <div className="flex flex-row h-screen bg-gray-50 font-sans">
      {/* 左侧导航栏 */}
      <Sidebar />
      
      {/* 主内容区 */}
      <MainContent 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        inputText={inputText}
        setInputText={setInputText}
      />
      
      {/* 浮动帮助按钮 */}
      <FloatingHelpButton />
    </div>
  );
}