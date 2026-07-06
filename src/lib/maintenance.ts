import { api } from '@/lib/api/client';

export interface GeneralConfig {
  storeName: string;
  storeUrl: string;
  storeEmail: string;
  storePhone: string;
  currency: string;
  locale: string;
  timezone: string;
  maintenanceMode: boolean;
}

const defaults: GeneralConfig = {
  storeName: 'Varisca',
  storeUrl: 'https://varisca.com',
  storeEmail: 'varisca.team@gmail.com',
  storePhone: '+91 88668 60624',
  currency: 'INR',
  locale: 'en-IN',
  timezone: 'Asia/Kolkata',
  maintenanceMode: false,
};

export function isEnvMaintenanceMode(): boolean {
  const raw = import.meta.env.VITE_MAINTENANCE_MODE;
  return raw === 'true' || raw === '1';
}

export async function fetchGeneralConfig(): Promise<GeneralConfig> {
  try {
    const res = await api.get<{ key: string; value: GeneralConfig }>(
      '/settings/kv/general',
      undefined,
      { skipAdminAuth: true },
    );
    return { ...defaults, ...res.value };
  } catch {
    return defaults;
  }
}

export async function isMaintenanceActive(): Promise<boolean> {
  if (isEnvMaintenanceMode()) return true;
  const config = await fetchGeneralConfig();
  return config.maintenanceMode;
}
