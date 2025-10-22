import { promises as fs } from 'node:fs';
import path from 'node:path';
export class FileMemoryStore {
    constructor(options) {
        this.dir = options.directory;
    }
    async ensureDir() {
        await fs.mkdir(this.dir, { recursive: true });
    }
    filePath(sessionId) {
        return path.join(this.dir, `${sessionId}.json`);
    }
    async listSessionIds() {
        try {
            await this.ensureDir();
            const entries = await fs.readdir(this.dir, { withFileTypes: true });
            return entries
                .filter(entry => entry.isFile() && entry.name.endsWith('.json'))
                .map(entry => entry.name.slice(0, -5));
        }
        catch (err) {
            const code = err?.code;
            if (code === 'ENOENT')
                return [];
            console.warn('[memory] failed to list sessions:', err?.message || err);
            return [];
        }
    }
    async loadSession(sessionId) {
        try {
            const data = await fs.readFile(this.filePath(sessionId), 'utf8');
            const parsed = JSON.parse(data);
            return parsed;
        }
        catch (err) {
            const code = err?.code;
            if (code === 'ENOENT')
                return null;
            console.warn('[memory] failed to load session:', err?.message || err);
            return null;
        }
    }
    async saveSession(snapshot) {
        try {
            await this.ensureDir();
            const finalPath = this.filePath(snapshot.id);
            const tempPath = `${finalPath}.${Date.now()}.tmp`;
            const payload = JSON.stringify(snapshot);
            await fs.writeFile(tempPath, payload, 'utf8');
            await fs.rename(tempPath, finalPath);
        }
        catch (err) {
            console.warn('[memory] failed to save session:', err?.message || err);
        }
    }
    async deleteSession(sessionId) {
        try {
            await fs.unlink(this.filePath(sessionId));
        }
        catch (err) {
            const code = err?.code;
            if (code === 'ENOENT')
                return;
            console.warn('[memory] failed to delete session:', err?.message || err);
        }
    }
}
