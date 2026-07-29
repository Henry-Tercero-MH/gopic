/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base del backend GOPIC (Railway en producción, localhost en dev). */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
