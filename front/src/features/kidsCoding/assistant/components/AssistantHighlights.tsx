interface AssistantHighlightsProps {
  highlights: string[];
}

export function AssistantHighlights({ highlights }: AssistantHighlightsProps) {
  return (
    <div className="col-span-5 rounded-[28px] bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 p-6 shadow-inner ring-1 ring-white/30">
      <p className="text-xs uppercase tracking-[0.4em] text-slate-600">亮点</p>
      <ul className="mt-3 space-y-2 text-base font-medium text-slate-800">
        {highlights.map(item => (
          <li key={item} className="flex items-center gap-3 rounded-2xl bg-white/70 px-4 py-2 shadow">
            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
