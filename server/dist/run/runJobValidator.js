const MAX_FILE_COUNT = 20;
const MAX_FILE_SIZE_BYTES = 100 * 1024;
const ensureSafePath = (path) => {
    if (typeof path !== 'string') {
        throw new Error('File path must be a string');
    }
    const trimmed = path.trim();
    if (!trimmed) {
        throw new Error('File path cannot be empty');
    }
    // 防止通过路径穿越写入任意文件
    if (trimmed.includes('/') || trimmed.includes('\\') || trimmed.includes('..')) {
        throw new Error('File path contains illegal characters');
    }
    return trimmed;
};
const ensureContent = (content, path) => {
    if (typeof content !== 'string') {
        throw new Error(`File ${path} content must be a string`);
    }
    const byteLength = Buffer.byteLength(content, 'utf8');
    if (byteLength > MAX_FILE_SIZE_BYTES) {
        throw new Error(`File ${path} exceeds size limit`);
    }
    return content;
};
export const sanitizeRunJobDTO = (payload) => {
    if (payload.protocolVersion !== 1) {
        throw new Error('Unsupported protocolVersion');
    }
    if (!Array.isArray(payload.files) || !payload.files.length) {
        throw new Error('files must be a non-empty array');
    }
    if (payload.files.length > MAX_FILE_COUNT) {
        throw new Error(`Too many files. Max supported files: ${MAX_FILE_COUNT}`);
    }
    const sanitizedFiles = [];
    const seen = new Set();
    payload.files.forEach(file => {
        const safePath = ensureSafePath(file.path);
        if (!safePath.toLowerCase().endsWith('.py')) {
            throw new Error(`Only Python files are supported: ${safePath}`);
        }
        if (seen.has(safePath)) {
            throw new Error(`Duplicate file path detected: ${safePath}`);
        }
        const content = ensureContent(file.content, safePath);
        sanitizedFiles.push({ path: safePath, content });
        seen.add(safePath);
    });
    const entryPath = ensureSafePath(payload.entryPath);
    if (!seen.has(entryPath)) {
        throw new Error('entryPath must exist in files');
    }
    return {
        protocolVersion: 1,
        files: sanitizedFiles,
        entryPath,
    };
};
