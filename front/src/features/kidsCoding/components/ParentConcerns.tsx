import { motion } from 'framer-motion';

const CONCERNS = [
  {
    question: '孩子能学到什么？',
    answer: '从零基础到进阶算法，逐步掌握编程思维、问题拆解与创造力，学习成果可量化追踪。',
    icon: 'fa-graduation-cap',
    color: 'blue',
  },
  {
    question: '如何追踪学习进度？',
    answer: '家长端提供实时数据面板、成长报告与目标管理工具，学习进展一目了然。',
    icon: 'fa-chart-line',
    color: 'green',
  },
  {
    question: '适合多大年龄？',
    answer: '课程针对 7-16 岁设计，按年龄和能力划分阶段内容，孩子可按节奏灵活进阶。',
    icon: 'fa-child',
    color: 'purple',
  },
  {
    question: '需要编程基础吗？',
    answer: '无需基础，AI 助手与动画教学帮助孩子轻松入门，循序渐进掌握知识点。',
    icon: 'fa-rocket',
    color: 'orange',
  },
  {
    question: '会不会沉迷游戏？',
    answer: '学习流程围绕知识目标设计，激励机制与时间管控配合，保障寓教于乐而不沉迷。',
    icon: 'fa-shield',
    color: 'red',
  },
  {
    question: '如何保持学习动力？',
    answer: '成就系统、金币奖励、社群协作与导师鼓励多重结合，帮助孩子建立持续动力。',
    icon: 'fa-trophy',
    color: 'indigo',
  },
] as const;

const COLOR_CLASSES: Record<(typeof CONCERNS)[number]['color'], string> = {
  blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
};

export function ParentConcerns() {
  return (
    <section id="parents" className="bg-white py-16 dark:bg-slate-900 md:py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-3xl text-center md:mb-16"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">
            家长最关注的
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent"> 六大问题</span>
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-300 sm:text-lg">
            我们提供完善的家长支持体系，从学习数据、激励机制到安全防沉迷，为孩子营造安心高效的成长环境。
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative mb-12 rounded-3xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-lg dark:from-blue-900/20 dark:to-indigo-900/20 md:p-8"
        >
          <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-500/10" />
          <div className="absolute -left-24 -bottom-24 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-500/10" />
          <div className="relative z-10 flex flex-col items-center gap-8 md:flex-row">
            <div className="order-2 w-full md:order-1 md:w-1/2">
              <h3 className="text-2xl font-semibold">家长控制中心</h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                通过家长端可以查看学习报告、设定奖励与目标，远程陪伴孩子一起成长。
              </p>
              <ul className="mt-6 space-y-3">
                {['实时数据与成就', '远程奖励与鼓励信箱', '学习目标与时间管理', '定期学习报告', '与老师沟通反馈', '账号与订阅管理'].map(
                  (item, index) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
                      className="flex items-start gap-3 rounded-xl bg-white/70 p-3 dark:bg-slate-800/80"
                    >
                      <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
                        <i className="fa-solid fa-check text-xs text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm">{item}</span>
                    </motion.li>
                  ),
                )}
              </ul>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-6 inline-flex items-center rounded-xl bg-blue-600 px-6 py-3 text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-700"
              >
                了解家长端
              </motion.button>
            </div>
            <div className="order-1 w-full md:order-2 md:w-1/2">
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.3 }} className="overflow-hidden rounded-2xl shadow-xl">
                <img
                  src="https://space.coze.cn/api/coze_space/gen_image?image_size=landscape_16_9&prompt=parent%20dashboard%20for%20kids%20coding%20progress%20with%20charts%20and%20data"
                  alt="家长端数据中心界面"
                  className="h-auto w-full rounded-2xl"
                />
              </motion.div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CONCERNS.map((item, index) => (
            <motion.div
              key={item.question}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="flex h-full flex-col rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-lg dark:border-slate-700 dark:bg-slate-800/60"
            >
              <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${COLOR_CLASSES[item.color]}`}>
                <i className={`fa-solid ${item.icon} text-lg`} />
              </div>
              <h3 className="text-lg font-semibold">{item.question}</h3>
              <p className="mt-3 flex-1 text-sm text-slate-600 dark:text-slate-300">{item.answer}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

