import { useEffect, useState } from 'react';
import type { ProgrammingAssistantContent } from '../types/studio';
import { mockStudioContent } from '../data/mockStudioContent';

interface UseProgrammingAssistantResult {
  data: ProgrammingAssistantContent | null;
  isLoading: boolean;
}

export function useProgrammingAssistant(): UseProgrammingAssistantResult {
  const [data, setData] = useState<ProgrammingAssistantContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    const timer = setTimeout(() => {
      if (!mounted) return;
      setData(mockStudioContent);
      setIsLoading(false);
    }, 200);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  return { data, isLoading };
}
