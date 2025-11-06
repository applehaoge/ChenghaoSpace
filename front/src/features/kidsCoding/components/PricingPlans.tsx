import { motion } from 'framer-motion';

export interface PricingPlansProps {
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

const PLANS = [
  {
    name: '启蒙计划',
    price: 99,
    period: '月',
    description: '零基础入门，涵盖编程启蒙、主线任务前 12 节与基础算法挑战。',
    features: ['主线任务 12 节', '基础算法闯关', '入门 AI 助手', '每周 1 次代码对战', '家长端基础功能'],
    highlight: false,
    cta: '免费体验',
  },
  {
    name: '进阶计划',
    price: 199,
    period: '月',
    description: '完整成长体系，包含全部课程、AI 工具与互动活动，是家长首选方案。',
    features: [
      '主线任务全解锁',
      '全部算法挑战',
      '高级 AI 助手',
      '无限次代码对战',
      '完整家长端功能',
      '每月 1 次直播课',
      'AI 创作工具包',
    ],
    highlight: true,
    cta: '立即订阅',
  },
  {
    name: '大师计划',
    price: 299,
    period: '月',
    description: '面向竞赛与深度创作者，提供导师辅导、定制学习路径与赛事支持。',
    features: ['全量课程与资源', '专属导师跟进', '定制学习计划', '竞赛集训营', '作品展示平台', '新功能优先体验'],
    highlight: false,
    cta: '升级大师',
  },
] as const;

export function PricingPlans({ onOpenAuthModal }: PricingPlansProps) {
  return (
    <section id="pricing" className="bg-gradient-to-b from-white to-blue-50 py-16 dark:from-slate-900 dark:to-blue-950/40 md:py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto mb-12 max-w-3xl text-center md:mb-16"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">
            选择最适合孩子的
            <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent"> 学习计划</span>
          </h2>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-300 sm:text-lg">
            支持按月或按年订阅，随时升级或降级方案，配套 AI 工具、家长端数据与专业师资服务。
          </p>
          <div className="mt-6 inline-flex items-center rounded-full bg-slate-200 p-1 dark:bg-slate-700/80">
            <button type="button" className="rounded-full bg-white px-4 py-2 text-sm font-medium shadow dark:bg-slate-800">
              月付
            </button>
            <button type="button" className="rounded-full px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300">
              年付（即将上线）
            </button>
          </div>
        </motion.div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className={`relative flex h-full flex-col rounded-2xl border bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl dark:bg-slate-800 ${
                plan.highlight ? 'border-blue-400 shadow-blue-600/10 dark:border-blue-500' : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              {plan.highlight ? (
                <div className="absolute -right-8 top-8 rotate-45 bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-1 font-semibold text-white shadow-lg">
                  最受欢迎
                </div>
              ) : null}
              <div className="flex flex-col gap-4">
                <h3 className="text-2xl font-semibold">{plan.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">{plan.description}</p>
              </div>
              <div className="mt-6 flex items-baseline gap-2">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">¥{plan.price}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">/ {plan.period}</span>
              </div>
              <ul className="mt-6 flex flex-1 flex-col gap-3 text-sm text-slate-600 dark:text-slate-300">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
                      <i className="fa-solid fa-check text-xs text-blue-600 dark:text-blue-400" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onOpenAuthModal('register')}
                className={`mt-6 w-full rounded-xl px-5 py-3 text-sm font-medium transition ${
                  plan.highlight
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600'
                }`}
              >
                {plan.cta}
              </motion.button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <i className="fa-solid fa-shield text-blue-500" />
            7 天无条件退款保障，服务透明可追踪
          </div>
        </motion.div>
      </div>
    </section>
  );
}

