import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { AuthContext } from '../contexts/authContext';
import { useContext } from 'react';
import { toast } from 'sonner';
import ProgrammingAssistantModal from '../components/ProgrammingAssistantModal';

// 模拟代码内容
const mockCode = `# AI国度修复计划 - 第1课：认识你的AI助手

# 欢迎来到AI国度！这个世界需要你的帮助来修复损坏的AI系统
# 让我们首先创建一个简单的AI助手来开始你的旅程

class AIAssistant:
    def __init__(self, name):
        self.name = name
        self.energy = 100
        self.knowledge = 0
    
    def greet(self):
        print(f"你好！我是{self.name}，你的AI助手。")
        print("很高兴能和你一起修复AI国度！")
    
    def learn(self, points):
        self.knowledge += points
        print(f"我学到了新知识！当前知识水平：{self.knowledge}")
    
    def work(self):
        if self.energy > 0:
            self.energy -= 10
            print(f"{self.name}正在努力工作...")
            print(f"剩余能量：{self.energy}")
        else:
            print(f"{self.name}太疲倦了，需要休息！")
    
    def rest(self):
        self.energy = min(100, self.energy + 20)
        print(f"{self.name}得到了充分休息！")
        print(f"当前能量：{self.energy}")

# 创建你的AI助手
my_assistant = AIAssistant("小智")

# 让我们和AI助手打个招呼吧
my_assistant.greet()

# 让AI助手学习一些新知识
my_assistant.learn(15)

# 让AI助手开始工作
my_assistant.work()

# 别忘了让AI助手休息哦
my_assistant.rest()`;

// 模拟控制台输出
const mockConsoleOutput = `你好！我是小智，你的AI助手。
很高兴能和你一起修复AI国度！
我学到了新知识！当前知识水平：15
小智正在努力工作...
剩余能量：90
小智得到了充分休息！
当前能量：100`;

// 模拟AI对话历史
const mockAIChatHistory = [
  {
    id: 1,
    text: "你好！我是你的AI编程助手，有什么可以帮助你的吗？",
    isAI: true
  },
  {
    id: 2,
    text: "我想了解如何创建一个AI助手类。",
    isAI: false
  },
  {
    id: 3,
    text: "创建AI助手类很简单！你需要定义一个class，然后添加__init__方法来初始化属性，再添加各种功能方法。让我为你展示一个例子...",
    isAI: true
  }
];

// 模拟任务剧情和目标
const mockMission = {
  title: "AI国度修复计划 - 第1课",
  story: "欢迎来到AI国度！在这个神奇的世界里，所有的AI系统都因为一场意外而损坏了。作为被选中的编程小英雄，你的任务是帮助修复这些AI系统，让AI国度恢复往日的繁荣。",
  objectives: [
    "理解Python类的基本概念",
    "创建一个简单的AI助手类",
    "实现AI助手的基本功能（问候、学习、工作、休息）",
    "运行代码并观察AI助手的行为"
  ],
  hints: [
    "类是一种用来创建对象的蓝图或模板",
    "__init__方法是一个特殊的方法，用于初始化对象的属性",
    "记得在方法的第一个参数使用self",
    "类的方法可以访问和修改对象的属性"
  ]
};

