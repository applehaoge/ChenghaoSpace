import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface TaskVideoDialogProps {
  isOpen: boolean;
  isDark: boolean;
  onClose: () => void;
  title: string;
  videoUrl: string;
  poster?: string;
}

export function TaskVideoDialog({ isOpen, isDark, onClose, title, videoUrl, poster }: TaskVideoDialogProps) {
  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          key="task-video"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            className={clsx(
              'w-[min(640px,90vw)] rounded-3xl border p-4 shadow-2xl',
              isDark ? 'border-blue-900 bg-gray-900 text-blue-50' : 'border-blue-100 bg-white text-slate-800',
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-blue-400">课程视频</p>
                <h3 className="text-lg font-semibold">{title}</h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10 text-blue-200 hover:bg-blue-500/20"
                aria-label="关闭视频"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-blue-500/20">
              <video
                src={videoUrl}
                poster={poster}
                controls
                className="h-80 w-full rounded-2xl bg-black object-cover"
                autoPlay
              />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
