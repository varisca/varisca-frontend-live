/* eslint-disable @typescript-eslint/no-explicit-any */
// ─── API Client ─────────────────────────────────────────────────────
// Centralized HTTP client for backend API calls with JWT auth.

const DEV_API_BASE = 'http://localhost:3001/api';

function stripQuotes(s: string): string {
  return s.replace(/^['"]+|['"]+$/g, '').trim();
}

/**
 * Turn VITE_API_URL (origin) or full URL into the API root used by this app (`.../api`).
 * - https://example.com → https://example.com/api
 * - https://example.com/api → unchanged (trailing slashes stripped)
 * - /api → relative, unchanged
 */
export function normalizeToApiRoot(input: string): string {
  const s = stripQuotes(input).trim();
  if (!s) return '';
  if (s.startsWith('/')) return s.replace(/\/+$/, '') || '/';
  try {
    const u = new URL(s);
    const path = (u.pathname || '/').replace(/\/+$/, '') || '/';
    if (path === '/api' || path.endsWith('/api')) {
      return `${u.origin}${path}`.replace(/\/+$/, '');
    }
    if (path === '/') {
      return `${u.origin}/api`;
    }
    return s.replace(/\/+$/, '');
  } catch {
    return s.replace(/\/+$/, '');
  }
}

/** VITE_API_URL is the canonical API origin for production builds. */
function getConfiguredApiRoot(): string {
  const env = import.meta.env;
  const raw = stripQuotes(String(env.VITE_API_URL ?? ''));
  return raw ? normalizeToApiRoot(raw) : '';
}

/**
 * Resolve API base URL (always ends with `/api` when absolute HTTP(S)).
 * - Admin on static hosts needs an absolute URL from VITE_API_URL.
 * - Storefront can use relative `/api` if you configure a reverse proxy.
 * - Dev on LAN: same host :3001 for phone testing.
 */
export function getApiBase(): string {
  const env = import.meta.env;
  const configured = getConfiguredApiRoot();

  if (typeof window === 'undefined') {
    return configured || DEV_API_BASE;
  }

  const path = window.location.pathname || '';
  const isAdmin = path.startsWith('/admin');
  const isProd = !!env.PROD;

  if (isProd && isAdmin) {
    if (configured && /^https?:\/\//i.test(configured)) return stripTrailingSlashApi(configured);
    return '/api';
  }

  if (configured.startsWith('/')) {
    return `${window.location.origin}${configured}`.replace(/\/+$/, '');
  }

  if (configured && /^https?:\/\//i.test(configured)) {
    return stripTrailingSlashApi(configured);
  }

  if (isProd) {
    return '/api';
  }

  if (configured && !/localhost|127\.0\.0\.1/i.test(configured)) {
    return stripTrailingSlashApi(configured);
  }

  const { hostname } = window.location;
  const isLoopback =
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]';

  // Dev only: phone/LAN testing (http://192.168.x.x:8080 → API on same host :3001).
  // NEVER do this in production — live sites would wrongly use http://varisca.in:3001/api.
  if (!import.meta.env.PROD && !isLoopback) {
    return `http://${hostname}:3001/api`;
  }

  return configured || DEV_API_BASE;
}

function stripTrailingSlashApi(url: string): string {
  return url.replace(/\/+$/, '');
}

function buildApiUrl(path: string, params?: Record<string, string | number | undefined>): string {
  const base = getApiBase().replace(/\/+$/, '') + '/';
  const cleanPath = String(path || '').replace(/^\/+/, '');
  let u: URL;
  try {
    u = new URL(cleanPath, base);
  } catch {
    // Avoid iOS "String did not match the expected pattern" by falling back to a safe join.
    const joined = `${base}${encodeURI(cleanPath)}`;
    u = new URL(joined);
  }

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== '') u.searchParams.set(k, String(v));
    });
  }

  return u.toString();
}
const TOKEN_KEY = 'varisca_admin_token';
const CUSTOMER_TOKEN_KEY = 'varisca_customer_token';

// ─── Token Management ───────────────────────────────────────────────

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export const getCustomerToken = (): string | null => localStorage.getItem(CUSTOMER_TOKEN_KEY);
export const setCustomerToken = (token: string) => localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
export const clearCustomerToken = () => localStorage.removeItem(CUSTOMER_TOKEN_KEY);


// ─── Core Fetch Wrapper ─────────────────────────────────────────────

interface RequestOptions {
  method?: string;
  body?: any;
  params?: Record<string, string | number | undefined>;
  /** Omit admin JWT (e.g. storefront checkout) so stale `varisca_admin_token` never hits protected-only routes by mistake. */
  skipAdminAuth?: boolean;
  /** Default 15s; use a higher value for large admin payloads (e.g. product images as base64). */
  timeoutMs?: number;
}

