/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API origin or full URL; normalized to `.../api` in client. */
  readonly VITE_API_URL?: string;
  /** Force storefront maintenance mode without using admin settings (`true` or `1`). */
  readonly VITE_MAINTENANCE_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
