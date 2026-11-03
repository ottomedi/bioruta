/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base del backend, sin barra final. Ver .env.example. */
  readonly VITE_API_URL?: string
  /** «true» para usar los mocks de src/mocks en vez del backend. */
  readonly VITE_USE_MOCKS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
