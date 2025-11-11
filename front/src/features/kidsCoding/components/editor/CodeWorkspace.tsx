import { useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { FileText, Minus, Palette, Play, Plus as PlusIcon, Search, Terminal, Trash2 } from 'lucide-react';
import { CodeEditor } from '@/features/kidsCoding/components/editor/CodeEditor';
import { ResizableConsole } from '@/features/kidsCoding/components/editor/ResizableConsole';
import type { RunConsoleState } from '@/features/kidsCoding/hooks/useRunJob';

interface CodeWorkspaceProps {
  isDark: boolean;
  zoomLevel: number;
  codeValue: string;
  onCodeChange: (value: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onRunCode: (code: string) => void;
  editorTheme: string;
  runState?: RunConsoleState;
  isRunBusy?: boolean;
  onAskAssistant?: (payload: { text: string }) => void;
}

const DEFAULT_CONSOLE_HEIGHT = 220;

export function CodeWorkspace({
  isDark,
  zoomLevel,
  codeValue,
  onCodeChange,
  onZoomIn,
  onZoomOut,
  onRunCode,
  editorTheme,
  runState,
  isRunBusy,
  onAskAssistant,
}: CodeWorkspaceProps) {
  const safeRunState: RunConsoleState =
    runState ?? {
      status: 'idle',
      stdout: '',
      stderr: '',
    };
  const editorFontSize = Math.max(12, Math.round((zoomLevel / 100) * 16));
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [consoleHeight, setConsoleHeight] = useState(DEFAULT_CONSOLE_HEIGHT);
  const consoleTimestamp = useMemo(() => new Date().toLocaleTimeString(), [codeValue]);

  useEffect(() => {
    if (safeRunState.status !== 'idle') {
      setIsConsoleOpen(true);
    }
  }, [safeRunState.status]);

  const consoleOutput = useMemo(() => {
    const defaultMessage = `>>> Waiting to run main.py · ${consoleTimestamp}\nUse "Run Code" to send the latest output here.`;
    if (safeRunState.status === 'idle') {
      return defaultMessage;
    }
    const segments: string[] = [];
    if (safeRunState.stdout?.trim()) {
      segments.push(safeRunState.stdout.trimEnd());
    }
    if (safeRunState.stderr?.trim()) {
      segments.push(`[stderr]\n${safeRunState.stderr.trimEnd()}`);
    }
    if (safeRunState.error) {
      segments.push(`[error]\n${safeRunState.error}`);
    }
    return segments.join('\n\n').trim() || defaultMessage;
  }, [safeRunState, consoleTimestamp]);

  const runStatusMeta = useMemo(() => getRunStatusMeta(safeRunState.status), [safeRunState.status]);

  const handleAskAssistant = useCallback(
    (payload: { text: string }) => {
      if (!onAskAssistant || !payload.text.trim()) return;
      onAskAssistant(payload);
    },
    [onAskAssistant],
  );

  const toggleConsole = () => setIsConsoleOpen(prev => !prev);
  const runBusy = Boolean(isRunBusy);
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

        <ResizableConsole
          isDark={isDark}
          isOpen={isConsoleOpen}
          height={consoleHeight}
          onHeightChange={setConsoleHeight}
          onClose={toggleConsole}
          output={consoleOutput}
          statusLabel={runStatusMeta.label}
          statusTone={runStatusMeta.tone}
          statusHint={safeRunState.error}
          statusState={safeRunState.status}
          onAskAssistant={onAskAssistant ? handleAskAssistant : undefined}
        />
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
                'opacity-80 cursor-not-allowed': runBusy,
              },
            )}
            onClick={() => onRunCode(codeValue)}
            disabled={runBusy}
          >
            <motion.div whileHover={{ rotate: 15 }}>
              <Play size={18} />
            </motion.div>
            <span className="font-semibold">{runBusy ? '运行中...' : '运行代码'}</span>
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

const getRunStatusMeta = (
  status: RunConsoleState['status'],
): { label?: string; tone: 'default' | 'info' | 'success' | 'warning' | 'error' } => {
  switch (status) {
    case 'queued':
      return { label: '排队中', tone: 'warning' };
    case 'running':
      return { label: '运行中', tone: 'info' };
    case 'succeeded':
      return { label: '已完成', tone: 'success' };
    case 'failed':
      return { label: '运行失败', tone: 'error' };
    case 'cancelled':
      return { label: '已取消', tone: 'default' };
    default:
      return { label: '就绪', tone: 'default' };
  }
};
