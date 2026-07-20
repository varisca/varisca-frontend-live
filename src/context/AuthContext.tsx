import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { customerAuthApi, clearCustomerToken } from '@/lib/api/client';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  name?: string;
  phone?: string;
  /** Single-line profile / billing address on `customers.address` (optional). */
  address?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  requestEmailOtp: (body: { first_name: string; last_name: string; email: string }) => Promise<
    { ok: true; expiresInSeconds: number; resendAfterSeconds: number } | { ok: false; error: string }
  >;
  verifyEmailOtp: (email: string, otp: string) => Promise<boolean>;
  requestPhoneOtp: (phone: string) => Promise<
    { ok: true; expiresInSeconds: number; resendAfterSeconds: number } | { ok: false; error: string }
  >;
  verifyPhoneOtp: (phone: string, otp: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  /** Reload customer from `/customers/auth/me` after profile changes. */
  refreshUser: () => Promise<void>;
  loading: boolean;
}

const AUTH_USER_KEY = 'varisca_customer_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function customerToUser(customer: any): User {
  return {
    id: customer.id,
    email: customer.email,
    first_name: customer.first_name || customer.name?.split(' ')[0] || '',
    last_name: customer.last_name || customer.name?.split(' ').slice(1).join(' ') || '',
    name: customer.name,
    phone: customer.phone,
    address: customer.address || '',
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const customer = await customerAuthApi.me();
    const userData = customerToUser(customer);
    setUser(userData);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
  }, []);

  // Load user from localStorage, then verify token is still valid with the server
  useEffect(() => {
    const savedUser = localStorage.getItem(AUTH_USER_KEY);
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem(AUTH_USER_KEY);
      }
    }

    // Silently verify token in background
    customerAuthApi.me()
      .then((customer) => {
        const userData = customerToUser(customer);
        setUser(userData);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
      })
      .catch(() => {
        // Token invalid or expired — clear session silently
        clearCustomerToken();
        localStorage.removeItem(AUTH_USER_KEY);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { customer } = await customerAuthApi.login(email, password);
      const base = customerToUser(customer);
      const userData: User = {
        ...base,
        first_name: base.first_name || email.split('@')[0],
      };
      setUser(userData);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
      toast.success('Welcome back!', { description: `Logged in as ${customer.email}` });
      return true;
    } catch (err: any) {
      // Surface the exact server error (wrong password, no account, etc.)
      toast.error('Login failed', { description: err.message || 'Invalid email or password.' });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const requestEmailOtp = useCallback(async (body: { first_name: string; last_name: string; email: string }) => {
    setLoading(true);
    try {
      const res = await customerAuthApi.requestEmailOtp(body);
      toast.success('OTP sent', { description: `We sent a code to ${res.email}` });
      return { ok: true as const, expiresInSeconds: res.expiresInSeconds, resendAfterSeconds: res.resendAfterSeconds };
    } catch (err: any) {
      toast.error('Could not send OTP', { description: err.message || 'Please try again.' });
      return { ok: false as const, error: err.message || 'Could not send OTP' };
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyEmailOtp = useCallback(async (email: string, otp: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { customer } = await customerAuthApi.verifyEmailOtp(email, otp);
      const base = customerToUser(customer);
      const userData: User = {
        ...base,
        first_name: base.first_name || email.split('@')[0],
      };
      setUser(userData);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
      toast.success('Welcome!', { description: `Logged in as ${customer.email}` });
      return true;
    } catch (err: any) {
      toast.error('OTP verification failed', { description: err.message || 'Invalid OTP.' });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const requestPhoneOtp = useCallback(async (phone: string) => {
    setLoading(true);
    try {
      const res = await customerAuthApi.requestPhoneOtp(phone);
      toast.success('OTP sent', { description: `We sent a code to ${phone}` });
      return { 
        ok: true as const, 
        expiresInSeconds: res.data.expiresInSeconds, 
        resendAfterSeconds: res.data.resendAfterSeconds 
      };
    } catch (err: any) {
      toast.error('Could not send OTP', { description: err.message || 'Please try again.' });
      return { ok: false as const, error: err.message || 'Could not send OTP' };
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyPhoneOtp = useCallback(async (phone: string, otp: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await customerAuthApi.verifyPhoneOtp(phone, otp);
      const customer = res.data.customer;
      const base = customerToUser(customer);
      const userData: User = {
        ...base,
        first_name: base.first_name || 'OTP Customer',
      };
      setUser(userData);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
      toast.success('Welcome!', { description: `Logged in as ${customer.phone}` });
      return true;
    } catch (err: any) {
      toast.error('OTP verification failed', { description: err.message || 'Invalid OTP.' });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    setLoading(true);
    try {
      const { customer } = await customerAuthApi.register({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
      });
      const userData: User = {
        ...customerToUser(customer),
        first_name: customer.first_name || data.first_name,
        last_name: customer.last_name || data.last_name,
      };
      setUser(userData);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
      toast.success('Account created!', { description: 'Welcome to Varisca!' });
      return true;
    } catch (err: any) {
      // 409 → "An account with this email already exists" surfaced directly
      toast.error('Registration failed', { description: err.message || 'Could not create account.' });
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    customerAuthApi.logout();
    setUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
    // Also clean up old key if it exists
    localStorage.removeItem('Varisca_user');
    toast.success('Logged out', { description: 'Come back soon!' });
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      requestEmailOtp,
      verifyEmailOtp,
      requestPhoneOtp,
      verifyPhoneOtp,
      register,
      logout,
      refreshUser,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Fallback to avoid hard-crashing if a component renders outside AuthProvider.
    // This should not happen in normal app flow (see `src/App.tsx`), but protects
    // the UI during HMR / partial renders.
    return {
      user: null,
      isAuthenticated: false,
      login: async () => false,
      requestEmailOtp: async () => ({ ok: false as const, error: 'AuthProvider not mounted' }),
      verifyEmailOtp: async () => false,
      requestPhoneOtp: async () => ({ ok: false as const, error: 'AuthProvider not mounted' }),
      verifyPhoneOtp: async () => false,
      register: async () => false,
      logout: () => {},
      refreshUser: async () => {},
      loading: false,
    };
  }
  return context;
};
