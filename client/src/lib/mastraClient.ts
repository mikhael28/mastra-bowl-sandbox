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
    memory?: {
      thread: string;
      resource: string;
      options?: {
        lastMessages?: number | false;
        semanticRecall?: boolean | Record<string, unknown>;
        workingMemory?: { enabled?: boolean } & Record<string, unknown>;
        threads?: { generateTitle?: boolean };
      };
    };
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

/**
 * Resume a suspended run after a `tool-call-approval` chunk by approving or
 * declining the pending tool call. The response is a new NDJSON stream that
 * continues the same run. Caller should fold chunks into the same assistant
 * message.
 */
export async function* resumeToolApproval(
  agentId: string,
  opts: {
    runId: string;
    toolCallId: string;
    approved: boolean;
  },
  signal?: AbortSignal,
): AsyncGenerator<Chunk, void, void> {
  const path = opts.approved ? 'approve-tool-call' : 'decline-tool-call';
  const res = await fetch(`/api/agents/${agentId}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ runId: opts.runId, toolCallId: opts.toolCallId }),
    signal,
  });
  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '');
    throw new Error(`${path} ${res.status}: ${text}`);
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
        yield { type: 'text-delta', payload: { text: line } };
      }
    }
  }
  if (buf.trim()) {
    try {
      yield JSON.parse(buf.trim()) as Chunk;
    } catch {
      /* ignore */
    }
  }
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

export type VoiceSpeaker = {
  voiceId: string;
  name?: string;
  displayName?: string;
  voice_name?: string;
  labels?: { accent?: string; [k: string]: unknown };
  [k: string]: unknown;
};

export async function speakText(
  agentId: string,
  text: string,
  speakerId?: string,
): Promise<Blob> {
  const res = await fetch(`/voice-speak/${agentId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(speakerId ? { text, speakerId } : { text }),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`voice-speak ${res.status}: ${err}`);
  }
  return res.blob();
}

