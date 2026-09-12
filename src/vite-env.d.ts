/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_PATH?: string;
  readonly VITE_DEMO_MODE?: string;
  readonly VITE_DEMO_TARGET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
