import { motion } from 'framer-motion';

const MODULES = [
  {
    title: '主线任务：AI 国度修复计划',
    description: '48~60 节剧情式课程，孩子化身编程小英雄，逐步掌握变量、循环、函数等核心知识。',
    image:
      'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_4_3&prompt=adventure%20game%20coding%20for%20kids%20cartoon%20style',
    features: ['剧情式学习', 'AI 功能调用', '难度分层', '实时反馈'],
  },
  {
    title: '算法挑战营',
    description: '闯关式算法任务覆盖排序、递归、图形等主题，配备提示与解析帮助孩子突破瓶颈。',
    image:
      'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_4_3&prompt=algorithm%20puzzle%20game%20for%20kids%20cartoon',
    features: ['分阶段挑战', '逻辑训练', '解题思路', '排行榜'],
  },
  {
    title: '自由创作工坊',
    description: '提供动画、小游戏、智能应用模板，结合素材库与 AI 生成工具，让创意快速落地。',
    image:
      'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_4_3&prompt=creative%20coding%20platform%20for%20kids',
    features: ['精选素材', 'AI 生成', '组件复用', '作品分享'],
  },
  {
    title: '代码对战竞技场',
    description: '实时匹配对手完成编程挑战，胜者获得金币奖励，培养专注力与团队合作精神。',
    image:
      'https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_4_3&prompt=code%20battle%20game%20two%20kids%20competing',
    features: ['实时对战', '金币奖励', '技能检验', '竞技体验'],
  },
] as const;

export function LearningContent() {
  return (
    <section id="courses" className="bg-gradient-to-b from-white to-blue-50 py-16 dark:from-slate-900 dark:to-blue-950/40 md:py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-3xl text-center md:mb-16"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">
            丰富多样的
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent"> 学习模块</span>
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-300 sm:text-lg">
            系统化课程与丰富活动覆盖编程启蒙、算法思维与创意实践，多场景锻炼孩子的逻辑力、协作力与创造力。
          </p>
        </motion.div>

        <div className="space-y-12 md:space-y-16">
          {MODULES.map((module, index) => (
            <motion.div
              key={module.title}
              initial={{ opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              className={`flex flex-col items-center gap-8 md:flex-row ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
            >
              <div className="relative w-full md:w-1/2">
                <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }} className="overflow-hidden rounded-2xl shadow-xl">
                  <img src={module.image} alt={module.title} className="h-auto w-full rounded-2xl object-cover" />
                </motion.div>
                <motion.div
                  className="absolute -right-6 -bottom-6 h-32 w-32 rounded-full bg-blue-400/30 blur-2xl dark:bg-blue-500/20"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                />
              </div>

              <div className="w-full md:w-1/2">
                <h3 className="text-2xl font-semibold md:text-3xl">{module.title}</h3>
                <p className="mt-4 text-base text-slate-600 dark:text-slate-300">{module.description}</p>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {module.features.map((feature, idx) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, x: index % 2 === 0 ? -24 : 24 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.2 + idx * 0.05 }}
                      className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-md dark:bg-slate-800/70"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
                        <i className="fa-solid fa-star text-sm text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm font-medium">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const element = document.getElementById('pricing');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="mt-6 inline-flex items-center rounded-xl bg-blue-600 px-6 py-3 text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-700"
                >
                  了解课程详情
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

