import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.OPENAI_API_BASE = 'http://localhost:8082';
console.log('SET OPENAI_API_BASE=', process.env.OPENAI_API_BASE);

try {
  const providerFactory = await import('./dist/providers/providerFactory.js');
  const getProvider = providerFactory.getProvider || providerFactory.default || providerFactory;
  const provider = getProvider('openai');
  console.log('Using provider:', provider.name);
  const res = await provider.chat({ prompt: '测试通过本地 proxy 的连接：请回 OK', systemPrompt: 'You are a helpful assistant.' });
  // 如果 proxy 要求客户端提供 Anthropic 风格的 API key，我们附带 Authorization header 到 fetch 调用
  // 由于 provider.chat 内部使用 fetch 直接调用 OpenAIProvider（由 providerFactory 返回），我们将临时
  // 覆盖全局 fetch 来在请求发送到本地 proxy 时注入 Authorization 头。注意：这是测试期间的临时覆盖。
  // 读取当前环境 OPENAI_API_KEY 作为客户端 key
  const clientKey = process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (clientKey) {
    // monkey-patch global fetch used by providers to inject header for requests to localhost:8082
    const origFetch = global.fetch || (await import('node-fetch')).default;
    global.fetch = async function (url, opts = {}) {
      try {
        const u = typeof url === 'string' ? url : url.href;
        if (u.startsWith('http://localhost:8082') || u.startsWith('http://127.0.0.1:8082')) {
          opts = opts || {};
          opts.headers = Object.assign({}, opts.headers || {}, {
            Authorization: `Bearer ${clientKey}`,
          });
        }
      } catch (e) {}
      return origFetch(url, opts);
    };
  }
  console.log('Provider response:', res);
} catch (err) {
  console.error('Test failed:', err);
}
