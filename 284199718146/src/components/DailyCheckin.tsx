import React, { useState } from 'react';
  import { motion } from 'framer-motion';
  import { toast } from 'sonner';
  import { useContext } from 'react';
  import { AuthContext } from '../contexts/authContext';
  
  export default function DailyCheckin() {
    const [hasCheckedIn, setHasCheckedIn] = useState(false);
    const { isAuthenticated } = useContext(AuthContext);
    
    // 随机生成每日编程运势
    const getDailyFortune = () => {
      const fortunes = [
        "今天你的代码将如同魔法般运行顺畅！",
        "编程灵感将如泉水般涌现，大胆尝试新方法吧！",
        "遇到问题不要怕，AI助手将助你一臂之力！",
        "今天适合复习基础，巩固知识大厦的根基。",
        "团队协作会给你带来意想不到的收获！",
        "尝试解决一个有挑战性的问题，你会发现自己的潜力！",
        "休息一下，放松的大脑能想出更好的解决方案。",
        "分享你的代码，与他人交流能获得新的见解。"
      ];
      
      return fortunes[Math.floor(Math.random() * fortunes.length)];
    };
    
    // 打卡功能
    const handleCheckIn = () => {
      if (!isAuthenticated) {
        toast('请先登录后再打卡');
        return;
      }
      
      if (hasCheckedIn) {
        toast('今天已经打卡过了哦！');
        return;
      }
      
      setHasCheckedIn(true);
      toast('打卡成功！获得10个金币奖励！');
    };
    
    // 随机生成连续打卡天数
  // 可以从配置或状态管理中获取，这里使用模拟数据
  const streakDays = Math.floor(Math.random() * 30) + 1;
    
    return (
      <section className="py-12 md:py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 md:p-8 shadow-xl border border-white/20 w-full">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-8 w-full">
                  {/* 左侧：每日运势 */}
                  <div className="w-full md:w-1/2 px-4">
                    <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center md:text-left">今日编程运势</h2>
                    
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="bg-white/20 rounded-2xl p-6 mb-6"
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 rounded-full bg-yellow-400/30 flex items-center justify-center mr-4">
                          <i className="fa-solid fa-star text-yellow-300 text-xl"></i>
                        </div>
                        <span className="font-semibold text-lg">你的今日运势</span>
                      </div>
                      <p className="text-white/90 text-lg italic">{getDailyFortune()}</p>
                    </motion.div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/20 rounded-2xl p-4 text-center">
                        <p className="text-sm text-white/80 mb-1">连续打卡</p>
                        <p className="text-2xl font-bold">{streakDays}天</p>
                      </div>
                      <div className="bg-white/20 rounded-2xl p-4 text-center">
                        <p className="text-sm text-white/80 mb-1">已获得金币</p>
                        <p className="text-2xl font-bold">{streakDays * 10}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* 右侧：打卡功能 */}
                  <div className="md:w-1/2 w-full flex flex-col items-center">
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      viewport={{ once: true }}
                      className="relative"
                    >
                      {/* 装饰圆环 - 移动端调整大小 */}
                      <svg className="w-48 h-48 md:w-64 md:h-64 mx-auto" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="rgba(255,255,255,0.2)"
                          strokeWidth="8"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#4ade80"
                          strokeWidth="8"
                          strokeDasharray={`${(streakDays / 30) * 283} 283`}
                          strokeDashoffset="0"
                          strokeLinecap="round"
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                      
                      {/* 打卡按钮 - 移动端调整大小 */}
                      <button 
                        onClick={handleCheckIn}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-28 h-28 md:w-32 md:h-32 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex flex-col items-center justify-center transition-all border border-white/30"
                        aria-label={hasCheckedIn ? "今日已打卡" : "点击打卡"}
                      >
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-blue-500 flex items-center justify-center mb-2">
                          {hasCheckedIn ? (
                            <i className="fa-solid fa-check text-white text-2xl"></i>
                          ) : (
                            <i className="fa-solid fa-calendar-check text-white text-2xl"></i>
                          )}
                        </div>
                        <span className="font-bold">{hasCheckedIn ? '已打卡' : '立即打卡'}</span>
                      </button>
                    </motion.div>
                    
                    {/* 打卡奖励 */}
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      viewport={{ once: true }}
                      className="mt-6 text-center"
                    >
                      <p className="text-white/80">每日打卡可获得 <span className="font-bold text-yellow-300">10金币</span> 奖励</p>
                    </motion.div>
                  </div>
                </div>
            </div></motion.div>
        </div>
      </section>
    );
  }