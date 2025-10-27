import { promises as fs } from 'node:fs';
import path from 'node:path';
import { ensureDirectory } from '../utils/fsHelpers.js';
const registryFilePath = path.resolve(process.cwd(), 'server_data', 'uploads', 'upload_index.json');
const readRegistry = async () => {
    try {
        const data = await fs.readFile(registryFilePath, 'utf8');
        return JSON.parse(data);
    }
    catch (error) {
        if (error?.code === 'ENOENT') {
            return {};
        }
        throw error;
    }
};
const writeRegistry = async (records) => {
    await ensureDirectory(path.dirname(registryFilePath));
    const payload = JSON.stringify(records, null, 2);
    await fs.writeFile(registryFilePath, payload, 'utf8');
};
export const registerUpload = async (record) => {
    const registry = await readRegistry();
    registry[record.fileId] = record;
    await writeRegistry(registry);
};
export const getUploadRecord = async (fileId) => {
    if (!fileId)
        return null;
    const registry = await readRegistry();
    return registry[fileId] || null;
};
export const removeUploadRecord = async (fileId) => {
    if (!fileId)
        return;
    const registry = await readRegistry();
    if (!(fileId in registry))
        return;
    delete registry[fileId];
    await writeRegistry(registry);
};
