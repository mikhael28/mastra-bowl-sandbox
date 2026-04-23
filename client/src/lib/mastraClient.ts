/**
 * Thin wrapper around the Mastra dev server HTTP API on localhost:4111.
 * The Vite dev server proxies /api and /voice-speak through, so we can use
 * relative paths in the browser.
 *
 * Docs: node_modules/@mastra/server/dist/docs/references/reference-server-routes.md
 */

export type AgentSummary = {
  id: string;
  name?: string;
  description?: string;
  instructions?: string;
  modelId?: string;
  tools?: Record<string, { id: string; description?: string }>;
  workflows?: Record<string, { id: string }>;
  agents?: Record<string, { id: string }>;
};

export type WorkflowSummary = {
  id: string;
  name?: string;
  description?: string;
  steps?: Record<string, unknown>;
  inputSchema?: unknown;
  outputSchema?: unknown;
};

export type ToolSummary = {
  id: string;
  description?: string;
  inputSchema?: unknown;
  outputSchema?: unknown;
};

export type McpServerSummary = {
  id: string;
  name?: string;
  version?: string;
  description?: string;
};

export type McpToolSummary = {
  id: string;
  name?: string;
  description?: string;
};

export type MemoryThreadSummary = {
  id: string;
  resourceId?: string;
  title?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type MemoryMessage = {
  id: string;
  role: string;
  content: unknown;
  createdAt?: string;
  threadId?: string;
};

/** Raw Mastra chunk types we care about in the UI. */
export type Chunk = {
  type: string;
  runId?: string;
  from?: string;
  payload?: any;
  // workflow chunks embed the whole object here too
  [k: string]: any;
};

async function j<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  // A few endpoints (DELETEs) return empty bodies.
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

function normalizeAgents(raw: unknown): AgentSummary[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as AgentSummary[];
  return Object.entries(raw as Record<string, any>).map(([id, a]) => ({
    id,
    ...(a ?? {}),
  }));
}

function normalizeWorkflows(raw: unknown): WorkflowSummary[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as WorkflowSummary[];
  return Object.entries(raw as Record<string, any>).map(([id, w]) => ({
    id,
    ...(w ?? {}),
  }));
}

function normalizeTools(raw: unknown): ToolSummary[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as ToolSummary[];
  return Object.entries(raw as Record<string, any>).map(([id, t]) => ({
    id,
    ...(t ?? {}),
  }));
}

// ---------------------------------------------------------------------------
// Agents
// ---------------------------------------------------------------------------

export async function listAgents(): Promise<AgentSummary[]> {
  const raw = await j<unknown>('/api/agents');
  return normalizeAgents(raw);
}

export async function getAgent(agentId: string): Promise<AgentSummary | null> {
  try {
    return await j<AgentSummary>(`/api/agents/${agentId}`);
  } catch {
    return null;
  }
}

export async function listAgentTools(agentId: string): Promise<ToolSummary[]> {
  try {
    const raw = await j<unknown>(`/api/agents/${agentId}/tools`);
    return normalizeTools(raw);
  } catch {
    return [];
  }
}

/**
 * Open a streaming agent run. Returns an async iterable of parsed chunks.
 *
 * Mastra streams chunks as a newline-delimited JSON (aka "json stream"):
 * each line is one ChunkType object. We parse them here so consumers only
 * see strongly-typed chunks.
 */
export async function* streamAgent(
  agentId: string,
  body: {
    messages: string | Array<{ role: string; content: string }>;
    memory?: { thread: string; resource: string };
    runId?: string;
    maxSteps?: number;
  },
  signal?: AbortSignal,
): AsyncGenerator<Chunk, void, void> {
  const res = await fetch(`/api/agents/${agentId}/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    throw new Error(`stream ${res.status}: ${text}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    // Each chunk is one JSON object per line. Some SSE implementations prefix
    // with `data: ` — handle that too.
    let nl: number;
    while ((nl = buf.indexOf('\n')) >= 0) {
      const rawLine = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (!rawLine) continue;
      const line = rawLine.startsWith('data:') ? rawLine.slice(5).trim() : rawLine;
      if (!line || line === '[DONE]') continue;
      try {
        yield JSON.parse(line) as Chunk;
      } catch {
        // Some servers send `data: <plaintext>`. Fold into a synthetic text chunk.
        yield { type: 'text-delta', payload: { text: line } };
      }
    }
  }

  if (buf.trim()) {
    try {
      yield JSON.parse(buf.trim()) as Chunk;
    } catch {
      /* ignore trailing garbage */
    }
  }
}

/** Non-streaming fallback — useful for quick one-shot calls. */
export async function generateAgent(
  agentId: string,
  body: {
    messages: string | any[];
    memory?: { thread: string; resource: string };
  },
): Promise<{ text?: string; toolCalls?: unknown[] }> {
  return j(`/api/agents/${agentId}/generate`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// Workflows
// ---------------------------------------------------------------------------

export async function listWorkflows(): Promise<WorkflowSummary[]> {
  const raw = await j<unknown>('/api/workflows');
  return normalizeWorkflows(raw);
}

export async function getWorkflow(workflowId: string): Promise<WorkflowSummary | null> {
  try {
    return await j<WorkflowSummary>(`/api/workflows/${workflowId}`);
  } catch {
    return null;
  }
}

export async function createWorkflowRun(
  workflowId: string,
  body: { resourceId?: string; disableScorers?: boolean } = {},
): Promise<{ runId: string } | any> {
  return j(`/api/workflows/${workflowId}/create-run`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function* streamWorkflow(
  workflowId: string,
  body: {
    inputData?: unknown;
    resourceId?: string;
    runId?: string;
    closeOnSuspend?: boolean;
  },
  signal?: AbortSignal,
): AsyncGenerator<Chunk, void, void> {
  const res = await fetch(`/api/workflows/${workflowId}/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    throw new Error(`workflow stream ${res.status}: ${text}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buf.indexOf('\n')) >= 0) {
      const rawLine = buf.slice(0, nl).trim();
      buf = buf.slice(nl + 1);
      if (!rawLine) continue;
      const line = rawLine.startsWith('data:') ? rawLine.slice(5).trim() : rawLine;
      if (!line || line === '[DONE]') continue;
      try {
        yield JSON.parse(line) as Chunk;
      } catch {
        /* ignore */
      }
    }
  }
}

export async function resumeWorkflow(
  workflowId: string,
  body: { step?: string | string[]; resumeData?: unknown; runId?: string },
): Promise<any> {
  return j(`/api/workflows/${workflowId}/resume-async`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export async function listWorkflowRuns(workflowId: string): Promise<any[]> {
  try {
    const raw = await j<any>(`/api/workflows/${workflowId}/runs`);
    if (Array.isArray(raw)) return raw;
    if (raw?.runs && Array.isArray(raw.runs)) return raw.runs;
    return [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Tools (global)
// ---------------------------------------------------------------------------

export async function listTools(): Promise<ToolSummary[]> {
  const raw = await j<unknown>('/api/tools');
  return normalizeTools(raw);
}

export async function executeTool(toolId: string, data: unknown): Promise<any> {
  return j(`/api/tools/${toolId}/execute`, {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}

export async function executeAgentTool(
  agentId: string,
  toolId: string,
  data: unknown,
): Promise<any> {
  return j(`/api/agents/${agentId}/tools/${toolId}/execute`, {
    method: 'POST',
    body: JSON.stringify({ data }),
  });
}

// ---------------------------------------------------------------------------
// Memory
// ---------------------------------------------------------------------------

export async function listMemoryThreads(params: {
  resourceId?: string;
  agentId?: string;
}): Promise<MemoryThreadSummary[]> {
  const q = new URLSearchParams();
  if (params.resourceId) q.set('resourceId', params.resourceId);
  if (params.agentId) q.set('agentId', params.agentId);
  const suffix = q.toString() ? `?${q.toString()}` : '';
  try {
    const raw = await j<any>(`/api/memory/threads${suffix}`);
    if (Array.isArray(raw)) return raw;
    if (raw?.threads) return raw.threads;
    return [];
  } catch {
    return [];
  }
}

export async function getMemoryThreadMessages(
  threadId: string,
  params: { agentId?: string } = {},
): Promise<MemoryMessage[]> {
  const q = new URLSearchParams();
  if (params.agentId) q.set('agentId', params.agentId);
  const suffix = q.toString() ? `?${q.toString()}` : '';
  try {
    const raw = await j<any>(`/api/memory/threads/${threadId}/messages${suffix}`);
    if (Array.isArray(raw)) return raw;
    if (raw?.messages) return raw.messages;
    return [];
  } catch {
    return [];
  }
}

export async function createMemoryThread(body: {
  resourceId: string;
  title?: string;
  agentId?: string;
}): Promise<MemoryThreadSummary> {
  return j('/api/memory/threads', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// MCP
// ---------------------------------------------------------------------------

export async function listMcpServers(): Promise<McpServerSummary[]> {
  try {
    const raw = await j<any>('/api/mcp/servers');
    if (Array.isArray(raw)) return raw;
    if (raw?.servers) return raw.servers;
    return [];
  } catch {
    return [];
  }
}

export async function listMcpServerTools(serverId: string): Promise<McpToolSummary[]> {
  try {
    const raw = await j<any>(`/api/mcp/servers/${serverId}/tools`);
    if (Array.isArray(raw)) return raw;
    if (raw?.tools) return raw.tools;
    return [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Server health
// ---------------------------------------------------------------------------

export async function pingServer(): Promise<boolean> {
  try {
    const res = await fetch('/api/agents');
    return res.ok;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Voice (custom route wired in this project's mastra/index.ts)
// ---------------------------------------------------------------------------

export async function speakText(agentId: string, text: string): Promise<Blob> {
  const res = await fetch(`/voice-speak/${agentId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`voice-speak ${res.status}: ${err}`);
  }
  return res.blob();
}
