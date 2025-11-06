import React from 'react';
  import { motion } from 'framer-motion';
  
  export default function LearningContent() {
    // 学习内容模块
     // 学习内容模块数据，可以从API或配置文件中获取
    const learningModules = [
      {
        title: "主线任务：AI国度修复计划",
        description: "48~60节课跟随剧情掌握编程知识，现已融入AI子系统经验任务，学生可以通过代码体验AI调用功能。",
        image: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_4_3&prompt=adventure%20game%20coding%20for%20kids%20cartoon%20style&sign=75cf20179d1e5e0386b7c1c9d80e235c",
        features: ["剧情式学习", "AI功能调用", "渐进式难度", "实时反馈"]
      },
      {
        title: "算法挑战",
        description: "闯关式算法任务，针对核心逻辑能力训练，培养孩子的计算思维和问题解决能力。",
        image: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_4_3&prompt=algorithm%20puzzle%20game%20for%20kids%20cartoon&sign=d9e2047cc7489e190a9ed0e3e269311a",
        features: ["分级挑战", "逻辑训练", "解题思路", "排行榜"]
      },
      {
        title: "自由创作",
        description: "游戏、动画、应用自由开发，支持精选素材、AI模型调用、组件复用，重点培养创作力。",
        image: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_4_3&prompt=creative%20coding%20platform%20for%20kids&sign=0f023de0f0ac0a0b614ee6f978106dfc",
        features: ["素材库", "AI生成", "组件复用", "作品分享"]
      },
      {
        title: "代码对战PK",
        description: "双人实时对战模式，比拼谁更快完成编程任务，获胜方获得金币奖励，激发学习动力。",
        image: "https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_4_3&prompt=code%20battle%20game%20two%20kids%20competing&sign=804e86d913f9cea3f9d56f700b923e31",
        features: ["实时对战", "金币奖励", "技能检验", "竞技体验"]
      }
    ];
  
    return (
      <section id="courses" className="py-16 md:py-20 bg-gradient-to-b from-white to-blue-50 dark:from-slate-900 dark:to-blue-950/50">
        <div className="container mx-auto px-4">
          {/* 标题部分 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-12 md:mb-16 px-4"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                丰富多样
              </span> 的学习内容
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
              橙浩编程提供系统化、趣味化的编程学习内容，从基础到进阶，
              满足不同年龄段和学习阶段孩子的需求，让编程学习充满乐趣。
            </p>
          </motion.div>
  
           {/* 学习模块 */}
          <div className="space-y-12 md:space-y-16">
            {learningModules.map((module, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-6 md:gap-8 items-center`}
              >
                {/* 图片部分 */}
                <div className="w-full md:w-1/2 relative">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-2xl overflow-hidden shadow-xl"
                  >
                    <img 
                      src={module.image} 
                      alt={module.title} 
                      className="w-full h-auto rounded-2xl object-cover"
                    />
                  </motion.div>
                  {/* 装饰元素 */}
                   <motion.div
                    className="absolute -bottom-6 -right-6 w-[8rem] h-[8rem] bg-blue-400/30 dark:bg-blue-500/20 rounded-full blur-2xl -z-10"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ 
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
                
                {/* 内容部分 */}
                <div className="md:w-1/2 px-4 w-full">
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4">{module.title}</h3>
                  <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-6">{module.description}</p>
                  
                  {/* 特点列表 - 优化移动端显示 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {module.features.map((feature, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
                        viewport={{ once: true }}
                        className="flex items-center space-x-3 bg-white dark:bg-slate-800/70 p-3 rounded-xl shadow-md"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                          <i className="fa-solid fa-star text-blue-600 dark:text-blue-400 text-sm"></i>
                        </div>
                        <span className="font-medium">{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* 按钮 */}
                   <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.location.href = '#pricing'}
                    className="w-full sm:w-auto px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/30 font-medium transition-all"
                  >
                    了解详情
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }