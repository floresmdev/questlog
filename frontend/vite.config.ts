import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Forward /api to the Express backend (VITE_API_MODE=http). `vite preview` reuses it.
    proxy: { '/api': 'http://localhost:3000' },
  },
});
