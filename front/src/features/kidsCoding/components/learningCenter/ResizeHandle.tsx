import clsx from 'clsx';
import { MouseEvent } from 'react';

interface ResizeHandleProps {
  onMouseDown: (event: MouseEvent<HTMLDivElement>) => void;
  label: string;
  side: 'left' | 'right';
}

export function ResizeHandle({ onMouseDown, label, side }: ResizeHandleProps) {
  return (
    <div
      role="separator"
      aria-label={label}
      onMouseDown={onMouseDown}
      className={clsx(
        'hidden select-none items-center px-1 text-slate-400 hover:text-blue-500 lg:flex',
        side === 'left' ? 'justify-start' : 'justify-end',
      )}
    >
      <div className="flex h-16 cursor-col-resize items-center gap-1 rounded-full px-1 py-2 transition hover:bg-blue-50 dark:hover:bg-slate-800/60">
        <span className="h-12 w-px rounded-full bg-slate-300 dark:bg-slate-600" />
      </div>
    </div>
  );
}
