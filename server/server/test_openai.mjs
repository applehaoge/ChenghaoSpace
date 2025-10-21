import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  const providerFactory = await import('./dist/providers/providerFactory.js');
  const getProvider = providerFactory.getProvider || providerFactory.default || providerFactory;
  const provider = getProvider('openai');
  console.log('Using provider:', provider.name);
  const res = await provider.chat({ prompt: '测试 OpenAI 连接：请简单回答 OK', systemPrompt: 'You are a helpful assistant.' });
  console.log('Provider response:', res);
} catch (err) {
  console.error('Test failed:', err);
}
