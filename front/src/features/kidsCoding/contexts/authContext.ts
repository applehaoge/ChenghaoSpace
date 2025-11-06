import { createContext } from 'react';

export interface KidsCodingUserInfo {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface KidsCodingAuthContextValue {
  isAuthenticated: boolean;
  userInfo: KidsCodingUserInfo | null;
  setIsAuthenticated: (value: boolean) => void;
  setUserInfo: (user: KidsCodingUserInfo | null) => void;
  logout: () => void;
}

export const KidsCodingAuthContext = createContext<KidsCodingAuthContextValue>({
  isAuthenticated: false,
  userInfo: null,
  setIsAuthenticated: () => {},
  setUserInfo: () => {},
  logout: () => {},
});

