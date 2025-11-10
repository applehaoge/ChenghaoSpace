import { motion } from 'framer-motion';
import {
  Home,
  Folder,
  Settings,
  HelpCircle,
  FileText,
  Moon,
  Sun,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface KidsCodingEditorHeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
}

const ACTION_BUTTONS = [
  { label: '新的作品' },
  { label: '保存' },
  { label: '分享' },
  { label: '登录' },
];

const NAV_ITEMS = [
  { icon: <Home size={20} />, label: '首页' },
  { icon: <Folder size={20} />, label: '文件' },
  { icon: <Settings size={20} />, label: '设置' },
  { icon: <HelpCircle size={20} />, label: '帮助' },
  { icon: <FileText size={20} />, label: '文档' },
];

export function KidsCodingEditorHeader({ isDark, toggleTheme }: KidsCodingEditorHeaderProps) {
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`flex items-center justify-between h-16 px-4 shadow-xl ${
        isDark ? 'bg-gray-800' : 'bg-gradient-to-r from-blue-500 via-blue-400 to-indigo-500'
      } rounded-b-3xl`}
    >
      <div className="flex items-center space-x-4">
        <nav className="flex items-center space-x-1">
          {NAV_ITEMS.map(item => (
            <motion.button
              key={item.label}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              className={`p-2.5 rounded-full transition-colors duration-300 ${
                isDark ? 'hover:bg-gray-700 text-white' : 'hover:bg-blue-300/80 text-white'
              }`}
              title={item.label}
            >
              {item.icon}
            </motion.button>
          ))}
        </nav>
      </div>

      <div className="flex space-x-2">
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          className={`px-5 py-1.5 rounded-full text-sm font-medium shadow-lg transition-all duration-300 ${
            isDark ? 'bg-blue-600/30 text-blue-200 hover:bg-blue-600/50' : 'bg-white/90 text-blue-700 hover:bg-white'
          }`}
          onClick={() => navigate('/')}
        >
          回橙浩空间（AI对话）
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          className={`px-5 py-1.5 rounded-full text-sm font-medium shadow-lg transition-all duration-300 ${
            isDark ? 'bg-blue-500 text-white hover:bg-blue-400' : 'bg-blue-600 text-white hover:bg-blue-500'
          }`}
          onClick={() => navigate('/kids-coding')}
        >
          橙浩编程首页
        </motion.button>
      </div>

      <div className="flex items-center space-x-3">
        <motion.button
          whileHover={{ rotate: 15 }}
          className={`p-2.5 rounded-full ${
            isDark ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-white/30 text-white hover:bg-white/50'
          } transition-colors duration-300 shadow-lg`}
          onClick={toggleTheme}
          title={isDark ? '切换到亮色模式' : '切换到暗色模式'}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </motion.button>

        {ACTION_BUTTONS.map(button => (
          <motion.button
            key={button.label}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 shadow-lg ${
              isDark ? 'bg-blue-600/30 text-blue-300 hover:bg-blue-600/50' : 'bg-white/80 text-blue-700 hover:bg-white'
            }`}
          >
            {button.label}
          </motion.button>
        ))}
      </div>
    </motion.header>
  );
}
