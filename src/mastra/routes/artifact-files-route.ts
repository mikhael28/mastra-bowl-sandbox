import { promises as fs, existsSync } from 'node:fs';
import path from 'node:path';
import { registerApiRoute } from '@mastra/core/server';

// Mastra's dev bundler runs the server from inside `.mastra/output/` (or in
// dev with cwd set to `src/mastra/public`). Either way, we want the *project*
// `workspace/` directory the agent's filesystem MCP is rooted at, not a path
// relative to the bundler cwd. The MASTRA_BOWL_WORKSPACE env var lets you
// override this for unusual setups; otherwise we resolve relative to the
// running script and walk up until we find a `workspace/` sibling.
function resolveWorkspaceRoot(): string {
  if (process.env.MASTRA_BOWL_WORKSPACE) {
    return path.resolve(process.env.MASTRA_BOWL_WORKSPACE);
  }
  // Try several candidates: cwd, cwd/.., cwd/../..., src/mastra/public/workspace
  const candidates = [
    path.resolve(process.cwd(), 'workspace'),
    path.resolve(process.cwd(), '..', 'workspace'),
    path.resolve(process.cwd(), '..', '..', 'workspace'),
    path.resolve(process.cwd(), '..', '..', '..', 'workspace'),
    // Mastra dev sometimes sets cwd to src/mastra/public — that folder has
    // its own workspace/ used by the studio sandbox. Prefer the project
    // root one if both exist.
    path.resolve(process.cwd(), 'src', 'mastra', 'public', 'workspace'),
  ];
  // Use the first candidate that exists; fall back to the first.
  for (const c of candidates) {
    try {
      if (existsSync(c)) return c;
    } catch {
      /* ignore */
    }
  }
  return candidates[0];
}

const WORKSPACE_ROOT = resolveWorkspaceRoot();
const ARTIFACTS_ROOT = path.join(WORKSPACE_ROOT, 'artifacts');

// Map common file extensions to Content-Type values for the iframe preview.
const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.cjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.wasm': 'application/wasm',
  '.map': 'application/json; charset=utf-8',
};

function contentTypeFor(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES[ext] ?? 'application/octet-stream';
}

/**
 * Serves files from `workspace/artifacts/<sessionId>/...` so the Artifact
 * tab's iframe preview can render HTML / images / etc. that the agent
 * has just written. Hardened against path traversal — every resolved
 * path must remain inside the artifacts root.
 */
export const artifactFilesRoute = registerApiRoute('/artifacts/:sessionId/*', {
  method: 'GET',
  handler: async (c) => {
    const sessionId = c.req.param('sessionId');
    if (!sessionId || /[\\/]/.test(sessionId) || sessionId === '..' || sessionId === '.') {
      return c.json({ error: 'Invalid sessionId' }, 400);
    }

    // Hono path matching: everything after `:sessionId/` is captured as the
    // wildcard. We can't rely on a named param for `*`, so derive it from
    // the URL pathname.
    const url = new URL(c.req.url);
    const prefix = `/artifacts/${sessionId}/`;
    if (!url.pathname.startsWith(prefix)) {
      return c.json({ error: 'Bad request' }, 400);
    }
    let relPath = decodeURIComponent(url.pathname.slice(prefix.length));
    if (!relPath || relPath.endsWith('/')) {
      relPath = path.join(relPath, 'index.html');
    }

    const sessionRoot = path.resolve(ARTIFACTS_ROOT, sessionId);
    const target = path.resolve(sessionRoot, relPath);

    // Path traversal guard.
    if (target !== sessionRoot && !target.startsWith(sessionRoot + path.sep)) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    let stat;
    try {
      stat = await fs.stat(target);
    } catch {
      return c.json({ error: 'Not found' }, 404);
    }
    if (!stat.isFile()) {
      return c.json({ error: 'Not a file' }, 404);
    }

    const buf = await fs.readFile(target);
    return new Response(new Uint8Array(buf), {
      status: 200,
      headers: {
        'Content-Type': contentTypeFor(target),
        'Content-Length': String(buf.byteLength),
        'Cache-Control': 'no-store',
      },
    });
  },
});
