import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { hasPermission, hasAnyPermission, type Permission } from '@/lib/admin/utils/permissions';
import { authApi, getToken, clearToken } from '@/lib/api/client';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'manager' | 'product_manager' | 'finance_manager' | 'support_executive';
  avatar?: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  /** On failure, `error` is the message from the API or network layer (show to user). */
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => void;
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);
const SESSION_KEY = 'varisca_admin_session';

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session — check JWT token validity via /api/auth/me
  useEffect(() => {
    const restore = async () => {
      const token = getToken();
      if (!token) {
        // Fallback: check old localStorage session for backward compat
        try {
          const stored = localStorage.getItem(SESSION_KEY);
          if (stored) setAdmin(JSON.parse(stored));
        } catch { /* ignore */ }
        setLoading(false);
        return;
      }
      try {
        const user = await authApi.me();
        const adminUser: AdminUser = { id: user.id, email: user.email, name: user.name, role: user.role };
        setAdmin(adminUser);
        localStorage.setItem(SESSION_KEY, JSON.stringify(adminUser));
      } catch {
        clearToken();
        localStorage.removeItem(SESSION_KEY);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      const adminUser: AdminUser = { id: res.user.id, email: res.user.email, name: res.user.name, role: res.user.role };
      setAdmin(adminUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(adminUser));
      setLoading(false);
      return { ok: true as const };
    } catch (e: unknown) {
      setLoading(false);
      const error = e instanceof Error ? e.message : 'Login failed';
      return { ok: false as const, error };
    }
  };

  const logout = () => {
    setAdmin(null);
    authApi.logout();
    localStorage.removeItem(SESSION_KEY);
  };

  const can = useCallback(
    (permission: Permission) => hasPermission(admin?.role, permission),
    [admin?.role],
  );

  const canAny = useCallback(
    (permissions: Permission[]) => hasAnyPermission(admin?.role, permissions),
    [admin?.role],
  );

  return (
    <AdminAuthContext.Provider value={{ admin, isAuthenticated: !!admin, loading, login, logout, can, canAny }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
};

export const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
