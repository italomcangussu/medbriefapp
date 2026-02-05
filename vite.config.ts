import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['medbrief.nexaescala.com', 'medbriefapp.nexaescala.com', 'nexaescala-medbriefing.ylgf5w.easypanel.host'],
  },
  build: {
    chunkSizeWarningLimit: 2000,
  },
});