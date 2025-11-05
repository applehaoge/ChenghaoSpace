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
    <aside className="w-full h-full flex flex-col bg-white border-r border-gray-100 shadow-sm overflow-hidden pt-4 sm:pt-6">
      <div className="flex justify-between items-center p-[15px_20px] bg-gradient-to-r from-blue-400 to-indigo-400 text-white rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-blue-500 font-bold text-lg">
            橙
          </div>
          <span className="text-xl font-bold">橙浩空间</span>
          <span className="text-xs bg-white/30 px-1.5 py-0.5 rounded">BETA</span>
        </div>
        <div className="relative">
          <div
            className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-blue-500 cursor-pointer"
            onClick={handleNotificationClick}
          >
            <i className="fas fa-paper-plane"></i>
          </div>
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>
      </div>

      <button
        className="w-[calc(100%-40px)] h-11 mx-[20px] my-5 bg-gradient-to-r from-blue-400 to-indigo-400 text-white rounded-xl border-none text-sm font-medium flex items-center justify-center gap-1 shadow-sm hover:shadow-md transition-shadow"
        onClick={onCreateNewTask}
      >
        <i className="fas fa-plus-circle"></i>
        <span>开启新聊天</span>
        <span className="text-xs bg-white/30 px-1.5 py-0.5 rounded">Ctrl</span>
      </button>

      <div className="p-[0_20px_10px] text-xs text-gray-500">聊天</div>
      <div className="p-[0_20px] flex-1 min-h-0 overflow-y-auto pr-1 custom-scrollbar">
        <ul className="list-none">
          {tasks.map((task, index) => (
            <li
              key={task.id}
              className={`flex items-center gap-2.5 p-3 rounded-md cursor-pointer transition-colors ${
                index === tasks.length - 1 ? 'mb-0' : 'mb-2'
              } ${
                activeTaskId === task.id
                  ? 'bg-blue-50 border border-blue-200 text-blue-600'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
              onClick={() => onSelectTask?.(task.id)}
            >
              {task.isBrand ? (
                <i className={`fab fa-${task.icon} text-${task.color}`}></i>
              ) : (
                <i className={`fas fa-${task.icon} text-${task.color}`}></i>
              )}
              <div className="flex flex-col flex-1 min-w-0">
                <span
                  className={`text-sm truncate ${
                    activeTaskId === task.id ? 'text-blue-700 font-medium' : 'text-gray-800'
                  }`}
                >
                  {task.name}
                </span>
                {task.lastMessagePreview ? (
                  <span
                    className={`text-xs truncate ${
                      activeTaskId === task.id ? 'text-blue-500' : 'text-gray-500'
                    }`}
                  >
                    {task.lastMessagePreview}
                  </span>
                ) : null}
              </div>
              <button
                type="button"
                className="ml-2 text-gray-400 hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded"
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
