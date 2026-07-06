import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Maintenance from '@/pages/Maintenance';
import {
  fetchGeneralConfig,
  isEnvMaintenanceMode,
  type GeneralConfig,
} from '@/lib/maintenance';

const POLL_INTERVAL_MS = 60_000;

export const MaintenanceGate = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const [loading, setLoading] = useState(!isAdminRoute);
  const [config, setConfig] = useState<GeneralConfig | null>(null);

  useEffect(() => {
    if (isAdminRoute) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const check = async () => {
      const general = await fetchGeneralConfig();
      if (!cancelled) {
        setConfig(general);
        setLoading(false);
      }
    };

    void check();
    const interval = window.setInterval(check, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [isAdminRoute]);

  if (isAdminRoute) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const maintenanceActive = isEnvMaintenanceMode() || config?.maintenanceMode;

  if (maintenanceActive) {
    return (
      <Maintenance
        config={{
          storeName: config?.storeName ?? 'Varisca',
          storeEmail: config?.storeEmail ?? 'varisca.team@gmail.com',
          storePhone: config?.storePhone ?? '+91 88668 60624',
        }}
      />
    );
  }

  return <>{children}</>;
};
