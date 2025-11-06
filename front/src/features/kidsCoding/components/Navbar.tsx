import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { KidsCodingAuthContext } from '@/features/kidsCoding/contexts/authContext';
import { useKidsCodingTheme } from '@/features/kidsCoding/hooks/useTheme';
import { UserProfileModal } from '@/features/kidsCoding/components/UserProfileModal';

export interface NavbarProps {
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

const NAV_LINKS = [
  { label: '首页', href: '#hero' },
  { label: '学习中心', href: '/kids-coding/editor', highlight: true },
  { label: '课程', href: '#courses' },
  { label: '功能特色', href: '#features' },
  { label: '家长指南', href: '#parents' },
  { label: '价格方案', href: '#pricing' },
] as const;

export function Navbar({ onOpenAuthModal }: NavbarProps) {
  const { theme, toggleTheme } = useKidsCodingTheme();
  const { isAuthenticated, userInfo, logout } = useContext(KidsCodingAuthContext);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = useNavigate();

  const handleNavClick = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: 'smooth' });
    } else if (href.startsWith('/')) {
      navigate(href);
    } else {
      window.open(href, '_blank', 'noopener,noreferrer');
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/90">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 text-xl font-bold text-white">
            橙
          </div>
          <span className="text-xl font-bold text-slate-900 dark:text-white">橙浩编程</span>
        </motion.div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 md:hidden"
          onClick={() => setMobileMenuOpen(prev => !prev)}
          aria-label="切换导航菜单"
        >
          <i className="fa-solid fa-bars" />
        </button>

        <div className="hidden items-center gap-2 md:flex">
          <div className="flex items-center gap-2">
            {NAV_LINKS.map(link => (
              <button
                key={link.label}
                type="button"
                onClick={() => handleNavClick(link.href)}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  link.highlight
                    ? 'text-blue-600 hover:text-blue-500'
                    : 'text-slate-600 hover:text-blue-500 dark:text-slate-300 dark:hover:text-blue-400'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
            aria-label="切换主题"
          >
            <i className={`fa-solid ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`} />
          </button>

          {!isAuthenticated ? (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => onOpenAuthModal('login')}
                className="rounded-xl px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
              >
                登录
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => onOpenAuthModal('register')}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-700"
              >
                免费注册
              </motion.button>
            </>
          ) : (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className="flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1 transition hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                <img
                  src={userInfo?.avatar}
                  alt={userInfo?.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{userInfo?.name}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-slate-200 bg-white px-4 pb-4 dark:border-slate-800 dark:bg-slate-900 md:hidden">
          <div className="flex flex-col gap-2">
            {NAV_LINKS.map(link => (
              <button
                key={link.label}
                type="button"
                onClick={() => handleNavClick(link.href)}
                className={`rounded-lg px-4 py-3 text-left text-sm font-medium ${
                  link.highlight
                    ? 'text-blue-600'
                    : 'text-slate-700 hover:bg-blue-50 dark:text-slate-200 dark:hover:bg-blue-900/30'
                }`}
              >
                {link.label}
              </button>
            ))}
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-lg px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              切换主题
            </button>
            {!isAuthenticated ? (
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onOpenAuthModal('login');
                    setMobileMenuOpen(false);
                  }}
                  className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50 dark:bg-slate-800 dark:text-blue-300"
                >
                  登录
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenAuthModal('register');
                    setMobileMenuOpen(false);
                  }}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  免费注册
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center gap-3 rounded-lg bg-slate-100 px-4 py-3 transition hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  <img src={userInfo?.avatar} alt={userInfo?.name} className="h-10 w-10 rounded-full" />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{userInfo?.name}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{userInfo?.email}</span>
                  </div>
                </button>
                <Link
                  to="/"
                  className="rounded-lg px-4 py-2 text-center text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  返回工作台
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    toast.success('已退出登录');
                  }}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  退出登录
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}

      {showProfileModal ? <UserProfileModal onClose={() => setShowProfileModal(false)} /> : null}
    </nav>
  );
}
