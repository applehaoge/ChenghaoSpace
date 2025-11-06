import React from 'react';
import { motion } from 'framer-motion';

interface ProgrammingAssistantModalProps {
  onClose: () => void;
}

export default function ProgrammingAssistantModal({ onClose }: ProgrammingAssistantModalProps) {
  // 模拟教学内容数据
  const teachingContent = {
    title: "Python类的基础知识",
    description: "在这节课中，我们将学习Python中类的基本概念和使用方法。类是面向对象编程的基础，通过类我们可以创建具有相同属性和方法的对象。",
    videoUrl: "https://example.com/python-class-tutorial.mp4", // 模拟视频URL
    imageUrl: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=programming%20concept%20illustration%20for%20kids&sign=c2e13599829823d863862ca75e77f269",
    keyPoints: [
      "类是创建对象的蓝图或模板",
      "使用class关键字定义类",
      "__init__方法用于初始化对象的属性",
      "self参数代表对象实例本身",
      "可以在类中定义方法来描述对象的行为"
    ]
  };

  // 模态框点击外部关闭
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-auto"
      onClick={handleOverlayClick}
      style={{ minHeight: '100vh' }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-4xl mx-auto overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* 头部 */}
        <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <h2 className="text-xl md:text-2xl font-bold flex items-center">
            <i className="fa-solid fa-book mr-2"></i>
            {teachingContent.title}
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="关闭"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
        
        {/* 内容 */}
        <div className="p-4 md:p-6 space-y-6">
          {/* 视频预览区域 */}
          <div className="bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative">
            <img 
              src={teachingContent.imageUrl} 
              alt="Python类的基础知识" 
              className="w-full h-auto rounded-xl"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-16 h-16 rounded-full bg-blue-600/90 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg"
              >
                <i className="fa-solid fa-play text-2xl ml-1"></i>
              </motion.button>
            </div>
            <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-2 py-1 rounded">
              05:23
            </div>
          </div>
          
          {/* 描述文本 */}
          <div>
            <h3 className="font-bold text-lg mb-2">课程介绍</h3>
            <p className="text-slate-600 dark:text-slate-300">{teachingContent.description}</p>
          </div>
          
          {/* 关键点列表 */}
          <div>
            <h3 className="font-bold text-lg mb-2">学习要点</h3>
            <ul className="space-y-2">
              {teachingContent.keyPoints.map((point, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-start bg-slate-50 dark:bg-slate-800 p-3 rounded-lg"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className="fa-solid fa-check text-blue-600 dark:text-blue-400 text-xs"></i>
                  </div>
                  <span className="ml-3">{point}</span>
                </motion.li>
              ))}
            </ul>
          </div>
          
          {/* 互动区域 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg flex flex-col items-center justify-center"
            >
              <i className="fa-solid fa-book-open text-xl mb-2"></i>
              <span className="text-sm font-medium">查看教材</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg flex flex-col items-center justify-center"
            >
              <i className="fa-solid fa-pencil text-xl mb-2"></i>
              <span className="text-sm font-medium">做练习</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg flex flex-col items-center justify-center"
            >
              <i className="fa-solid fa-question-circle text-xl mb-2"></i>
              <span className="text-sm font-medium">提问</span>
            </motion.button>
          </div>
          
          {/* 底部按钮 */}
          <div className="flex space-x-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-colors"
            >
              关闭
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            >
              继续学习
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}