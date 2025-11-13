import type { AssistantResourceBundle } from '../types/assistant';
import { mockAssistantResources } from '../data/mockAssistantResources';

export async function getAssistantResources(): Promise<AssistantResourceBundle> {
  // 预留给后端 API，当前返回本地 mock，模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 150));
  return mockAssistantResources;
}
