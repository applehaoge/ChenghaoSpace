import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { Clock, FileText, Folder, Trash2 } from 'lucide-react';
import type { FileEntry } from '@/features/kidsCoding/types/editor';

interface FileListPanelProps {
  isDark: boolean;
  files: FileEntry[];
  editingEntryId?: string | null;
  editingValue?: string;
  onEditingValueChange?: (value: string) => void;
  onCommitEditing?: () => void;
  onCancelEditing?: () => void;
  onRequestRename?: (entry: FileEntry) => void;
  onRemoveEntry?: (entry: FileEntry) => void;
  activeEntryId?: string;
  onSelectEntry?: (entry: FileEntry) => void;
}

export function FileListPanel({
  isDark,
  files,
  editingEntryId,
  editingValue = '',
  onEditingValueChange,
  onCommitEditing,
  onCancelEditing,
  onRequestRename,
  onRemoveEntry,
  activeEntryId,
  onSelectEntry,
}: FileListPanelProps) {
  if (!files.length) {
    return (
      <div className="flex flex-col items-center justify-center mt-12 space-y-3">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}>
          <Clock size={36} className={isDark ? 'text-gray-600' : 'text-blue-200'} />
        </motion.div>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-blue-300'}`}>点击上方 “+” 按钮创建新条目</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-0.5 px-2.5 py-1.5">
      {files.map(file => (
        <FileRow
          key={file.id}
          file={file}
          isDark={isDark}
          isEditing={file.id === editingEntryId}
          isSelected={file.id === activeEntryId}
          editingValue={editingValue}
          onEditingValueChange={onEditingValueChange}
          onCommitEditing={onCommitEditing}
          onCancelEditing={onCancelEditing}
          onRequestRename={onRequestRename}
          onRemoveEntry={onRemoveEntry}
          onSelectEntry={onSelectEntry}
        />
      ))}
    </div>
  );
}

function FileRow({
  file,
  isDark,
  isEditing,
  isSelected,
  editingValue,
  onEditingValueChange,
  onCommitEditing,
  onCancelEditing,
  onRequestRename,
  onRemoveEntry,
  onSelectEntry,
}: {
  file: FileEntry;
  isDark: boolean;
  isEditing: boolean;
  isSelected: boolean;
  editingValue: string;
  onEditingValueChange?: (value: string) => void;
  onCommitEditing?: () => void;
  onCancelEditing?: () => void;
  onRequestRename?: (entry: FileEntry) => void;
  onRemoveEntry?: (entry: FileEntry) => void;
  onSelectEntry?: (entry: FileEntry) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const extensionSuffix = file.extension ? `.${file.extension}` : '';

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

  const handleSelect = () => {
    if (!isEditing && file.kind !== 'folder') {
      onSelectEntry?.(file);
    }
  };
  const isActive = isSelected && !isEditing;

  return (
    <motion.div
      onClick={handleSelect}
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
            ? 'bg-blue-900/70 text-blue-50 font-semibold border-l-[3px] border-l-[#4C8DFF]'
            : 'bg-[#D8E6FF] text-[#45527A] font-semibold border-l-[3px] border-l-[#4C8DFF]'
          : '',
      )}
    >
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        {file.kind === 'folder' ? (
          <Folder
            size={16}
            className={isActive ? 'text-[#4C8DFF]' : isDark ? 'text-amber-300' : 'text-amber-600'}
          />
        ) : (
          <FileText
            size={16}
            className={isActive ? 'text-[#4C8DFF]' : isDark ? 'text-blue-400' : 'text-blue-800'}
          />
        )}
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
            onDoubleClick={() => onRequestRename?.(file)}
            className={clsx(
              'text-left truncate transition-colors duration-200',
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
            {file.name}
          </button>
        )}
      </div>
      {!isEditing ? (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-0.5 rounded-full hover:bg-red-500/20 hover:text-red-500 transition-colors duration-300"
          onClick={() => onRemoveEntry?.(file)}
        >
          <Trash2 size={14} />
        </motion.button>
      ) : null}
    </motion.div>
  );
}
