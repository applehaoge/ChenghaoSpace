import React from 'react';
  import { motion } from 'framer-motion';
  
  interface PricingPlansProps {
    openAuthModal: (mode: 'login' | 'register') => void;
  }
  
  export default function PricingPlans({ openAuthModal }: PricingPlansProps) {
    // 价格方案
     // 价格方案数据，可以从API或配置文件中获取
    const pricingPlans = [
      {
        name: "启蒙计划",
        price: "99",
        period: "月",
        description: "适合编程入门的孩子，基础编程知识学习",
        features: [
          "主线任务前12节",
          "基础算法挑战",
          "简易AI助手",
          "每周1次代码对战",
          "基础家长端功能"
        ],
        buttonText: "免费体验",
        popular: false
      },
      {
        name: "进阶计划",
        price: "199",
        period: "月",
        description: "适合有一定基础的孩子，全面提升编程能力",
        features: [
          "完整主线任务",
          "全部算法挑战",
          "高级AI助手",
          "无限次代码对战",
          "完整家长端功能",
          "每月1次直播课",
          "AI辅助创作工具"
        ],
        buttonText: "立即订阅",
        popular: true
      },
      {
        name: "大师计划",
        price: "299",
        period: "月",
        description: "适合编程爱好者，培养专业编程技能",
        features: [
          "全部课程内容",
          "专属VIP客服",
          "定制学习计划",
          "导师一对一指导",
          "编程竞赛辅导",
          "作品展示平台",
          "优先体验新功能"
        ],
        buttonText: "升级大师",
        popular: false
      }
    ];
  
    return (
      <section id="pricing" className="py-16 md:py-20 bg-gradient-to-b from-white to-blue-50 dark:from-slate-900 dark:to-blue-950/50">
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
              选择适合 <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">孩子</span> 的学习计划
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mb-6">
              我们提供多种灵活的学习方案，满足不同孩子的学习需求和家庭预算，
              让每个孩子都能享受到优质的编程教育。
            </p>
            
            <div className="inline-flex items-center p-1 bg-slate-200 dark:bg-slate-700 rounded-full">
              <button className="px-4 py-2 rounded-full bg-white dark:bg-slate-800 shadow-sm font-medium">月付</button>
              <button className="px-4 py-2 rounded-full text-slate-600 dark:text-slate-300 font-medium">年付</button>
            </div>
          </motion.div>
  
           {/* 价格卡片 - 完全响应式布局 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto w-full">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className={`rounded-2xl overflow-hidden border ${
                  plan.popular 
                    ? 'border-blue-400 dark:border-blue-500 shadow-2xl shadow-blue-500/20 dark:shadow-blue-600/10' 
                    : 'border-slate-200 dark:border-slate-700 shadow-lg'
                } relative h-full flex flex-col`}
              >
                {/* 热门标签 */}
                {plan.popular && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-1 text-sm font-bold transform translate-x-4 translate-y-4 rotate-45 shadow-lg">
                      最受欢迎
                    </div>
                  </div>
                )}
                
                <div className={`p-6 md:p-8 ${plan.popular ? 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30' : 'bg-white dark:bg-slate-800'} flex flex-col h-full`}>
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold">¥{plan.price}</span>
                    <span className="text-slate-600 dark:text-slate-300">/{plan.period}</span>
                  </div>
                  
                  <ul className="space-y-3 mb-6 md:mb-8 flex-grow">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start space-x-3">
                        <div className="mt-1 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                          <i className="fa-solid fa-check text-blue-600 dark:text-blue-400 text-xs"></i>
                        </div>
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => openAuthModal('register')}
                    className={`w-full py-3 rounded-xl font-medium transition-all ${
                      plan.popular 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30' 
                        : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100'
                    }`}
                  >
                    {plan.buttonText}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* 退款保证 */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-12 text-center px-4"
          >
            <div className="inline-flex items-center justify-center space-x-2 bg-slate-100 dark:bg-slate-800 rounded-full px-4 py-2 sm:px-6 sm:py-3">
              <i className="fa-solid fa-shield-alt text-green-600 dark:text-green-400"></i>
              <span className="font-medium">7天无理由退款保证</span>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }