/**
 * Educational copy for every Mastra primitive surfaced in this UI.
 * Each entry explains what the primitive is, how this sandbox wires it up,
 * and the HTTP endpoint the client uses to talk to it.
 *
 * The entries intentionally lean pedagogical — they are what someone learning
 * Mastra sees when they click a `ⓘ` badge in the chat. Keep them concrete:
 * reference file paths, endpoints, tool names, not abstractions.
 */

export type PrimitiveId =
  | 'agent'
  | 'agent-as-tool'
  | 'tool'
  | 'workflow'
  | 'workflow-suspend'
  | 'memory'
  | 'working-memory'
  | 'rag'
  | 'mcp'
  | 'scorer'
  | 'processor'
  | 'voice'
  | 'browser'
  | 'workspace'
  | 'sandbox'
  | 'approval'
  | 'stream'
  | 'observability';

export type EducationEntry = {
  id: PrimitiveId;
  title: string;
  tagline: string;
  why: string;
  howHere: string[];
  /** Optional, longer set of teaching bullets shown in detail view. */
  details?: string[];
  endpoint?: string;
  docs?: string;
};

export const EDUCATION: Record<PrimitiveId, EducationEntry> = {
  agent: {
    id: 'agent',
    title: 'Agent',
    tagline: 'An autonomous LLM loop with tools, memory, and instructions.',
    why:
      'Agents are the decision-makers of Mastra: give them a goal plus some tools, and they plan, call the tools, and keep going until the job is done. This is what turns a plain chat into an OpenClaw.',
    howHere: [
      'OpenClaw is the flagship agent — instructions scope it to BD & content work, and it orchestrates specialist sub-agents.',
      'Each specialist (copywriter, editor, email, news, math) is a standalone Agent registered in src/mastra/index.ts.',
      'This chat streams from POST /api/agents/:id/stream and renders text-delta + tool-call chunks live.',
    ],
    details: [
      "An Agent is an object you construct with `new Agent({ id, name, instructions, model, tools, agents, workflows, memory, ... })`.",
      'At runtime the agent calls the model → inspects the response → if it contains tool-calls, runs them → feeds results back → repeats. This is "the agent loop".',
      'OpenClaw uses `mastra/openai/gpt-5.1-codex` via the Model Router, so you can swap models without changing code.',
    ],
    endpoint: 'POST /api/agents/:agentId/stream',
    docs: 'https://mastra.ai/docs/agents/overview',
  },
  'agent-as-tool': {
    id: 'agent-as-tool',
    title: 'Agent-as-tool',
    tagline: 'A parent agent calling another agent the way it calls a function.',
    why:
      'Mastra lets you expose a specialist agent to a supervisor agent as if it were just another tool. The supervisor plans, delegates, and composes — no custom orchestration layer needed.',
    howHere: [
      'OpenClaw lists copywriter, editor, research-planner, retrieval-evaluator, and email-agent in its `agents` option.',
      'publisher-agent also does this — it calls copywriter-agent and editor-agent via content-tools.ts.',
      'When the supervisor calls one, you see the nested tool-call chunk in the stream below.',
    ],
    details: [
      'Each subagent has its own instructions, model, and tools — so "who does the work" is a scheduling decision the parent makes.',
      'The subagent result becomes the tool-result fed back to the parent, so the parent can still decide what to do next.',
      'Because subagents are *agents*, they run their own inner loop, emit their own reasoning/tool-calls, and inherit memory from the run if configured.',
    ],
    docs: 'https://mastra.ai/docs/agents/supervisor-agents',
  },
  tool: {
    id: 'tool',
    title: 'Tool',
    tagline: 'A typed function the agent can invoke, with Zod input/output schemas.',
    why:
      "Tools are how agents reach beyond their context window: web search, email, filesystem writes, Pinecone RAG, calculators. They're just typed functions.",
    howHere: [
      'This project ships tavily, exa, AgentMail (7 tools), calculators, workspace todo, qualify-lead, and RAG ingestion/search.',
      'Tools defined in src/mastra/tools/ and attached per-agent (e.g. math-agent gets the calculator set).',
      'You can execute any tool directly via POST /api/tools/:toolId/execute — the "Tools" panel here does exactly that.',
    ],
    details: [
      'A tool is a `createTool({ id, description, inputSchema, outputSchema, execute })`. The model sees the description + input schema and calls it when useful.',
      'Every tool call surfaces as a chunk in the stream — what you see in bubbles here are those chunks, rendered.',
      'Integration tools from Composio & Arcade are dynamic: they load per-user based on your COMPOSIO_API_KEY/ARCADE_API_KEY and make Gmail, Notion, Linear, Slack, HubSpot, and GitHub available.',
    ],
    endpoint: 'POST /api/tools/:toolId/execute',
    docs: 'https://mastra.ai/docs/agents/using-tools',
  },
  workflow: {
    id: 'workflow',
    title: 'Workflow',
    tagline: 'A typed DAG of steps: then, parallel, branch, dountil.',
    why:
      'When you need a structured process — not an autonomous loop — use a workflow. Each step has a Zod schema in and out, so TypeScript keeps the pipeline honest.',
    howHere: [
      'blog-post-workflow demonstrates branch() — score the post and either finalize or rewrite.',
      'tech-touchdown-workflow runs two searches in parallel(), then assembles.',
      'deep-search and rag-workflow use dountil() for iterative research with a satisfaction check.',
      'Streaming workflow execution via POST /api/workflows/:id/stream shows each step as it completes.',
    ],
    details: [
      'Workflows are first-class primitives: you build them with a typed builder API, attach them to the Mastra instance, and they get their own REST surface and observability spans.',
      'Agents can call workflows as if they were tools (add to `workflows` on the Agent) — so OpenClaw can delegate structured pipelines.',
      "When a step fails, the workflow snapshots its state and can be resumed or retried — that's the value of the primitive over 'just a function'.",
    ],
    endpoint: 'POST /api/workflows/:workflowId/stream',
    docs: 'https://mastra.ai/docs/workflows/overview',
  },
  'workflow-suspend': {
    id: 'workflow-suspend',
    title: 'Workflow suspend/resume',
    tagline: 'Pause a workflow, collect input from a human, then keep going.',
    why:
      'Real processes often need a human in the loop — approvals, clarifications, picks. Mastra workflows can suspend() at any step and be resumed with fresh data without losing state.',
    howHere: [
      'deep-search and rag-workflow both suspend at clarify-intent to ask the user 3 questions.',
      "When a workflow suspends, the stream emits a step-output with state.clarifiedIntent missing — the UI here surfaces those questions and POSTs to /resume-async.",
    ],
    endpoint: 'POST /api/workflows/:workflowId/resume-async',
    docs: 'https://mastra.ai/docs/workflows/suspend-and-resume',
  },
  memory: {
    id: 'memory',
    title: 'Memory',
    tagline: 'Persistent, vector-backed chat history + observational memory.',
    why:
      "Agents need to remember. Mastra's Memory stores every message, supports semantic recall via embeddings, and persists across sessions using LibSQL (or Postgres/MongoDB).",
    howHere: [
      'openclaw-agent uses a LibSQLStore + LibSQLVector at file:./openclaw-memory.db with text-embedding-3-small.',
      'observationalMemory is enabled — the agent silently learns across turns.',
      'Threads and messages are inspectable via GET /api/memory/threads and /messages endpoints.',
    ],
    details: [
      'Memory has two shapes: *episodic* (messages in threads) and *semantic* (vector index over past messages for recall).',
      '`lastMessages: 20` keeps the last N messages in-context; the vector store lets the agent pull in older-but-relevant history on demand.',
      'Threads are resource-scoped, so multiple users of the same agent have independent histories.',
    ],
    endpoint: 'GET /api/memory/threads',
    docs: 'https://mastra.ai/docs/memory/overview',
  },
  'working-memory': {
    id: 'working-memory',
    title: 'Working memory',
    tagline: 'A structured, resource-scoped profile the agent maintains over time.',
    why:
      'Beyond chat history, working memory is a free-form markdown template the agent writes into — things it should always remember about the user: name, tone, ICP, active projects.',
    howHere: [
      'OpenClaw has a userProfile template with fields for name, role, timezone, tone, active projects, ICP, etc.',
      'The instructions teach OpenClaw to update it only after the user-facing reply is finished.',
      'scope: "resource" — tied to the user, not a single thread.',
    ],
    details: [
      'Working memory is fed back into the system prompt on every turn, so anything the agent writes there becomes durable context for future conversations.',
      "It's different from chat history: chat is what was *said*, working memory is what the agent *should remember about you*.",
      'Because scope=resource, switching threads keeps the same profile — but switching userId resets it.',
    ],
    endpoint: 'GET /working-memory/:agentId?resourceId=...',
    docs: 'https://mastra.ai/docs/memory/working-memory',
  },
  rag: {
    id: 'rag',
    title: 'Agentic RAG',
    tagline: 'Vector + planner + evaluator loop on a Pinecone-backed knowledge base.',
    why:
      "RAG means grounding the agent's answers in private data. Mastra's stack includes a vector store, an ingest pipeline for many file types, and a unified `kb-search` tool with quick / deep / auto modes.",
    howHere: [
      'Pinecone is the vector store (VECTOR_STORE_NAME = knowledge-base).',
      'Collections isolate different bodies of knowledge — a seeded "mastra-docs" ships out of the box.',
      'rag-workflow orchestrates clarify → plan queries → vector search → evaluate → (loop) → read full doc → synthesize.',
    ],
    details: [
      'Each chunk returned by `kb-search` is independently scored — the UI here renders them as cards so you can see what the LLM is grounding on.',
      'Agentic RAG adds a planner agent (picks queries) and an evaluator agent (decides if chunks are good enough) around plain vector search.',
      'The ragWorkflow uses `dountil()` to keep searching + re-evaluating until the bar is met or a step-limit trips.',
    ],
    endpoint: 'POST /api/tools/kb-search/execute',
    docs: 'https://mastra.ai/docs/rag/overview',
  },
  mcp: {
    id: 'mcp',
    title: 'MCP server',
    tagline: 'Expose tools & resources to any MCP-speaking client (Claude, Cursor, ...).',
    why:
      'Model Context Protocol is the emerging standard for tool-calling across AI clients. Mastra can both run an MCP server AND consume remote MCP tools.',
    howHere: [
      'docs-server exposes the Mastra docs overview as a resource and as a read_docs tool.',
      'filesystem-client consumes an external MCP server for workspace file access.',
      'Inspect servers + tools via /api/mcp/servers.',
    ],
    endpoint: 'GET /api/mcp/servers',
    docs: 'https://mastra.ai/docs/mcp/overview',
  },
  scorer: {
    id: 'scorer',
    title: 'Scorer',
    tagline: 'LLM-as-judge + programmatic evals with sampling.',
    why:
      'Once agents are in production you need to measure output quality over time. Scorers analyze outputs on custom rubrics and can be run inline with sampling, or in CI.',
    howHere: [
      'basedScorer grades blog posts 0-10 on authenticity, boldness, originality, personality, impact.',
      'OpenClaw attaches answerRelevancy, toxicity, and based scorers at low sampling rates.',
      'blog-post-workflow calls basedScorer.run() directly and branches on score.',
    ],
    details: [
      'A scorer has preprocess → analyze → generateScore → generateReason steps. Each step output is retained, so you can trace *why* a reply got a score.',
      'Sampling means we run the scorer on a fraction of outputs — enough to track quality without paying for every turn.',
      'Scores are stored and queryable via /api/scores/run/:runId — the green chips on assistant messages here are fetched from that endpoint.',
    ],
    endpoint: 'GET /api/scores/run/:runId',
    docs: 'https://mastra.ai/docs/evals/overview',
  },
  processor: {
    id: 'processor',
    title: 'Processor',
    tagline: 'Input/output middleware — moderation, prompt-injection defense, normalization.',
    why:
      "Processors let you intercept agent I/O without changing instructions. Think of them as the agent's firewall.",
    howHere: [
      'OpenClaw uses UnicodeNormalizer + PromptInjectionDetector as input processors.',
      'Copywriter + publisher use ContentModerationInputProcessor / OutputProcessor to block violent or political content.',
      'A tripped output processor emits a `tripwire` chunk in the stream.',
    ],
    details: [
      "`PromptInjectionDetector` uses `strategy: 'rewrite'` — if it fires it can rewrite your message before the model sees it. That rewrite is visible in the `tripwire` block.",
      'Unicode normalization strips zero-width characters that are a common jailbreak vector.',
      'Output processors can block or rewrite the agent\'s *reply* — exposing everything to a moderation layer before the user sees it.',
    ],
    docs: 'https://mastra.ai/docs/agents/processors',
  },
  voice: {
    id: 'voice',
    title: 'Voice',
    tagline: 'Text-to-speech and speech-to-text attached to an agent.',
    why:
      'Voice is another I/O channel. Mastra wraps ElevenLabs + OpenAI voice providers and exposes speak/listen on the agent.',
    howHere: [
      'voice-agent uses ElevenLabs eleven_multilingual_v2 (speech) + scribe_v1 (listen).',
      'A custom /voice-speak/:agentId route streams audio/mpeg back to this UI.',
      'The "🔊 Play" button on assistant messages hits that route.',
    ],
    endpoint: 'POST /voice-speak/:agentId',
    docs: 'https://mastra.ai/docs/agents/adding-voice',
  },
  browser: {
    id: 'browser',
    title: 'Browser',
    tagline: 'Stagehand-powered browser automation as agent tools.',
    why:
      'Some tasks only exist in the browser: forms, dashboards, gated content. Stagehand lets an agent navigate, observe, act, and extract structured data using natural language.',
    howHere: [
      'OpenClaw gets StagehandBrowser with stagehand_navigate / observe / act / extract tools.',
      'Uses BrowserBase in production, headless local Chrome in dev.',
    ],
    details: [
      '`stagehand_navigate(url)` → load a page. `stagehand_observe(instruction)` → enumerate candidate actions. `stagehand_act(instruction)` → execute a natural-language action. `stagehand_extract(instruction, schema)` → pull structured data.',
      'When BROWSERBASE_API_KEY is set, sessions are cloud-recorded and debuggable — otherwise it runs headless locally.',
      'Always `stagehand_close` when the task is done — browser sessions are expensive.',
    ],
    docs: 'https://mastra.ai/docs/agents/browsing-the-web',
  },
  workspace: {
    id: 'workspace',
    title: 'Workspace',
    tagline: 'Sandboxed filesystem + shell the agent can read/write/execute in.',
    why:
      "Give the agent a real scratch space — it can save drafts, run scripts, index artifacts. All destructive ops gate behind approval so you don't wake up to a deleted repo.",
    howHere: [
      "OpenClaw's workspace is ./workspace with LocalFilesystem + LocalSandbox in dev, E2B in prod.",
      'WRITE_FILE, EDIT_FILE, DELETE, AST_EDIT, EXECUTE_COMMAND, KILL_PROCESS require approval.',
      'BM25 search + autoIndex mean the agent can grep its own outputs from prior sessions.',
    ],
    details: [
      'The workspace gets its own toolset: `mastra_workspace_list_files`, `_read_file`, `_write_file`, `_edit_file`, `_grep`, `_execute_command`, ...',
      'Skills directories (`.agents/skills`) are surfaced into the workspace so skill prompts work inline.',
      'In production, `E2BSandbox` runs commands in an isolated microVM with a 5-minute timeout — a real sandbox, not just chdir.',
    ],
    docs: 'https://mastra.ai/docs/agents/workspace',
  },
  sandbox: {
    id: 'sandbox',
    title: 'Sandbox',
    tagline: 'Isolated shell the agent can run commands in — `execute_command`.',
    why:
      "The sandbox is the 'shell' half of the workspace. It lets the agent type `npm install`, `pandoc file.md -o file.pdf`, `ls -la`, and get stdout/stderr/exit-code back without touching your host.",
    howHere: [
      'In dev: `LocalSandbox` runs commands against ./workspace with your shell.',
      'In prod: `E2BSandbox` spins up an ephemeral microVM per run.',
      'Every `execute_command` requires approval — the terminal card below shows stdout, stderr, and exit code as the command runs.',
    ],
    details: [
      'The sandbox is a first-class abstraction over "how does the agent run code?". Swapping Local → E2B is a one-line change.',
      "Long-running processes get a PID: `kill_process` can stop them. `get_process_output` polls stdout if you don't want to block.",
      "Approval gating is per-call; the UI shows you exactly what command the agent wants to run *before* you click Approve.",
    ],
    docs: 'https://mastra.ai/docs/agents/workspace',
  },
  approval: {
    id: 'approval',
    title: 'Tool approval (HITL)',
    tagline: 'Suspend the agent mid-run until you approve or decline a tool call.',
    why:
      'Some tools have real-world side effects — sending email, deleting files, running shell commands. Mastra suspends the run and asks the human before proceeding.',
    howHere: [
      'Any tool with `requireApproval: true` emits a `tool-call-approval` chunk.',
      'The chat here turns those into Approve / Decline buttons; clicking calls POST /api/agents/:id/approve-tool-call (or decline-) which resumes the run.',
      "OpenClaw's workspace config gates writes/edits/deletes and shell commands.",
    ],
    endpoint: 'POST /api/agents/:agentId/approve-tool-call',
    docs: 'https://mastra.ai/docs/agents/tool-approval',
  },
  stream: {
    id: 'stream',
    title: 'Streaming',
    tagline: 'NDJSON chunks: text-delta, tool-call, tool-result, step-finish, tripwire, finish.',
    why:
      'Agents are slow. Streaming lets the UI render as soon as the first token arrives — and lets you see tool calls, reasoning, and step boundaries *as they happen*.',
    howHere: [
      'POST /api/agents/:id/stream returns an NDJSON body — one JSON object per line.',
      'mastraClient.ts parses each chunk and the Chat component re-renders the active assistant bubble.',
      'Chunk types used: text-delta, reasoning-delta, tool-call, tool-result, tool-error, tool-call-approval, tripwire, finish, error.',
    ],
    endpoint: 'POST /api/agents/:agentId/stream',
    docs: 'https://mastra.ai/docs/agents/streaming',
  },
  observability: {
    id: 'observability',
    title: 'Observability',
    tagline: 'Traces, spans, logs, and sensitive-data scrubbing.',
    why:
      'You cannot debug what you cannot see. Mastra ships OpenTelemetry-flavored tracing out of the box and pipes it to Studio and (optionally) Mastra Cloud.',
    howHere: [
      'Observability in src/mastra/index.ts wires DefaultExporter (local storage) + CloudExporter.',
      'SensitiveDataFilter redacts passwords / tokens / keys from spans.',
      'Traces are queryable via /api/telemetry/traces and power the Studio timeline.',
    ],
    endpoint: 'GET /api/telemetry/traces',
    docs: 'https://mastra.ai/docs/observability/overview',
  },
};

/**
 * Map a Mastra stream chunk type to the primitive it demonstrates.
 * Used to auto-open the education sidepanel when something interesting happens.
 */
export function educationForChunk(type: string): PrimitiveId | null {
  switch (type) {
    case 'tool-call':
    case 'tool-result':
    case 'tool-call-input-streaming-start':
    case 'tool-call-delta':
      return 'tool';
    case 'tool-call-approval':
    case 'data-tool-call-approval':
      return 'approval';
    case 'tripwire':
      return 'processor';
    case 'reasoning-start':
    case 'reasoning-delta':
    case 'reasoning-end':
    case 'reasoning-signature':
      return 'agent';
    default:
      return null;
  }
}

/**
 * Classify a tool by its id. Used by the chat view to dispatch the right
 * specialized card. The patterns come directly from the tools registered
 * in src/mastra/agents/openclaw-agent.ts (WORKSPACE_TOOLS prefix, the
 * StagehandBrowser's `stagehand_` prefix, the rag tool family, and our
 * subagent naming convention of `*-agent` or `*Agent`).
 */
export type ToolKind =
  | 'workspace-list'
  | 'workspace-read'
  | 'workspace-write'
  | 'workspace-edit'
  | 'workspace-delete'
  | 'workspace-grep'
  | 'workspace-mkdir'
  | 'sandbox-exec'
  | 'sandbox-kill'
  | 'stagehand-navigate'
  | 'stagehand-observe'
  | 'stagehand-act'
  | 'stagehand-extract'
  | 'stagehand-close'
  | 'stagehand-other'
  | 'rag-search'
  | 'rag-ingest'
  | 'rag-collection'
  | 'todo'
  | 'subagent'
  | 'workflow'
  | 'mcp'
  | 'integration-composio'
  | 'integration-arcade'
  | 'search-web'
  | 'generic';

