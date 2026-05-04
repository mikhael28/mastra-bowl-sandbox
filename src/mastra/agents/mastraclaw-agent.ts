import { Agent } from '@mastra/core/agent';
import {
  Workspace,
  LocalFilesystem,
  LocalSandbox,
  WORKSPACE_TOOLS,
} from '@mastra/core/workspace';
import {
  UnicodeNormalizer,
  PromptInjectionDetector,
} from '@mastra/core/processors';
import { ModelRouterEmbeddingModel } from '@mastra/core/llm';
import { E2BSandbox } from '@mastra/e2b';
import { createTelegramAdapter } from '@chat-adapter/telegram';
import { Memory } from '@mastra/memory';
import { LibSQLStore, LibSQLVector } from '@mastra/libsql';
import { StagehandBrowser } from '@mastra/stagehand';
import { ElevenLabsVoice } from '@mastra/voice-elevenlabs';
import {
  createAnswerRelevancyScorer,
  createToxicityScorer,
} from '@mastra/evals/scorers/prebuilt';
import { readDocsTool } from '../mcp/docs-server';
import { tavilySearch } from '../tools/tavily-search';
import { exaSearch } from '../tools/exa-search';
import { deepResearchTool } from '../tools/deep-research-tool';
import {
  ingestDocumentTool,
  ingestTextTool,
  batchIngestTool,
  createCollectionTool,
  listCollectionsTool,
  describeCollectionTool,
  deleteCollectionDocumentTool,
  ragSearchTool,
} from '../tools/rag';
import { todoAdd, todoList, todoComplete } from '../tools/todo-tools';
import { qualifyLead } from '../tools/qualify-lead-tool';
import { basedScorer } from '../scorers/based-scorer';
import { copywriterAgent } from './copywriter-agent';
import { editorAgent } from './editor-agent';
import { researchPlannerAgent } from './research-planner-agent';
import { retrievalEvaluatorAgent } from './retrieval-evaluator-agent';
import { emailAgent } from './email-agent';
import { blogPostWorkflow } from '../workflows/blog-post-workflow';
import { techTouchdownWorkflow } from '../workflows/tech-touchdown-workflow';
import { deepSearch } from '../workflows/deep-search-workflow';
import { ragWorkflow } from '../workflows/rag-workflow';
import { resolveIntegrationTools } from '../tool-providers';
import { filesystemMcp } from '../mcp/filesystem-client';
import { createSlackAdapter } from '@chat-adapter/slack';

// Detect environment: use E2B when deployed (production without MASTRA_DEV flag), local otherwise
const isDeployed = process.env.NODE_ENV === 'production' && process.env.MASTRA_DEV !== 'true';

// ---------------------------------------------------------------------------
// Model selection — detect LM Studio at startup and prefer a local model when
// it's running. Override with MASTRA_PREFERRED_MODEL ("openai/gpt-4o",
// "lmstudio/qwen3-4b-instruct-2507", etc.). LM Studio exposes an
// OpenAI-compatible server at http://127.0.0.1:1234/v1 by default.
// ---------------------------------------------------------------------------

const CLOUD_DEFAULT_MODEL = 'mastra/openai/gpt-5.3-codex';
const LMSTUDIO_BASE_URL = process.env.LMSTUDIO_URL ?? 'http://127.0.0.1:1234';

type LmStudioStatus = { running: boolean; models: string[] };

async function probeLmStudio(timeoutMs = 600): Promise<LmStudioStatus> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await fetch(`${LMSTUDIO_BASE_URL}/v1/models`, {
      signal: ctl.signal,
    });
    if (!res.ok) return { running: false, models: [] };
    const json = (await res.json()) as { data?: Array<{ id: string }> };
    return { running: true, models: (json.data ?? []).map((m) => m.id) };
  } catch {
    return { running: false, models: [] };
  } finally {
    clearTimeout(timer);
  }
}

