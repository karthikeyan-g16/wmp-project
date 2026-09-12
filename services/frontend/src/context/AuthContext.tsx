import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { authApi } from '../api/authApi';
import type { AuthUser, LoginRequest, RegisterRequest } from '../types/portfolio';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function loadUser(): AuthUser | null {
  const raw = localStorage.getItem('wmp_user');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUser);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('wmp_token'));

  const saveAuth = useCallback((token: string, user: AuthUser) => {
    localStorage.setItem('wmp_token', token);
    localStorage.setItem('wmp_user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    const res = await authApi.login(data);
    saveAuth(res.token, { id: res.userId, email: res.email, fullName: res.fullName });
  }, [saveAuth]);

  const register = useCallback(async (data: RegisterRequest) => {
    const res = await authApi.register(data);
    saveAuth(res.token, { id: res.userId, email: res.email, fullName: res.fullName });
  }, [saveAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem('wmp_token');
    localStorage.removeItem('wmp_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
