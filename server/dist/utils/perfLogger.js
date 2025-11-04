const isEnabled = () => {
    if (process.env.ENABLE_CHAT_METRICS === '1')
        return true;
    if (process.env.NODE_ENV && process.env.NODE_ENV !== 'production')
        return true;
    return false;
};
const now = () => Number(process.hrtime.bigint()) / 1000000; // convert to ms
export const createPerfLogger = (scope, extraMeta, enabled = isEnabled()) => {
    if (!enabled) {
        return {
            mark: () => {
                /* noop */
            },
            measure: () => null,
            event: () => {
                /* noop */
            },
            timeAsync: async (_label, fn) => await fn(),
            reset: () => {
                /* noop */
            },
        };
    }
    const marks = new Map();
    const baseMeta = extraMeta ? { ...extraMeta } : undefined;
    const log = (label, duration, meta) => {
        const payload = baseMeta || meta ? { ...baseMeta, ...meta } : undefined;
        if (typeof duration === 'number') {
            console.info(`[Perf:${scope}] ${label}: ${duration.toFixed(1)}ms`, payload ?? '');
        }
        else {
            console.info(`[Perf:${scope}] ${label}`, payload ?? '');
        }
    };
    return {
        mark: label => {
            marks.set(label, now());
        },
        measure: (label, startLabel, meta) => {
            const start = marks.get(startLabel);
            if (typeof start !== 'number') {
                return null;
            }
            const duration = now() - start;
            log(label, duration, meta);
            return duration;
        },
        event: (label, meta) => {
            log(label, null, meta);
        },
        timeAsync: async (label, fn, meta) => {
            const startLabel = `${label}:start`;
            marks.set(startLabel, now());
            try {
                const result = await fn();
                const start = marks.get(startLabel);
                if (typeof start === 'number') {
                    const duration = now() - start;
                    log(label, duration, meta);
                }
                return result;
            }
            finally {
                marks.delete(startLabel);
            }
        },
        reset: label => {
            if (!label) {
                marks.clear();
            }
            else {
                marks.delete(label);
            }
        },
    };
};