export default function CodeEditor() {
  const { theme, toggleTheme } = useTheme();
  const { userInfo, logout } = useContext(AuthContext);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'visualization' | 'console' | 'ai'>('visualization');
  const [aiInput, setAiInput] = useState('');
  const [aiChatHistory, setAiChatHistory] = useState(mockAIChatHistory);
  const [isRunning, setIsRunning] = useState(false);
  const [showAssistantModal, setShowAssistantModal] = useState(false);
  const [isVisualizationFullscreen, setIsVisualizationFullscreen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState<'code' | 'mission' | 'result'>('code');
  const consoleRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);
  const visualizationRef = useRef<HTMLDivElement>(null);
  
  // 响应式布局控制
  const [screenWidth, setScreenWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  
  useEffect(() => {
    // 初始化屏幕宽度
    if (typeof window !== 'undefined') {
      setScreenWidth(window.innerWidth);
      
      // 监听窗口大小变化
      const handleResize = () => {
        setScreenWidth(window.innerWidth);
        
        // 在宽屏设备上，默认展开所有面板
        if (window.innerWidth >= 1024) {
          setIsLeftPanelOpen(true);
          setIsRightPanelOpen(true);
        } else if (window.innerWidth >= 768) {
          // 在中等屏幕上，默认只展开一个侧边面板
          setIsLeftPanelOpen(true);
          setIsRightPanelOpen(false);
        }
      };
      
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);
  
  // 移动端菜单控制
  const handleMobileMenuChange = (menu: 'code' | 'mission' | 'result') => {
    setShowMobileMenu(menu);
    
    // 在移动端，只显示一个面板
    if (menu === 'mission') {
      setIsLeftPanelOpen(true);
      setIsRightPanelOpen(false);
    } else if (menu === 'result') {
      setIsLeftPanelOpen(false);
      setIsRightPanelOpen(true);
    } else {
      setIsLeftPanelOpen(false);
      setIsRightPanelOpen(false);
    }
  };

  // 处理左侧面板展开/收起
  const toggleLeftPanel = () => {
    setIsLeftPanelOpen(!isLeftPanelOpen);
  };

  // 处理右侧面板展开/收起
  const toggleRightPanel = () => {
    setIsRightPanelOpen(!isRightPanelOpen);
  };

   // 处理运行代码
  const handleRunCode = () => {
    setIsRunning(true);
    // 模拟运行代码的延迟
    setTimeout(() => {
      setIsRunning(false);
      toast('代码运行成功！');
      
      // 在移动端自动切换到结果视图
      if (screenWidth < 768) {
        handleMobileMenuChange('result');
      }
      
      // 滚动到控制台底部
      if (consoleRef.current) {
        consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
      }
    }, 1000);
  };

  // 处理可视化区域全屏切换
  const toggleVisualizationFullscreen = async () => {
    if (!visualizationRef.current) return;
    
    try {
      if (!isVisualizationFullscreen) {
        // 进入全屏
        if (visualizationRef.current.requestFullscreen) {
          await visualizationRef.current.requestFullscreen();
        } else if ((visualizationRef.current as any).webkitRequestFullscreen) {
          await (visualizationRef.current as any).webkitRequestFullscreen();
        } else if ((visualizationRef.current as any).msRequestFullscreen) {
          await (visualizationRef.current as any).msRequestFullscreen();
        }
        setIsVisualizationFullscreen(true);
        toast('已进入全屏模式');
      } else {
        // 退出全屏
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }
        setIsVisualizationFullscreen(false);
        toast('已退出全屏模式');
      }
    } catch (error) {
      console.error('全屏切换失败:', error);
      toast('全屏切换失败，请稍后再试');
    }
  };

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement
      );
      
      // 如果当前全屏元素不是我们的可视化区域，则更新状态
      if (!isFullscreen && isVisualizationFullscreen) {
        setIsVisualizationFullscreen(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [isVisualizationFullscreen]);

  // 处理保存代码
  const handleSaveCode = () => {
    toast('代码已保存 ✓');
  };

  // 处理AI助手对话
  const handleAISend = () => {
    if (!aiInput.trim()) return;
    
    // 添加用户消息
    const newUserMessage = {
      id: Date.now(),
      text: aiInput.trim(),
      isAI: false
    };
    
    setAiChatHistory(prev => [...prev, newUserMessage]);
    setAiInput('');
    
    // 模拟AI回复
    setTimeout(() => {
      const newAIMessage = {
        id: Date.now() + 1,
        text: "这是一个很好的问题！让我来为你解答...",
        isAI: true
      };
      setAiChatHistory(prev => [...prev, newAIMessage]);
    }, 1000);
  };

  // 退出登录
  const handleLogout = () => {
    logout();
  };

  // 判断是否是移动设备
  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 overflow-hidden">
      {/* 顶部工具栏 */}
      <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 px-4 py-2 flex items-center justify-between z-10">
        {/* 左侧按钮组 */}
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRunCode}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl shadow-md flex items-center"
          >
            <i className="fa-solid fa-play mr-2"></i>
            运行
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveCode}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl shadow-md flex items-center"
          >
            <i className="fa-solid fa-save mr-2"></i>
            保存
          </motion.button>
          
          {/* 编程助手按钮 - 在移动设备上可能需要调整位置或尺寸 */}
          {!isMobile && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowAssistantModal(true);
              }}
              className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow-md flex items-center"
            >
              <i className="fa-solid fa-book mr-2"></i>
              编程助手
            </motion.button>
          )}
        </div>
        
        {/* 中间任务标题 - 在移动设备上隐藏或简化 */}
        <div className={isMobile ? "hidden" : "text-center"}>
          <h1 className="text-xl font-bold">{mockMission.title}</h1>
        </div>
        
        {/* 右侧信息 */}
        <div className="flex items-center space-x-4">
          {/* 金币显示 */}
          <motion.div 
            className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-3 py-1 rounded-lg flex items-center"
            whileHover={{ scale: 1.05 }}
          >
            <i className="fa-solid fa-coins mr-1"></i>
            <span className="font-bold">100</span>
          </motion.div>
        </div>
      </header>
      
      {/* 主内容区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧任务栏 */}
        <AnimatePresence>
          {(isLeftPanelOpen || (isMobile && showMobileMenu === 'mission')) && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ 
                width: isMobile ? '100%' : (isTablet ? 300 : 280), 
                opacity: 1
              }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col h-full overflow-hidden z-20"
            >
              <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                <h2 className="font-bold text-lg">任务说明</h2>
                {(isTablet || !isMobile) && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleLeftPanel}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center"
                  >
                    <i className="fa-solid fa-chevron-left"></i>
                  </motion.button>
                )}
                {isMobile && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleMobileMenuChange('code')}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center"
                  >
                    <i className="fa-solid fa-times"></i>
                  </motion.button>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto p-4">
                {/* 任务剧情 */}
                <div className="mb-6">
                  <h3 className="font-bold mb-2 flex items-center">
                    <i className="fa-solid fa-book-open text-blue-500 mr-2"></i>
                    任务剧情
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{mockMission.story}</p>
                </div>
                
                {/* 任务目标 */}
                <div className="mb-6">
                  <h3 className="font-bold mb-2 flex items-center">
                    <i className="fa-solid fa-bullseye text-green-500 mr-2"></i>
                    任务目标
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {mockMission.objectives.map((objective, index) => (
                      <li key={index} className="flex items-start">
                        <i className="fa-solid fa-check-circle text-green-500 mt-1 mr-2"></i>
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* 教学提示 */}
                <div>
                  <h3 className="font-bold mb-2 flex items-center">
                    <i className="fa-solid fa-lightbulb text-yellow-500 mr-2"></i>
                    教学提示
                  </h3>
                  <ul className="space-y-2 text-sm">
                    {mockMission.hints.map((hint, index) => (
                      <li key={index} className="flex items-start">
                        <i className="fa-solid fa-star text-yellow-500 mt-1 mr-2"></i>
                        <span className="text-slate-600 dark:text-slate-300">{hint}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
        
        {/* 左侧面板收起状态的提示按钮 - 仅在平板和桌面显示 */}
        {!isMobile && !isLeftPanelOpen && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleLeftPanel}
            className="w-10 h-10 rounded-r-lg bg-white dark:bg-slate-800 border-r border-t border-b border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-md z-10"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </motion.button>
        )}
        
        {/* 中间代码编辑区 - 在移动端仅当没有面板打开时显示 */}
        {(isMobile && showMobileMenu === 'code') || (!isMobile && !(isLeftPanelOpen && isRightPanelOpen)) || (!isMobile && (isLeftPanelOpen !== isRightPanelOpen)) || (!isMobile && !isMobile) ? (
          <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-900">
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* 模拟代码编辑器 */}
              <div 
                ref={codeRef}
                className="flex-1 p-4 font-mono text-sm overflow-y-auto bg-slate-800 dark:bg-slate-950 text-green-400 rounded-lg m-4 border border-slate-700 shadow-lg"
                style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}
              >
                <pre>{mockCode}</pre>
              </div>
              
              {/* 运行状态提示 */}
              <div className={`px-4 py-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between ${isRunning ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                <div className="flex items-center">
                  {isRunning ? (
                    <>
                      <div className="w-3 h-3 rounded-full bg-blue-500 mr-2 animate-pulse"></div>
                      <span className="text-blue-600 dark:text-blue-400">代码运行中...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-slate-500 dark:text-slate-400">就绪 - 点击运行按钮执行代码</span>
                    </>
                  )}
                </div>
                
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Python 3.10 | 行 45, 列 12
                </div>
              </div>
            </div>
          </main>
        ) : null}
        
        {/* 右侧面板收起状态的提示按钮 - 仅在平板和桌面显示 */}
        {!isMobile && !isRightPanelOpen && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleRightPanel}
            className="w-10 h-10 rounded-l-lg bg-white dark:bg-slate-800 border-l border-t border-b border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-md z-10"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </motion.button>
        )}
        
        {/* 右侧运行/AI区 - 在移动设备上全屏显示 */}
        <AnimatePresence>
          {(isRightPanelOpen || (isMobile && showMobileMenu === 'result')) && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ 
                width: isMobile ? '100%' : (isTablet ? 320 : 350), 
                opacity: 1
              }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col h-full overflow-hidden z-20"
            >
              <div className="p-4 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
                <div className="flex space-x-2 flex-wrap gap-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('visualization')}
                    className={`px-3 py-1 rounded-lg text-sm ${activeTab === 'visualization' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}
                  >
                    <i className="fa-solid fa-desktop mr-1"></i>
                    可视化
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('console')}
                    className={`px-3 py-1 rounded-lg text-sm ${activeTab === 'console' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}
                  >
                    <i className="fa-solid fa-terminal mr-1"></i>
                    控制台
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveTab('ai')}
                    className={`px-3 py-1 rounded-lg text-sm ${activeTab === 'ai' ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}
                  >
                    <i className="fa-solid fa-robot mr-1"></i>
                    AI助手
                  </motion.button>
                </div>
                {(isTablet || !isMobile) && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={toggleRightPanel}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center"
                  >
                    <i className="fa-solid fa-chevron-right"></i>
                  </motion.button>
                )}
                {isMobile && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleMobileMenuChange('code')}
                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center"
                  >
                    <i className="fa-solid fa-times"></i>
                  </motion.button>
                )}
              </div>
              
              <div className="flex-1 overflow-hidden">
                {/* 可视化窗口 */}
                {activeTab === 'visualization' && (
                  <div className="h-full p-4 flex flex-col">
                    <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-600 relative">
                      {/* 模拟Pygame渲染窗口 */}
                      <div ref={visualizationRef} className="w-full h-full bg-slate-800 flex flex-col items-center justify-center">
                        <div className="text-center">
                          <div className="w-24 h-24 mx-auto mb-4">
                            <img 
                              src="https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=cartoon%20robot%20character%20happy%20expression&sign=f610e0fe70e7b0b1bff1ec92b407f11f" 
                              alt="AI助手" 
                              className="w-full h-full rounded-full"
                            />
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">你好！我是小智</h3>
                          <p className="text-green-400 font-mono text-sm">
                            很高兴能和你一起修复AI国度！
                          </p>
                        </div>
                      </div>
                      
                      {/* 全屏模式下的控制按钮组 */}
                      {isVisualizationFullscreen && (
                        <div className="absolute top-4 right-4 flex space-x-3 z-50">
                          {/* 播放按钮 */}
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toast('播放已开始')}
                            className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg"
                            aria-label="播放"
                          >
                            <i className="fa-solid fa-play text-xl"></i>
                          </motion.button>
                          
                          {/* 暂停按钮 */}
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toast('播放已暂停')}
                            className="w-12 h-12 rounded-full bg-yellow-500 text-white flex items-center justify-center shadow-lg"
                            aria-label="暂停"
                          >
                            <i className="fa-solid fa-pause text-xl"></i>
                          </motion.button>
                          
                          {/* 退出全屏按钮 */}
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleVisualizationFullscreen}
                            className="w-12 h-12 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg"
                            aria-label="退出全屏"
                          >
                            <i className="fa-solid fa-compress text-xl"></i>
                          </motion.button>
                        </div>
                      )}
                    </div>
                    
                    {/* 非全屏模式下的全屏按钮 */}
                    {!isVisualizationFullscreen && (
                      <div className="absolute bottom-4 right-4 flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={toggleVisualizationFullscreen}
                          className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm text-white flex items-center justify-center"
                          aria-label="全屏"
                        >
                          <i className="fa-solid fa-expand"></i>
                        </motion.button>
                      </div>
                    )}
                    
                    {/* 游戏状态信息 */}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg text-sm">
                        <div className="flex justify-between">
                          <span>AI能量:</span>
                          <span className="font-bold">100%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                      <div className="bg-slate-100 dark:bg-slate-700 p-2 rounded-lg text-sm">
                        <div className="flex justify-between">
                          <span>知识水平:</span>
                          <span className="font-bold">15%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-full mt-1 overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: '15%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* 控制台日志 */}
                {activeTab === 'console' && (
                  <div className="h-full flex flex-col">
                    <div className="p-2 bg-slate-200 dark:bg-slate-700 text-xs text-slate-500 dark:text-slate-400 border-b border-slate-300 dark:border-slate-600">
                      Python Console
                    </div>
                    <div 
                      ref={consoleRef}
                      className="flex-1 bg-black text-white font-mono text-sm p-4 overflow-y-auto"
                      style={{ whiteSpace: 'pre-wrap' }}
                    >
                      <pre>{mockConsoleOutput}</pre>
                    </div>
                  </div>
                )}
                
                {/* AI助手对话区 */}
                {activeTab === 'ai' && (
                  <div className="h-full flex flex-col">
                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                      {aiChatHistory.map(message => (
                        <div 
                          key={message.id} 
                          className={`flex ${message.isAI ? 'justify-start' : 'justify-end'}`}
                        >
                          <div className={`max-w-[80%] p-3 rounded-xl ${
                            message.isAI 
                              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200' 
                              : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                          }`}>
                            <p>{message.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* AI输入框 */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={aiInput}
                          onChange={(e) => setAiInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAISend()}
                          placeholder="向AI助手提问..."
                          className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 outline-none"
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleAISend}
                          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg"
                        >
                          <i className="fa-solid fa-paper-plane"></i>
                        </motion.button>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        AI助手可以帮助你解答编程问题、提供代码示例和解释概念
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
      
      {/* 移动端底部导航 - 增强版 */}
      {isMobile && (
        <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-4 py-2 flex justify-around items-center md:hidden z-30">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleMobileMenuChange('mission')}
            className={`flex flex-col items-center justify-center p-2 ${showMobileMenu === 'mission' ? 'text-blue-500' : ''}`}
          >
            <i className="fa-solid fa-tasks text-lg"></i><span className="text-xs mt-1">任务</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleRunCode}
            className="flex flex-col items-center justify-center p-2"
          >
            <i className="fa-solid fa-play text-lg text-green-500"></i>
            <span className="text-xs mt-1">运行</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleMobileMenuChange('result')}
            className={`flex flex-col items-center justify-center p-2 ${showMobileMenu === 'result' ? 'text-blue-500' : ''}`}
          >
            <i className="fa-solid fa-desktop text-lg"></i>
            <span className="text-xs mt-1">结果</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAssistantModal(true)}
            className="flex flex-col items-center justify-center p-2"
          >
            <i className="fa-solid fa-book text-lg text-indigo-500"></i>
            <span className="text-xs mt-1">助手</span>
          </motion.button>
        </footer>
      )}
      
      {/* 编程助手模态框 */}
      {showAssistantModal && (
        <ProgrammingAssistantModal onClose={() => setShowAssistantModal(false)} />
      )}
    </div>
  );
}