// Prefer Qwen3 → Qwen2.5 → anything that looks tool-capable. The user can
// override entirely via MASTRA_PREFERRED_MODEL.
function pickBestLocalModel(models: string[]): string | null {
  if (models.length === 0) return null;
  const ranked = [...models].sort((a, b) => score(b) - score(a));
  return ranked[0];
  function score(id: string): number {
    const lower = id.toLowerCase();
    if (lower.includes('qwen3')) return 10;
    if (lower.includes('qwen2.5')) return 8;
    if (lower.includes('hermes')) return 6;
    if (lower.includes('llama-3')) return 5;
    return 1;
  }
}

const userOverrideModel = process.env.MASTRA_PREFERRED_MODEL?.trim() || null;
const lmStudioStatus: LmStudioStatus = await probeLmStudio();
const localPick = pickBestLocalModel(lmStudioStatus.models);

let selectedModel: any = CLOUD_DEFAULT_MODEL;
let selectedModelSource: 'override' | 'local' | 'cloud-default' = 'cloud-default';

if (userOverrideModel) {
  if (userOverrideModel.startsWith('lmstudio/')) {
    selectedModel = {
      id: userOverrideModel,
      url: `${LMSTUDIO_BASE_URL}/v1`,
      apiKey: process.env.LMSTUDIO_API_KEY ?? 'lm-studio',
    };
  } else {
    selectedModel = userOverrideModel;
  }
  selectedModelSource = 'override';
} else if (lmStudioStatus.running && localPick) {
  selectedModel = {
    id: `lmstudio/${localPick}`,
    url: `${LMSTUDIO_BASE_URL}/v1`,
    apiKey: process.env.LMSTUDIO_API_KEY ?? 'lm-studio',
  };
  selectedModelSource = 'local';
}

// Surfaced via /api/local-model-status so the client model picker can show the
// current selection without re-probing. Re-export for reading-only use.
export const modelSelectionInfo = {
  selected:
    typeof selectedModel === 'string' ? selectedModel : selectedModel.id,
  source: selectedModelSource,
  cloudDefault: CLOUD_DEFAULT_MODEL,
  lmStudio: {
    baseUrl: LMSTUDIO_BASE_URL,
    running: lmStudioStatus.running,
    models: lmStudioStatus.models,
    suggested: localPick,
  },
  override: userOverrideModel,
};

console.info(
  `[mastraclaw-agent] model = ${modelSelectionInfo.selected} (${selectedModelSource}); LM Studio ${lmStudioStatus.running ? 'detected' : 'not detected'} at ${LMSTUDIO_BASE_URL}`,
);

// Memoize tool-provider and MCP lookups: schemas are stable for the process
// lifetime, and doing them on every agent turn adds a network round-trip to
// first-token latency. Keyed on userId because Composio/Arcade scope tools per user.
type ToolMap = Record<string, unknown>;
const integrationToolsCache = new Map<string, Promise<ToolMap>>();
let mcpToolsPromise: Promise<ToolMap> | null = null;

const getIntegrationTools = (userId: string | undefined): Promise<ToolMap> => {
  const key = userId ?? '__anon__';
  let cached = integrationToolsCache.get(key);
  if (!cached) {
    cached = resolveIntegrationTools({ userId }).catch((err) => {
      integrationToolsCache.delete(key); // don't cache failures
      throw err;
    }) as Promise<ToolMap>;
    integrationToolsCache.set(key, cached);
  }
  return cached;
};

const getMcpTools = (): Promise<ToolMap> => {
  if (!mcpToolsPromise) {
    mcpToolsPromise = filesystemMcp.listTools().catch((err: unknown) => {
      console.warn('[mastraclaw-agent] filesystem MCP unavailable:', err);
      mcpToolsPromise = null; // retry on next call
      return {};
    }) as Promise<ToolMap>;
  }
  return mcpToolsPromise;
};

const sandbox = isDeployed
  ? new E2BSandbox({
      id: 'mastraclaw-sandbox',
      timeout: 300_000,
    })
  : new LocalSandbox({
      workingDirectory: './workspace',
    });

