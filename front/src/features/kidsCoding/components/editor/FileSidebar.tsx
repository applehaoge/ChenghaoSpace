import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Clock, Download, FileText, Folder, Plus, Trash2, Upload } from 'lucide-react';
import { FILE_PANEL_COLLAPSED_WIDTH, FILE_PANEL_WIDTH } from '@/features/kidsCoding/constants/editorLayout';
import type { FileEntry } from '@/features/kidsCoding/types/editor';

interface FileSidebarProps {
  isDark: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
  files: FileEntry[];
}

export function FileSidebar({ isDark, isCollapsed, onToggle, files }: FileSidebarProps) {
  return (
    <motion.div
      initial={false}
      animate={{
        opacity: isCollapsed ? 0.85 : 1,
        scale: isCollapsed ? 0.98 : 1,
      }}
      transition={{ duration: 0.4 }}
      className={`relative flex flex-col border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white/90 border-blue-200'
      } backdrop-blur-sm shadow-xl rounded-3xl overflow-hidden`}
      style={{ width: isCollapsed ? FILE_PANEL_COLLAPSED_WIDTH : FILE_PANEL_WIDTH }}
    >
      <CollapseHandle isDark={isDark} isCollapsed={isCollapsed} onToggle={onToggle} />

      <div
        className={`flex flex-1 flex-col transition-all duration-300 ${
          isCollapsed ? 'pointer-events-none opacity-0 h-0 overflow-hidden' : 'opacity-100'
        }`}
        aria-hidden={isCollapsed}
      >
        <div
          className={`p-3 flex justify-between items-center border-b ${
            isDark ? 'border-gray-700' : 'border-blue-200'
          }`}
        >
          <div className="flex space-x-2">
            <SidebarIconButton isDark={isDark} icon={<FileText size={16} />} />
            <SidebarIconButton isDark={isDark} icon={<Folder size={16} />} />
          </div>
          <div className="flex space-x-2">
            <SidebarIconButton isDark={isDark} icon={<Plus size={16} />} motionButton />
            <SidebarIconButton isDark={isDark} icon={<Upload size={16} />} motionButton />
            <SidebarIconButton isDark={isDark} icon={<Download size={16} />} motionButton />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
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
                <span className={isDark ? 'text-blue-300 font-medium' : 'text-blue-800 font-medium'}>
                  {file.name}
                </span>
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

          {!files.length && (
            <div className="flex flex-col items-center justify-center mt-12 space-y-3">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}>
                <Clock size={36} className={isDark ? 'text-gray-600' : 'text-blue-200'} />
              </motion.div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-blue-300'}`}>点击上方 “+” 按钮创建新文件</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function CollapseHandle({
  isDark,
  isCollapsed,
  onToggle,
}: {
  isDark: boolean;
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  const buttonColors = isDark
    ? 'bg-gray-900/85 text-blue-200 border-blue-500/30 hover:bg-gray-800'
    : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50';

  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        aria-label={isCollapsed ? '展开文件面板' : '收起文件面板'}
        aria-expanded={!isCollapsed}
        className={`absolute top-1/2 ${isCollapsed ? '-right-3' : '-right-5'} flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border shadow-lg transition-colors ${buttonColors}`}
      >
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full ${
            isDark ? 'bg-blue-800/40' : 'bg-blue-100'
          }`}
        >
          {isCollapsed ? <ArrowRight size={15} strokeWidth={2.5} /> : <ArrowLeft size={15} strokeWidth={2.5} />}
        </span>
      </button>
      <div
        className={`absolute inset-y-5 -right-0.5 w-px rounded-full transition-opacity duration-200 ${
          isDark ? 'bg-blue-400/60' : 'bg-blue-500/60'
        } ${isCollapsed ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />
    </>
  );
}

interface SidebarIconButtonProps {
  isDark: boolean;
  icon: ReactNode;
  motionButton?: boolean;
}

function SidebarIconButton({ isDark, icon, motionButton = false }: SidebarIconButtonProps) {
  const baseClasses = `p-1.5 rounded-full transition-colors duration-300 ${
    isDark ? 'hover:bg-gray-700' : 'hover:bg-blue-100'
  }`;

  if (motionButton) {
    return (
      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={baseClasses}>
        {icon}
      </motion.button>
    );
  }

  return <button className={baseClasses}>{icon}</button>;
}
