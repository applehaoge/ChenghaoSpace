import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { ensureDirectory, resolveWithinCwd } from './fsHelpers.js';
const TEMP_PREFIX = 'fs-helpers-test-';
let tempRoot;
beforeEach(async () => {
    tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), TEMP_PREFIX));
});
afterEach(async () => {
    try {
        await fs.rm(tempRoot, { recursive: true, force: true });
    }
    catch {
        // ignore cleanup errors for safety
    }
});
describe('fsHelpers', () => {
    it('resolves paths relative to process cwd', () => {
        const target = resolveWithinCwd('uploads', 'images');
        expect(target).toBe(path.resolve(process.cwd(), 'uploads', 'images'));
    });
    it('creates nested directories when needed', async () => {
        const nested = path.join(tempRoot, 'deep', 'nested', 'dir');
        await ensureDirectory(nested);
        const stats = await fs.stat(nested);
        expect(stats.isDirectory()).toBe(true);
    });
});
