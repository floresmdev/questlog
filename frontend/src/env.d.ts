interface ImportMetaEnv {
  /** 'http' talks to the backend through /api; anything else (default) uses the mocks. */
  readonly VITE_API_MODE?: 'mock' | 'http';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
