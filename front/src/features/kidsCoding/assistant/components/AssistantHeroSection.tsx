import { Volume2 } from 'lucide-react';
import clsx from 'clsx';
import type { HeroShowcase } from '../types/studio';

interface AssistantHeroSectionProps {
  hero: HeroShowcase;
}

export function AssistantHeroSection({ hero }: AssistantHeroSectionProps) {
  return (
    <section className="col-span-7 flex h-full flex-col justify-between rounded-[28px] bg-gradient-to-br from-indigo-500/80 via-purple-500/70 to-pink-500/80 p-6 text-white shadow-2xl ring-1 ring-white/20">
      <div className="space-y-2">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs uppercase tracking-[0.3em]">
          <span className="h-2 w-2 rounded-full bg-amber-300" />
          Spotlight Lesson
        </p>
        <h2 className="text-3xl font-bold leading-tight">{hero.title}</h2>
        <p className="text-base opacity-80">{hero.subtitle}</p>
        <p className="text-sm opacity-80">{hero.description}</p>
      </div>

      <div className="relative mt-4 flex flex-1 items-center justify-center overflow-hidden rounded-3xl border border-white/20 bg-black/30">
        <video
          className="h-full w-full object-cover opacity-80"
          src={hero.videoUrl}
          poster={hero.posterUrl}
          controls
        />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl bg-black/40 px-4 py-2 text-sm">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-[0.4em] opacity-70">Soundtrack</span>
            <span className="font-semibold">Storybook – lo-fi mix</span>
          </div>
          <a
            href={hero.soundtrackUrl}
            className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1 text-sm font-semibold shadow-lg backdrop-blur hover:bg-white/30"
          >
            <Volume2 size={16} />
            试听
          </a>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {hero.tasks.map(task => (
          <div
            key={task.title}
            className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm shadow-lg backdrop-blur"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/70">{task.badge}</p>
            <p className="mt-1 text-base font-semibold">{task.title}</p>
            <p className="text-[13px] text-white/80">{task.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
