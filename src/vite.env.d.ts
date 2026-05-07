/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API origin or full URL; normalized to `.../api` in client (e.g. https://api.varisca.in). */
  readonly VITE_API_URL?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_API_BASE?: string;
  readonly VITE_API_BACKEND_URL?: string;
  readonly VITE_API_ADMIN_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
