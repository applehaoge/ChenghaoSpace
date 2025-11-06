import React from 'react';
  import { motion } from 'framer-motion';
  
  interface FooterProps {
    openAuthModal: (mode: 'login' | 'register') => void;
  }
  
  export default function Footer({ openAuthModal }: FooterProps) {
    return (
      <footer className="bg-slate-900 text-white pt-12 pb-8">
        <div className="container mx-auto px-4">
           {/* 完全响应式布局 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8 mb-12 w-full">
            {/* Logo和简介 */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">橙</span>
                </div>
                <span className="text-xl font-bold">橙浩编程</span>
              </div>
              <p className="text-slate-400 mb-6 max-w-md">
                橙浩编程是面向7-16岁青少年的AI编程教育平台，通过游戏化学习和AI辅助，
                让孩子在探索中掌握编程技能，培养未来所需的科技素养和创新能力。
              </p>
              <div className="flex flex-wrap gap-4">
                {['twitter', 'facebook', 'instagram', 'youtube'].map((social, index) => (
                  <motion.a
                    key={index}
                    href="#"
                    whileHover={{ scale: 1.1, y: -3 }}
                    className="w-10 h-10 rounded-full bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors"
                  >
                    <i className={`fa-brands fa-${social}`}></i>
                  </motion.a>
                ))}
              </div>
            </div>
            
            {/* 链接 */}
            <div>
              <h4 className="font-bold text-lg mb-6">课程</h4>
              <ul className="space-y-4">
                {['主线任务', '算法挑战', '自由创作', '代码对战', '编程手册'].map((item, index) => (
                  <motion.li key={index} whileHover={{ x: 5 }}>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors">{item}</a>
                  </motion.li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6">关于我们</h4>
              <ul className="space-y-4">
                {['公司简介', '师资团队', '教学理念', '合作伙伴', '联系我们'].map((item, index) => (
                  <motion.li key={index} whileHover={{ x: 5 }}>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors">{item}</a>
                  </motion.li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold text-lg mb-6">帮助中心</h4>
              <ul className="space-y-4">
                {['常见问题', '家长指南', '学生指南', '隐私政策', '服务条款'].map((item, index) => (
                  <motion.li key={index} whileHover={{ x: 5 }}>
                    <a href="#" className="text-slate-400 hover:text-white transition-colors">{item}</a>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* 行动号召 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-slate-800 rounded-2xl p-6 mb-12 text-center"
          >
            <h3 className="text-xl md:text-2xl font-bold mb-4">准备好开始编程之旅了吗？</h3>
            <p className="text-slate-400 mb-6 max-w-2xl mx-auto px-4">
              立即注册橙浩编程，开启孩子的AI编程启蒙之旅，培养未来科技创新能力。
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 px-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openAuthModal('register')}
                className="w-full sm:w-auto px-6 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/30 font-medium transition-all"
              >
                免费注册
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-6 py-3 text-white bg-slate-700 hover:bg-slate-600 rounded-xl font-medium transition-all"
              >
                预约体验课
              </motion.button>
            </div>
          </motion.div>
          
          {/* 版权信息 */}
          <div className="pt-8 border-t border-slate-800 text-center text-slate-500 text-sm px-4">
            <p>© 2025 橙浩编程 版权所有 | 京ICP备XXXXXXXX号-1</p>
            <p className="mt-2">本网站仅用于展示，所有内容均为示例</p>
          </div>
        </div>
      </footer>
    );
  }