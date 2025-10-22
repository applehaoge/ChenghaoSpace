import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { MemoryStore, SessionMemorySnapshot } from '../conversationMemory.js';

export interface FileMemoryStoreOptions {
  directory: string;
}

export class FileMemoryStore implements MemoryStore {
  private readonly dir: string;

  constructor(options: FileMemoryStoreOptions) {
    this.dir = options.directory;
  }

  private async ensureDir(): Promise<void> {
    await fs.mkdir(this.dir, { recursive: true });
  }

  private filePath(sessionId: string): string {
    return path.join(this.dir, `${sessionId}.json`);
  }

  async listSessionIds(): Promise<string[]> {
    try {
      await this.ensureDir();
      const entries = await fs.readdir(this.dir, { withFileTypes: true });
      return entries
        .filter(entry => entry.isFile() && entry.name.endsWith('.json'))
        .map(entry => entry.name.slice(0, -5));
    } catch (err) {
      const code = (err as NodeJS.ErrnoException)?.code;
      if (code === 'ENOENT') return [];
      console.warn('[memory] failed to list sessions:', (err as Error)?.message || err);
      return [];
    }
  }

  async loadSession(sessionId: string): Promise<SessionMemorySnapshot | null> {
    try {
      const data = await fs.readFile(this.filePath(sessionId), 'utf8');
      const parsed = JSON.parse(data) as SessionMemorySnapshot;
      return parsed;
    } catch (err) {
      const code = (err as NodeJS.ErrnoException)?.code;
      if (code === 'ENOENT') return null;
      console.warn('[memory] failed to load session:', (err as Error)?.message || err);
      return null;
    }
  }

  async saveSession(snapshot: SessionMemorySnapshot): Promise<void> {
    try {
      await this.ensureDir();
      const finalPath = this.filePath(snapshot.id);
      const tempPath = `${finalPath}.${Date.now()}.tmp`;
      const payload = JSON.stringify(snapshot);
      await fs.writeFile(tempPath, payload, 'utf8');
      await fs.rename(tempPath, finalPath);
    } catch (err) {
      console.warn('[memory] failed to save session:', (err as Error)?.message || err);
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      await fs.unlink(this.filePath(sessionId));
    } catch (err) {
      const code = (err as NodeJS.ErrnoException)?.code;
      if (code === 'ENOENT') return;
      console.warn('[memory] failed to delete session:', (err as Error)?.message || err);
    }
  }
}
