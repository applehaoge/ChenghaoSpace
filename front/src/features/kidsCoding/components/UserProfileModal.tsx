import { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { KidsCodingAuthContext } from '@/features/kidsCoding/contexts/authContext';

export interface UserProfileModalProps {
  onClose: () => void;
}

export function UserProfileModal({ onClose }: UserProfileModalProps) {
  const { userInfo, setUserInfo, logout } = useContext(KidsCodingAuthContext);
  const [name, setName] = useState(userInfo?.name ?? '');
  const [isUploading, setIsUploading] = useState(false);

  const handleSave = () => {
    if (!name.trim() || !userInfo) return;
    setUserInfo({ ...userInfo, name: name.trim() });
    toast.success('用户名已更新');
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('请上传图片文件');
      return;
    }
    setIsUploading(true);
    setTimeout(() => {
      if (userInfo) {
        const randomId = Math.floor(Math.random() * 10000);
        const nextAvatar = `https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=cartoon%20avatar%20for%20user%20${randomId}`;
        setUserInfo({ ...userInfo, avatar: nextAvatar });
        toast.success('头像更新成功');
      }
      setIsUploading(false);
    }, 1200);
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
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">个人资料</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
            aria-label="关闭"
          >
            <i className="fa-solid fa-times" />
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-blue-100 shadow-lg dark:border-blue-900/40">
              {isUploading ? (
                <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800">
                  <i className="fa-solid fa-spinner fa-spin text-blue-500" />
                </div>
              ) : (
                <img src={userInfo?.avatar} alt={userInfo?.name} className="h-full w-full object-cover" />
              )}
            </div>
            <label className="absolute -right-2 -bottom-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-blue-600 text-white shadow-lg transition hover:bg-blue-700">
              <i className="fa-solid fa-camera" />
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploading} />
            </label>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">点击图标可自定义头像</p>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">用户名</label>
            <div className="flex gap-2">
              <input
                value={name}
                onChange={event => setName(event.target.value)}
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                placeholder="请输入用户名"
              />
              <button
                type="button"
                onClick={handleSave}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                保存
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">邮箱</label>
            <div className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {userInfo?.email ?? '未设置'}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            关闭
          </button>
          <button
            type="button"
            onClick={() => {
              logout();
              onClose();
              toast.success('已退出登录');
            }}
            className="flex-1 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
          >
            退出登录
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

