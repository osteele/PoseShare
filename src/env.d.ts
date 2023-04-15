/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly POSESHARE_RELOAD_ON_MODE_CHANGE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
