import type { ReactNode, RefObject } from 'react';
import { motion } from 'framer-motion';
import { Copy, Download, Edit3, Files, Link2, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import type { FileRowAction } from '@/features/kidsCoding/components/editor/sidebar/types';

interface FileTreeRowMenuProps {
  isDark: boolean;
  onSelect: (action: FileRowAction) => void;
  menuRef: RefObject<HTMLDivElement>;
}

type MenuItemConfig = {
  action: FileRowAction;
  label: string;
  icon: ReactNode;
  tone?: 'danger';
};

const MENU_ITEMS: MenuItemConfig[] = [
  { action: 'rename', label: '重命名', icon: <Edit3 size={12} /> },
  { action: 'duplicate', label: '创建副本', icon: <Files size={12} /> },
  { action: 'delete', label: '删除', icon: <Trash2 size={12} />, tone: 'danger' },
  { action: 'copyName', label: '复制名称', icon: <Copy size={12} /> },
  { action: 'copyRelativePath', label: '复制相对路径', icon: <Link2 size={12} /> },
  { action: 'export', label: '导出', icon: <Download size={12} /> },
];

export function FileTreeRowMenu({ isDark, onSelect, menuRef }: FileTreeRowMenuProps) {
  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.98, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: -4 }}
      transition={{ duration: 0.12 }}
      className={clsx(
        'min-w-[156px] rounded-2xl border px-1 py-0.5 shadow-xl backdrop-blur-sm',
        isDark ? 'bg-slate-900/95 border-slate-700 text-blue-50' : 'bg-white border-blue-100 text-[#45527A]',
      )}
    >
      <ul className="space-y-0.5">
        {MENU_ITEMS.map(item => (
          <li key={item.action}>
            <button
              type="button"
              onClick={event => {
                event.stopPropagation();
                onSelect(item.action);
              }}
              className={clsx(
                'flex w-full items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-left text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                isDark
                  ? 'hover:bg-blue-900/60 focus-visible:ring-blue-500/40 focus-visible:ring-offset-slate-900'
                  : 'hover:bg-blue-50 focus-visible:ring-blue-300 focus-visible:ring-offset-white',
                item.tone === 'danger'
                  ? isDark
                    ? 'text-red-300 hover:text-red-200'
                    : 'text-red-500 hover:text-red-600'
                  : '',
              )}
            >
              <span className="flex h-4 w-4 items-center justify-center">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
