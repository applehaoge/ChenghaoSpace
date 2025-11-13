import { motion } from 'framer-motion';
import { Clock, FileText, Trash2 } from 'lucide-react';
import type { FileEntry } from '@/features/kidsCoding/types/editor';

interface FileListPanelProps {
  isDark: boolean;
  files: FileEntry[];
}

export function FileListPanel({ isDark, files }: FileListPanelProps) {
  if (!files.length) {
    return (
      <div className="flex flex-col items-center justify-center mt-12 space-y-3">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}>
          <Clock size={36} className={isDark ? 'text-gray-600' : 'text-blue-200'} />
        </motion.div>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-blue-300'}`}>点击上方 “+” 按钮创建新文件</p>
      </div>
    );
  }

  return (
    <>
      {files.map(file => (
        <motion.div
          key={file.id}
          whileHover={{ x: 3 }}
          className={`flex items-center justify-between p-2.5 rounded-2xl mb-2 cursor-pointer transition-colors duration-300 ${
            isDark
              ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 hover:from-blue-600/30 hover:to-indigo-600/30'
              : 'bg-gradient-to-r from-blue-100 to-indigo-50 hover:from-blue-200 hover:to-indigo-100'
          } shadow-lg`}
        >
          <div className="flex items-center space-x-2">
            <FileText size={16} className={isDark ? 'text-blue-400' : 'text-blue-800'} />
            <span className={isDark ? 'text-blue-300 font-medium' : 'text-blue-800 font-medium'}>{file.name}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-0.5 rounded-full hover:bg-red-500/20 hover:text-red-500 transition-colors duration-300"
          >
            <Trash2 size={14} />
          </motion.button>
        </motion.div>
      ))}
    </>
  );
}
