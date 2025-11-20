import clsx from 'clsx';
import { motion } from 'framer-motion';

interface CelebrationModalProps {
  onContinue: () => void;
}

export function CelebrationModal({ onContinue }: CelebrationModalProps) {
  return (
    <motion.div
      key="celebration-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl px-6"
      aria-live="assertive"
    >
      <div className="absolute inset-0 rounded-2xl bg-slate-900/70 backdrop-blur-sm" aria-hidden />
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className={clsx(
          'relative w-full max-w-xs rounded-2xl border border-slate-100/30 bg-slate-900/95',
          'px-6 py-5 text-center text-slate-100 shadow-2xl',
        )}
      >
        <div className="mb-2 text-3xl">🎉</div>
        <p className="mb-3 text-base font-semibold">恭喜答对！</p>
        <button
          type="button"
          onClick={onContinue}
          className="w-full rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
        >
          继续
        </button>
      </motion.div>
    </motion.div>
  );
}
