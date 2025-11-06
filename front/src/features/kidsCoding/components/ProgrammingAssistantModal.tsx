import { motion } from 'framer-motion';

const TEACHING_CONTENT = {
  title: 'Python 类的基础知识',
  description:
    '通过本节课，孩子将认识类与对象的概念，理解 __init__ 的作用，并学会为 AI 助手添加行为方法，完成一个完整的面向对象示例。',
  videoDuration: '05:23',
  imageUrl:
    'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=programming%20concept%20illustration%20for%20kids',
  keyPoints: [
    '类是创建对象的蓝图或模板',
    '使用 class 关键字定义类，并在 __init__ 中初始化属性',
    'self 代表对象本身，可在方法中访问属性',
    '合理划分方法，描述对象的行为',
    '通过实例化与方法调用让代码“动”起来',
  ],
};

export interface ProgrammingAssistantModalProps {
  onClose: () => void;
}

export function ProgrammingAssistantModal({ onClose }: ProgrammingAssistantModalProps) {
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl dark:bg-slate-900"
        onClick={event => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white dark:border-slate-800">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <i className="fa-solid fa-book" />
            {TEACHING_CONTENT.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 transition hover:bg-white/30"
            aria-label="关闭"
          >
            <i className="fa-solid fa-times" />
          </button>
        </div>

        <div className="space-y-6 p-6 md:p-8">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
            <img src={TEACHING_CONTENT.imageUrl} alt={TEACHING_CONTENT.title} className="h-auto w-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                type="button"
                className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl"
              >
                <i className="fa-solid fa-play text-2xl" />
              </motion.button>
            </div>
            <div className="absolute bottom-4 right-4 rounded bg-black/70 px-2 py-1 text-xs text-white">
              {TEACHING_CONTENT.videoDuration}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold">课程介绍</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{TEACHING_CONTENT.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">学习要点</h3>
            <ul className="mt-3 space-y-3">
              {TEACHING_CONTENT.keyPoints.map((point, index) => (
                <motion.li
                  key={point}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/80"
                >
                  <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
                    <i className="fa-solid fa-check text-xs text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-200">{point}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { icon: 'fa-book-open', label: '查看教材', color: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' },
              { icon: 'fa-pencil', label: '做练习', color: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400' },
              { icon: 'fa-question-circle', label: '向老师提问', color: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' },
            ].map(item => (
              <motion.button
                key={item.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                className={`flex flex-col items-center justify-center rounded-xl p-4 text-sm font-medium transition ${item.color}`}
              >
                <i className={`fa-solid ${item.icon} mb-2 text-xl`} />
                {item.label}
              </motion.button>
            ))}
          </div>

          <div className="flex gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              关闭
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-700"
            >
              继续学习
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

