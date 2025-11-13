import clsx from 'clsx';
import type { PracticeQuestion } from '../types/studio';

interface AssistantPracticeSectionProps {
  questions: PracticeQuestion[];
}

const difficultyColors: Record<PracticeQuestion['difficulty'], string> = {
  easy: 'bg-emerald-500/15 text-emerald-600',
  medium: 'bg-amber-500/15 text-amber-600',
  hard: 'bg-rose-500/15 text-rose-600',
};

export function AssistantPracticeSection({ questions }: AssistantPracticeSectionProps) {
  return (
    <section className="col-span-7 rounded-[28px] bg-white/90 p-6 shadow-2xl ring-1 ring-violet-100">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-violet-500">练习中心</p>
          <h3 className="text-lg font-semibold text-slate-800">选择题 · 填空题 · 连线题</h3>
        </div>
        <button
          type="button"
          className="rounded-full border border-violet-200 px-4 py-1 text-sm font-semibold text-violet-600 hover:bg-violet-50"
        >
          管理题库
        </button>
      </header>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {questions.map(question => (
          <article
            key={question.id}
            className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-gradient-to-b from-white to-slate-50/60 p-4 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span
                className={clsx(
                  'rounded-full px-2 py-0.5 text-xs font-semibold',
                  difficultyColors[question.difficulty],
                )}
              >
                {question.difficulty === 'easy' ? '入门' : question.difficulty === 'medium' ? '进阶' : '挑战'}
              </span>
              <span className="text-xs uppercase tracking-[0.4em] text-slate-400">{question.type}</span>
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-900">{question.title}</h4>
              {'prompt' in question && (
                <p className="text-sm text-slate-600">{question.prompt}</p>
              )}
            </div>

            {question.type === 'choice' && (
              <ul className="space-y-2 text-sm text-slate-700">
                {question.options.map((option, index) => (
                  <li
                    key={option}
                    className={clsx(
                      'rounded-xl border px-3 py-2',
                      index === question.answerIndex ? 'border-emerald-400 bg-emerald-50/70' : 'border-slate-200',
                    )}
                  >
                    {String.fromCharCode(65 + index)}. {option}
                  </li>
                ))}
              </ul>
            )}

            {question.type === 'fill' && (
              <div className="space-y-2">
                {question.blanks.map(blank => (
                  <div key={blank} className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-600">
                    ______ ({blank})
                  </div>
                ))}
              </div>
            )}

            {question.type === 'match' && (
              <div className="grid grid-cols-2 gap-2 text-sm text-slate-700">
                <div className="space-y-2 rounded-2xl bg-slate-100/80 p-3">
                  {question.leftColumn.map(item => (
                    <p key={item} className="rounded-lg bg-white px-2 py-1 shadow-sm">
                      {item}
                    </p>
                  ))}
                </div>
                <div className="space-y-2 rounded-2xl bg-slate-100/80 p-3">
                  {question.rightColumn.map(item => (
                    <p key={item} className="rounded-lg bg-white px-2 py-1 shadow-sm">
                      {item}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
