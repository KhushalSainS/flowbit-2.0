'use client';

import { useState, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const register = async (data: RegisterData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
      }
      
      // Automatically sign in after registration
      await login({ email: data.email, password: data.password });
      
      return result.user;
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });
      
      if (result?.error) {
        throw new Error(result.error);
      }
      
      router.push('/dashboard');
      return true;
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut({ redirect: false });
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'An error occurred during logout');
    } finally {
      setLoading(false);
    }
  };
  
  return {
    user: session?.user,
    isAuthenticated: !!session,
    isLoading: status === 'loading' || loading,
    error,
    register,
    login,
    logout,
  };
}

export default useAuth;
