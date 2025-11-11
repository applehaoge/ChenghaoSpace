import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Minus, Palette, Play, Plus as PlusIcon, Search, Terminal, Trash2 } from 'lucide-react';
import { CodeEditor } from '@/features/kidsCoding/components/editor/CodeEditor';

interface ConsoleLine {
  id: string;
  text: string;
}

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
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const consoleTimestamp = useMemo(() => new Date().toLocaleTimeString(), [codeValue]);
  const consoleLines: ConsoleLine[] = [
    { id: 'system', text: 'Python 3.11.0 (kids-sandbox) ready' },
    { id: 'prompt', text: `>>> Waiting to run main.py · ${consoleTimestamp}` },
    { id: 'hint', text: 'Use "Run Code" to see the latest output here.' },
  ];
  const consoleOutput = consoleLines.map(line => line.text).join('\n\n');

  const toggleConsole = () => setIsConsoleOpen(prev => !prev);
  const toolbarActions = [
    { icon: <Search size={18} />, label: '搜索' },
    { icon: <Palette size={18} />, label: '主题' },
    {
      icon: <Terminal size={18} />,
      label: isConsoleOpen ? '收起控制台' : '终端',
      onClick: toggleConsole,
      active: isConsoleOpen,
    },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className={clsx('flex-1 min-w-0 flex flex-col overflow-hidden shadow-xl relative rounded-3xl', {
        'bg-gray-900': isDark,
        'bg-white': !isDark,
      })}
    >
      <div
        className={clsx('flex items-center px-4 rounded-t-3xl', {
          'bg-gray-800': isDark,
          'bg-blue-50/70': !isDark,
        })}
      >
        <motion.div
          className={clsx('flex items-center space-x-2 border border-b-transparent px-3 py-2 shadow-md rounded-t-2xl', {
            'bg-gray-900 border-gray-700': isDark,
            'bg-white border-blue-200': !isDark,
          })}
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

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <div className="flex-1 flex overflow-hidden relative">
          <div
            className={clsx('flex-1 h-full overflow-hidden shadow-inner border border-t-0', {
              'border-gray-800/70 bg-gray-900': isDark,
              'border-blue-100 bg-white': !isDark,
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

        <AnimatePresence initial={false}>
          {isConsoleOpen && (
            <motion.div
              key="code-console"
              initial={{ opacity: 0, y: 24, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: 24, height: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={clsx(
                'border-t overflow-hidden rounded-t-3xl shadow-2xl shadow-black/20',
                isDark
                  ? 'bg-gradient-to-b from-gray-900/95 via-gray-900 to-gray-950/95 border-gray-800 text-emerald-100'
                  : 'bg-gradient-to-b from-white via-blue-50 to-blue-100/80 border-blue-100 text-slate-700',
              )}
            >
              <div className="px-5 pt-4 pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1.5">
                      {['bg-red-500/80', 'bg-amber-400/80', 'bg-emerald-400/80'].map(color => (
                        <span
                          key={color}
                          className={clsx(
                            'h-2.5 w-2.5 rounded-full shadow-sm',
                            color,
                            isDark ? 'shadow-black/30' : 'shadow-white/40',
                          )}
                        />
                      ))}
                    </div>
                    <div className="text-[11px] uppercase tracking-[0.25em] font-semibold opacity-75">Console</div>
                    <span
                      className={clsx(
                        'inline-flex items-center text-[11px] font-medium tracking-wide rounded-full px-2 py-0.5',
                        isDark ? 'bg-emerald-500/10 text-emerald-200' : 'bg-emerald-100 text-emerald-600',
                      )}
                    >
                      Ready
                    </span>
                  </div>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={toggleConsole}
                    className={clsx(
                      'text-[11px] rounded-full px-3 py-1 transition-colors border',
                      isDark
                        ? 'border-gray-700/70 bg-gray-800/80 text-blue-200 hover:bg-gray-700'
                        : 'border-blue-200 bg-white text-blue-700 hover:bg-blue-50',
                    )}
                  >
                    收起
                  </motion.button>
                </div>
              </div>
              <div
                className={clsx(
                  'font-mono text-[12px] px-0 pb-4 max-h-48 overflow-y-auto',
                  isDark ? 'bg-black/10' : 'bg-white/60',
                )}
              >
                <pre
                  className={clsx(
                    'w-full min-h-[120px] whitespace-pre-wrap px-5 py-4 leading-relaxed tracking-wide rounded-none border-0 m-0',
                    isDark ? 'bg-gray-950/80 text-emerald-200' : 'bg-white text-slate-700 shadow-inner',
                  )}
                >
                  {consoleOutput}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
          {toolbarActions.map(action => (
            <BottomIconButton
              key={action.label}
              isDark={isDark}
              icon={action.icon}
              title={action.label}
              onClick={action.onClick}
              active={action.active}
            />
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
  active?: boolean;
}

function BottomIconButton({ isDark, icon, onClick, title, active = false }: BottomIconButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={clsx('p-1.5 border rounded-full transition-all duration-300 shadow-md', {
        'border-gray-700 bg-gray-900 hover:bg-gray-700': isDark && !active,
        'border-blue-200 bg-white hover:bg-blue-100': !isDark && !active,
        'border-blue-500/70 bg-blue-900/40 text-blue-200': isDark && active,
        'border-blue-400 bg-blue-100 text-blue-700': !isDark && active,
      })}
      onClick={onClick}
      title={title}
    >
      {icon}
    </motion.button>
  );
}
