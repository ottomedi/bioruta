/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base del backend, sin barra final. Ver .env.example. */
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
