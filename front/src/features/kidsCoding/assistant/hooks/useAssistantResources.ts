import { useEffect, useState } from 'react';
import type { AssistantResourceBundle } from '../types/assistant';
import { getAssistantResources } from '../services/assistantResources';

interface UseAssistantResourcesResult {
  data: AssistantResourceBundle | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}

export function useAssistantResources(): UseAssistantResourcesResult {
  const [data, setData] = useState<AssistantResourceBundle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let canceled = false;
    setIsLoading(true);
    getAssistantResources()
      .then(bundle => {
        if (canceled) return;
        setData(bundle);
        setError(null);
      })
      .catch(err => {
        if (canceled) return;
        setError(err instanceof Error ? err : new Error('加载编程助手资源失败'));
      })
      .finally(() => {
        if (!canceled) setIsLoading(false);
      });
    return () => {
      canceled = true;
    };
  }, [refreshToken]);

  const refresh = () => setRefreshToken(prev => prev + 1);

  return { data, isLoading, error, refresh };
}
