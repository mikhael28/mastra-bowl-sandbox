import { MCPServer } from '@mastra/mcp';
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

// Resolve from project root (where mastra dev/start runs)
// In dev: src/mastra/public/ has the file
// In built output: .mastra/output/ has the file (copied from public/)
const candidates = [
  join(process.cwd(), 'src', 'mastra', 'public', 'mastra-docs-overview.md'),
  join(process.cwd(), '.mastra', 'output', 'mastra-docs-overview.md'),
];
const DOCS_PATH = candidates.find(p => existsSync(p)) ?? candidates[0];

export const readDocsTool = createTool({
  id: 'read_docs',
  description:
    'Reads the Mastra documentation overview file. Returns the full content or a section filtered by heading.',
  inputSchema: z.object({
    section: z
      .string()
      .optional()
      .describe(
        'Optional section heading to filter by (e.g. "Agents", "Memory", "Workspace"). If omitted, returns the full document.',
      ),
  }),
  execute: async ({ section }) => {
    const content = readFileSync(DOCS_PATH, 'utf-8');

    if (!section) {
      return { content };
    }

    // Extract a section by heading
    const pattern = new RegExp(
      `^(#{1,3})\\s+${section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
      'im',
    );
    const match = pattern.exec(content);
    if (!match) {
      return { content: `Section "${section}" not found in the documentation.` };
    }

    const level = match[1].length;
    const start = match.index;
    const rest = content.slice(start + match[0].length);
    const nextHeading = rest.search(new RegExp(`^#{1,${level}}\\s`, 'm'));
    const end = nextHeading === -1 ? content.length : start + match[0].length + nextHeading;

    return { content: content.slice(start, end).trim() };
  },
});

export const docsMcpServer = new MCPServer({
  id: 'docs-server',
  name: 'Mastra Docs Server',
  version: '1.0.0',
  description: 'Serves the Mastra documentation overview as a resource and provides a tool to read it.',
  tools: {
    read_docs: readDocsTool,
  },
  resources: {
    listResources: async () => [
      {
        uri: 'docs://mastra-docs-overview',
        name: 'Mastra Documentation Overview',
        description: 'Comprehensive overview of the Mastra framework documentation',
        mimeType: 'text/markdown',
      },
    ],
    getResourceContent: async ({ uri }) => {
      if (uri === 'docs://mastra-docs-overview') {
        const content = readFileSync(DOCS_PATH, 'utf-8');
        return [{ text: content }];
      }
      throw new Error(`Resource not found: ${uri}`);
    },
  },
});