export function classifyTool(
  toolName: string,
  knownWorkflows: string[] = [],
  knownSubagents: string[] = [],
): ToolKind {
  const t = toolName;
  // Native workspace tools (registered when an Agent has `workspace:` config).
  if (t === 'mastra_workspace_list_files') return 'workspace-list';
  if (t === 'mastra_workspace_read_file') return 'workspace-read';
  if (t === 'mastra_workspace_write_file') return 'workspace-write';
  if (t === 'mastra_workspace_edit_file' || t === 'mastra_workspace_ast_edit')
    return 'workspace-edit';
  if (t === 'mastra_workspace_delete') return 'workspace-delete';
  if (t === 'mastra_workspace_grep') return 'workspace-grep';
  if (t === 'mastra_workspace_mkdir') return 'workspace-mkdir';
  if (t === 'mastra_workspace_execute_command') return 'sandbox-exec';
  if (t === 'mastra_workspace_kill_process') return 'sandbox-kill';
  if (t === 'mastra_workspace_get_process_output') return 'sandbox-exec';
  // MCP filesystem (fs_*) — this agent's workspace is exposed through an
  // external MCP server, so these functionally are workspace ops too.
  if (
    t === 'fs_list_directory' ||
    t === 'fs_list_directory_with_sizes' ||
    t === 'fs_directory_tree'
  )
    return 'workspace-list';
  if (
    t === 'fs_read_file' ||
    t === 'fs_read_text_file' ||
    t === 'fs_read_media_file' ||
    t === 'fs_read_multiple_files' ||
    t === 'fs_get_file_info'
  )
    return 'workspace-read';
  if (t === 'fs_write_file') return 'workspace-write';
  if (t === 'fs_edit_file') return 'workspace-edit';
  if (t === 'fs_create_directory') return 'workspace-mkdir';
  if (t === 'fs_search_files') return 'workspace-grep';
  if (t === 'fs_move_file') return 'workspace-edit';
  if (t === 'fs_list_allowed_directories') return 'workspace-list';

  if (t === 'stagehand_navigate') return 'stagehand-navigate';
  if (t === 'stagehand_observe') return 'stagehand-observe';
  if (t === 'stagehand_act') return 'stagehand-act';
  if (t === 'stagehand_extract') return 'stagehand-extract';
  if (t === 'stagehand_close') return 'stagehand-close';
  if (t.startsWith('stagehand_')) return 'stagehand-other';

  if (t === 'kb-search' || t === 'rag-search' || t === 'ragSearchTool')
    return 'rag-search';
  if (
    t.startsWith('kb-ingest') ||
    t.startsWith('kb-batch') ||
    t === 'ingestDocumentTool' ||
    t === 'ingestTextTool' ||
    t === 'batchIngestTool'
  )
    return 'rag-ingest';
  if (
    (t.startsWith('kb-') && !t.startsWith('kb-search')) ||
    t === 'createCollectionTool' ||
    t === 'listCollectionsTool' ||
    t === 'describeCollectionTool' ||
    t === 'deleteCollectionDocumentTool'
  )
    return 'rag-collection';

  if (t.startsWith('todo-') || t === 'todoAdd' || t === 'todoList' || t === 'todoComplete')
    return 'todo';

  if (
    t === 'tavily-search' ||
    t === 'tavilySearch' ||
    t === 'exa-search' ||
    t === 'exaSearch' ||
    t === 'deep-research' ||
    t === 'deepResearchTool'
  )
    return 'search-web';

  if (knownWorkflows.includes(t)) return 'workflow';
  if (knownSubagents.includes(t)) return 'subagent';
  if (/-agent$/i.test(t) || /Agent$/.test(t)) return 'subagent';

  if (t.startsWith('composio_') || t.startsWith('COMPOSIO_'))
    return 'integration-composio';
  if (t.startsWith('arcade_') || t.startsWith('ARCADE_'))
    return 'integration-arcade';
  if (t.startsWith('fs_') || t.startsWith('mcp_')) return 'mcp';

  return 'generic';
}

