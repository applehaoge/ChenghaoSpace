import clsx from 'clsx';
import type { GalleryItem } from '../types/studio';

interface AssistantGallerySectionProps {
  gallery: GalleryItem[];
}

export function AssistantGallerySection({ gallery }: AssistantGallerySectionProps) {
  return (
    <section className="col-span-5 flex h-full flex-col rounded-[28px] bg-white/90 p-6 shadow-2xl ring-1 ring-blue-100">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-blue-500">素材库</p>
          <h3 className="text-lg font-semibold text-slate-800">图片 / 视频快速预览</h3>
        </div>
        <button
          type="button"
          className="rounded-full bg-gradient-to-r from-emerald-400 to-cyan-500 px-4 py-1 text-sm font-semibold text-white shadow-lg hover:opacity-90"
        >
          上传素材
        </button>
      </header>

      <div className="mt-4 flex flex-1 gap-3 overflow-x-auto pb-2">
        {gallery.map(item => (
          <article
            key={item.id}
            className={clsx(
              'min-w-[180px] flex-1 rounded-2xl border p-3 shadow-lg transition-all duration-300 hover:-translate-y-1',
            )}
            style={{
              borderColor: `${item.accent}33`,
              boxShadow: `0 12px 40px ${item.accent}40`,
              background: `linear-gradient(145deg, ${item.accent}22, #ffffff)`,
            }}
          >
            <div className="relative h-32 overflow-hidden rounded-xl">
              <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover" />
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-xs font-semibold text-slate-700">
                {item.mediaType.toUpperCase()}
              </span>
            </div>
            <h4 className="mt-3 text-base font-semibold text-slate-800">{item.title}</h4>
            <p className="text-sm text-slate-600">{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
