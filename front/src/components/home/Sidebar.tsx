import { toast } from 'sonner';

export type SidebarTask = {
  id: string;
  name: string;
  icon: string;
  color: string;
  isBrand?: boolean;
  lastMessagePreview?: string;
};

export type SidebarProps = {
  onCreateNewTask: () => Promise<void>;
  tasks: SidebarTask[];
  activeTaskId?: string | null;
  onSelectTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
};

export function Sidebar({
  onCreateNewTask,
  tasks,
  activeTaskId,
  onSelectTask,
  onDeleteTask,
}: SidebarProps) {
  const handleNotificationClick = () => {
    toast.info('您有新的通知');
  };

  return (
    <aside className="flex h-full w-full flex-col overflow-hidden border-r border-gray-100 bg-white pt-1 sm:pt-2">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-base font-semibold text-blue-500">
            橙
          </div>
          <div className="flex flex-col justify-center gap-1 leading-tight">
            <span className="text-2xl font-semibold text-gray-900 tracking-wide">橙浩空间</span>
            <span className="text-xs text-gray-400">AI 学习助手</span>
          </div>
        </div>
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white shadow-sm transition-colors hover:bg-blue-600"
          onClick={handleNotificationClick}
          aria-label="查看通知"
        >
          <i className="fas fa-paper-plane"></i>
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>
      </div>

      <button
        className="mx-5 my-5 flex h-11 items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-500/90 text-sm font-medium text-white transition-all hover:bg-blue-500"
        onClick={onCreateNewTask}
      >
        <i className="fas fa-plus-circle"></i>
        <span>开启新聊天</span>
        <span className="rounded bg-white/20 px-1.5 py-0.5 text-xs">Ctrl</span>
      </button>

      <div className="px-5 pb-3 text-xs font-medium uppercase tracking-widest text-gray-400">聊天</div>
      <div className="custom-scrollbar flex-1 min-h-0 overflow-y-auto px-5 pb-4">
        <ul className="list-none">
          {tasks.map((task, index) => (
            <li
              key={task.id}
              className={`mb-2 flex cursor-pointer items-center gap-2.5 rounded-lg border bg-white p-3 transition-colors ${
                index === tasks.length - 1 ? 'mb-0' : ''
              } ${
                activeTaskId === task.id
                  ? 'border-blue-200 bg-blue-50 text-blue-700'
                  : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => onSelectTask?.(task.id)}
            >
              {task.isBrand ? (
                <i className={`fab fa-${task.icon} text-${task.color}`}></i>
              ) : (
                <i className={`fas fa-${task.icon} text-${task.color}`}></i>
              )}
              <div className="flex flex-col flex-1 min-w-0">
                <span className={`truncate text-sm ${activeTaskId === task.id ? 'font-medium text-blue-700' : 'text-gray-800'}`}>
                  {task.name}
                </span>
                {task.lastMessagePreview ? (
                  <span
                    className={`truncate text-xs ${
                      activeTaskId === task.id ? 'text-blue-500' : 'text-gray-500'
                    }`}
                  >
                    {task.lastMessagePreview}
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                className="ml-2 rounded text-gray-300 transition-colors hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                aria-label="删除聊天"
                onClick={event => {
                  event.stopPropagation();
                  onDeleteTask?.(task.id);
                }}
              >
                <i className="fas fa-trash-alt"></i>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
