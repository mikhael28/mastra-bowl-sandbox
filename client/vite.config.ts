import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const MASTRA_URL = process.env.VITE_MASTRA_URL || 'http://localhost:4111';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: MASTRA_URL,
        changeOrigin: true,
      },
      '/voice-speak': {
        target: MASTRA_URL,
        changeOrigin: true,
      },
      // Custom Mastra routes can't live under /api (reserved), so the
      // working-memory-route is mounted at the root. Proxy it through Vite
      // so the UI can still use a relative URL in the browser.
      '/working-memory': {
        target: MASTRA_URL,
        changeOrigin: true,
      },
      // Static file server for the Artifact tab — serves files written
      // by the agent under workspace/artifacts/<sessionId>/.
      '/artifacts': {
        target: MASTRA_URL,
        changeOrigin: true,
      },
    },
  },
});
