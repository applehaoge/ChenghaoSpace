import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { Home, Folder, Settings, HelpCircle, FileText, Plus, Upload, Trash2, Play, Search, Palette, Terminal, ArrowLeft, ArrowRight, Minus, Plus as PlusIcon, Moon, Sun, Star, Trophy, Sparkles, Clock } from 'lucide-react';
import { toast } from 'sonner';

// 下载图标组件
function Download(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.size || 24}
      height={props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

// 代码行组件 - 处理语法高亮
function CodeLine({ code, isDark, isActive }: { code: string; isDark: boolean; isActive?: boolean }) {
  // 简单的语法高亮逻辑 - 根据主题调整颜色
  let highlightedCode = code
    .replace(/\b(import|from|as|def|class|return|if|elif|else|for|while|in|print)\b/g, 
      `<span class="${isDark ? 'text-blue-400' : 'text-blue-600'} font-medium">$1</span>`)
    // 函数和方法
    .replace(/\b(\w+)\(/g, 
      `<span class="${isDark ? 'text-green-400' : 'text-green-600'}">$1</span>(`)
    // 字符串
    .replace(/(".*?")/g, 
      `<span class="${isDark ? 'text-red-400' : 'text-red-500'}">$1</span>`)
    // 数字
    .replace(/\b(\d+\.?\d*)\b/g, 
      `<span class="${isDark ? 'text-orange-400' : 'text-orange-500'}">$1</span>`);
  
  return <span dangerouslySetInnerHTML={{ __html: highlightedCode }} />;
}

// 浮动装饰元素组件 - 为少儿版添加趣味性
function FloatingDeco({ children, delay = 0, duration = 6 }: { children: React.ReactNode, delay?: number, duration?: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none opacity-70"
      initial={{ y: 0 }}
      animate={{ 
        y: [0, -10, 0],
      }}
      transition={{ 
        duration: duration, 
        repeat: Infinity, 
        repeatType: "reverse",
        delay: delay
      }}
    >
      {children}
    </motion.div>
  );
}

// 代码编辑器页面 - 蓝色主题 少儿版
export function KidsCodingEditorPage() {
  // 缩放级别状态
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const { theme, toggleTheme, isDark } = useTheme();
  const [activeLine, setActiveLine] = useState<number | null>(null);
  const [showTutorialHint, setShowTutorialHint] = useState(true);
  
  // 模拟代码数据
  const codeLines = [
    { id: 1, content: "import matplotlib.pyplot as plt", type: "code" },
    { id: 2, content: "import numpy as np", type: "code" },
    { id: 3, content: "", type: "empty" },
    { id: 4, content: "# 一个一元二次函数", type: "comment" },
    { id: 5, content: "x = np.arange(-5, 5, 0.01)", type: "code" },
    { id: 6, content: "y = (x ** 2)", type: "code" },
    { id: 7, content: "# 画图", type: "comment" },
    { id: 8, content: "plt.plot(x, y)", type: "code" },
    { id: 9, content: "plt.show()", type: "code" }
  ];
  
  // 隐藏教程提示
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTutorialHint(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // 缩放控制函数
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 150));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 60));
  };
  
  // 运行代码函数
  const handleRunCode = () => {
    toast.success("代码正在运行中！", {
      description: "这是一个少儿版编辑器，实际运行功能需要后端支持哦！",
      duration: 3000,
      className: "rounded-xl shadow-lg"
    });
  };
  
  // 鼠标悬停在代码行上
  const handleCodeLineHover = (id: number) => {
    setActiveLine(id);
  };
  
  const handleCodeLineLeave = () => {
    setActiveLine(null);
  };
  
  return (
    <div className={`kids-coding-editor flex flex-col h-screen overflow-hidden transition-colors duration-300 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-blue-50 to-blue-100'
    } relative`}>
      {/* 装饰性浮动元素 - 为少儿版添加趣味性 */}
      <FloatingDeco delay={0} duration={5}>
        <Star size={16} className={`absolute top-[15%] left-[5%] ${isDark ? 'text-yellow-300' : 'text-yellow-500'}`} />
      </FloatingDeco>
      <FloatingDeco delay={1} duration={7}>
        <Sparkles size={14} className={`absolute top-[30%] right-[8%] ${isDark ? 'text-blue-300' : 'text-blue-500'}`} />
      </FloatingDeco>
      <FloatingDeco delay={2} duration={6}>
        <Trophy size={18} className={`absolute bottom-[20%] left-[10%] ${isDark ? 'text-amber-300' : 'text-amber-500'}`} />
      </FloatingDeco>
      
      {/* 顶部导航栏 - 蓝色主题 */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`flex items-center justify-between h-16 px-4 shadow-xl ${
          isDark 
            ? 'bg-gray-800' 
            : 'bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-500'
        } rounded-b-3xl`}
      >
        <div className="flex items-center space-x-4">
          <nav className="flex items-center space-x-1">
            {[
              { icon: <Home size={20} />, label: "首页" },
              { icon: <Folder size={20} />, label: "文件" },
              { icon: <Settings size={20} />, label: "设置" },
              { icon: <HelpCircle size={20} />, label: "帮助" },
              { icon: <FileText size={20} />, label: "文档" }
            ].map((item, index) => (
              <motion.button 
                key={index}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className={`p-2.5 rounded-full transition-colors duration-300 ${
                  isDark 
                    ? 'hover:bg-gray-700 text-white' 
                    : 'hover:bg-blue-300/80 text-white'
                }`}
                title={item.label}
              >
                {item.icon}
              </motion.button>
            ))}
          </nav>
        </div>
        
        {/* 标签页切换 */}
        <div className={`flex space-x-1 rounded-full p-1 ${
          isDark ? 'bg-gray-700/50' : 'bg-white/30'
        } backdrop-blur-sm shadow-inner`}>
          <motion.button 
            whileHover={{ y: -1 }}
            className={`px-4 py-1.5 rounded-full font-medium transition-all duration-300 ${
              isDark 
                ? 'bg-blue-500/30 text-blue-200' 
                : 'bg-blue-300/80 text-blue-800'
            }`}
          >
            积木
          </motion.button>
          <motion.button 
            whileHover={{ y: -1 }}
            className={`px-4 py-1.5 rounded-full font-medium transition-all duration-300 ${
              isDark 
                ? 'bg-gray-800 text-white' 
                : 'bg-white text-blue-800'
            } shadow-md`}
          >
            代码
          </motion.button>
        </div>
        
        {/* 右侧操作按钮 */}
        <div className="flex items-center space-x-3">
          {/* 主题切换按钮 */}
          <motion.button
            whileHover={{ rotate: 15 }}
            className={`p-2.5 rounded-full ${
              isDark 
                ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' 
                : 'bg-white/30 text-white hover:bg-white/50'
            } transition-colors duration-300 shadow-lg`}
            onClick={toggleTheme}
            title={isDark ? "切换到亮色模式" : "切换到暗色模式"}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>
          
          {[
            { 
              label: "新的作品", 
              color: isDark 
                ? "bg-blue-600/30 text-blue-300 hover:bg-blue-600/50" 
                : "bg-white/80 text-blue-700 hover:bg-white"
            },
            { 
              label: "保存", 
              color: isDark 
                ? "bg-blue-600/30 text-blue-300 hover:bg-blue-600/50" 
                : "bg-white/80 text-blue-700 hover:bg-white"
            },
            { 
              label: "分享", 
              color: isDark 
                ? "bg-gradient-to-r from-purple-700/30 to-indigo-700/30 text-purple-300 hover:from-purple-600/50 hover:to-indigo-600/50" 
                : "bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600"
            },
            { 
              label: "登录", 
              color: isDark 
                ? "bg-blue-600/30 text-blue-300 hover:bg-blue-600/50" 
                : "bg-white/80 text-blue-700 hover:bg-white"
            },
          ].map((button, index) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.96 }}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${button.color} shadow-lg`}
            >
              {button.label}
            </motion.button>
          ))}
        </div>
      </motion.header>
      
      {/* 主内容区域 */}
      <div className="flex flex-1 overflow-hidden pt-4">
        {/* 文件资源管理器 - 浅蓝色背景 */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`w-56 flex flex-col border ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white/90 border-blue-200'
          } backdrop-blur-sm shadow-xl rounded-3xl mx-2`}
        >
          {/* 文件操作工具栏 */}
          <div className={`p-3 flex justify-between items-center border-b ${
            isDark ? 'border-gray-700' : 'border-blue-200'
          } rounded-t-3xl`}>
            <div className="flex space-x-2">
              <button className={`p-1.5 rounded-full hover:transition-colors duration-300 ${
                isDark ? 'hover:bg-gray-700' : 'hover:bg-blue-100'
              }`}>
                <FileText size={16} className={isDark ? "text-blue-400" : "text-blue-800"} />
              </button>
              <button className={`p-1.5 rounded-full hover:transition-colors duration-300 ${
                isDark ? 'hover:bg-gray-700' : 'hover:bg-blue-100'
              }`}>
                <Folder size={16} className={isDark ? "text-blue-400" : "text-blue-800"} />
              </button>
            </div>
            <div className="flex space-x-2">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-1.5 rounded-full transition-colors duration-300 ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-blue-100'
                }`}
              >
                <Plus size={16} className={isDark ? "text-blue-400" : "text-blue-800"} />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-1.5 rounded-full transition-colors duration-300 ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-blue-100'
                }`}
              >
                <Upload size={16} className={isDark ? "text-blue-400" : "text-blue-800"} />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-1.5 rounded-full transition-colors duration-300 ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-blue-100'
                }`}
              >
                <Download size={16} className={isDark ? "text-blue-400" : "text-blue-800"} />
              </motion.button>
            </div>
          </div>
          
          {/* 文件列表 */}
          <div className="flex-1 overflow-y-auto p-3">
            <motion.div 
              whileHover={{ x: 3 }}
              className={`flex items-center justify-between p-2.5 rounded-2xl mb-2 cursor-pointer transition-colors duration-300 ${
                isDark 
                  ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30' 
                  : 'bg-gradient-to-r from-blue-100 to-indigo-50 hover:from-blue-200 hover:to-indigo-100'
              } shadow-lg`}
            >
              <div className="flex items-center space-x-2">
                <FileText size={16} className={isDark ? "text-blue-400" : "text-blue-800"} />
                <span className={isDark ? "text-blue-300 font-medium" : "text-blue-800 font-medium"}>main.py</span>
              </div>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-0.5 rounded-full hover:bg-red-500/20 hover:text-red-500 transition-colors duration-300"
              >
                <Trash2 size={14} />
              </motion.button>
            </motion.div>
            
            {/* 空文件状态 */}
            <div className="flex flex-col items-center justify-center mt-12 space-y-3">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <Clock size={36} className={isDark ? "text-gray-600" : "text-blue-200"} />
              </motion.div>
              <p className={`text-sm ${isDark ? "text-gray-400" : "text-blue-300"}`}>
                点击上方的"+"按钮创建新文件
              </p>
            </div>
          </div>
        </motion.div>
        
        {/* 代码编辑器区域 */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={`flex-1 flex flex-col overflow-hidden ${
            isDark ? 'bg-gray-900' : 'bg-white'
          } shadow-xl rounded-3xl mx-2`}
        >
          {/* 文件名标签栏 */}
          <div className={`flex items-center border-b px-4 ${
            isDark ? 'border-gray-700 bg-gray-800' : 'border-blue-100 bg-blue-50/70'
          } rounded-t-3xl`}>
            <motion.div 
              whileHover={{ y: -1 }}
              className={`flex items-center space-x-2 border border-b-transparent rounded-t-2xl px-3 py-2 -mb-px ${
                isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-blue-200'
              } shadow-md`}
            >
              <FileText size={16} className={isDark ? "text-blue-400" : "text-blue-600"} />
              <span className={isDark ? "text-blue-300 font-medium" : "text-blue-800 font-medium"}>main.py</span>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-0.5 rounded-full hover:bg-red-500/20 hover:text-red-500 transition-colors duration-300"
              >
                <Trash2 size={14} />
              </motion.button>
            </motion.div>
          </div>
          
          {/* 代码编辑区域 */}
          <div className="flex-1 flex overflow-hidden relative" style={{ fontSize: `${zoomLevel}%` }}>
            {/* 行号区域 */}
            <div className={`text-sm px-3 py-4 font-mono border-r text-right min-w-[3rem] ${
              isDark ? 'bg-gray-800/50 text-gray-400 border-gray-700' : 'bg-blue-50/50 text-gray-500 border-blue-100'
            }`}>
              {codeLines.map(line => (
                <div 
                  key={line.id} 
                  className={`py-1 transition-colors duration-300 ${
                    activeLine === line.id 
                      ? isDark ? 'text-blue-400' : 'text-blue-600'
                      : ''
                  }`}
                >
                  {line.id}
                </div>
              ))}
            </div>
            
            {/* 代码内容区域 */}
            <div className={`flex-1 font-mono text-sm p-4 overflow-y-auto ${
              isDark ? 'bg-gray-900' : 'bg-white'
            }`}>
              {codeLines.map(line => (
                <div 
                  key={line.id} 
                  className={`py-1 flex items-start transition-colors duration-300 ${
                    activeLine === line.id 
                      ? isDark ? 'bg-blue-900/20' : 'bg-blue-50'
                      : ''
                  }`}
                  onMouseEnter={() => handleCodeLineHover(line.id)}
                  onMouseLeave={handleCodeLineLeave}
                >
                  {line.type === 'comment' ? (
                    <span className={isDark ? "text-amber-400" : "text-amber-500"}>{line.content}</span>
                  ) : line.type === 'code' ? (
                    <CodeLine code={line.content} isDark={isDark} isActive={activeLine === line.id} />
                  ) : (
                    <span></span>
                  )}
                </div>
              ))}
            </div>
            
            {/* 右侧滚动条 */}
            <div className={`w-2.5 relative ${
              isDark ? 'bg-gray-800/50' : 'bg-blue-50/50'
            }`}>
              <motion.div 
                className={`absolute w-2 rounded-full top-4 h-20 ${
                  isDark 
                    ? 'bg-gradient-to-b from-blue-500/80 to-indigo-500/80' 
                    : 'bg-gradient-to-b from-blue-400 to-indigo-300'
                } shadow-lg`}
                whileHover={{ scale: 1.2 }}
              ></motion.div>
            </div>
          </div>
          
          {/* 底部控制栏 */}
          <div className={`flex items-center justify-between h-14 px-4 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-blue-50/70 border-blue-100'
          } border-t rounded-b-3xl`}>
            <div className="flex items-center space-x-2">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-1.5 border rounded-full transition-all duration-300 ${
                  isDark 
                    ? 'border-gray-700 bg-gray-900 hover:bg-gray-700' 
                    : 'border-blue-200 bg-white hover:bg-blue-100'
                } shadow-md`}
              >
                <ArrowLeft size={16} />
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-1.5 border rounded-full transition-all duration-300 ${
                  isDark 
                    ? 'border-gray-700 bg-gray-900 hover:bg-gray-700' 
                    : 'border-blue-200 bg-white hover:bg-blue-100'
                } shadow-md`}
              >
                <ArrowRight size={16} />
              </motion.button>
            </div>
            
            <div className="flex items-center space-x-2">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-1.5 border rounded-full transition-all duration-300 ${
                  isDark 
                    ? 'border-gray-700 bg-gray-900 hover:bg-gray-700' 
                    : 'border-blue-200 bg-white hover:bg-blue-100'
                } shadow-md`}
                onClick={handleZoomOut}
              >
                <Minus size={16} />
              </motion.button>
              <motion.span 
                whileHover={{ scale: 1.05 }}
                className={`w-12 text-center text-sm font-medium rounded-full ${
                  isDark ? 'text-gray-300 bg-gray-900' : 'text-gray-600 bg-white'
                } py-1 shadow-md`}
              >
                {zoomLevel}%
              </motion.span>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-1.5 border rounded-full transition-all duration-300 ${
                  isDark 
                    ? 'border-gray-700 bg-gray-900 hover:bg-gray-700' 
                    : 'border-blue-200 bg-white hover:bg-blue-100'
                } shadow-md`}
                onClick={handleZoomIn}
              >
                <PlusIcon size={16} />
              </motion.button>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className={`px-6 py-2.5 rounded-full font-medium flex items-center space-x-2 shadow-xl transition-all duration-300 ${
                isDark 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
              } text-white`}
              onClick={handleRunCode}
            >
              <motion.div
                whileHover={{ rotate: 15 }}
              >
                <Play size={18} />
              </motion.div>
              <span className="font-semibold">运行代码</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
      
      {/* 右下角功能图标 */}
      <div className="absolute bottom-8 right-6 flex flex-col items-center space-y-4">
        {[
          { 
            icon: <Search size={18} />, 
            label: "搜索", 
            color: isDark 
              ? "bg-gray-800 border-gray-700 text-blue-400" 
              : "bg-white border-blue-200 text-blue-600" 
          },
          { 
            icon: <Palette size={18} />, 
            label: "主题", 
            color: isDark 
              ? "bg-gray-800 border-gray-700 text-blue-400" 
              : "bg-white border-blue-200 text-blue-600" 
          },
          { 
            icon: <Terminal size={18} />, 
            label: "终端", 
            color: isDark 
              ? "bg-gray-800 border-gray-700 text-blue-400" 
              : "bg-white border-blue-200 text-blue-600" 
          },
        ].map((item, index) => (
          <motion.button 
            key={index}
            whileHover={{ y: -4, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`w-12 h-12 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${item.color} border-2`}
            title={item.label}
          >
            {item.icon}
          </motion.button>
        ))}
        
        <motion.button 
          whileHover={{ y: -4, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${
            isDark 
              ? 'bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border-2 border-purple-600/50 text-purple-400' 
              : 'bg-gradient-to-r from-purple-100 to-indigo-50 border-2 border-purple-400 text-purple-600'
          }`}
          title="AI助手"
        >
          <span className="text-lg font-bold">AI</span>
        </motion.button>
      </div>
      
      {/* 教程提示 - 为少儿用户提供操作指引 */}
      {showTutorialHint && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`absolute bottom-28 left-4 max-w-xs p-4 rounded-2xl shadow-2xl ${
            isDark 
              ? 'bg-blue-900/90 text-blue-100' 
              : 'bg-blue-500/95 text-white'
          } backdrop-blur-sm`}
        >
          <div className="flex items-start space-x-3">
            <Sparkles size={20} className="mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">💡 提示</h3>
              <p className="text-sm opacity-90">
                编写完代码后，点击底部的"运行代码"按钮可以看到你的程序效果哦！
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
