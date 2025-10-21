import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { User, Permission } from '../types';
import { apiClient } from '../api/client';

interface AuthContextType {
  user: User | null;
  login: (username: string, password_hash: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Try to restore session from stored token
  React.useEffect(() => {
    const restore = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      try {
        const data = await apiClient.verifyToken();
        if (data && data.user) setUser(data.user);
      } catch (err) {
        console.warn('Token verification failed:', err);
        localStorage.removeItem('authToken');
      }
    };
    restore();
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    // Call backend API to get JWT token + user
    const res = await apiClient.login(username, password);
    if (res && res.token) {
      localStorage.setItem('authToken', res.token);
    }
    if (res && res.user) {
      setUser(res.user);
    }
  };

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!user) {
        return false;
    }
    return user.permissions?.includes(permission) || false;
  }, [user]);


  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};