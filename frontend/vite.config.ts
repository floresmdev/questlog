import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Forward /api to the Express backend once it exists (see docs/HANDOFF.md §1b).
    proxy: { '/api': 'http://localhost:3000' },
  },
});
