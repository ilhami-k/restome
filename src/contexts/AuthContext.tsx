import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getCurrentAuthSession,
  signInWithPassword,
  signOut,
  subscribeToAuthStateChange,
} from '../services/auth.service';

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCurrentAuthSession().then((session) => {
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });

    const unsubscribe = subscribeToAuthStateChange((session) => {
      setIsAuthenticated(!!session);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithPassword(email, password);
  };

  const logout = async () => {
    await signOut();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
