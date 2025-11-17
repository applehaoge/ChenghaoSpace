export type CodeLineItem = {
  id: number;
  content: string;
  type: 'comment' | 'code' | 'empty';
};

export interface FileEntry {
  id: string;
  name: string;
  path: string;
  kind?: 'file' | 'folder';
  extension?: string;
  language?: string;
  content?: string;
  encoding?: 'utf8' | 'base64';
}
