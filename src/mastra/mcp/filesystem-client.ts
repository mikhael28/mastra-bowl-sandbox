import { MCPClient } from '@mastra/mcp';
import { resolve } from 'node:path';

const WORKSPACE_PATH = resolve(process.cwd(), 'workspace');

export const filesystemMcp = new MCPClient({
  id: 'openclaw-filesystem-mcp',
  servers: {
    fs: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', WORKSPACE_PATH],
    },
  },
  timeout: 30_000,
});