const workspace = new Workspace({
  id: 'mastraclaw-workspace',
  name: 'MastraClaw Workspace',
  filesystem: new LocalFilesystem({
    basePath: './workspace',
  }),
  sandbox,
  tools: {
    enabled: true,
    requireApproval: false,
    // Gate destructive filesystem + shell operations behind explicit approval.
    [WORKSPACE_TOOLS.FILESYSTEM.WRITE_FILE]: { requireApproval: true, requireReadBeforeWrite: true },
    [WORKSPACE_TOOLS.FILESYSTEM.EDIT_FILE]: { requireApproval: true, requireReadBeforeWrite: true },
    [WORKSPACE_TOOLS.FILESYSTEM.DELETE]: { requireApproval: true },
    [WORKSPACE_TOOLS.FILESYSTEM.AST_EDIT]: { requireApproval: true, requireReadBeforeWrite: true },
    [WORKSPACE_TOOLS.SANDBOX.EXECUTE_COMMAND]: { requireApproval: true },
    [WORKSPACE_TOOLS.SANDBOX.KILL_PROCESS]: { requireApproval: true },
  },
  bm25: true,
  autoIndexPaths: ['.'],
  skills: ['.agents/skills'],
  lsp: true,
});

// BrowserBase: use cloud when credentials are available, otherwise local
const useBrowserbase = !!(process.env.BROWSERBASE_API_KEY && process.env.BROWSERBASE_PROJECT_ID);

const browser = new StagehandBrowser({
  env: useBrowserbase ? 'BROWSERBASE' : 'LOCAL',
  apiKey: process.env.BROWSERBASE_API_KEY,
  projectId: process.env.BROWSERBASE_PROJECT_ID,
  model: 'openai/gpt-4o',
  headless: useBrowserbase ? false : true,
  verbose: 0,
});

// Exported so the browser-mirror server route can attach a CDP screencast to
// the same instance the agent is driving.
export const mastraclawBrowser = browser;

const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
const voice = elevenLabsApiKey
  ? new ElevenLabsVoice({
      speechModel: {
        name: 'eleven_multilingual_v2',
        apiKey: elevenLabsApiKey,
      },
      listeningModel: {
        name: 'scribe_v1',
        apiKey: elevenLabsApiKey,
      },
      speaker: 'JBFqnCBsd6RMkjVDRZzb',
    })
  : undefined;

const workingMemoryTemplate = `# User Profile
- **Name**:
- **Role / Company**:
- **Timezone**:
- **Preferred tone** (e.g. concise / warm / technical):
- **Active projects**:
- **Known ICP / target audience**:
- **Active inboxes (AgentMail)**:
- **Notable decisions or commitments made in prior sessions**:
`;

