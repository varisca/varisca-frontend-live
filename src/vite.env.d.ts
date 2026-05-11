/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API origin or full URL; normalized to `.../api` in client. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