export function primitiveForToolKind(kind: ToolKind): PrimitiveId {
  switch (kind) {
    case 'workspace-list':
    case 'workspace-read':
    case 'workspace-write':
    case 'workspace-edit':
    case 'workspace-delete':
    case 'workspace-grep':
    case 'workspace-mkdir':
      return 'workspace';
    case 'sandbox-exec':
    case 'sandbox-kill':
      return 'sandbox';
    case 'stagehand-navigate':
    case 'stagehand-observe':
    case 'stagehand-act':
    case 'stagehand-extract':
    case 'stagehand-close':
    case 'stagehand-other':
      return 'browser';
    case 'rag-search':
    case 'rag-ingest':
    case 'rag-collection':
      return 'rag';
    case 'subagent':
      return 'agent-as-tool';
    case 'workflow':
      return 'workflow';
    case 'mcp':
      return 'mcp';
    case 'integration-composio':
    case 'integration-arcade':
    case 'todo':
    case 'search-web':
    case 'generic':
    default:
      return 'tool';
  }
}

/** Human-readable source label for the tool catalog drawer. */
export function toolProvenance(toolName: string): {
  source: string;
  color: string;
} {
  if (toolName.startsWith('mastra_workspace_'))
    return { source: 'Workspace', color: 'slate' };
  if (toolName.startsWith('stagehand_')) return { source: 'Browser', color: 'lime' };
  if (
    toolName.startsWith('kb-') ||
    toolName === 'ragSearchTool' ||
    toolName === 'ingestDocumentTool' ||
    toolName === 'ingestTextTool' ||
    toolName === 'batchIngestTool' ||
    toolName === 'createCollectionTool' ||
    toolName === 'listCollectionsTool' ||
    toolName === 'describeCollectionTool' ||
    toolName === 'deleteCollectionDocumentTool'
  )
    return { source: 'RAG', color: 'pink' };
  if (toolName.startsWith('todo-') || toolName.startsWith('todo') && /^todo[A-Z]/.test(toolName))
    return { source: 'Workspace', color: 'slate' };
  if (
    toolName === 'tavily-search' ||
    toolName === 'tavilySearch' ||
    toolName === 'exa-search' ||
    toolName === 'exaSearch'
  )
    return { source: 'Search API', color: 'emerald' };
  if (toolName === 'deep-research' || toolName === 'deepResearchTool')
    return { source: 'Research', color: 'emerald' };
  if (toolName === 'qualify-lead' || toolName === 'qualifyLead')
    return { source: 'BD', color: 'indigo' };
  if (toolName.startsWith('composio_') || toolName.startsWith('COMPOSIO_'))
    return { source: 'Composio', color: 'violet' };
  if (toolName.startsWith('arcade_') || toolName.startsWith('ARCADE_'))
    return { source: 'Arcade', color: 'violet' };
  if (toolName.startsWith('fs_')) return { source: 'Workspace', color: 'slate' };
  if (/-agent$/i.test(toolName) || /Agent$/.test(toolName))
    return { source: 'Subagent', color: 'violet' };
  if (toolName === 'read_docs' || toolName === 'readDocsTool')
    return { source: 'MCP', color: 'fuchsia' };
  return { source: 'Tool', color: 'emerald' };
}
