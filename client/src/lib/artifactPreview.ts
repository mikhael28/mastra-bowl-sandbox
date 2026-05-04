import { apiUrl } from './mastraClient';

/**
 * Decides how to render an artifact file in the preview pane:
 *  - HTML  → iframe
 *  - PNG/JPG/GIF/SVG/WebP → <img>
 *  - MD    → markdown
 *  - everything else → syntax-highlighted code (or plain monospace)
 */
export type PreviewMode = 'iframe' | 'image' | 'markdown' | 'code';

export function previewModeFor(filePath: string): PreviewMode {
  const ext = filePath.toLowerCase().split('.').pop() ?? '';
  if (ext === 'html' || ext === 'htm') return 'iframe';
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'ico'].includes(ext))
    return 'image';
  if (ext === 'md' || ext === 'markdown') return 'markdown';
  return 'code';
}

/**
 * Build an absolute (proxied) URL the iframe / <img> can load. The Vite dev
 * server proxies `/artifacts/*` to the Mastra server, which serves files
 * from `workspace/artifacts/<sessionId>/`. In production the bundled
 * VITE_API_BASE_URL is prepended so the asset is fetched directly.
 */
export function artifactUrl(sessionId: string, relPath: string): string {
  // `relPath` may come back from the agent as `workspace/artifacts/<sid>/foo`
  // or just `artifacts/<sid>/foo` or even `foo`. Strip any leading prefix so
  // we end up with the path *inside* the session folder.
  let p = relPath.replace(/^\/+/, '');
  const prefixA = `workspace/artifacts/${sessionId}/`;
  const prefixB = `artifacts/${sessionId}/`;
  if (p.startsWith(prefixA)) p = p.slice(prefixA.length);
  else if (p.startsWith(prefixB)) p = p.slice(prefixB.length);
  return apiUrl(
    `/artifacts/${encodeURIComponent(sessionId)}/${p
      .split('/')
      .map(encodeURIComponent)
      .join('/')}`,
  );
}

/**
 * Returns true when `path` (as written by a tool call) lives under the
 * session's sandboxed artifact folder. Used by the auto-approval guard.
 */
export function isInsideArtifactSession(
  path: string | undefined,
  sessionId: string,
): boolean {
  if (!path) return false;
  const p = path.replace(/^\/+/, '');
  return (
    p.startsWith(`workspace/artifacts/${sessionId}/`) ||
    p.startsWith(`artifacts/${sessionId}/`) ||
    p === `workspace/artifacts/${sessionId}` ||
    p === `artifacts/${sessionId}`
  );
}

/**
 * Strip the absolute-ish path the agent uses down to the path *inside* the
 * session folder (used for the file picker labels).
 */
export function relativeToSession(path: string, sessionId: string): string {
  let p = path.replace(/^\/+/, '');
  const prefixes = [
    `workspace/artifacts/${sessionId}/`,
    `artifacts/${sessionId}/`,
  ];
  for (const pre of prefixes) {
    if (p.startsWith(pre)) return p.slice(pre.length);
  }
  return p;
}
