import type { LLMProvider } from '../providers/baseProvider.js';

type MessageRole = 'user' | 'assistant';

interface StoredMessage {
  role: MessageRole;
  content: string;
  createdAt: number;
}

interface MemoryVector {
  embedding: number[];
  content: string;
  role: MessageRole;
  createdAt: number;
}

interface SessionMemory {
  id: string;
  history: StoredMessage[];
  vectors: MemoryVector[];
  summary?: string;
  lastSummaryIndex: number;
  lastUpdated: number;
  summarising?: boolean;
}

export interface MemoryContext {
  sessionId: string;
  summary?: string;
  relevantFacts: string[];
  recentHistory: StoredMessage[];
}

export interface MemoryMetadata {
  sessionId: string;
  summary?: string;
  factsUsed: string[];
  recentCount: number;
  totalMessages: number;
}

export interface MemoryManagerOptions {
  maxHistoryMessages?: number;
  maxStoredVectors?: number;
  vectorSimilarityK?: number;
  summaryInterval?: number;
  minFactLength?: number;
}

const DEFAULT_OPTIONS: Required<MemoryManagerOptions> = {
  maxHistoryMessages: 8,
  maxStoredVectors: 40,
  vectorSimilarityK: 3,
  summaryInterval: 6,
  minFactLength: 16,
};

export class ConversationMemoryManager {
  private sessions = new Map<string, SessionMemory>();
  private readonly opts: Required<MemoryManagerOptions>;

  constructor(private readonly provider: LLMProvider, options: MemoryManagerOptions = {}) {
    this.opts = { ...DEFAULT_OPTIONS, ...options };
  }

  async prepareContext(sessionId: string, userMessage: string): Promise<MemoryContext> {
    const session = this.ensureSession(sessionId);
    const relevantFacts = await this.searchRelevantFacts(session, userMessage, this.opts.vectorSimilarityK);
    const recentHistory = session.history.slice(-this.opts.maxHistoryMessages);
    return {
      sessionId,
      summary: session.summary,
      relevantFacts,
      recentHistory,
    };
  }

  async recordInteraction(sessionId: string, userMessage: string, assistantMessage: string): Promise<MemoryMetadata> {
    const session = this.ensureSession(sessionId);
    const now = Date.now();

    session.history.push({ role: 'user', content: userMessage, createdAt: now });
    if (this.shouldStoreFact(userMessage)) {
      await this.storeVector(session, userMessage, 'user');
    }

    session.history.push({ role: 'assistant', content: assistantMessage, createdAt: now + 1 });
    session.lastUpdated = Date.now();

    this.maybeScheduleSummary(session);

    return {
      sessionId,
      summary: session.summary,
      factsUsed: [],
      recentCount: Math.min(session.history.length, this.opts.maxHistoryMessages),
      totalMessages: session.history.length,
    };
  }

  private ensureSession(sessionId: string): SessionMemory {
    let session = this.sessions.get(sessionId);
    if (!session) {
      session = {
        id: sessionId,
        history: [],
        vectors: [],
        lastSummaryIndex: 0,
        lastUpdated: Date.now(),
      };
      this.sessions.set(sessionId, session);
    }
    return session;
  }

  private shouldStoreFact(text: string): boolean {
    if (!text) return false;
    const trimmed = text.trim();
    if (trimmed.length < this.opts.minFactLength) return false;
    if (/[?？]$/.test(trimmed)) return false;
    return true;
  }

  private async storeVector(session: SessionMemory, text: string, role: MessageRole): Promise<void> {
    try {
      const embedding = await this.embedText(text);
      if (embedding.length === 0) return;
      session.vectors.push({ embedding, content: text, role, createdAt: Date.now() });
      if (session.vectors.length > this.opts.maxStoredVectors) {
        session.vectors.splice(0, session.vectors.length - this.opts.maxStoredVectors);
      }
    } catch (err) {
      console.warn('[memory] failed to embed text for vector store:', (err as Error)?.message || err);
    }
  }

  private async searchRelevantFacts(session: SessionMemory, query: string, k: number): Promise<string[]> {
    if (!session.vectors.length || !query?.trim()) return [];
    try {
      const queryVector = await this.embedText(query);
      if (!queryVector.length) return [];

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
    } catch (err) {
      console.warn('[memory] failed to search relevant facts:', (err as Error)?.message || err);
      return [];
    }
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (!a.length || !b.length || a.length !== b.length) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i += 1) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    if (!normA || !normB) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private async embedText(text: string): Promise<number[]> {
    const result = await this.provider.embed(text);
    if (Array.isArray(result) && result.length > 0) {
      if (typeof result[0] === 'number') {
        return result as number[];
      }
      if (Array.isArray(result[0])) {
        return (result as number[][])[0] ?? [];
      }
    }
    return [];
  }

  private maybeScheduleSummary(session: SessionMemory) {
    const messagesSinceSummary = session.history.length - session.lastSummaryIndex;
    if (messagesSinceSummary < this.opts.summaryInterval) return;
    if (session.summarising) return;

    session.summarising = true;
    void this.updateSummary(session).catch((err) => {
      console.warn('[memory] summarize failed:', (err as Error)?.message || err);
    }).finally(() => {
      session.summarising = false;
    });
  }

  private async updateSummary(session: SessionMemory): Promise<void> {
    const recentMessages = session.history.slice(-this.opts.maxHistoryMessages * 2);
    if (!recentMessages.length) return;

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
    }
  }
}
