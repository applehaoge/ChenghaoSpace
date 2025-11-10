import { useEffect, useState } from 'react';

const STORAGE_KEY = 'kidsCoding.editor.sidebarCollapsed';

export function useFileSidebar(initialState = false) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') {
      return initialState;
    }
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'true') return true;
      if (saved === 'false') return false;
    } catch {
      // ignore storage read errors
    }
    return initialState;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(STORAGE_KEY, String(isCollapsed));
    } catch {
      // ignore storage write errors
    }
  }, [isCollapsed]);

  const toggleSidebar = () => setIsCollapsed(prev => !prev);

  return {
    isCollapsed,
    toggleSidebar,
  };
}
