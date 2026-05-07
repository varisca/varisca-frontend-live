import React, { createContext, useContext, useState, useEffect } from 'react';
import { sdk } from '@/lib/medusa';
import { toast } from '@/components/ui/use-toast';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
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
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const MedusaAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { customer } = await sdk.store.customer.retrieve();
        if (customer) {
            setUser(customer as unknown as User);
        }
      } catch (e) {
        // Not logged in
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      await sdk.auth.login(email, password);
      const { customer } = await sdk.store.customer.retrieve();
      setUser(customer as unknown as User);
      toast({ title: "Welcome back!", description: `Logged in as ${email}` });
      return true;
    } catch (e) {
      console.error(e);
      toast({ title: "Login Failed", description: "Invalid credentials", variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    setLoading(true);
    try {
      // 1. Create Customer
      await sdk.store.customer.create(data);
      // 2. Login automatically
      await sdk.auth.login(data.email, data.password);
      
      const { customer } = await sdk.store.customer.retrieve();
      setUser(customer as unknown as User);
      toast({ title: "Account Created", description: "Welcome to Varisca!" });
      return true;
    } catch (e) {
      console.error(e);
      toast({ title: "Registration Failed", description: "Could not create account", variant: "destructive" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await sdk.auth.logout(); 
      setUser(null);
      toast({ title: "Logged out", description: "Come back soon!" });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within MedusaAuthProvider");
  return context;
};
