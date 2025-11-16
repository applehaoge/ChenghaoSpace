export type CodeLineItem = {
  id: number;
  content: string;
  type: 'comment' | 'code' | 'empty';
};

export interface FileEntry {
  id: string;
  name: string;
  kind?: 'file' | 'folder';
  extension?: string;
}
