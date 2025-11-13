import clsx from 'clsx';
import type { KnowledgePoint } from '../types/studio';

interface AssistantKnowledgeSectionProps {
  knowledge: KnowledgePoint[];
}

export function AssistantKnowledgeSection({ knowledge }: AssistantKnowledgeSectionProps) {
  return (
    <section className="col-span-12 grid gap-5 lg:grid-cols-2">
      {knowledge.map(point => (
        <article
          key={point.id}
          className="flex flex-col gap-4 rounded-[28px] border border-indigo-100 bg-white/95 p-5 shadow-xl"
        >
          <div className="relative h-48 overflow-hidden rounded-2xl">
            <img src={point.mediaUrl} alt={point.title} className="h-full w-full object-cover" />
            <span className="absolute left-4 top-4 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700">
              {point.mediaType.toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-indigo-500">知识点</p>
            <h3 className="text-lg font-semibold text-slate-900">{point.title}</h3>
            <p className="text-sm text-slate-600">{point.summary}</p>
          </div>
          <ul className="space-y-2 text-sm text-slate-700">
            {point.tips.map(tip => (
              <li
                key={tip}
                className={clsx(
                  'rounded-2xl border border-slate-200 px-4 py-2 shadow-sm',
                  'bg-gradient-to-r from-indigo-50 via-white to-white',
                )}
              >
                {tip}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
}
