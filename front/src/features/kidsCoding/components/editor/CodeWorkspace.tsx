import clsx from 'clsx';
import { motion } from 'framer-motion';
import { FileText, Minus, Palette, Play, Plus as PlusIcon, Search, Terminal, Trash2 } from 'lucide-react';
import { CodeEditor } from '@/features/kidsCoding/components/editor/CodeEditor';

interface CodeWorkspaceProps {
  isDark: boolean;
  zoomLevel: number;
  codeValue: string;
  onCodeChange: (value: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRunCode: (code: string) => void;
  editorTheme: string;
}

export function CodeWorkspace({
  isDark,
  zoomLevel,
  codeValue,
  onCodeChange,
  onZoomIn,
  onZoomOut,
  onRunCode,
  editorTheme,
}: CodeWorkspaceProps) {
  const editorFontSize = Math.max(12, Math.round((zoomLevel / 100) * 16));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className={clsx('flex-1 flex flex-col overflow-hidden shadow-xl rounded-3xl relative', {
        'bg-gray-900': isDark,
        'bg-white': !isDark,
      })}
    >
      <div
        className={clsx('flex items-center border-b px-4 rounded-t-3xl', {
          'border-gray-700 bg-gray-800': isDark,
          'border-blue-100 bg-blue-50/70': !isDark,
        })}
      >
        <motion.div
          whileHover={{ y: -1 }}
          className={clsx(
            'flex items-center space-x-2 border border-b-transparent rounded-t-2xl px-3 py-2 -mb-px shadow-md',
            {
              'bg-gray-900 border-gray-700': isDark,
              'bg-white border-blue-200': !isDark,
            },
          )}
        >
          <FileText size={16} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
          <span className={isDark ? 'text-blue-300 font-medium' : 'text-blue-800 font-medium'}>main.py</span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-0.5 rounded-full hover:bg-red-500/20 hover:text-red-500 transition-colors duration-300"
          >
            <Trash2 size={14} />
          </motion.button>
        </motion.div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <div
          className={clsx('flex-1 relative px-4 py-4 pr-16 md:pr-20', {
            'bg-gray-900': isDark,
            'bg-white': !isDark,
          })}
        >
          <div
            className={clsx('h-full rounded-2xl overflow-hidden shadow-inner border', {
              'border-gray-800/70': isDark,
              'border-blue-100': !isDark,
            })}
          >
            <CodeEditor
              value={codeValue}
              onChange={onCodeChange}
              language="python"
              theme={editorTheme}
              fontSize={editorFontSize}
            />
          </div>
        </div>

        <div
          className={clsx('w-2.5 relative', {
            'bg-gray-800/50': isDark,
            'bg-blue-50/50': !isDark,
          })}
        >
          <motion.div
            className={clsx('absolute w-2 rounded-full top-4 h-20 shadow-lg', {
              'bg-gradient-to-b from-blue-500/80 to-indigo-500/80': isDark,
              'bg-gradient-to-b from-blue-400 to-indigo-300': !isDark,
            })}
            whileHover={{ scale: 1.2 }}
          />
        </div>
      </div>

      <div
        className={clsx('flex items-center justify-between h-14 px-4 border-t rounded-b-3xl', {
          'bg-gray-800 border-gray-700': isDark,
          'bg-blue-50/70 border-blue-100': !isDark,
        })}
      >
        <div className="flex items-center space-x-2">
          <BottomIconButton isDark={isDark} icon={<Minus size={16} />} onClick={onZoomOut} />
          <motion.span
            whileHover={{ scale: 1.05 }}
            className={clsx('w-12 text-center text-sm font-medium rounded-full py-1 shadow-md', {
              'text-gray-300 bg-gray-900': isDark,
              'text-gray-600 bg-white': !isDark,
            })}
          >
            {zoomLevel}%
          </motion.span>
          <BottomIconButton isDark={isDark} icon={<PlusIcon size={16} />} onClick={onZoomIn} />
        </div>

        <div className="flex items-center space-x-3">
          {[
            { icon: <Search size={18} />, label: '搜索' },
            { icon: <Palette size={18} />, label: '主题' },
            { icon: <Terminal size={18} />, label: '终端' },
          ].map(action => (
            <BottomIconButton key={action.label} isDark={isDark} icon={action.icon} title={action.label} />
          ))}
          <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.97 }}
          className={clsx(
            'px-6 py-2.5 rounded-full font-medium flex items-center space-x-2 shadow-xl transition-all duration-300 text-white',
            {
              'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500': isDark,
              'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600': !isDark,
            },
          )}
          onClick={() => onRunCode(codeValue)}
        >
          <motion.div whileHover={{ rotate: 15 }}>
            <Play size={18} />
          </motion.div>
          <span className="font-semibold">运行代码</span>
        </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

interface BottomIconButtonProps {
  isDark: boolean;
  icon: React.ReactNode;
  onClick?: () => void;
  title?: string;
}

function BottomIconButton({ isDark, icon, onClick, title }: BottomIconButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={clsx('p-1.5 border rounded-full transition-all duration-300 shadow-md', {
        'border-gray-700 bg-gray-900 hover:bg-gray-700': isDark,
        'border-blue-200 bg-white hover:bg-blue-100': !isDark,
      })}
      onClick={onClick}
      title={title}
    >
      {icon}
    </motion.button>
  );
}