export const mastraclawAgent = new Agent({
  id: 'mastraclaw-agent',
  name: 'MastraClaw',
  description:
    'General-purpose autonomous assistant for business development and content. Coordinates specialist subagents (copywriter, editor, research planner, retrieval evaluator), runs research + RAG, drafts and sends email with approval, and maintains a persistent todo list.',
  instructions: `You are MastraClaw, an autonomous assistant for business development and content.

## Scope
- **BD**: market/competitive research, pitch decks, business plans, outreach drafts, lead qualification, GTM.
- **Content**: blog posts, social copy, newsletters, marketing emails, press releases, case studies, whitepapers.

## Delegate to specialists — don't do their work yourself
- **copywriter-agent**: first drafts of prose (blog, newsletter, email, landing copy).
- **editor-agent**: polish any draft for grammar/flow/tone.
- **research-planner**: turn a topic into 3–5 well-formed search queries.
- **retrieval-evaluator**: judge RAG chunk quality and synthesize grounded answers with citations.
- **email-agent**: all AgentMail operations — create/list inboxes, list threads, read messages, send, reply. Sending/replying requires user approval. Draft prose yourself (or via copywriter-agent) and hand the finished body to email-agent.

Standard content flow: research-planner → search (or deep-research) → copywriter-agent → editor-agent → present.

## Search & browse
- \`tavily-search\`: fast web search (general/news, time-range filters).
- \`exa-search\`: semantic search with category filtering.
- \`deep-research\`: iterative planner→search→evaluate loop for reports, comparisons, buying guides, market scans, "deep dives". It AUTO-creates \`workspace/research/<session>/\` with \`query.md\`, \`sources/\`, \`answer.md\`, \`answer.html\`, \`README.md\` — do NOT save it yourself. Tell the user the session path and offer to open/extend. For PDF: try \`pandoc answer.md -o answer.pdf\`; fall back to \`npx md-to-pdf answer.md\` or printing \`answer.html\`. Pass any clarifications you gathered as \`clarifiedIntent\`.
- Browser (Stagehand): \`stagehand_navigate\` → URL, \`stagehand_observe\` → discover actions, \`stagehand_act\` → natural-language interactions, \`stagehand_extract\` → structured data. Always \`stagehand_close\` when done.

## Workflows — prefer when they fit
- \`blogPostWorkflow\`: research → draft → edit → score.
- \`techTouchdownWorkflow\`: tech-update digest.
- \`deepSearch\`: multi-agent deep research with human-in-the-loop clarification.
- \`ragWorkflow\`: agentic RAG with a clarification step before searching.

## Knowledge base (Pinecone-backed RAG)
Each **collection** is an isolated namespace (e.g. \`mastra-docs\`, a client manual).
- Manage: \`kb-create-collection\`, \`kb-list-collections\`, \`kb-describe-collection\`, \`kb-delete-document\` (approval).
- Ingest: \`kb-ingest-document\` (PDF/DOCX/XLSX/CSV/MD/TXT/JPG/PNG), \`kb-ingest-text\`, \`kb-batch-ingest\`. Always attach meaningful \`tags\` and \`sourceType\` so filters work.
- Search: \`kb-search\` with \`mode: 'auto'\` (default — planner picks complexity). Override to \`'quick'\` for direct lookups or \`'deep'\` for citation-heavy/multi-step questions. Optional \`sourceTypeFilter\`, \`tagFilter\`.
- Create a collection before ingesting. Delegate chunk-quality judgment to \`retrieval-evaluator\`.
- \`mastra-docs\` ships seeded (run \`npm run seed:mastra-docs\` if empty) for Mastra framework questions.

## Workspace
Full read/execute access. Writes/edits/deletes and shell commands require approval — surface them clearly. Save drafts and deliverables to the workspace so users can review and iterate. Folder layout: \`/drafts\`, \`/research\`, \`/content\`, \`/business\`, \`/business/leads\`. Name files descriptively with dates when relevant. \`fs_*\` tools (MCP filesystem) complement the built-in workspace tools for read/write/search inside \`./workspace\`.

LSP is enabled — use \`lsp_inspect\` for type info, diagnostics, and symbol lookups on TypeScript/JavaScript/Python/Go/Rust files in the workspace before editing code, so changes are grounded in the language server's view of the project.

## Lead qualification
Use \`qualify-lead\` on any inbound prospect message. It returns fitScore, stage, budget/timeline signals, pain points, red flags, nextStep, suggestedReply. Save to \`business/leads/\` and surface fitScore + nextStep.

## Todo list (\`workspace/todo.json\`)
Track work across sessions: \`todo-add\`, \`todo-list\` (filter all/pending/completed), \`todo-complete\`. Add a todo when the user asks to remember/track/follow up. Review pending todos when relevant at session start.

## Integrations (Composio / Arcade)
When \`COMPOSIO_API_KEY\` / \`ARCADE_API_KEY\` are set, live tools for Gmail, Notion, Linear, Slack, HubSpot, GitHub, and web scraping are available (namespaced). Prefer these over asking the user to do manual work. Configure slugs via \`COMPOSIO_TOOL_SLUGS\` / \`ARCADE_TOOL_SLUGS\`.

## Working memory
Persistent, resource-scoped profile block. Update whenever you learn something durable (name, role, timezone, ICP, tone, decisions). Never invent fields — leave blank if unknown.

**Timing (overrides the default memory instructions):** Do NOT call \`updateWorkingMemory\` before or during your user-facing answer. First stream the entire reply to the user. Only after your final sentence, as the last action of the turn, call \`updateWorkingMemory\` if the turn produced something worth persisting. Treat the tool call as a silent post-script the user doesn't see — it must not delay first-token or mid-stream output. If nothing durable changed, skip the tool entirely.

## How you work
- Proactive and autonomous: break tasks down and execute.
- Professional but approachable. Lead with the key insight or deliverable. Ask clarifying questions when ambiguous. Suggest next steps after finishing.
- Telegram: keep replies concise and actionable; save long outputs as files.
- Voice (ElevenLabs): short, natural, no markdown — it's spoken aloud.

## Acknowledge before you act
Before any tool call, subagent delegation, or long-running step, stream ONE short sentence that confirms the request and names what you're about to do. Keep it tight (under ~15 words), in plain prose, no markdown headers, and no fluff. This is the first thing the user sees — it exists so they know the request registered and isn't hung. Examples: "Got it — researching top Zapier alternatives now.", "On it, drafting that intro and looping in the editor.", "Pulling your inboxes from AgentMail." Then proceed with the work. Don't re-acknowledge between tool calls; one lead-in per turn is enough.`,
  model: selectedModel,

  agents: {
    copywriterAgent,
    editorAgent,
    researchPlannerAgent,
    retrievalEvaluatorAgent,
    emailAgent,
  },

  memory: new Memory({
    storage: new LibSQLStore({
      id: 'mastraclaw-memory-storage',
      url: 'file:./mastraclaw-memory.db',
    }),
    vector: new LibSQLVector({
      id: 'mastraclaw-memory-vector',
      url: 'file:./mastraclaw-memory.db',
    }),
    embedder: new ModelRouterEmbeddingModel('openai/text-embedding-3-small'),
    options: {
      lastMessages: 20,
      workingMemory: {
        enabled: true,
        scope: 'resource',
        template: workingMemoryTemplate,
      },
      observationalMemory: true,
      generateTitle: true,
    },
  }),

  inputProcessors: [
    new UnicodeNormalizer({
      stripControlChars: true,
      preserveEmojis: true,
      collapseWhitespace: true,
      trim: true,
    }),
    new PromptInjectionDetector({
      model: 'openai/gpt-5.3-codex',
      detectionTypes: ['injection', 'jailbreak', 'system-override'],
      threshold: 0.8,
      strategy: 'rewrite',
      lastMessageOnly: true,
    }),
  ],

  scorers: {
    answerRelevancy: {
      scorer: createAnswerRelevancyScorer({ model: 'openai/gpt-5.3-codex' }),
      sampling: { type: 'ratio', rate: 0.2 },
    },
    toxicity: {
      scorer: createToxicityScorer({ model: 'openai/gpt-5.3-codex' }),
      sampling: { type: 'ratio', rate: 0.2 },
    },
    based: {
      scorer: basedScorer,
      sampling: { type: 'ratio', rate: 0.1 },
    },
  },

  channels: {
    adapters: {
      ...(isDeployed ? { telegram: createTelegramAdapter() } : {}),
      slack: createSlackAdapter() 
    },
  },

  workflows: {
    blogPostWorkflow,
    techTouchdownWorkflow,
    deepSearch,
    ragWorkflow,
  },

  tools: async ({ requestContext }) => {
    const staticTools = {
      readDocsTool,
      tavilySearch,
      exaSearch,
      deepResearchTool,
      qualifyLead,
      // Agentic RAG (knowledge base)
      ingestDocumentTool,
      ingestTextTool,
      batchIngestTool,
      createCollectionTool,
      listCollectionsTool,
      describeCollectionTool,
      deleteCollectionDocumentTool,
      ragSearchTool,
      // Workspace todo list
      todoAdd,
      todoList,
      todoComplete,
    };

    const userId =
      (requestContext?.get?.('userId') as string | undefined) ??
      process.env.COMPOSIO_USER_ID;

    const [integrationTools, mcpTools] = await Promise.all([
      getIntegrationTools(userId),
      getMcpTools(),
    ]);

    return {
      ...staticTools,
      ...integrationTools,
      ...mcpTools,
    };
  },

  ...(voice ? { voice } : {}),

  browser,

  workspace,
});
