import { AnimatePresence, motion } from 'framer-motion';

import { MissionPanel } from '@/features/kidsCoding/components/learningCenter/MissionPanel';
import { MissionContent } from '@/features/kidsCoding/types/learningCenter';

interface MissionDrawerProps {
  open: boolean;
  onClose: () => void;
  content: MissionContent;
}

export function MissionDrawer({ open, onClose, content }: MissionDrawerProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="mission-drawer"
          className="fixed inset-0 z-50 flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="关闭任务面板"
            className="h-full flex-1 bg-slate-950/60"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            className="relative h-full w-full max-w-md bg-slate-50 shadow-2xl dark:bg-slate-900"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-500 shadow-lg transition hover:scale-105 dark:bg-slate-800 dark:text-slate-200"
            >
              <i className="fa-solid fa-xmark" />
            </button>
            <MissionPanel content={content} className="h-full" />
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
