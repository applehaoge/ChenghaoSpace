import { CheckCircle2, FolderOpen, Link2, Play, Sparkles } from 'lucide-react';
import type { GalleryItem, HeroShowcase } from '../types/studio';

interface AssistantTaskBoardProps {
  hero: HeroShowcase;
  gallery: GalleryItem[];
  highlights: string[];
}

export function AssistantTaskBoard({ hero, gallery, highlights }: AssistantTaskBoardProps) {
  const showcaseImage = gallery[0];
  const exampleImage = gallery[1] ?? gallery[0];

  const quickLinks = [
    { label: '查看步骤文档', href: '#', icon: <Link2 size={14} /> },
    { label: '打开素材文件夹', href: '#', icon: <FolderOpen size={14} /> },
  ];

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto pr-1 text-slate-900">
      <section className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <article className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500">今日任务</p>
              <h2 className="text-lg font-semibold">{hero.title}</h2>
              <p className="text-sm text-slate-600">{hero.subtitle}</p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Play size={14} />
              视频
            </button>
          </header>
          <div className="mt-3 flex gap-3">
            <video
              src={hero.videoUrl}
              poster={hero.posterUrl}
              className="h-32 w-2/3 rounded-xl border border-slate-200 object-cover"
              controls
            />
            <div className="flex-1 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
              <p>{hero.description}</p>
              <div className="mt-3 flex gap-2 text-xs">
                {quickLinks.map(link => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-slate-600 hover:bg-slate-100"
                  >
                    {link.icon}
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </article>

        <div className="grid gap-3">
          <article className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow">
            <p className="text-[11px] uppercase tracking-[0.35em] text-indigo-500">素材</p>
            <div className="mt-2 h-24 overflow-hidden rounded-xl">
              <img src={showcaseImage.thumbnail} alt={showcaseImage.title} className="h-full w-full object-cover" />
            </div>
            <h3 className="mt-2 text-base font-semibold">{showcaseImage.title}</h3>
            <p className="text-xs text-slate-600">{showcaseImage.description}</p>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow">
            <p className="text-[11px] uppercase tracking-[0.35em] text-indigo-500">示例</p>
            <div className="mt-2 h-20 overflow-hidden rounded-xl">
              <img src={exampleImage.thumbnail} alt={exampleImage.title} className="h-full w-full object-cover" />
            </div>
            <h3 className="mt-2 text-sm font-semibold">{exampleImage.title}</h3>
            <p className="text-xs text-slate-600 line-clamp-2">{exampleImage.description}</p>
          </article>
        </div>
      </section>

      <section className="grid gap-3 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <article className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow">
          <header className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.35em] text-slate-500">完成顺序</p>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">约 25min</span>
          </header>
          <ol className="mt-2 space-y-1.5 text-sm text-slate-700">
            {hero.tasks.map(task => (
              <li
                key={task.title}
                className="grid grid-cols-[32px_1fr] items-start gap-2 rounded-xl bg-slate-50 px-3 py-2"
              >
                <span className="text-xs font-semibold text-indigo-600">{task.badge}</span>
                <div>
                  <p className="font-semibold text-slate-900">{task.title}</p>
                  <p className="text-xs text-slate-600">{task.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow">
          <header className="flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-indigo-500">
            <Sparkles size={14} />
            开工前
          </header>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-700">
            {highlights.slice(0, 3).map(item => (
              <li key={item} className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2">
                <CheckCircle2 size={16} className="mt-0.5 text-indigo-500" />
                {item}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-3 w-full rounded-full border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
          >
            打开素材
          </button>
        </article>
      </section>
    </div>
  );
}
