/// <reference types="vite/client" />
interface ImportMetaEnv {
  readonly VITE_PUBLIC_API_URL: string;
  readonly VITE_PUBLIC_ENABLE_LIVE_SCORES: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
