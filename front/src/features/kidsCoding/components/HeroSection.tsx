import { motion } from 'framer-motion';

export interface HeroSectionProps {
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

export function HeroSection({ onOpenAuthModal }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden" id="hero">
      <div className="absolute inset-0 -z-10 opacity-20 dark:opacity-10">
        <div className="absolute top-16 left-8 h-40 w-40 rounded-full bg-blue-500 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-56 w-56 rounded-full bg-orange-500 blur-3xl" />
        <div className="absolute left-1/3 top-1/2 h-80 w-80 rounded-full bg-indigo-500 blur-3xl" />
      </div>

      <div className="container mx-auto flex flex-col items-center px-4 pb-16 pt-10 md:flex-row md:pb-24 md:pt-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full text-center md:w-1/2 md:text-left"
        >
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              AI 驱动的
            </span>
            <br />
            <span>少儿编程启蒙课堂</span>
          </h1>
          <p className="mt-6 text-base text-slate-600 dark:text-slate-300 sm:text-lg md:text-xl">
            橙浩编程结合 AI 助手、剧情任务和互动课堂，让 7-16 岁的孩子在游戏化体验中掌握编程思维与创作能力，
            体系化提升逻辑、算法与创造力。
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-start">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onOpenAuthModal('register')}
              className="w-full rounded-xl bg-blue-600 px-6 py-3 text-lg font-medium text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-700 sm:w-auto"
            >
              免费体验课程
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const element = document.getElementById('courses');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full rounded-xl bg-white px-6 py-3 text-lg font-medium text-blue-600 transition hover:bg-blue-50 dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-blue-900/30 sm:w-auto"
            >
              了解更多课程
            </motion.button>
          </div>

          <div className="mt-12 px-2">
            <p className="text-sm text-slate-500 dark:text-slate-400">深受家长与孩子信赖</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-6 md:justify-start">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.1 }}
                    className="h-10 w-10 overflow-hidden rounded-full border-2 border-white dark:border-slate-900"
                  >
                    <img
                      src={`https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=happy%20child%20face%20cartoon%20style%20${i}`}
                      alt="孩子用户头像"
                      className="h-full w-full object-cover"
                    />
                  </motion.div>
                ))}
              </div>
              <div>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map(i => (
                    <i key={i} className="fa-solid fa-star text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">平均评分 4.9 / 5</p>
              </div>
              <div>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">10,000+</p>
                <p className="text-sm text-slate-600 dark:text-slate-300">活跃学员</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative mt-12 w-full max-w-lg md:mt-0 md:w-1/2"
        >
          <div className="relative overflow-hidden rounded-3xl shadow-2xl">
            <img
              src="https://lf-code-agent.coze.cn/obj/x-ai-cn/284199718146/attachment/image_20251104104331.png"
              alt="孩子与 AI 一起学习编程的插画"
              className="h-auto w-full rounded-3xl"
            />
          </div>
          <motion.div
            className="absolute -bottom-6 -left-6 h-32 w-32 rounded-2xl bg-orange-400 opacity-80"
            animate={{ rotate: [0, 10, 0], y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -right-8 -top-10 h-40 w-40 rounded-2xl bg-blue-400 opacity-70"
            animate={{ rotate: [0, -12, 0], y: [0, -12, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </div>
    </section>
  );
}

