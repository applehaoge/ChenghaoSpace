import type { FileEntry } from '@/features/kidsCoding/types/editor';

export interface FileTreeNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  depth: number;
  parentId?: string;
  path: string;
  children: FileTreeNode[];
  entry: FileEntry;
}

export interface FlattenedFileTreeNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  depth: number;
  parentId?: string;
  path: string;
  hasChildren: boolean;
  isExpanded: boolean;
  entry: FileEntry;
}

export function buildFileTree(entries: FileEntry[]): FileTreeNode[] {
  const nodes = new Map<string, FileTreeNode>();
  entries.forEach(entry => {
    nodes.set(entry.id, createTreeNode(entry));
  });

  const folderByPath = new Map<string, FileTreeNode>();
  entries.forEach(entry => {
    if (entry.kind === 'folder') {
      const path = getEntryPath(entry);
      if (path) {
        folderByPath.set(path, nodes.get(entry.id)!);
      }
    }
  });

  const roots: FileTreeNode[] = [];
  entries.forEach(entry => {
    const node = nodes.get(entry.id)!;
    const entryPath = node.path;
    const parentPath = getParentDirectoryPath(entryPath);
    const parentNode = parentPath ? folderByPath.get(parentPath) : undefined;
    if (parentNode) {
      node.parentId = parentNode.id;
      parentNode.children.push(node);
    } else {
      roots.push(node);
    }
  });

  roots.forEach(root => assignDepth(root, 0));
  return roots;
}

export function flattenFileTree(
  nodes: FileTreeNode[],
  expandedFolderIds: Set<string>,
): FlattenedFileTreeNode[] {
  const acc: FlattenedFileTreeNode[] = [];
  const walk = (list: FileTreeNode[]) => {
    list.forEach(node => {
      const hasChildren = node.children.length > 0;
      const isExpanded = hasChildren && expandedFolderIds.has(node.id);
      acc.push({
        id: node.id,
        name: node.name,
        type: node.type,
        depth: node.depth,
        parentId: node.parentId,
        path: node.path,
        hasChildren,
        isExpanded,
        entry: node.entry,
      });
      if (isExpanded) {
        walk(node.children);
      }
    });
  };
  walk(nodes);
  return acc;
}

export function getEntryPath(entry: FileEntry) {
  return (entry.path ?? entry.name ?? '').trim();
}

export function getParentDirectoryPath(path: string) {
  const trimmed = path.trim();
  if (!trimmed) return '';
  const slashIndex = trimmed.lastIndexOf('/');
  if (slashIndex <= 0) {
    return '';
  }
  return trimmed.slice(0, slashIndex);
}

export function collectAncestorPaths(path: string) {
  const trimmed = path.trim();
  if (!trimmed.includes('/')) {
    return [];
  }
  const segments = trimmed.split('/');
  const ancestors: string[] = [];
  for (let index = 0; index < segments.length - 1; index += 1) {
    ancestors.push(segments.slice(0, index + 1).join('/'));
  }
  return ancestors;
}

function createTreeNode(entry: FileEntry): FileTreeNode {
  return {
    id: entry.id,
    name: entry.name,
    type: entry.kind === 'folder' ? 'folder' : 'file',
    depth: 0,
    parentId: undefined,
    path: getEntryPath(entry),
    children: [],
    entry,
  };
}

function assignDepth(node: FileTreeNode, depth: number) {
  node.depth = depth;
  node.children.forEach(child => assignDepth(child, depth + 1));
}
