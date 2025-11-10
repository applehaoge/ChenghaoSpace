import { useEffect, useState } from 'react';

const STORAGE_KEY = 'kidsCoding.insightsCollapsed';

export function useInsightsSidebar(initialState = false) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return initialState;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === 'true') return true;
      if (stored === 'false') return false;
    } catch {
      // ignore storage errors
    }
    return initialState;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, String(isCollapsed));
    } catch {
      // ignore storage errors
    }
  }, [isCollapsed]);

  const toggleSidebar = () => setIsCollapsed(prev => !prev);

  return {
    isCollapsed,
    toggleSidebar,
  };
}
