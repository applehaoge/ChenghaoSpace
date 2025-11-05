import type { FortuneActivity } from './fortuneConfig';

type Countdown = {
  label: string;
  daysRemaining: number;
};

type DailyProgressPanelProps = {
  defaultStudentName: string;
  hasCheckedInToday: boolean;
  onCheckIn: () => void;
  checkInStreak: number;
  monthLabel: string;
  weekdayLabel: string;
  dayNumber: string;
  upcomingCountdowns: Countdown[];
  fortuneLevel: string;
  fortuneGood: readonly FortuneActivity[];
  fortuneBad: readonly FortuneActivity[];
};

export function DailyProgressPanel({
  defaultStudentName,
  hasCheckedInToday,
  onCheckIn,
  checkInStreak,
  monthLabel,
  weekdayLabel,
  dayNumber,
  upcomingCountdowns,
  fortuneLevel,
  fortuneGood,
  fortuneBad,
}: DailyProgressPanelProps) {
  return (
    <section
      className="mx-auto w-full max-w-4xl rounded-3xl border border-gray-100/70 bg-white/90 px-5 py-6 shadow-sm ring-1 ring-blue-100/50 backdrop-blur sm:px-6 lg:px-8 2xl:px-10"
      style={{ maxWidth: 'clamp(820px, 70vw, 1320px)' }}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
        <div className="order-2 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white/70 p-6 text-center text-sm text-gray-500 shadow-inner lg:order-1 lg:w-[300px] lg:flex-none">
          <div className="flex w-full flex-1 flex-col items-center justify-center gap-3">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">
              AD · 300×250
            </span>
            <span className="text-base font-medium text-gray-600">预留广告位</span>
            <span className="text-xs text-gray-400">适配常见 Medium Rectangle 素材尺寸</span>
          </div>
        </div>

        {hasCheckedInToday ? (
          <div className="order-1 flex flex-1 flex-col items-center gap-8 rounded-3xl bg-white/95 px-6 py-8 text-center shadow-md sm:px-10 sm:py-10 lg:order-2 lg:px-14">
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm font-medium uppercase tracking-widest text-blue-500">今日运势</span>
              <h3 className="m-0 text-2xl font-semibold text-gray-800">{defaultStudentName} 的运势</h3>
            </div>
            <div className="flex items-center gap-6 text-5xl font-black tracking-[0.15em] text-rose-500 sm:text-6xl">
              <span className="text-4xl sm:text-5xl">§</span>
              <span>{fortuneLevel}</span>
              <span className="text-4xl sm:text-5xl">§</span>
            </div>
            <div className="grid w-full gap-6 text-left md:grid-cols-2">
              <div className="rounded-2xl border border-rose-100 bg-rose-50/80 p-6 shadow-sm">
                <div className="flex items-center gap-2 text-xl font-semibold text-rose-500">
                  <i className="fas fa-circle-check"></i>
                  宜
                </div>
                <ul className="mt-4 space-y-4 text-base leading-tight text-gray-700">
                  {fortuneGood.map(item => (
                    <li key={item.title} className="flex flex-col gap-1">
                      <span className="font-semibold text-rose-500">{item.title}</span>
                      <span className="text-sm text-gray-500">{item.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 text-xl font-semibold text-gray-800">
                  <i className="fas fa-ban text-rose-400"></i>
                  忌
                </div>
                <ul className="mt-4 space-y-4 text-base leading-tight text-gray-700">
                  {fortuneBad.map(item => (
                    <li key={item.title} className="flex flex-col gap-1">
                      <span className="font-semibold text-gray-800">{item.title}</span>
                      <span className="text-sm text-gray-500">{item.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex w-full flex-col items-center gap-3 text-sm text-gray-600">
              <div className="w-full rounded-xl bg-blue-50 px-5 py-3 text-blue-600">
                <i className="fas fa-lightbulb mr-2"></i>
                今日贴士：保持好奇心，多动手实践，你就是下一位少儿编程高手！
              </div>
              <p className="text-base text-gray-700">
                你已经连续打卡 <span className="font-semibold text-gray-900">{checkInStreak}</span> 天，继续保持！
              </p>
            </div>
          </div>
        ) : (
          <div className="order-1 flex flex-1 flex-col gap-4 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 p-6 text-white shadow-md lg:order-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/80">欢迎回来！</p>
                <p className="text-2xl font-semibold">{defaultStudentName}</p>
              </div>
              <div className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium uppercase tracking-widest">
                每日打卡
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-6">
              <div className="flex flex-col items-center text-white/90">
                <span className="text-base">{monthLabel}</span>
                <span className="text-lg">{weekdayLabel}</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-6xl font-black leading-none">{dayNumber}</span>
                <span className="text-lg font-medium text-white/90">日</span>
              </div>
            </div>
            <ul className="space-y-1 text-sm text-white/90">
              {upcomingCountdowns.map(event => (
                <li key={event.label} className="flex items-center gap-2">
                  <i className="fas fa-flag text-white/70"></i>
                  <span>
                    距 {event.label} 还剩{' '}
                    <span className="font-semibold text-white">{event.daysRemaining}</span> 天
                  </span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={onCheckIn}
              disabled={hasCheckedInToday}
              className={`mt-2 inline-flex items-center justify-center rounded-xl px-5 py-3 text-base font-semibold transition-all ${
                hasCheckedInToday
                  ? 'cursor-not-allowed bg-white/20 text-white/70'
                  : 'bg-white text-indigo-600 shadow-lg hover:-translate-y-0.5 hover:shadow-xl'
              }`}
            >
              {hasCheckedInToday ? '今日已打卡' : '点击打卡'}
            </button>
            <p className="text-xs text-white/80">
              {hasCheckedInToday
                ? `你已经连续打卡 ${checkInStreak} 天，坚持就是成功的秘诀！`
                : `连续打卡可以累计学习成就，当前连续 ${checkInStreak} 天`}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
