/// <reference types="vite/client" />
/** biome-ignore-all lint/nursery/useConsistentTypeDefinitions: part of vite config */

interface ImportMetaEnv {
  readonly VITE_SERVER_URL?: string;
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}
