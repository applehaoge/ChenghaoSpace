import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { useContext } from 'react';
import { AuthContext } from '../contexts/authContext';
import UserProfileModal from './UserProfileModal';

interface NavbarProps {
  openAuthModal: (mode: 'login' | 'register') => void;
}

export default function Navbar({ openAuthModal }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, userInfo, logout } = useContext(AuthContext);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // 导航链接
  const navLinks = [
    { title: '首页', href: '/' },
    { title: '学习中心', href: '/editor', isHighlighted: true },
    { title: '课程', href: '#courses' },
    { title: '功能特色', href: '#features' },
    { title: '家长指南', href: '#parents' },
    { title: '价格', href: '#pricing' },
  ];

  // 打开个人资料模态框
  const openProfileModal = () => {
    setShowProfileModal(true);
  };

  // 关闭个人资料模态框
  const closeProfileModal = () => {
    setShowProfileModal(false);
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center space-x-2"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">橙</span>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">橙浩编程</span>
        </motion.div>

         {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8 overflow-x-auto py-2">
          {navLinks.map((link, index) => (
            <motion.a
              key={index}
              href={link.href}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className={`font-medium transition-all whitespace-nowrap ${
                  link.isHighlighted
                    ? 'text-blue-600 dark:text-blue-400 px-4 py-2 font-semibold'
                    : 'text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 px-4 py-2'
                }`}
            >
              {link.title}
            </motion.a>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleTheme()}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
          >
            {theme === 'light' ? (
              <i className="fa-solid fa-moon"></i>
            ) : (
              <i className="fa-solid fa-sun"></i>
            )}
          </motion.button>

          {!isAuthenticated ? (
            <>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
              >
                登录
              </motion.button>
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => openAuthModal('register')}
                className="px-4 py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-500/20 transition-colors"
              >
                免费注册
              </motion.button>
            </>
          ) : (
            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <button 
                onClick={openProfileModal}
                className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-200 dark:border-blue-800 shadow-md hover:shadow-lg transition-all"
                title="点击查看个人资料"
              >
                {userInfo?.avatar ? (
                  <img 
                    src={userInfo.avatar} 
                    alt={userInfo.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium">
                    {userInfo?.name.charAt(0).toUpperCase() || '?'}
                  </div>
                )}
              </button>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </motion.div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden w-10 h-10 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800"
        >
          <i className={`fa-solid ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </motion.button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800"
        >
          <div className="container mx-auto px-4 py-3 flex flex-col space-y-3">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className={`font-medium py-2 transition-all ${
                  link.isHighlighted
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-600 dark:text-blue-400 rounded-lg shadow-md font-semibold flex items-center px-4'
                    : 'text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 px-4'
                }`}
              >
                {link.isHighlighted && (
                  <i className="fa-solid fa-code mr-2"></i>
                )}
                {link.title}
              </a>
            ))}
            
            <div className="pt-2 flex flex-col space-y-3">
              <button
                onClick={() => toggleTheme()}
                className="w-full py-2 font-medium text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors flex items-center justify-center"
              >
                {theme === 'light' ? (
                  <><i className="fa-solid fa-moon mr-2"></i> 切换到暗色模式</>
                ) : (
                  <><i className="fa-solid fa-sun mr-2"></i> 切换到亮色模式</>
                )}
              </button>
              
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={() => {
                      openAuthModal('login');
                      setIsMenuOpen(false);
                    }}
                    className="w-full py-2 font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                  >
                    登录
                  </button>
                  <button
                    onClick={() => {
                      openAuthModal('register');
                      setIsMenuOpen(false);
                    }}
                    className="w-full py-2 font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-lg shadow-blue-500/20 transition-colors"
                  >
                    免费注册
                  </button>
                </>
               ) : (
                <>
                  <button
                    onClick={() => {
                      openProfileModal();
                      setIsMenuOpen(false);
                    }}
                    className="w-full py-2 font-medium flex items-center justify-center space-x-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    {userInfo?.avatar ? (
                      <img 
                        src={userInfo.avatar} 
                        alt={userInfo.name} 
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-medium">
                        {userInfo?.name.charAt(0).toUpperCase() || '?'}
                      </div>
                    )}
                    <span>{userInfo?.name || '用户'}</span>
                    <span className="ml-auto">个人设置</span>
                  </button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full py-2 font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors flex items-center justify-center"
                  >
                  <i className="fa-solid fa-right-from-bracket mr-2"></i>
                    退出登录
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* 用户个人资料模态框 */}
      {showProfileModal && (
        <UserProfileModal onClose={closeProfileModal} />
      )}
    </nav>
  );
}