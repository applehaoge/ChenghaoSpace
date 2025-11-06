import { createContext } from "react";

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  setIsAuthenticated: (value: boolean) => void;
  setUserInfo: (userInfo: UserInfo | null) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userInfo: null,
  setIsAuthenticated: () => {},
  setUserInfo: () => {},
  logout: () => {},
});