import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// MASTRA_SERVER_URL lives in the project-root .env (one level up from
// client/), shared with the Mastra server itself. Load it with loadEnv and
// an empty prefix so non-VITE_ vars are visible to the config.
const LOCAL_URL = 'http://localhost:4111';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(__dirname, '..'), '');

  // Trim trailing slashes and a trailing /api — client paths already include
  // /api/... etc., so the value works whether the user supplies the bare
  // origin or an "API base" URL like https://x.mastra.cloud/api.
  const normalize = (raw: string | undefined) =>
    (raw || '')
      .trim()
      .replace(/\/+$/, '')
      .replace(/\/api$/, '');

  const remoteUrl = normalize(env.MASTRA_SERVER_URL);
  const studioUrl = normalize(env.MASTRA_STUDIO_URL);

  // The "default" target the picker falls back to when the user hasn't made
  // an explicit choice — preserves the existing env-driven behavior.
  const defaultTarget: 'local' | 'remote' = remoteUrl ? 'remote' : 'local';
  const defaultUrl = remoteUrl || LOCAL_URL;

  const proxyRoutes = [
    '/api',
    '/voice-speak',
    // Custom Mastra routes can't live under /api (reserved), so the
    // working-memory route is mounted at the root.
    '/working-memory',
    // Static file server for the Artifact tab — serves files written
    // by the agent under workspace/artifacts/<sessionId>/.
    '/artifacts',
    '/local-model-status',
    '/browser-mirror',
  ];

  // No-prefix routes preserve the existing default behavior — apiUrl()
  // emits these when the picker is on "default". /__local and /__remote
  // are pinned alternates the picker uses to override at runtime; the
  // rewrite strips the prefix before forwarding upstream.
  const proxy: Record<string, any> = {};
  for (const route of proxyRoutes) {
    proxy[route] = { target: defaultUrl, changeOrigin: true };
    proxy[`/__local${route}`] = {
      target: LOCAL_URL,
      changeOrigin: true,
      rewrite: (p: string) => p.replace(/^\/__local/, ''),
    };
    if (remoteUrl) {
      proxy[`/__remote${route}`] = {
        target: remoteUrl,
        changeOrigin: true,
        rewrite: (p: string) => p.replace(/^\/__remote/, ''),
      };
    }
    if (studioUrl) {
      proxy[`/__studio${route}`] = {
        target: studioUrl,
        changeOrigin: true,
        rewrite: (p: string) => p.replace(/^\/__studio/, ''),
      };
    }
  }

  return {
    plugins: [react()],
    define: {
      // Empty in dev so the browser uses relative paths and the Vite proxy
      // avoids CORS. In production builds the deployed bundle calls the
      // server URL directly — no proxy needed since the bundle is typically
      // served from the same origin (or the server sends permissive CORS).
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(
        mode === 'production' ? defaultUrl : '',
      ),
      'import.meta.env.VITE_LOCAL_URL': JSON.stringify(LOCAL_URL),
      'import.meta.env.VITE_REMOTE_URL': JSON.stringify(remoteUrl),
      'import.meta.env.VITE_STUDIO_URL': JSON.stringify(studioUrl),
      'import.meta.env.VITE_DEFAULT_TARGET': JSON.stringify(defaultTarget),
    },
    server: {
      port: 5174,
      proxy,
    },
  };
});
