import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
export class OpenAIProvider {
    constructor(apiKey, baseUrl, apiPath) {
        this.name = 'openai';
        this.apiKey = apiKey;
        this.baseUrl = baseUrl && baseUrl.trim() ? baseUrl.replace(/\/+$/, '') : (process.env.OPENAI_API_BASE || process.env.OPENAI_API_URL || 'https://api.openai.com');
        // allow overriding the specific API path, e.g. /v1/messages?beta=true
        this.apiPath = apiPath && apiPath.trim() ? apiPath.trim() : (process.env.OPENAI_API_PATH || undefined);
    }
    async embed(text) {
        const texts = Array.isArray(text) ? text : [text];
        // Normalize base to avoid duplicate /v1 if user sets OPENAI_API_BASE including /v1
        const baseNoV1 = this.baseUrl.replace(/\/v1(?:\/.*)?$/i, '').replace(/\/+$/, '');
        // if apiPath is set, prefer that full path under baseNoV1 (handles cases like /v1/messages?beta=true)
        const embeddingsPath = this.apiPath ? this.apiPath.replace(/^[\/]+/, '') : 'v1/embeddings';
        const url = `${baseNoV1}/${embeddingsPath}`;
        const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
        const agent = proxy ? new HttpsProxyAgent(proxy) : undefined;
        const res = await fetch(url, {
            method: 'POST',
            agent: agent,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify({ model: 'text-embedding-3-small', input: texts })
        });
        const data = await res.json();
        if (!data || !data.data)
            throw new Error('invalid embeddings response');
        const embeddings = data.data.map((d) => d.embedding);
        return embeddings.length === 1 ? embeddings[0] : embeddings;
    }
    async chat(opts) {
        const body = {
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: opts.systemPrompt || 'You are a helpful assistant.' },
                ...(opts.conversation || []),
                { role: 'user', content: opts.prompt }
            ]
        };
        const baseNoV1 = this.baseUrl.replace(/\/v1(?:\/.*)?$/i, '').replace(/\/+$/, '');
        // prefer explicit apiPath for chat if provided, otherwise use v1/chat/completions
        const chatPath = this.apiPath ? this.apiPath.replace(/^[\/]+/, '') : 'v1/chat/completions';
        let url = `${baseNoV1}/${chatPath}`;
        const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
        const agent = proxy ? new HttpsProxyAgent(proxy) : undefined;
        // If apiPath points to /v1/messages and chat/completions fails, fall back to messages endpoint
        try {
            let res = await fetch(url, {
                agent: agent,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                const data = await res.json();
                const text = data?.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : JSON.stringify(data);
                return { text, metadata: { provider: this.name } };
            }
            // If response not ok, try fallback
            const fallbackPath = 'v1/messages?beta=true';
            url = `${baseNoV1}/${fallbackPath}`;
            const res2 = await fetch(url, {
                agent: agent,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify(body)
            });
            const data2 = await res2.json();
            const text2 = data2?.choices && data2.choices[0] && data2.choices[0].message ? data2.choices[0].message.content : JSON.stringify(data2);
            return { text: text2, metadata: { provider: this.name, fallback: true } };
        }
        catch (err) {
            // rethrow to be handled by caller
            throw err;
        }
    }
}
