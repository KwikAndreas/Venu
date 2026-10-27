/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "before" atau "after". Kosong = "after". Lihat web/.env.example. */
  readonly VITE_SECURITY_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