async function request<T = any>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, params, skipAdminAuth, timeoutMs: timeoutOption } = opts;
  const token = skipAdminAuth ? null : getToken();

  const url = buildApiUrl(path, params);

  // Avoid sending Content-Type on GET/HEAD — it triggers a CORS preflight. Storefront
  // public GETs (no Authorization) then stay "simple" and work reliably cross-origin
  // without relying on OPTIONS handling.
  const headers: Record<string, string> = {};
  const needsJsonContentType =
    body != null || (method !== 'GET' && method !== 'HEAD');
  if (needsJsonContentType) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const controller = new AbortController();
  const timeoutMs = timeoutOption ?? 15000;
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
      // Prevent stale GET responses (e.g. product list still showing deleted rows until DevTools disables cache).
      cache: 'no-store',
    });
  } catch (e: any) {
    const msg =
      e?.name === 'AbortError'
        ? `Request timed out after ${Math.round(timeoutMs / 1000)}s`
        : (e?.message || 'Network error (failed to reach API)');
    throw new Error(msg);
  } finally {
    window.clearTimeout(timeout);
  }

  // Some mobile browsers can surface 304 to JS fetch (no body),
  // which breaks `res.json()` even though the browser may have a cached copy.
  // Retry once with a cache-busting query so we always get a JSON body.
  if (res.status === 304) {
    const retry = new URL(url);
    retry.searchParams.set('__cb', String(Date.now()));
    res = await fetch(retry.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store',
    });
  }

  if (res.status === 401) {
    const errBody = (await res.json().catch(() => ({}))) as { error?: string };
    const message = errBody.error || 'Invalid email or password';
    if (!skipAdminAuth) {
      clearToken();
      const p = window.location.pathname || '';
      if (p.startsWith('/admin') && !p.startsWith('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    throw new Error(message);
  }

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as {
      error?: string;
      details?: string;
      message?: string;
    };
    if (res.status === 413) {
      throw new Error('Request too large. Reduce image size or upload fewer images.');
    }
    const msg = body.details || body.message || body.error || res.statusText || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return res.json();
}

/**
 * Storefront POST: same URL rules as `api.post`, but never sends admin JWT.
 * Sends customer JWT when present (routes using optionalCustomerAuth), e.g. Razorpay create-order.
 */
export async function storefrontPost<T = any>(path: string, body?: unknown): Promise<T> {
  const url = buildApiUrl(path);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const ct = getCustomerToken();
  if (ct) headers.Authorization = `Bearer ${ct}`;

  const controller = new AbortController();
  const timeoutMs = 15000;
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (e: unknown) {
    const msg =
      (e as { name?: string })?.name === 'AbortError'
        ? `Request timed out after ${Math.round(timeoutMs / 1000)}s`
        : ((e as Error)?.message || 'Network error (failed to reach API)');
    throw new Error(msg);
  } finally {
    window.clearTimeout(timeout);
  }

  if (res.status === 304) {
    const retry = new URL(url);
    retry.searchParams.set('__cb', String(Date.now()));
    res = await fetch(retry.toString(), {
      method: 'POST',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  if (!res.ok) {
    const raw = await res.text();
    let msg = res.statusText || `HTTP ${res.status}`;
    try {
      const j = JSON.parse(raw) as { error?: string; details?: string; message?: string };
      msg = j.message || j.details || j.error || msg;
    } catch {
      const stripped = raw.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      if (stripped) msg = stripped.slice(0, 240);
    }
    if (res.status === 404 && /cannot\s+post/i.test(msg)) {
      const host = typeof window !== 'undefined' ? window.location.hostname : '';
      const looksLocal =
        host === 'localhost' ||
        host === '127.0.0.1' ||
        /^192\.168\.\d+\.\d+$/.test(host) ||
        /^10\.\d+\.\d+\.\d+$/.test(host);
      msg = looksLocal
        ? 'Your local API on port 3001 is an old build without /api/payment. Stop every Node process using that port (Task Manager or netstat), then run npm run dev from the backend folder.'
        : 'Payment API is not available (404). Deploy the latest backend with /api/payment routes, or fix VITE_API_URL / reverse proxy so requests reach the Varisca API.';
    }
    throw new Error(msg);
  }

  return res.json() as Promise<T>;
}

// ─── Convenience Methods ────────────────────────────────────────────

export const api = {
  get: <T = any>(
    path: string,
    params?: Record<string, any>,
    extra?: Pick<RequestOptions, 'skipAdminAuth' | 'timeoutMs'>
  ) => request<T>(path, { params, ...extra }),

  post: <T = any>(
    path: string,
    body?: any,
    extra?: Pick<RequestOptions, 'skipAdminAuth' | 'timeoutMs'>,
  ) => request<T>(path, { method: 'POST', body, ...extra }),

  put: <T = any>(path: string, body?: any, extra?: Pick<RequestOptions, 'timeoutMs'>) =>
    request<T>(path, { method: 'PUT', body, ...extra }),

  patch: <T = any>(path: string, body?: any) =>
    request<T>(path, { method: 'PATCH', body }),

  delete: <T = any>(path: string, extra?: Pick<RequestOptions, 'timeoutMs'>) =>
    request<T>(path, { method: 'DELETE', ...extra }),
};

// ─── Auth API ───────────────────────────────────────────────────────

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: any }>('/auth/login', { email, password });
    setToken(res.token);
    return res;
  },
  me: () => api.get('/auth/me'),
  logout: () => { clearToken(); },
};

// ─── Customer Auth API ───────────────────────────────────────────────

async function customerRequest<T = any>(path: string, opts: { method?: string; body?: any } = {}): Promise<T> {
  const { method = 'GET', body } = opts;
  const token = getCustomerToken();
  const url = buildApiUrl(path);
  const headers: Record<string, string> = {};
  const needsJsonContentType =
    body != null || (method !== 'GET' && method !== 'HEAD');
  if (needsJsonContentType) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const controller = new AbortController();
  const timeoutMs = 15000;
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (e: any) {
    const msg =
      e?.name === 'AbortError'
        ? `Request timed out after ${Math.round(timeoutMs / 1000)}s`
        : (e?.message || 'Network error (failed to reach API)');
    throw new Error(msg);
  } finally {
    window.clearTimeout(timeout);
  }

  if (res.status === 304) {
    const retry = new URL(url);
    retry.searchParams.set('__cb', String(Date.now()));
    res = await fetch(retry.toString(), { method, headers, body: body ? JSON.stringify(body) : undefined });
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const customerApi = {
  get: <T = any>(path: string) =>
    customerRequest<T>(path),
  post: <T = any>(path: string, body?: any) =>
    customerRequest<T>(path, { method: 'POST', body }),
  put: <T = any>(path: string, body?: any) =>
    customerRequest<T>(path, { method: 'PUT', body }),
  patch: <T = any>(path: string, body?: any) =>
    customerRequest<T>(path, { method: 'PATCH', body }),
  delete: <T = any>(path: string) =>
    customerRequest<T>(path, { method: 'DELETE' }),
};

export const customerAuthApi = {
  register: async (data: { first_name: string; last_name: string; email: string; password: string }) => {
    const res = await customerRequest<{ token: string; customer: any }>('/customers/auth/register', {
      method: 'POST',
      body: data,
    });
    setCustomerToken(res.token);
    return res;
  },
  login: async (email: string, password: string) => {
    const res = await customerRequest<{ token: string; customer: any }>('/customers/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    setCustomerToken(res.token);
    return res;
  },
  requestEmailOtp: async (body: { first_name: string; last_name: string; email: string }) => {
    return customerRequest<{ email: string; expiresInSeconds: number; resendAfterSeconds: number }>(
      '/customers/auth/otp/email/request',
      { method: 'POST', body },
    );
  },
  verifyEmailOtp: async (email: string, otp: string) => {
    const res = await customerRequest<{ token: string; customer: any; isNewCustomer: boolean }>(
      '/customers/auth/otp/email/verify',
      { method: 'POST', body: { email, otp } },
    );
    setCustomerToken(res.token);
    return res;
  },
  requestPhoneOtp: async (phone: string) => {
    return customerRequest<{ success: boolean; message: string; data: { phone: string; expiresInSeconds: number; resendAfterSeconds: number } }>(
      '/auth/send-otp',
      { method: 'POST', body: { phone } },
    );
  },
  verifyPhoneOtp: async (phone: string, otp: string) => {
    const res = await customerRequest<{ success: boolean; message: string; data: { token: string; customer: any; isNewCustomer: boolean } }>(
      '/auth/verify-otp',
      { method: 'POST', body: { phone, otp } },
    );
    setCustomerToken(res.data.token);
    return res;
  },
  me: () => customerRequest<any>('/customers/auth/me'),
  /** Persist profile to DB (requires customer JWT). */
  updateProfile: (body: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    address?: string;
  }) => customerRequest<any>('/customers/auth/me', { method: 'PUT', body }),
  logout: () => { clearCustomerToken(); },
};



// ─── Generic CRUD helpers ───────────────────────────────────────────

export function createCrudApi<T extends { id: string }>(basePath: string) {
  return {
    list: (params?: Record<string, any>) =>
      api.get<{ data: T[]; total?: number }>(basePath, params),

    get: (id: string) =>
      api.get<T>(`${basePath}/${id}`),

    create: (data: Partial<T>) =>
      api.post<T>(basePath, data),

    update: (id: string, data: Partial<T>) =>
      api.put<T>(`${basePath}/${id}`, data),

    remove: (id: string) =>
      api.delete(`${basePath}/${id}`),

    bulkDelete: (ids: string[]) =>
      api.post(`${basePath}/bulk-delete`, { ids }),
  };
}

export default api;
