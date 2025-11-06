import React from 'react';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  openAuthModal: (mode: 'login' | 'register') => void;
}

export default function HeroSection({ openAuthModal }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 -z-10 opacity-20 dark:opacity-10">
        <div className="absolute top-20 left-10 w-[10rem] h-[10rem] rounded-full bg-blue-500 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-[15rem] h-[15rem] rounded-full bg-orange-500 blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-[20rem] h-[20rem] rounded-full bg-indigo-500 blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-4 pt-8 pb-16 md:pt-12 md:pb-24 flex flex-col md:flex-row items-center">
        {/* 文字内容 */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full md:w-1/2 text-center md:text-left mb-12 md:mb-0"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">AI驱动的</span>
            <br />
            <span>少儿编程启蒙</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed px-0 sm:px-4">
            橙浩编程让孩子在AI陪伴下，通过游戏化学习方式，轻松掌握编程思维和技能，培养未来科技创新能力。
          </p>
          <div className="flex flex-col sm:flex-row items-center md:items-start space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start px-0 sm:px-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => openAuthModal('register')}
              className="w-full sm:w-auto px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/30 font-medium text-lg transition-all"
            >
              免费体验课程
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '#courses'}
              className="w-full sm:w-auto px-6 py-3 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl shadow-md font-medium text-lg transition-all"
            >
              了解更多课程
            </motion.button>
          </div>
          
          {/* 信任标识 */}
          <div className="mt-12 px-4">
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">受到众多家长和孩子的信赖</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-8">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 overflow-hidden"
                  >
                    <img 
                      src={`https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=happy%20child%20face%20cartoon%20style%20${i}`}
                      alt="用户头像"
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>
              <div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <i key={i} className="fa-solid fa-star text-yellow-400"></i>
                  ))}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">4.9/5 好评率</p>
              </div>
              <div>
                <p className="font-bold text-blue-600 dark:text-blue-400">10000+</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">活跃学员</p>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* 图片内容 - 优化响应式布局 */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="md:w-1/2 relative w-full max-w-md mx-auto"
        >
          <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src="https://lf-code-agent.coze.cn/obj/x-ai-cn/284199718146/attachment/image_20251104104331.png" 
              alt="孩子与AI一起编程" 
              className="w-full h-auto rounded-3xl"
            />
          </div>
          
          {/* 装饰元素 */}
           <motion.div 
            className="absolute -bottom-6 -left-6 w-[8rem] h-[8rem] rounded-2xl bg-orange-400 opacity-80 -z-10 floating"
            animate={{ 
              rotate: [0, 10, 0],
              y: [0, -10, 0]
            }}
            transition={{ 
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
           <motion.div 
            className="absolute -top-8 -right-8 w-[10rem] h-[10rem] rounded-2xl bg-blue-400 opacity-70 -z-10 floating-delay-1"
            animate={{ 
              rotate: [0, -15, 0],
              y: [0, -15, 0]
            }}
            transition={{ 
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}