import clsx from 'clsx';

interface CollapsedPanelRailProps {
  label: string;
  onExpand: () => void;
  side: 'left' | 'right';
}

export function CollapsedPanelRail({ label, onExpand, side }: CollapsedPanelRailProps) {
  const isLeft = side === 'left';
  return (
    <button
      type="button"
      aria-label={`展开${label}`}
      onClick={onExpand}
      className={clsx(
        'hidden h-full min-h-[200px] w-3 items-center justify-center rounded-md border border-transparent bg-white/70 px-0 shadow-sm shadow-slate-200/40 backdrop-blur transition hover:border-blue-200 dark:bg-slate-900/60 dark:shadow-slate-900/30 lg:flex',
        isLeft ? 'pr-0' : 'pl-0',
      )}
    >
      <span
        className={clsx(
          'relative flex h-16 w-0.5 items-center justify-center rounded-full bg-blue-500/70 dark:bg-blue-400/60',
        )}
      >
        <span
          className={clsx(
            'absolute top-1/2 -translate-y-1/2 border-[4px] border-transparent',
            isLeft ? '-right-1 border-l-blue-500/70' : '-left-1 border-r-blue-500/70',
          )}
        />
      </span>
    </button>
  );
}
