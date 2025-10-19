import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { User, Permission } from '../types';
import { mockUsers } from '../api/mock';

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
    return new Promise((resolve, reject) => {
        setTimeout(() => { // Simulate network delay
            const foundUser = mockUsers.find(
                u => u.username.toLowerCase() === username.toLowerCase() && u.password_hash === password_hash
            );
            if (foundUser) {
                const { password_hash, ...userToStore } = foundUser;
                setUser(userToStore);
                resolve();
            } else {
                reject(new Error('Invalid username or password'));
            }
        }, 500);
    });
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