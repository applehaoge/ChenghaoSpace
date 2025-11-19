import { useEffect, useRef } from 'react';
import type { HTMLAttributes, MouseEvent } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { ChevronRight, FileText, Folder, Trash2 } from 'lucide-react';
import type { FlattenedFileTreeNode } from '@/features/kidsCoding/core/buildFileTree';
import type { FileEntry } from '@/features/kidsCoding/types/editor';

const BASE_INDENT_PX = 8;
const INDENT_STEP_PX = 12;
const GLOBAL_SHIFT_PX = 4;

type DragProps = Pick<HTMLAttributes<HTMLDivElement>, 'draggable' | 'onDragStart' | 'onDragEnd'>;
type DropProps = Pick<HTMLAttributes<HTMLDivElement>, 'onDragEnter' | 'onDragLeave' | 'onDragOver' | 'onDrop'>;

interface FileTreeRowProps {
  node: FlattenedFileTreeNode;
  isDark: boolean;
  isEditing: boolean;
  isSelected: boolean;
  editingValue: string;
  onEditingValueChange?: (value: string) => void;
  onCommitEditing?: () => void;
  onCancelEditing?: () => void;
  onRequestRename?: (entry: FileEntry) => void;
  onRemoveEntry?: (entry: FileEntry) => void;
  onFolderClick?: (entry: FileEntry) => void;
  onFileClick?: (entry: FileEntry) => void;
  dragProps?: DragProps;
  dropProps?: DropProps;
  isDropTarget?: boolean;
}

export function FileTreeRow({
  node,
  isDark,
  isEditing,
  isSelected,
  editingValue,
  onEditingValueChange,
  onCommitEditing,
  onCancelEditing,
  onRequestRename,
  onRemoveEntry,
  onFolderClick,
  onFileClick,
  dragProps,
  dropProps,
  isDropTarget,
}: FileTreeRowProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const extensionSuffix = node.entry.extension ? `.${node.entry.extension}` : '';

  useEffect(() => {
    if (isEditing) {
      const input = inputRef.current;
      if (!input) return;
      input.focus();
      if (!extensionSuffix) {
        input.select();
        return;
      }
      const suffixIndex = input.value.lastIndexOf(extensionSuffix);
      if (suffixIndex > 0) {
        input.setSelectionRange(0, suffixIndex);
      } else {
        input.select();
      }
    }
  }, [isEditing, extensionSuffix]);

  const handleRowClick = (event: MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (isEditing) return;
    if (node.type === 'folder') {
      onFolderClick?.(node.entry);
    } else {
      onFileClick?.(node.entry);
    }
  };

  const handleArrowClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onFolderClick?.(node.entry);
  };

  const isActive = isSelected && !isEditing;
  const indentPx = GLOBAL_SHIFT_PX + node.depth * INDENT_STEP_PX;
  const resolvedDragProps = dragProps ?? {};
  const resolvedDropProps = dropProps ?? {};

  return (
    <motion.div
      onClick={handleRowClick}
      whileHover={{ x: 3 }}
      className={clsx(
        'group relative flex items-center justify-between rounded-xl px-3 py-1.5 text-sm transition-colors duration-200 cursor-pointer border border-transparent z-0 overflow-hidden',
        isDark ? 'bg-blue-950/40 text-blue-100' : 'bg-white text-[#60709A]',
        !isEditing &&
          (isDark ? 'hover:bg-blue-900/60 hover:text-blue-50' : 'hover:bg-[#EBF3FF] hover:text-[#45527A]'),
        isEditing
          ? isDark
            ? 'border-blue-400 bg-blue-950/70 shadow-[0_0_0_1px_rgba(59,130,246,0.4)] z-10'
            : 'border-blue-400 bg-white shadow-[0_0_0_1px_rgba(59,130,246,0.4)] z-10'
          : '',
        isActive
          ? isDark
            ? 'bg-blue-900/70 text-blue-50 font-semibold border-l-[2px] border-l-[#4C8DFF]'
            : 'bg-[#D8E6FF] text-[#45527A] font-semibold border-l-[2px] border-l-[#4C8DFF]'
          : '',
        isDropTarget ? 'ring-1 ring-blue-400/70' : '',
      )}
      style={{ paddingLeft: indentPx }}
      {...resolvedDragProps}
      {...resolvedDropProps}
    >
      <div className="flex items-center flex-1 min-w-0 space-x-2">
        <div className="w-3 flex justify-center">
          {node.type === 'folder' && node.hasChildren ? (
            <button
              type="button"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              onClick={handleArrowClick}
              tabIndex={-1}
            >
              <ChevronRight
                size={10}
                className={clsx('transition-transform duration-200', node.isExpanded ? 'rotate-90' : 'rotate-0')}
              />
            </button>
          ) : (
            <span className="inline-flex text-[10px] text-transparent select-none">▶</span>
          )}
        </div>
        <div className="ml-1">
          {node.type === 'folder' ? (
            <Folder size={16} className={isActive ? 'text-[#4C8DFF]' : isDark ? 'text-amber-300' : 'text-amber-600'} />
          ) : (
            <FileText size={16} className={isActive ? 'text-[#4C8DFF]' : isDark ? 'text-blue-400' : 'text-blue-800'} />
          )}
        </div>
        {isEditing ? (
          <input
            ref={inputRef}
            value={editingValue}
            onChange={event => onEditingValueChange?.(event.target.value)}
            onBlur={() => onCommitEditing?.()}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault();
                onCommitEditing?.();
              } else if (event.key === 'Escape') {
                event.preventDefault();
                onCancelEditing?.();
              }
            }}
            className={`flex-1 w-full min-w-0 rounded-xl border px-2 py-1 text-sm font-medium outline-none ${
              isDark
                ? 'bg-gray-900/80 border-blue-800 text-blue-100 placeholder:text-blue-300/40'
                : 'bg-white border-blue-200 text-blue-800 placeholder:text-blue-400/60'
            }`}
          />
        ) : (
          <button
            type="button"
            onDoubleClick={event => {
              event.stopPropagation();
              onRequestRename?.(node.entry);
            }}
            className={clsx(
              'text-left truncate transition-colors duration-200 ml-2 flex-1 min-w-0',
              isActive ? 'font-semibold' : 'font-medium',
              isDark
                ? isActive
                  ? 'text-blue-50'
                  : 'text-blue-200'
                : isActive
                  ? 'text-[#45527A]'
                  : 'text-[#60709A]',
              !isDark && !isActive ? 'group-hover:text-[#45527A]' : '',
              isDark && !isActive ? 'group-hover:text-blue-50' : '',
            )}
          >
            {node.name}
          </button>
        )}
      </div>
      {!isEditing ? (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-0.5 rounded-full hover:bg-red-500/20 hover:text-red-500 transition-colors duration-300"
          onClick={event => {
            event.stopPropagation();
            onRemoveEntry?.(node.entry);
          }}
        >
          <Trash2 size={14} />
        </motion.button>
      ) : null}
    </motion.div>
  );
}
