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

  const login = async (username: string, password_hash: string): Promise<void> => {
    try {
      const response = await apiClient.login(username, password_hash);
      if (response && response.user && response.token) {
        // Store token in localStorage for API requests
        localStorage.setItem('authToken', response.token);
        setUser(response.user);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const logout = useCallback(() => {
    // Clear token from localStorage
    localStorage.removeItem('authToken');
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