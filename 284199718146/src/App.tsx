import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CodeEditor from './pages/CodeEditor';
import { Empty } from './components/Empty';
import { AuthContext } from './contexts/authContext';
import AuthModal from './components/AuthModal';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // 从本地存储加载用户信息
  React.useEffect(() => {
    const savedUser = localStorage.getItem('userInfo');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUserInfo(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse user data', error);
      }
    }
  }, []);

  // 保存用户信息到本地存储
  React.useEffect(() => {
    if (userInfo) {
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    } else {
      localStorage.removeItem('userInfo');
    }
  }, [userInfo]);

  // 退出登录函数
  const logout = () => {
    setIsAuthenticated(false);
    setUserInfo(null);
    localStorage.removeItem('userInfo');
  };

  // 打开认证模态框
  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  // 关闭认证模态框
  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  // 切换认证模式（登录/注册）
  const toggleAuthMode = () => {
    setAuthMode(prev => prev === 'login' ? 'register' : 'login');
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      userInfo, 
      setIsAuthenticated, 
      setUserInfo, 
      logout 
    }}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 text-slate-800 dark:text-slate-100">
        <Navbar openAuthModal={openAuthModal} />
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<Home openAuthModal={openAuthModal} />} />
            <Route path="/editor" element={<CodeEditor />} />
          </Routes>
        </main>
        
        {/* 认证模态框 */}
        {showAuthModal && (
          <AuthModal 
            mode={authMode} 
            onClose={closeAuthModal} 
            toggleMode={toggleAuthMode}
          />
        )}
      </div>
    </AuthContext.Provider>
  );
}