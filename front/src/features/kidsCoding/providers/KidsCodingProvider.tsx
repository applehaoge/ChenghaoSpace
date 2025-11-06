import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  KidsCodingAuthContext,
  type KidsCodingAuthContextValue,
  type KidsCodingUserInfo,
} from '@/features/kidsCoding/contexts/authContext';

const STORAGE_KEY = 'kidsCoding.userInfo';

interface KidsCodingProviderProps {
  children: ReactNode;
}

export function KidsCodingProvider({ children }: KidsCodingProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<KidsCodingUserInfo | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as KidsCodingUserInfo;
      setUserInfo(parsed);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('[KidsCodingProvider] Failed to restore user info:', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (userInfo) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(userInfo));
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('[KidsCodingProvider] Failed to persist user info:', error);
    }
  }, [userInfo]);

  const logout = () => {
    setIsAuthenticated(false);
    setUserInfo(null);
  };

  const value = useMemo<KidsCodingAuthContextValue>(
    () => ({
      isAuthenticated,
      userInfo,
      setIsAuthenticated,
      setUserInfo,
      logout,
    }),
    [isAuthenticated, userInfo],
  );

  return <KidsCodingAuthContext.Provider value={value}>{children}</KidsCodingAuthContext.Provider>;
}

