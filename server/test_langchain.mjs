import 'dotenv/config';
import { ChatOpenAI } from 'langchain/chat_models/openai';

async function main() {
  console.log('OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY);
  const model = new ChatOpenAI({ openAIApiKey: process.env.OPENAI_API_KEY, modelName: 'gpt-4o-mini' });
  try {
    const res = await model.call('测试 LangChain 与 OpenAI 的连通性');
    console.log('LangChain response:', res);
  } catch (err) {
    console.error('LangChain call failed:');
    console.error(err);
    process.exitCode = 2;
  }
}

main();
