import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Agent, Role } from '@shared/types';
import { authApi, setToken, removeToken } from '@/lib/api';

interface UserWithAgent extends User {
  agent?: Agent;
}

interface AuthContextType {
  user: UserWithAgent | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithAgent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('aerocheck_token');
      if (!token) {
        setUser(null);
        return;
      }
      
      const response = await authApi.me();
      if (response.success && response.data) {
        setUser(response.data as UserWithAgent);
      } else {
        removeToken();
        setUser(null);
      }
    } catch {
      removeToken();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      await refreshUser();
      setIsLoading(false);
    };
    initAuth();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    if (response.success && response.data) {
      setToken(response.data.token);
      setUser(response.data.user as UserWithAgent);
    } else {
      throw new Error('Connexion echouee');
    }
  };

  const register = async (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) => {
    const response = await authApi.register(data);
    if (response.success && response.data) {
      setToken(response.data.token);
      setUser(response.data.user as UserWithAgent);
    } else {
      throw new Error('Inscription echouee');
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  const hasRole = (...roles: Role[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshUser,
      hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
