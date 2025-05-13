'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '../lib/axios';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  tenant_id: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (email: string, password: string, subdomain: string) => Promise<void>;
  logout: () => void;
  register: (firstName: string, lastName: string, email: string, password: string, subdomain: string, isAdmin: boolean) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, subdomain: string) => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.post('/auth/login', {
        email,
        password,
        tenant: subdomain,
      });

      setToken(data.accessToken);
      setUser(data.user);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      router.push('/');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    subdomain: string,
    isAdmin: boolean
  ) => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.post('/auth/register', {
        firstName,
        lastName,
        email,
        password,
        tenant: subdomain,
        role: isAdmin ? 'admin' : 'student'
      });

      setToken(data.accessToken);
      setUser(data.user);
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      router.push('/');
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    router.push('/');
  };

  const value = {
    token,
    user,
    login,
    logout,
    register,
    isAuthenticated: !!token,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 