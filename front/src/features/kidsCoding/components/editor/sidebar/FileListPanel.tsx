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

  return (
    <motion.div
      onClick={handleSelect}
      whileHover={{ x: 3 }}
      className={clsx(
        'relative flex items-center justify-between rounded-xl px-3 py-1.5 text-sm transition-colors duration-200 cursor-pointer border border-transparent z-0',
        isDark ? 'bg-blue-950/40 text-blue-100 hover:bg-blue-900/60' : 'bg-white text-blue-900 hover:bg-blue-50/70',
        isEditing
          ? isDark
            ? 'border-blue-400 bg-blue-950/70 shadow-[0_0_0_1px_rgba(59,130,246,0.4)] z-10'
            : 'border-blue-400 bg-white shadow-[0_0_0_1px_rgba(59,130,246,0.4)] z-10'
          : '',
        isSelected && !isEditing
          ? isDark
            ? 'bg-cyan-400/55 text-gray-900 border-cyan-200/80 font-semibold shadow-[0_4px_18px_rgba(34,211,238,0.45)] z-10'
            : 'bg-blue-400/25 text-blue-900 border-blue-500/60 font-semibold shadow-[0_4px_16px_rgba(59,130,246,0.35)] z-10'
          : '',
      )}
    >
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        {file.kind === 'folder' ? (
          <Folder size={16} className={isDark ? 'text-amber-300' : 'text-amber-600'} />
        ) : (
          <FileText size={16} className={isDark ? 'text-blue-400' : 'text-blue-800'} />
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
            className={`flex-1 rounded-xl border px-2 py-1 text-sm font-medium outline-none ${
              isDark
                ? 'bg-gray-900/80 border-blue-800 text-blue-100 placeholder:text-blue-300/40'
                : 'bg-white border-blue-200 text-blue-800 placeholder:text-blue-400/60'
            }`}
          />
        ) : (
          <button
            type="button"
            onDoubleClick={() => onRequestRename?.(file)}
            className={`text-left font-medium truncate ${
              isDark ? 'text-blue-200 hover:text-white' : 'text-blue-800 hover:text-blue-900'
            }`}
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
