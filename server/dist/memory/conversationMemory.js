const DEFAULT_OPTIONS = {
    maxHistoryMessages: 8,
    maxStoredVectors: 40,
    vectorSimilarityK: 3,
    summaryInterval: 6,
    minFactLength: 16,
};
export class ConversationMemoryManager {
    constructor(provider, options = {}) {
        this.provider = provider;
        this.sessions = new Map();
        const { store, ...rest } = options;
        this.opts = { ...DEFAULT_OPTIONS, ...rest };
        this.store = store;
    }
    async prepareContext(sessionId, userMessage) {
        const session = await this.ensureSession(sessionId);
        const relevantFacts = await this.searchRelevantFacts(session, userMessage, this.opts.vectorSimilarityK);
        const recentHistory = session.history.slice(-this.opts.maxHistoryMessages);
        return {
            sessionId,
            summary: session.summary,
            relevantFacts,
            recentHistory,
        };
    }
    async recordInteraction(sessionId, userMessage, assistantMessage) {
        const session = await this.ensureSession(sessionId);
        const now = Date.now();
        session.history.push({ role: 'user', content: userMessage, createdAt: now });
        if (this.shouldStoreFact(userMessage)) {
            await this.storeVector(session, userMessage, 'user');
        }
        session.history.push({ role: 'assistant', content: assistantMessage, createdAt: now + 1 });
        session.lastUpdated = Date.now();
        this.maybeScheduleSummary(session);
        await this.persistSession(session);
        return {
            sessionId,
            summary: session.summary,
            factsUsed: [],
            recentCount: Math.min(session.history.length, this.opts.maxHistoryMessages),
            totalMessages: session.history.length,
        };
    }
    async ensureSession(sessionId) {
        let session = this.sessions.get(sessionId);
        if (session)
            return session;
        if (this.store) {
            try {
                const snapshot = await this.store.loadSession(sessionId);
                if (snapshot) {
                    session = {
                        ...snapshot,
                        summarising: false,
                    };
                    this.sessions.set(sessionId, session);
                    return session;
                }
            }
            catch (err) {
                console.warn('[memory] failed to load session from store:', err?.message || err);
            }
        }
        session = {
            id: sessionId,
            history: [],
            vectors: [],
            lastSummaryIndex: 0,
            lastUpdated: Date.now(),
        };
        this.sessions.set(sessionId, session);
        return session;
    }
    async persistSession(session) {
        if (!this.store)
            return;
        const snapshot = {
            id: session.id,
            history: session.history,
            vectors: session.vectors,
            summary: session.summary,
            lastSummaryIndex: session.lastSummaryIndex,
            lastUpdated: session.lastUpdated,
        };
        try {
            await this.store.saveSession(snapshot);
        }
        catch (err) {
            console.warn('[memory] failed to persist session:', err?.message || err);
        }
    }
    shouldStoreFact(text) {
        if (!text)
            return false;
        const trimmed = text.trim();
        if (trimmed.length < this.opts.minFactLength)
            return false;
        if (/[?？]$/.test(trimmed))
            return false;
        return true;
    }
    async storeVector(session, text, role) {
        try {
            const embedding = await this.embedText(text);
            if (embedding.length === 0)
                return;
            session.vectors.push({ embedding, content: text, role, createdAt: Date.now() });
            if (session.vectors.length > this.opts.maxStoredVectors) {
                session.vectors.splice(0, session.vectors.length - this.opts.maxStoredVectors);
            }
        }
        catch (err) {
            console.warn('[memory] failed to embed text for vector store:', err?.message || err);
        }
    }
    async searchRelevantFacts(session, query, k) {
        if (!session.vectors.length || !query?.trim())
            return [];
        try {
            const queryVector = await this.embedText(query);
            if (!queryVector.length)
                return [];
            const scored = session.vectors
                .map((vector) => ({
                score: this.cosineSimilarity(vector.embedding, queryVector),
                value: vector.content,
            }))
                .filter(item => Number.isFinite(item.score))
                .sort((a, b) => b.score - a.score)
                .slice(0, k)
                .filter(item => item.score > 0.2);
            return Array.from(new Set(scored.map(item => item.value)));
        }
        catch (err) {
            console.warn('[memory] failed to search relevant facts:', err?.message || err);
            return [];
        }
    }
    cosineSimilarity(a, b) {
        if (!a.length || !b.length || a.length !== b.length)
            return 0;
        let dot = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < a.length; i += 1) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        if (!normA || !normB)
            return 0;
        return dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }
    async embedText(text) {
        const result = await this.provider.embed(text);
        if (Array.isArray(result) && result.length > 0) {
            if (typeof result[0] === 'number') {
                return result;
            }
            if (Array.isArray(result[0])) {
                return result[0] ?? [];
            }
        }
        return [];
    }
    maybeScheduleSummary(session) {
        const messagesSinceSummary = session.history.length - session.lastSummaryIndex;
        if (messagesSinceSummary < this.opts.summaryInterval)
            return;
        if (session.summarising)
            return;
        session.summarising = true;
        void this.updateSummary(session).catch((err) => {
            console.warn('[memory] summarize failed:', err?.message || err);
        }).finally(() => {
            session.summarising = false;
        });
    }
    async updateSummary(session) {
        const recentMessages = session.history.slice(-this.opts.maxHistoryMessages * 2);
        if (!recentMessages.length)
            return;
        const conversationText = recentMessages
            .map((msg) => `${msg.role === 'user' ? '用户' : '助手'}：${msg.content}`)
            .join('\n');
        const instruction = session.summary
            ? `已有对话摘要如下：\n${session.summary}\n\n请基于该摘要和最近新增的对话更新摘要，保持语言精炼，仅记录对话中长期有用的事实。`
            : '请将以下对话整理成不超过 80 字的摘要，突出长期需记住的事实。';
        const prompt = `${instruction}\n\n最近对话：\n${conversationText}`;
        const res = await this.provider.chat({
            prompt,
            systemPrompt: 'You are a helpful assistant that writes concise Chinese summaries of conversations.',
        });
        const summary = res.text?.trim();
        if (summary) {
            session.summary = summary;
            session.lastSummaryIndex = session.history.length;
            await this.persistSession(session);
        }
    }
}
