import React from 'react';
  import { motion } from 'framer-motion';
  
  export default function ParentConcerns() {
    // 家长关心的问题
     // 家长关心的问题数据，可以从API或配置文件中获取
    const concerns = [
      {
        question: "孩子能学到什么？",
        answer: "孩子将学习编程基础知识、算法思维、问题解决能力，同时培养创造力和逻辑思维，掌握AI时代的核心技能。",
        icon: "fa-graduation-cap",
        color: "blue"
      },
      {
        question: "如何追踪学习进度？",
        answer: "家长可以通过家长端实时查看孩子的学习数据、完成的任务、获得的成就，了解学习情况和进步。",
        icon: "fa-chart-line",
        color: "green"
      },
      {
        question: "适合多大年龄的孩子？",
        answer: "橙浩编程适合7-16岁的孩子，课程根据年龄段和认知水平分为多个阶段，循序渐进。",
        icon: "fa-child",
        color: "purple"
      },
      {
        question: "是否需要编程基础？",
        answer: "不需要任何编程基础，我们从零基础开始教学，通过游戏化方式引导孩子入门编程世界。",
        icon: "fa-rocket",
        color: "orange"
      },
      {
        question: "孩子会不会沉迷游戏？",
        answer: "我们采用教育游戏化设计，而非纯游戏体验，通过任务系统和学习目标引导孩子专注学习，避免沉迷。",
        icon: "fa-shield-alt",
        color: "red"
      },
      {
        question: "如何激励孩子持续学习？",
        answer: "通过成就系统、金币奖励、排行榜、同伴协作等多种机制，激发孩子的学习兴趣和动力，养成持续学习的习惯。",
        icon: "fa-trophy",
        color: "indigo"
      }
    ];
  
    // 图标颜色映射
    const colorClasses = {
      blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
      green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
      purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
      orange: "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400",
      red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
      indigo: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
    };
  
    return (
      <section id="parents" className="py-16 md:py-20 bg-white dark:bg-slate-900">
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
                家长关注
              </span> 的问题
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
              橙浩编程重视家长的参与和监督，我们提供全面的家长支持系统，
              让您能够实时了解孩子的学习情况，共同见证成长。
            </p>
          </motion.div>
  
          {/* 家长端功能展示 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl p-6 md:p-8 mb-12 md:mb-16 shadow-lg relative overflow-hidden"
          >
            {/* 背景装饰 */}
             <div className="absolute -top-20 -right-20 w-[16rem] h-[16rem] bg-blue-400/20 dark:bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-[16rem] h-[16rem] bg-indigo-400/20 dark:bg-indigo-500/10 rounded-full blur-3xl"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <div className="md:w-1/2 px-4 order-2 md:order-1">
                <h3 className="text-xl md:text-2xl font-bold mb-4">家长端管理系统</h3>
                <ul className="space-y-3">
                  {[
                    "实时查看学习数据和进度",
                    "远程奖励和发送鼓励信息",
                    "设定学习目标和时间管理",
                    "接收学习报告和分析",
                    "与老师沟通孩子学习情况",
                    "管理账户和订阅信息"
                  ].map((item, index) => (
                    <motion.li 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-start space-x-3"
                    >
                      <div className="mt-1 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                        <i className="fa-solid fa-check text-blue-600 dark:text-blue-400 text-xs"></i>
                      </div>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
                
                 <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.location.href = '#pricing'}
                  className="mt-6 w-full sm:w-auto px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/30 font-medium transition-all"
                >
                  了解家长端
                </motion.button>
              </div>
              
              <div className="md:w-1/2 order-1 md:order-2">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-2xl overflow-hidden shadow-xl"
                >
                  <img 
                    src="https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=parent%20dashboard%20for%20kids%20coding%20progress%20with%20charts%20and%20data&sign=4fe6911f83fbd1ceddd5cf69ca4fca30" 
                    alt="家长端管理界面" 
                    className="w-full h-auto rounded-2xl"
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
  
           {/* 常见问题 - 完全响应式布局 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
            {concerns.map((concern, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border border-slate-200 dark:border-slate-700 h-full flex flex-col"
              >
                  <div className={`w-12 h-12 rounded-xl ${colorClasses[concern.color as keyof typeof colorClasses]} flex items-center justify-center mb-5`}>
                  <i className={`fa-solid ${concern.icon} text-xl`}></i>
                </div>
                <h3 className="text-xl font-bold mb-3">{concern.question}</h3>
                <p className="text-slate-600 dark:text-slate-300 flex-grow">{concern.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    );
  }