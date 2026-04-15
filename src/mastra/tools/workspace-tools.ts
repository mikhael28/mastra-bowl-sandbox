import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { mkdir, writeFile, readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const WORKSPACE_ROOT = resolve(process.cwd(), 'workspace');

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'untitled';
}

function safeJoin(root: string, relative: string): string {
  const full = resolve(root, relative);
  if (!full.startsWith(root)) {
    throw new Error(`Path escapes workspace: ${relative}`);
  }
  return full;
}

export async function ensureSession(sessionId?: string, seed?: string): Promise<string> {
  const id =
    sessionId ??
    `${new Date().toISOString().replace(/[:.]/g, '-')}-${slugify(seed ?? 'research')}`;
  const dir = join(WORKSPACE_ROOT, id);
  await mkdir(join(dir, 'sources'), { recursive: true });
  await mkdir(join(dir, 'artifacts'), { recursive: true });
  return id;
}

export async function writeSource(
  sessionId: string,
  source: {
    url: string;
    title?: string | null;
    query?: string;
    publishedDate?: string;
    author?: string | null;
    summary?: string;
    text?: string;
  },
): Promise<string> {
  const dir = safeJoin(WORKSPACE_ROOT, join(sessionId, 'sources'));
  await mkdir(dir, { recursive: true });
  const filename = `${slugify(source.title || source.url)}.md`;
  const path = join(dir, filename);
  const body = [
    `# ${source.title ?? source.url}`,
    '',
    `- URL: ${source.url}`,
    source.query ? `- Query: ${source.query}` : null,
    source.publishedDate ? `- Published: ${source.publishedDate}` : null,
    source.author ? `- Author: ${source.author}` : null,
    '',
    source.summary ? `## Summary\n\n${source.summary}\n` : null,
    source.text ? `## Content\n\n${source.text}\n` : null,
  ]
    .filter(Boolean)
    .join('\n');
  await writeFile(path, body, 'utf8');
  return path;
}

export async function writeArtifact(
  sessionId: string,
  name: string,
  content: string,
): Promise<string> {
  const dir = safeJoin(WORKSPACE_ROOT, join(sessionId, 'artifacts'));
  await mkdir(dir, { recursive: true });
  const filename = name.endsWith('.md') ? name : `${slugify(name)}.md`;
  const path = join(dir, filename);
  await writeFile(path, content, 'utf8');
  return path;
}

export const writeArtifactTool = createTool({
  id: 'workspace-write-artifact',
  description:
    'Save a finalized artifact (e.g. the research answer, an outline, a draft) as a Markdown file inside the current research session workspace.',
  inputSchema: z.object({
    sessionId: z.string().describe('Research session id returned by the workflow'),
    name: z.string().describe('Artifact filename (without extension is fine)'),
    content: z.string().describe('Markdown content to write'),
  }),
  outputSchema: z.object({ path: z.string() }),
  execute: async ({ sessionId, name, content }) => ({
    path: await writeArtifact(sessionId, name, content),
  }),
});

export const saveSourceTool = createTool({
  id: 'workspace-save-source',
  description:
    'Save a web source (title, url, summary/text, metadata) as a Markdown file in the session sources folder so it can be referenced later.',
  inputSchema: z.object({
    sessionId: z.string(),
    url: z.string(),
    title: z.string().nullable().optional(),
    query: z.string().optional(),
    publishedDate: z.string().optional(),
    author: z.string().nullable().optional(),
    summary: z.string().optional(),
    text: z.string().optional(),
  }),
  outputSchema: z.object({ path: z.string() }),
  execute: async ({ sessionId, ...source }) => ({
    path: await writeSource(sessionId, source),
  }),
});

export const listWorkspaceTool = createTool({
  id: 'workspace-list',
  description: 'List artifacts and sources saved in a research session workspace.',
  inputSchema: z.object({ sessionId: z.string() }),
  outputSchema: z.object({
    sources: z.array(z.string()),
    artifacts: z.array(z.string()),
  }),
  execute: async ({ sessionId }) => {
    const base = safeJoin(WORKSPACE_ROOT, sessionId);
    const [sources, artifacts] = await Promise.all([
      readdir(join(base, 'sources')).catch(() => []),
      readdir(join(base, 'artifacts')).catch(() => []),
    ]);
    return { sources, artifacts };
  },
});

export const readWorkspaceFileTool = createTool({
  id: 'workspace-read-file',
  description: 'Read a previously saved artifact or source file from the session workspace.',
  inputSchema: z.object({
    sessionId: z.string(),
    kind: z.enum(['sources', 'artifacts']),
    filename: z.string(),
  }),
  outputSchema: z.object({ content: z.string() }),
  execute: async ({ sessionId, kind, filename }) => {
    const path = safeJoin(WORKSPACE_ROOT, join(sessionId, kind, filename));
    return { content: await readFile(path, 'utf8') };
  },
});
