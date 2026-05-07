import { getApiBase } from '@/lib/api/client';

/** Public POST — saves custom order to database for admin. */
export async function submitCustomOrderToApi(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const API_BASE = getApiBase().replace(/\/+$/, '');
  const res = await fetch(`${API_BASE}/custom-orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  }
  return data as Record<string, unknown>;
}
