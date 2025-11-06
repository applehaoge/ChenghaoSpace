import React, { useState, useContext } from 'react';
  import { motion } from 'framer-motion';
  import { toast } from 'sonner';
  import { AuthContext } from '../contexts/authContext';
  
  interface AuthModalProps {
    mode: 'login' | 'register';
    onClose: () => void;
    toggleMode: () => void;
  }
  
  export default function AuthModal({ mode, onClose, toggleMode }: AuthModalProps) {
    const { setIsAuthenticated, setUserInfo } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
  
    // 处理登录或注册
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // 简单验证
      if (!email || !password) {
        toast('请填写所有必填字段');
        return;
      }
      
      if (mode === 'register' && password !== confirmPassword) {
        toast('两次输入的密码不一致');
        return;
      }
      
      setIsSubmitting(true);
      
      // 模拟API请求
      setTimeout(() => {
        // 设置用户信息，包括随机头像
        const randomId = Math.floor(Math.random() * 1000);
        setUserInfo({
          id: `user_${randomId}`,
          name: email.split('@')[0],
          email: email,
          avatar: `https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=cartoon%20avatar%20for%20user%20${randomId}`
        });
        
        setIsAuthenticated(true);
        toast(mode === 'login' ? '登录成功！' : '注册成功！');
        onClose();
        setIsSubmitting(false);
      }, 1000);
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
          className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md mx-auto overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          style={{ maxHeight: '90vh', overflowY: 'auto' }}
        >
          {/* 头部 */}
          <div className="p-4 md:p-6 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-bold">{mode === 'login' ? '登录' : '注册'}</h2>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                aria-label="关闭"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
          </div>
          
          {/* 表单 */}
          <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-5">
            <div className="space-y-3">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">邮箱</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入您的邮箱"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                  required
                /></div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">密码</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入您的密码"
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                  required
                />
              </div>
              
              {mode === 'register' && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">确认密码</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="请再次输入密码"
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                    required
                  />
                </div>
              )}
              
              {mode === 'login' && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">记住我</span>
                  </label>
                  <a href="#" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">忘记密码？</a>
                </div>
              )}
            </div>
            
            {/* 提交按钮 */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin mr-2"></i>
                  处理中...
                </>
              ) : (
                mode === 'login' ? '登录' : '注册'
              )}
            </button>
            
            {/* 切换模式 */}
            <div className="text-center">
              <span className="text-slate-600 dark:text-slate-400 text-sm">
                {mode === 'login' ? '还没有账号？' : '已有账号？'}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="ml-1 text-blue-600 dark:text-blue-400 font-medium hover:underline"
                >
                  {mode === 'login' ? '立即注册' : '立即登录'}
                </button>
              </span>
            </div>
          </form>
          
          {/* 其他登录方式 */}
          <div className="px-4 md:px-6 pb-4 md:pb-6">
            <div className="relative flex items-center justify-center my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <div className="relative px-4 bg-white dark:bg-slate-900 text-slate-500 text-sm">
                或使用其他方式登录
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {['google', 'apple', 'weixin'].map((provider, index) => (
                <motion.button
                  key={index}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full h-11 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center justify-center bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  aria-label={`使用${provider === 'google' ? '谷歌' : provider === 'apple' ? '苹果' : '微信'}登录`}
                >
                  <i className={`fa-brands fa-${provider} text-lg`}></i>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  }