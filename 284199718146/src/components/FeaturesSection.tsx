import React from 'react';
  import { motion } from 'framer-motion';
  
  export default function FeaturesSection() {
    // 主要功能特点
     // 功能特点数据，可以从API或配置文件中获取
    const features = [
      {
        title: "AI助手全程陪伴",
        description: "AI助手具备成长、技能升级与外观变化，让学习不再孤单",
        icon: "fa-robot",
        color: "blue"
      },
      {
        title: "主线任务剧情化学习",
        description: "AI国度修复计划，48~60节课跟随剧情掌握编程知识",
        icon: "fa-route",
        color: "purple"
      },
      {
        title: "算法挑战思维训练",
        description: "闯关式算法任务，针对核心逻辑能力训练",
        icon: "fa-brain",
        color: "green"
      },
      {
        title: "自由创作空间",
        description: "游戏、动画、应用自由开发，支持精选素材和组件复用",
        icon: "fa-paint-brush",
        color: "orange"
      },
      {
        title: "代码对战PK",
        description: "双人实时对战模式，比拼谁更快完成编程任务",
        icon: "fa-gamepad",
        color: "red"
      },
      {
        title: "AI辅助功能",
        description: "错误检测、自动修复、代码补全、语音朗读等智能功能",
        icon: "fa-magic",
        color: "indigo"
      }
    ];
  
    // 图标颜色映射
    const colorClasses = {
      blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
      green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
      orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
      red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
      indigo: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
    };
  
    return (
      <section id="features" className="py-16 md:py-20 bg-white dark:bg-slate-900">
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
                橙浩编程
              </span> 核心特色
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
              我们融合先进的AI技术与游戏化学习方法，打造沉浸式编程教育体验，
              让孩子在探索中激发创造力，培养未来所需的科技素养。
            </p>
          </motion.div>
  
           {/* 功能卡片网格 - 完全响应式布局 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-slate-200 dark:border-slate-700"
              >
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl ${colorClasses[feature.color as keyof typeof colorClasses]} flex items-center justify-center mb-6`}>
                  <i className={`fa-solid ${feature.icon} text-xl`}></i>
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300">{feature.description}</p>
                  <button
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                    onClick={() => window.location.href = '#courses'}
                  >
                    了解详情
                  </button>
                </motion.div>
              ))}
            </div>
  
          {/* 更多功能 - 移动端调整列数 */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-12 md:mt-16 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl p-6 md:p-8 shadow-lg"
          >
            <h3 className="text-xl md:text-2xl font-bold mb-6 text-center">更多创新功能</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                { title: "成就系统", desc: "金币、通行证、限定装扮" },
                { title: "荣耀协作", desc: "协同编程金币互助" },
                { title: "错题本", desc: "AI讲解与复习巩固" },
                { title: "编程手册", desc: "AI辅助交互式文档" },
                { title: "家长端", desc: "学习数据追踪与管理" },
                { title: "商城系统", desc: "AI助手配件与素材" },
                { title: "语音朗读", desc: "代码内容语音播报" },
                { title: "实时翻译", desc: "多语言支持学习环境" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-start space-x-3"
                >
                  <div className="mt-1 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-check text-blue-600 dark:text-blue-400 text-xs"></i>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{item.title}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    );
  }