export async function listVoiceSpeakers(agentId: string): Promise<VoiceSpeaker[]> {
  try {
    const raw = await j<any>(`/api/agents/${agentId}/voice/speakers`);
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export async function transcribeAudio(
  agentId: string,
  audio: Blob,
  filetype: 'wav' | 'webm' | 'mp4' | 'ogg' = 'webm',
): Promise<string> {
  const fd = new FormData();
  fd.append('audio', audio, `recording.${filetype}`);
  fd.append('options', JSON.stringify({ filetype }));
  const res = await fetch(`/api/agents/${agentId}/voice/listen`, {
    method: 'POST',
    body: fd,
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`voice/listen ${res.status}: ${err}`);
  }
  const data = await res.json();
  return (data && data.text ? String(data.text) : '').trim();
}

// ---------------------------------------------------------------------------
// Scorers (evals)
// ---------------------------------------------------------------------------

export type ScoreRecord = {
  id: string;
  scorerId: string;
  score?: number;
  preprocessStepResult?: unknown;
  analyzeStepResult?: unknown;
  generateScoreStepResult?: unknown;
  generateReasonStepResult?: { reason?: string };
  reason?: string;
  entityId?: string;
  entityType?: string;
  runId?: string;
  traceId?: string;
  createdAt?: string;
  input?: unknown;
  output?: unknown;
  metadata?: Record<string, unknown>;
  [k: string]: unknown;
};

export async function listScorers(): Promise<Array<{ id: string; scorer?: { description?: string } }>> {
  try {
    const raw = await j<any>('/api/scores/scorers');
    if (!raw) return [];
    return Object.entries(raw).map(([id, s]) => ({ id, ...(s as any) }));
  } catch {
    return [];
  }
}

export async function listScoresByRunId(runId: string): Promise<ScoreRecord[]> {
  try {
    const raw = await j<any>(`/api/scores/run/${runId}`);
    if (Array.isArray(raw)) return raw;
    if (raw?.scores && Array.isArray(raw.scores)) return raw.scores;
    return [];
  } catch {
    return [];
  }
}

export async function listScoresByEntity(
  entityType: 'AGENT' | 'WORKFLOW',
  entityId: string,
  perPage = 20,
): Promise<ScoreRecord[]> {
  try {
    const raw = await j<any>(
      `/api/scores/entity/${entityType}/${entityId}?perPage=${perPage}`,
    );
    if (Array.isArray(raw)) return raw;
    if (raw?.scores && Array.isArray(raw.scores)) return raw.scores;
    return [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Workspace helpers
//
// These delegate to the WORKSPACE_TOOLS that the mastraclaw-agent already
// registers — we just call them via `/api/agents/:agentId/tools/:toolId/execute`.
// That keeps the file-tree / file-read paths exactly in sync with the
// approval policies the agent uses, and teaches the reader that the workspace
// itself is just a bag of tools.
// ---------------------------------------------------------------------------

export type WorkspaceEntry = {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  modified?: string;
};

// The mastraclaw-agent exposes its workspace through the MCP filesystem client,
// which provides `fs_*` tools. The WORKSPACE_TOOLS set (mastra_workspace_*)
// is registered on the Agent internally but is not reachable via
// `/api/agents/:id/tools/:toolId/execute`. So we drive the explorer through
// `fs_list_directory_with_sizes` and `fs_read_text_file`, which ARE callable
// — same files the agent sees, same access boundaries.
//
// Directory listings come back as a text string like:
//   [DIR] foo
//   [FILE] bar.txt   1.2K
// which we parse into WorkspaceEntry objects.
export async function listWorkspace(
  agentId: string,
  path = 'workspace',
): Promise<WorkspaceEntry[]> {
  const normalized = path === '.' || path === '' ? 'workspace' : path;
  try {
    const raw = await executeAgentTool(
      agentId,
      'fs_list_directory_with_sizes',
      { path: normalized },
    );
    const data = unwrapToolResult(raw);
    const text: string =
      typeof data === 'string'
        ? data
        : typeof (data as any)?.content === 'string'
          ? (data as any).content
          : '';
    if (!text) return [];
    return parseFsListing(text, normalized);
  } catch {
    return [];
  }
}

function parseFsListing(text: string, basePath: string): WorkspaceEntry[] {
  const out: WorkspaceEntry[] = [];
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('Total:') || line.startsWith('Combined size:'))
      continue;
    const dirMatch = line.match(/^\[DIR\]\s+(.+?)(?:\s+\d.*)?$/);
    const fileMatch = line.match(/^\[FILE\]\s+(\S+)(?:\s+([\d.]+)\s*([KMG]?B))?$/);
    if (dirMatch) {
      const name = dirMatch[1].trim();
      out.push({
        name,
        path: `${basePath}/${name}`,
        type: 'directory',
      });
    } else if (fileMatch) {
      const name = fileMatch[1].trim();
      const sizeNum = parseFloat(fileMatch[2] ?? '');
      const unit = fileMatch[3] ?? 'B';
      const mult =
        unit === 'KB' ? 1024 : unit === 'MB' ? 1024 * 1024 : unit === 'GB' ? 1024 ** 3 : 1;
      out.push({
        name,
        path: `${basePath}/${name}`,
        type: 'file',
        size: isFinite(sizeNum) ? Math.round(sizeNum * mult) : undefined,
      });
    }
  }
  // Sort dirs first, then files, each alphabetical.
  out.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return out;
}

export async function readWorkspaceFile(
  agentId: string,
  path: string,
): Promise<{ content: string; path: string; size?: number } | null> {
  try {
    const raw = await executeAgentTool(agentId, 'fs_read_text_file', { path });
    const data = unwrapToolResult(raw);
    if (typeof data === 'string') return { content: data, path };
    if (data && typeof data === 'object') {
      const content =
        (data as any).content ?? (data as any).text ?? (data as any).data;
      if (typeof content === 'string')
        return { content, path, size: (data as any).size };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Write a file in the agent's workspace via the MCP filesystem `fs_write_file`
 * tool. Same access rules as the agent — the MCP fs server is rooted at
 * `workspace/`. Returns true on success.
 */
export async function writeWorkspaceFile(
  agentId: string,
  path: string,
  content: string,
): Promise<boolean> {
  try {
    await executeAgentTool(agentId, 'fs_write_file', { path, content });
    return true;
  } catch {
    return false;
  }
}

/**
 * Create a directory in the agent's workspace via `fs_create_directory`.
 */
export async function createWorkspaceDirectory(
  agentId: string,
  path: string,
): Promise<boolean> {
  try {
    await executeAgentTool(agentId, 'fs_create_directory', { path });
    return true;
  } catch {
    return false;
  }
}

// Small helper: Mastra wraps execute results as `{ data: ... }` or returns raw
// depending on the endpoint — flatten either shape for consumers.
function unwrapToolResult(raw: any): any {
  if (raw == null) return raw;
  if (typeof raw === 'object' && 'data' in raw) return (raw as any).data;
  if (typeof raw === 'object' && 'result' in raw) return (raw as any).result;
  return raw;
}

// ---------------------------------------------------------------------------
// Workspace todo list (workspace/todo.json via todo-* tools)
// ---------------------------------------------------------------------------

export type TodoItem = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
};

export async function listTodos(
  agentId: string,
  filter: 'all' | 'pending' | 'completed' = 'all',
): Promise<{ todos: TodoItem[]; counts: { total: number; pending: number; completed: number } }> {
  try {
    const raw = await executeAgentTool(agentId, 'todo-list', { filter });
    const data = unwrapToolResult(raw);
    return {
      todos: Array.isArray(data?.todos) ? (data.todos as TodoItem[]) : [],
      counts: data?.counts ?? { total: 0, pending: 0, completed: 0 },
    };
  } catch {
    return { todos: [], counts: { total: 0, pending: 0, completed: 0 } };
  }
}

export async function completeTodo(
  agentId: string,
  id: string,
): Promise<TodoItem | null> {
  try {
    const raw = await executeAgentTool(agentId, 'todo-complete', { id });
    const data = unwrapToolResult(raw);
    return (data?.todo as TodoItem) ?? null;
  } catch {
    return null;
  }
}

export async function addTodo(
  agentId: string,
  text: string,
): Promise<TodoItem | null> {
  try {
    const raw = await executeAgentTool(agentId, 'todo-add', { text });
    const data = unwrapToolResult(raw);
    return (data?.todo as TodoItem) ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Working memory (custom route — see src/mastra/routes/working-memory-route.ts)
// ---------------------------------------------------------------------------

export type WorkingMemory = {
  agentId: string;
  resourceId?: string;
  threadId?: string;
  template?: string | null;
  scope?: string | null;
  enabled?: boolean;
  workingMemory?: string | null;
  updatedAt?: string | null;
  error?: string;
};

export async function getWorkingMemory(
  agentId: string,
  params: { resourceId?: string; threadId?: string } = {},
): Promise<WorkingMemory | null> {
  const q = new URLSearchParams();
  if (params.resourceId) q.set('resourceId', params.resourceId);
  if (params.threadId) q.set('threadId', params.threadId);
  const suffix = q.toString() ? `?${q.toString()}` : '';
  try {
    return await j<WorkingMemory>(`/working-memory/${agentId}${suffix}`);
  } catch {
    return null;
  }
}

export async function updateWorkingMemory(
  agentId: string,
  body: { resourceId?: string; threadId?: string; workingMemory: string },
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`/working-memory/${agentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return { ok: false, error: data?.error ?? `HTTP ${res.status}` };
    return { ok: true };
  } catch (err: any) {
    return { ok: false, error: String(err?.message ?? err) };
  }
}

export async function deleteMemoryThread(threadId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/memory/threads/${threadId}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Local model status (LM Studio detection)
// ---------------------------------------------------------------------------

export type LocalModelStatus = {
  selected: string;
  source: 'override' | 'local' | 'cloud-default';
  cloudDefault: string;
  lmStudio: {
    baseUrl: string;
    running: boolean;
    models: string[];
    suggested: string | null;
  };
  override: string | null;
};

export async function getLocalModelStatus(): Promise<LocalModelStatus | null> {
  try {
    return await j<LocalModelStatus>('/local-model-status');
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Workflow runs — used to render a completed workflow's step timeline after
// the agent calls it as a tool. See Chat.tsx → WorkflowToolCard.
// ---------------------------------------------------------------------------

export type WorkflowRunRecord = {
  runId: string;
  workflowName?: string;
  snapshot?: any;
  createdAt?: string;
  updatedAt?: string;
  [k: string]: unknown;
};

export async function getWorkflowRun(
  workflowId: string,
  runId: string,
): Promise<WorkflowRunRecord | null> {
  try {
    return await j<WorkflowRunRecord>(
      `/api/workflows/${workflowId}/runs/${runId}`,
    );
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Observability — traces + spans
//
// Mastra's observability domain stores every agent/workflow/model/tool span
// against a traceId. The server exposes:
//
//   GET  /api/observability/traces              list traces (paginated)
//   GET  /api/observability/traces/:traceId     trace + all its spans
//
// List supports optional filters: runId, entityId, entityType.
// Each span has a spanType from this set (see SpanRecord.spanType):
//   agent_run, workflow_run, workflow_step, workflow_conditional,
//   workflow_conditional_eval, workflow_parallel, workflow_loop,
//   model_generation, model_step, model_chunk,
//   tool_call, mcp_tool_call, processor_run, generic
// ---------------------------------------------------------------------------

export type SpanType =
  | 'agent_run'
  | 'workflow_run'
  | 'workflow_step'
  | 'workflow_conditional'
  | 'workflow_conditional_eval'
  | 'workflow_parallel'
  | 'workflow_loop'
  | 'model_generation'
  | 'model_step'
  | 'model_chunk'
  | 'tool_call'
  | 'mcp_tool_call'
  | 'processor_run'
  | 'generic'
  | (string & {});

export type TokenUsage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  inputDetails?: { cacheRead?: number; cacheWrite?: number; text?: number };
  outputDetails?: { reasoning?: number; text?: number };
  // Older shape seen on finish chunks
  promptTokens?: number;
  completionTokens?: number;
};

export type SpanRecord = {
  traceId: string;
  spanId: string;
  parentSpanId: string | null;
  name: string;
  spanType: SpanType;
  isEvent: boolean;
  startedAt: string;
  endedAt: string | null;
  entityType?: string | null;
  entityId?: string | null;
  entityName?: string | null;
  parentEntityType?: string | null;
  parentEntityId?: string | null;
  parentEntityName?: string | null;
  rootEntityType?: string | null;
  rootEntityId?: string | null;
  rootEntityName?: string | null;
  runId?: string | null;
  threadId?: string | null;
  resourceId?: string | null;
  sessionId?: string | null;
  tags?: string[] | null;
  metadata?: Record<string, any> | null;
  attributes?: Record<string, any> | null;
  input?: any;
  output?: any;
  requestContext?: Record<string, any> | null;
  errorInfo?: { message?: string; [k: string]: any } | null;
  createdAt?: string;
  updatedAt?: string | null;
};

export type TracePage = {
  pagination: { total: number; page: number; perPage: number; hasMore: boolean };
  spans: SpanRecord[];
};

export type TraceDetail = {
  traceId: string;
  spans: SpanRecord[];
};

export type TraceListFilters = {
  page?: number;
  perPage?: number;
  runId?: string;
  entityId?: string;
  entityType?: string;
};

/**
 * List recent root spans (one per trace). The server returns one span per
 * trace — the top-level agent_run / workflow_run — with pagination metadata.
 */
export async function listTraces(
  filters: TraceListFilters = {},
): Promise<TracePage> {
  const q = new URLSearchParams();
  q.set('page', String(filters.page ?? 0));
  q.set('perPage', String(filters.perPage ?? 25));
  if (filters.runId) q.set('runId', filters.runId);
  if (filters.entityId) q.set('entityId', filters.entityId);
  if (filters.entityType) q.set('entityType', filters.entityType);
  try {
    return await j<TracePage>(`/api/observability/traces?${q.toString()}`);
  } catch {
    return {
      pagination: { total: 0, page: 0, perPage: filters.perPage ?? 25, hasMore: false },
      spans: [],
    };
  }
}

/** Fetch one trace plus every span that belongs to it. */
export async function getTrace(traceId: string): Promise<TraceDetail | null> {
  try {
    return await j<TraceDetail>(`/api/observability/traces/${traceId}`);
  } catch {
    return null;
  }
}

/**
 * Resolve a runId (the id a Chat turn or workflow stream used) to its trace.
 * The list endpoint filters by runId and returns the root span — we grab its
 * traceId and fetch the full tree.
 */
export async function getTraceByRunId(runId: string): Promise<TraceDetail | null> {
  const page = await listTraces({ runId, perPage: 1 });
  const root = page.spans[0];
  if (!root?.traceId) return null;
  return getTrace(root.traceId);
}
