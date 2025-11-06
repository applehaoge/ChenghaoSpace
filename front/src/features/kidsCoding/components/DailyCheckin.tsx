import { useContext, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { KidsCodingAuthContext } from '@/features/kidsCoding/contexts/authContext';

const FORTUNE_MESSAGES = [
  '今天你的代码会像魔法一样顺利运行，尽情发挥创意吧！',
  '灵感泉涌的一天，试着完成一项新功能，也许会超出预期。',
  '遇到问题别担心，AI 助手随时待命，勇敢提问就好。',
  '适合复习基础的日子，把知识打牢更有底气。',
  '合作会带来惊喜，邀请小伙伴一起完成挑战吧！',
  '挑战一个难题，突破后你会发现自己远比想象中强大。',
  '给大脑放个小假，短暂的休息能激发下一次灵感。',
  '把今天的学习成果分享出去，获得更多鼓励与启发。',
] as const;

function pickFortune(seed: number) {
  return FORTUNE_MESSAGES[seed % FORTUNE_MESSAGES.length];
}

export function DailyCheckin() {
  const { isAuthenticated } = useContext(KidsCodingAuthContext);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const streak = useMemo(() => Math.floor(Math.random() * 30) + 1, []);
  const fortune = useMemo(() => pickFortune(Date.now()), []);

  const handleCheckin = () => {
    if (!isAuthenticated) {
      toast.info('请先登录后再打卡~');
      return;
    }
    if (hasCheckedIn) {
      toast.info('今天已经打过卡啦，保持好状态！');
      return;
    }
    setHasCheckedIn(true);
    toast.success('打卡成功！获得 10 枚金币奖励。');
  };

  const progress = Math.min(100, Math.round((streak / 30) * 100));

  return (
    <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16 text-white md:py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-5xl rounded-3xl border border-white/20 bg-white/10 p-8 shadow-xl backdrop-blur"
        >
          <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-semibold md:text-4xl">今日编程运势</h2>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-6 rounded-2xl bg-white/20 p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-400/30">
                    <i className="fa-solid fa-star text-2xl text-yellow-200" />
                  </div>
                  <span className="text-lg font-medium">你的今日好运提示</span>
                </div>
                <p className="mt-4 text-base leading-relaxed text-white/90">{fortune}</p>
              </motion.div>

              <div className="mt-6 grid grid-cols-2 gap-4 text-center text-white/90">
                <div className="rounded-2xl bg-white/20 p-4">
                  <p className="text-sm text-white/70">连续打卡</p>
                  <p className="mt-2 text-2xl font-bold">{streak} 天</p>
                </div>
                <div className="rounded-2xl bg-white/20 p-4">
                  <p className="text-sm text-white/70">累计金币</p>
                  <p className="mt-2 text-2xl font-bold">{streak * 10}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-1 flex-col items-center gap-6">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <svg viewBox="0 0 120 120" className="h-64 w-64">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="8"
                    strokeDasharray={`${(progress / 100) * 326} 326`}
                    strokeLinecap="round"
                    transform="rotate(-90 60 60)"
                  />
                </svg>
                <button
                  type="button"
                  onClick={handleCheckin}
                  className="absolute left-1/2 top-1/2 flex h-32 w-32 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-white/30 backdrop-blur transition hover:bg-white/40"
                >
                  <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600">
                    <i className={`fa-solid ${hasCheckedIn ? 'fa-check' : 'fa-calendar-check'} text-2xl text-white`} />
                  </div>
                  <span className="text-sm font-semibold">{hasCheckedIn ? '已打卡' : '立即打卡'}</span>
                </button>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="text-sm text-white/80"
              >
                每日坚持打卡即可获得 <span className="font-semibold text-yellow-200">10 枚金币</span>，连续 7 天还会解锁惊喜奖励！
              </motion.p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

