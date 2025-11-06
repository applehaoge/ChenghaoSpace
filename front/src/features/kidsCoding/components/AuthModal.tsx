import { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { KidsCodingAuthContext } from '@/features/kidsCoding/contexts/authContext';

export interface AuthModalProps {
  mode: 'login' | 'register';
  onClose: () => void;
  onToggleMode: () => void;
}

export function AuthModal({ mode, onClose, onToggleMode }: AuthModalProps) {
  const { setIsAuthenticated, setUserInfo } = useContext(KidsCodingAuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password) {
      toast.error('请填写完整的邮箱和密码');
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      toast.error('两次输入的密码不一致');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      const randomId = Math.floor(Math.random() * 1000);
      setUserInfo({
        id: `user_${randomId}`,
        name: email.split('@')[0] ?? '学员',
        email,
        avatar: `https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=cartoon%20avatar%20for%20user%20${randomId}`,
      });
      setIsAuthenticated(true);
      toast.success(mode === 'login' ? '登录成功' : '注册成功');
      onClose();
      setIsSubmitting(false);
    }, 800);
  };

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <motion.div
        initial={{ scale: 0.95, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 16 }}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900"
        onClick={event => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
          <h2 className="text-xl font-semibold">{mode === 'login' ? '登录账户' : '注册账户'}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
            aria-label="关闭"
          >
            <i className="fa-solid fa-times" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">邮箱</label>
            <input
              value={email}
              onChange={event => setEmail(event.target.value)}
              type="email"
              placeholder="请输入您的邮箱"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">密码</label>
            <input
              value={password}
              onChange={event => setPassword(event.target.value)}
              type="password"
              placeholder="请输入密码"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {mode === 'register' ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">确认密码</label>
              <input
                value={confirmPassword}
                onChange={event => setConfirmPassword(event.target.value)}
                type="password"
                placeholder="请再次输入密码"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 w-full rounded-xl bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? '处理中…' : mode === 'login' ? '登录' : '注册'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>{mode === 'login' ? '还没有账户？' : '已经拥有账户？'}</span>
          <button type="button" onClick={onToggleMode} className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
            {mode === 'login' ? '立即注册' : '去登录'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

