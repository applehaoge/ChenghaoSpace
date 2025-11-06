import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { AuthContext } from '../contexts/authContext';

interface UserProfileModalProps {
  onClose: () => void;
}

export default function UserProfileModal({ onClose }: UserProfileModalProps) {
  const { userInfo, setUserInfo, logout } = useContext(AuthContext);
  const [newName, setNewName] = useState(userInfo?.name || '');
  const [isUploading, setIsUploading] = useState(false);
  const [tempAvatar, setTempAvatar] = useState<string | null>(null);

  // 处理用户名更新
  const handleNameUpdate = () => {
    if (!newName.trim() || newName === userInfo?.name) return;
    
    if (userInfo) {
      const updatedUserInfo = {
        ...userInfo,
        name: newName.trim()
      };
      setUserInfo(updatedUserInfo);
      toast('用户名更新成功！');
    }
  };

  // 处理头像上传
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      toast('请上传图片文件');
      return;
    }
    
    setIsUploading(true);
    
    // 模拟上传过程
    setTimeout(() => {
      // 生成随机ID用于新头像
      const randomId = Math.floor(Math.random() * 10000);
      const newAvatarUrl = `https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=cartoon%20avatar%20for%20user%20${randomId}`;
      
      setTempAvatar(newAvatarUrl);
      
      if (userInfo) {
        const updatedUserInfo = {
          ...userInfo,
          avatar: newAvatarUrl
        };
        setUserInfo(updatedUserInfo);
        toast('头像更新成功！');
      }
      
      setIsUploading(false);
    }, 1500);
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
            <h2 className="text-xl md:text-2xl font-bold">个人设置</h2>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="关闭"
            >
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
        </div>
        
        {/* 内容 */}
        <div className="p-4 md:p-6 space-y-6">
          {/* 头像设置 */}
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-blue-100 dark:border-blue-900/50 shadow-lg">
                {isUploading ? (
                  <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-800">
                    <i className="fa-solid fa-spinner fa-spin text-blue-500 text-2xl"></i>
                  </div>
                ) : (
                  <img 
                    src={tempAvatar || userInfo?.avatar} 
                    alt={userInfo?.name} 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-lg cursor-pointer transition-colors">
                <i className="fa-solid fa-camera"></i>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarChange}
                  disabled={isUploading}
                />
              </label>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">点击更换头像</p>
          </div>
          
          {/* 用户名设置 */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">用户名</label>
            <div className="flex gap-2">
              <input
                type="text"
                id="username"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
                placeholder="请输入用户名"
              />
              <button
                onClick={handleNameUpdate}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                保存
              </button>
            </div>
          </div>
          
          {/* 邮箱信息 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">邮箱</label>
            <div className="px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm">
              {userInfo?.email || '未设置'}
            </div>
          </div>
          
          {/* 分割线 */}
          <div className="border-t border-slate-200 dark:border-slate-800 my-4"></div>
          
          {/* 退出登录按钮 */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={logout}
            className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-400 rounded-lg font-medium transition-all flex items-center justify-center"
          >
            <i className="fa-solid fa-sign-out-alt mr-2"></i>
            退出登录
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}