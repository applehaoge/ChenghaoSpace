import { motion } from 'framer-motion';

const FEATURES = [
  {
    title: 'AI 助手全程陪伴',
    description: '智能助手具备成长、技能升级与形象变化，引导孩子边学边练。',
    icon: 'fa-robot',
    color: 'blue',
  },
  {
    title: '主线剧情任务',
    description: '“AI 国度修复计划” 48-60 节任务课程，循序渐进掌握编程知识。',
    icon: 'fa-route',
    color: 'purple',
  },
  {
    title: '算法挑战训练',
    description: '闯关模式训练逻辑思维，配合即时反馈培养分析与拆解能力。',
    icon: 'fa-brain',
    color: 'green',
  },
  {
    title: '自由创作空间',
    description: '游戏、动画、应用自由开发，素材库与 AI 生成工具一步到位。',
    icon: 'fa-pencil',
    color: 'orange',
  },
  {
    title: '代码对战 PK',
    description: '双人实时对战，比拼解题速度，激活学习动力与竞技体验。',
    icon: 'fa-gamepad',
    color: 'red',
  },
  {
    title: 'AI 辅助学习',
    description: '错误检测、自动修复、代码补全、语音朗读等辅助功能全面开放。',
    icon: 'fa-magic',
    color: 'indigo',
  },
] as const;

const COLOR_CLASSES: Record<(typeof FEATURES)[number]['color'], string> = {
  blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
  red: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
};

export function FeaturesSection() {
  return (
    <section id="features" className="bg-white py-16 dark:bg-slate-900 md:py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-3xl text-center md:mb-16"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
              橙浩编程
            </span>{' '}
            核心特色
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-300 sm:text-lg">
            将 AI 技术与游戏化教学结合，打造沉浸式学习体验，让孩子在探索中激发创造力，养成面向未来的科技素养。
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800/60"
            >
              <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-xl ${COLOR_CLASSES[feature.color]}`}>
                <i className={`fa-solid ${feature.icon} text-xl`} />
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{feature.description}</p>
              <button
                type="button"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                onClick={() => {
                  const element = document.getElementById('courses');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                了解详情
                <i className="fa-solid fa-arrow-right text-xs" />
              </button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 rounded-3xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 shadow-lg dark:from-blue-900/20 dark:to-indigo-900/20 md:p-8"
        >
          <h3 className="text-center text-xl font-semibold md:text-2xl">更多创新功能</h3>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            {[
              { title: '成就系统', desc: '通行证、限定外观、成长激励全覆盖' },
              { title: '荣耀协作', desc: '多人协作闯关，金币互助提升学习动力' },
              { title: '错题本', desc: 'AI 讲解错题原因，按计划复习巩固' },
              { title: '编程手册', desc: '交互式知识地图，重点难点随时查' },
              { title: '家长中心', desc: '学习数据可视化，目标管理更轻松' },
              { title: '素材商城', desc: 'AI 生成素材与组件，作品创作更高效' },
              { title: '语音朗读', desc: '代码朗读模式，照顾视力与阅读差异' },
              { title: '实时翻译', desc: '多语言课堂环境，拓展国际视野' },
            ].map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.2 + idx * 0.05 }}
                className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm dark:bg-slate-800"
              >
                <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
                  <i className="fa-solid fa-check text-xs text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">{item.title}</h4>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

