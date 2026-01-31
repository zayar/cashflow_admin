/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GRAPHQL_URI: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
