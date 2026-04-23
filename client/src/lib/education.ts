/**
 * Educational copy for every Mastra primitive surfaced in this UI.
 * Each entry explains what the primitive is, how this sandbox wires it up,
 * and the HTTP endpoint the client uses to talk to it.
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
  | 'observability';

export type EducationEntry = {
  id: PrimitiveId;
  title: string;
  tagline: string;
  why: string;
  howHere: string[];
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
    docs: 'https://mastra.ai/docs/agents/workspace',
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
