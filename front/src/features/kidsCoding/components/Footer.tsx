import { motion } from 'framer-motion';

export interface FooterProps {
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

const FOOTER_LINK_GROUPS = [
  {
    title: '课程',
    links: ['主线任务', '算法挑战', '自由创作', '代码对战', '编程手册'],
  },
  {
    title: '关于我们',
    links: ['公司简介', '师资团队', '教学理念', '合作伙伴', '联系我们'],
  },
  {
    title: '帮助中心',
    links: ['常见问题', '家长指南', '学生指南', '隐私政策', '服务条款'],
  },
];

export function Footer({ onOpenAuthModal }: FooterProps) {
  return (
    <footer className="bg-slate-900 pt-12 pb-8 text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 pb-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 text-xl font-bold">
                橙
              </div>
              <span className="text-xl font-bold">橙浩编程</span>
            </div>
            <p className="max-w-md text-sm text-slate-400">
              专为 7-16 岁青少年打造的 AI 编程学习平台，通过剧情课程、AI 助手与互动活动，
              帮助孩子在快乐中掌握编程技能、培养未来所需的创新能力。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {['twitter', 'facebook', 'instagram', 'youtube'].map(platform => (
                <motion.a
                  key={platform}
                  href="#"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 transition hover:bg-blue-500"
                >
                  <i className={`fa-brands fa-${platform}`} />
                </motion.a>
              ))}
            </div>
          </div>

          {FOOTER_LINK_GROUPS.map(group => (
            <div key={group.title}>
              <h4 className="text-lg font-semibold">{group.title}</h4>
              <ul className="mt-6 space-y-4 text-sm text-slate-400">
                {group.links.map(link => (
                  <motion.li key={link} whileHover={{ x: 4 }}>
                    <a href="#" className="transition hover:text-white">
                      {link}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl bg-slate-800 p-6 text-center"
        >
          <h3 className="text-xl font-semibold md:text-2xl">准备好开启孩子的编程之旅了吗？</h3>
          <p className="mt-3 text-sm text-slate-400">
            注册即可体验 AI 编程课堂，与万名学员一同探索未来科技。
          </p>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onOpenAuthModal('register')}
              className="rounded-xl bg-blue-600 px-6 py-3 font-medium text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-700"
            >
              免费注册
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="rounded-xl bg-slate-700 px-6 py-3 font-medium text-white transition hover:bg-slate-600"
            >
              预约体验课
            </motion.button>
          </div>
        </motion.div>

        <div className="mt-8 border-t border-slate-800 pt-6 text-center text-xs text-slate-500">
          <p>© 2025 橙浩编程 版权所有 | 京ICP备00000000号</p>
          <p className="mt-2">本页面用于展示示例界面，所有内容均为演示数据。</p>
        </div>
      </div>
    </footer>
  );
}

