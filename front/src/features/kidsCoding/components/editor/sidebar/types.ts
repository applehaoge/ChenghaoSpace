export type SidebarView = 'tasks' | 'files';

export type FileRowAction =
  | 'rename'
  | 'duplicate'
  | 'delete'
  | 'copyName'
  | 'copyRelativePath'
  | 'export';
