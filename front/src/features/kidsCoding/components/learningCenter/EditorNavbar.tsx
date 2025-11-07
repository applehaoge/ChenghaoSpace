import clsx from 'clsx';

interface EditorNavbarProps {
  onOpenMission: () => void;
  onSave: () => void;
  onFormat: () => void;
  onOpenAssistant: () => void;
}

const NAV_ITEMS = [
  { label: '代码编辑器', icon: 'fa-code', active: true },
  { label: '保持 · 编程助手', icon: 'fa-robot', active: false },
];

export function EditorNavbar({ onOpenMission, onSave, onFormat, onOpenAssistant }: EditorNavbarProps) {
  return (
    <nav className="rounded-3xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 p-6 text-white shadow-xl shadow-blue-500/30">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {NAV_ITEMS.map(item => (
              <span
                key={item.label}
                className={clsx(
                  'flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition',
                  item.active ? 'bg-white text-blue-600 shadow-lg shadow-blue-500/40' : 'bg-white/10 text-white/80'
                )}
              >
                <i className={clsx('fa-solid', item.icon)} />
                {item.label}
              </span>
            ))}
          </div>
          <p className="text-sm text-white/80">
            欢迎回到 AI 国度，新的任务已经就绪，随时打开左侧任务栏查看剧情与提示。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onOpenMission}
            className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2 text-sm font-medium transition hover:bg-white/25"
          >
            <i className="fa-solid fa-map" />
            任务说明
          </button>
          <button
            type="button"
            onClick={onSave}
            className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2 text-sm font-medium transition hover:bg-white/25"
          >
            <i className="fa-solid fa-floppy-disk" />
            保存进度
          </button>
          <button
            type="button"
            onClick={onFormat}
            className="flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2 text-sm font-medium transition hover:bg-white/25"
          >
            <i className="fa-solid fa-wand-magic-sparkles" />
            自动格式化
          </button>
          <button
            type="button"
            onClick={onOpenAssistant}
            className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-slate-100"
          >
            <i className="fa-solid fa-comments" />
            呼叫助手
          </button>
        </div>
      </div>
    </nav>
  );
}
