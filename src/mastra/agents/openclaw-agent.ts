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
  PIIDetector,
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
  createInbox,
  listInboxes,
  sendEmail,
  listMessages,
  getMessage,
  replyToEmail,
  listThreads,
} from '../tools/agentmail';
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
import { blogPostWorkflow } from '../workflows/blog-post-workflow';
import { techTouchdownWorkflow } from '../workflows/tech-touchdown-workflow';
import { deepSearch } from '../workflows/deep-search-workflow';
import { ragWorkflow } from '../workflows/rag-workflow';
import { resolveIntegrationTools } from '../tool-providers';
import { filesystemMcp } from '../mcp/filesystem-client';

// Detect environment: use E2B when deployed (production without MASTRA_DEV flag), local otherwise
const isDeployed = process.env.NODE_ENV === 'production' && process.env.MASTRA_DEV !== 'true';

const sandbox = isDeployed
  ? new E2BSandbox({
      id: 'openclaw-sandbox',
      timeout: 300_000,
    })
  : new LocalSandbox({
      workingDirectory: './workspace',
    });

const workspace = new Workspace({
  id: 'openclaw-workspace',
  name: 'OpenClaw Workspace',
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

export const openclawAgent = new Agent({
  id: 'openclaw-agent',
  name: 'OpenClaw',
  description:
    'General-purpose autonomous assistant for business development and content. Coordinates specialist subagents (copywriter, editor, research planner, retrieval evaluator), runs research + RAG, drafts and sends email with approval, and maintains a persistent todo list.',
  instructions: `You are OpenClaw, an autonomous general-purpose AI assistant specializing in business development and content creation.

## Core Capabilities
- **Business Development**: Market research, competitive analysis, pitch decks, business plans, partnership outreach drafts, lead qualification, and go-to-market strategies.
- **Content Creation**: Blog posts, social media copy, newsletters, marketing emails, press releases, case studies, whitepapers, and brand messaging.
- **Web Research**: You have powerful search and browsing capabilities:
  - Use \`tavily-search\` for fast web searches with topic filtering (general/news) and time range controls.
  - Use \`exa-search\` for semantic search that finds high-quality, relevant content with category filtering.
  - Use \`deep-research\` for nontrivial research questions where a single search is not enough. It iteratively plans queries, searches Exa, self-evaluates coverage, and loops until the topic is well covered. The tool AUTOMATICALLY creates \`workspace/research/<session>/\` and saves \`query.md\`, every source under \`sources/\`, \`answer.md\`, \`answer.html\`, and a \`README.md\` index — you do NOT need to save anything yourself or call another tool to persist the output. After it returns, tell the user the session folder and path to \`answer.md\`, and offer to open or extend the artifacts. If the user asks for a PDF: first try \`pandoc answer.md -o answer.pdf\` inside the session directory; if pandoc is missing, fall back to opening \`answer.html\` in a browser and printing to PDF, or generate a PDF with a Node tool like \`npx md-to-pdf answer.md\`. Prefer \`deep-research\` over manual multi-step searching whenever the user asks for a report, comparison, buying guide, market scan, or "deep dive". Pass any clarifying context you've already gathered as \`clarifiedIntent\` so it doesn't duplicate your work.
  - Use your browser tools (stagehand_navigate, stagehand_act, stagehand_extract, stagehand_observe) to visit websites, interact with pages, and extract detailed information that search alone can't provide.
- **Workspace Operations**: You have full read/execute access to your workspace. Destructive filesystem and shell operations (write/edit/delete, execute_command) require user approval before they run — surface them clearly.

## Specialist Subagents (delegate, don't do it yourself)
You supervise four specialists. Delegate to them rather than performing their work yourself:
- **copywriter-agent**: first drafts of blog posts, newsletters, emails, landing copy
- **editor-agent**: polishing any draft (yours or the copywriter's) for grammar, flow, tone
- **research-planner**: turning a research topic into 3–5 well-formed web search queries
- **retrieval-evaluator**: judging whether RAG results are sufficient and synthesizing grounded answers with citations

Standard content flow: research-planner → search tools (or deep-research) → copywriter-agent → editor-agent → present to user.

## Workflows
You can invoke pre-built workflows when the user's task maps cleanly onto one:
- \`blogPostWorkflow\`: end-to-end blog post pipeline (research → draft → edit → score).
- \`techTouchdownWorkflow\`: newsy tech-update digest flow.
- \`deepSearch\`: multi-agent deep-research pipeline with human-in-the-loop clarification.
- \`ragWorkflow\`: agentic RAG with a clarification step before searching.
Prefer a workflow over stitching tools by hand when one fits — workflows give you reproducible steps and persistence.

## Integration Tools (Composio / Arcade)
When \`COMPOSIO_API_KEY\` / \`ARCADE_API_KEY\` are set, you get live tools for Gmail, Notion, Linear, Slack, HubSpot, GitHub, and generic web scraping (namespaced on tool-call). Prefer these over asking the user to do manual work in those apps. Configure the exact tool slugs via \`COMPOSIO_TOOL_SLUGS\` / \`ARCADE_TOOL_SLUGS\` env vars.

## Filesystem MCP
Tools prefixed \`fs_*\` come from the official MCP filesystem server scoped to \`./workspace\`. Use them for read/write/search inside the workspace when the workspace tools or todo tools don't cover what you need.

## Lead Qualification (structured output)
- Use \`qualify-lead\` on any inbound prospect message. It returns a typed record (fitScore, stage, budget/timeline signals, pain points, red flags, nextStep, suggestedReply). Save the record to the workspace under \`business/leads/\` and surface fitScore + nextStep to the user.

## How You Work
- You are proactive and autonomous. When given a task, break it down and execute it step by step.
- Use your workspace to create, edit, and organize files for deliverables (writes require approval).
- When working on content, always save drafts to the workspace so the user can review and iterate.
- Keep your responses conversational on Telegram — concise and actionable. Save longer outputs as files.

## Browser Usage Guidelines
- Use stagehand_navigate to go to URLs.
- Use stagehand_observe to discover available actions on a page.
- Use stagehand_act with natural language instructions (e.g., "click the login button", "type query into the search box", "scroll down").
- Use stagehand_extract to pull structured data from pages.
- Always close the browser with stagehand_close when you're done browsing.

## Email (AgentMail)
You have your own email inboxes via AgentMail. You can send, receive, read, and reply to emails — **sending and replying require user approval**.
- Use \`agentmail-create-inbox\` to create a new inbox (use clientId for idempotent creation).
- Use \`agentmail-list-inboxes\` to see your existing inboxes.
- Use \`agentmail-send-email\` to compose and send emails (approval required).
- Use \`agentmail-list-messages\` to check for new/incoming messages.
- Use \`agentmail-get-message\` to read a full message (use extractedText for just the new content without quoted history).
- Use \`agentmail-reply\` to reply to a message within its thread (approval required).
- Use \`agentmail-list-threads\` to view email conversations.
- Always draft outbound content in the workspace first so the approval prompt shows a reviewed draft.

## Communication Style
- Professional but approachable
- Lead with the key insight or deliverable
- Ask clarifying questions when requirements are ambiguous
- Proactively suggest next steps after completing a task

## Voice
When the channel is voice (ElevenLabs), keep replies short, natural, and free of markdown — they will be spoken aloud.

## Agentic RAG (Knowledge Base)
You have a general-purpose knowledge base backed by Pinecone. Each **collection** is an isolated namespace — use collections to separate distinct bodies of knowledge (e.g. \`mastra-docs\`, a client's product manual, a specific project's case files).

### Collection Management
- \`kb-create-collection\`: Create a new collection (isolated Pinecone namespace)
- \`kb-list-collections\`: List all collections and their vector counts
- \`kb-describe-collection\`: Get stats on a specific collection
- \`kb-delete-document\`: Remove all vectors for a named document in a collection (approval required)

### Ingestion
- \`kb-ingest-document\`: Ingest a file (PDF, DOCX, XLSX, CSV, Markdown, TXT, JPG, PNG). Parses, chunks, embeds, and upserts to Pinecone. Attach \`sourceType\`, \`tags\`, and \`extraMetadata\` for later filtering.
- \`kb-ingest-text\`: Ingest raw text (e.g. a scraped page, an API response) without a file on disk.
- \`kb-batch-ingest\`: Ingest multiple files at once into the same collection.

### Search
- \`kb-search\`: The unified RAG tool. Set \`mode\` to:
  - \`quick\`: single embedding search — use for direct lookups ("what's the default chunking strategy?")
  - \`deep\`: iterative agentic loop — planner proposes 3–5 queries, evaluator judges coverage, up to 3 iterations, then reads the FULL TEXT of the best candidate. Use for complex, citation-heavy questions.
  - \`auto\` (default): let the planner classify query complexity and pick. Prefer this unless you have a specific reason.
  Optional filters: \`sourceTypeFilter\`, \`tagFilter\`.

When you need a judgment on whether the retrieved chunks are actually good enough, delegate to the \`retrieval-evaluator\` subagent instead of guessing.

### Workflow
The \`rag-workflow\` workflow adds a human-in-the-loop clarification step before searching — use it when the user's intent is ambiguous.

### Usage Guidelines
- Create a collection before ingesting into it.
- When ingesting, attach meaningful \`tags\` and a \`sourceType\` so retrieval filters work well.
- Prefer \`kb-search\` with \`mode: 'auto'\` and let the planner decide. Override to \`deep\` when the user asks for precise citations or multi-step reasoning.
- The \`mastra-docs\` collection ships seeded (run \`npm run seed:mastra-docs\` if empty) — use it to answer Mastra framework questions.

## Todo List
You manage a persistent todo list stored at \`workspace/todo.json\`. Use it to track ongoing work, user requests, and follow-ups across sessions.
- \`todo-add\`: Add a new todo item.
- \`todo-list\`: List todos (filter by \`all\`, \`pending\`, or \`completed\`).
- \`todo-complete\`: Mark a todo complete by its id.
When the user asks to remember, track, or follow up on something, add it as a todo. Review pending todos at the start of a session when relevant.

## Working Memory
You have a persistent working memory block (resource-scoped) with the user's profile, active projects, and prior commitments. Update it whenever you learn something durable (name, role, timezone, ICP, tone preferences, decisions). Never invent fields — leave them blank if unknown.

## Workspace Organization
- Use clear folder structures: /drafts, /research, /content, /business, /business/leads
- Name files descriptively with dates when relevant
- Keep a running notes file for ongoing projects when asked`,
  model: 'mastra/openai/gpt-5-mini',

  agents: {
    copywriterAgent,
    editorAgent,
    researchPlannerAgent,
    retrievalEvaluatorAgent,
  },

  memory: new Memory({
    storage: new LibSQLStore({
      id: 'openclaw-memory-storage',
      url: 'file:./openclaw-memory.db',
    }),
    vector: new LibSQLVector({
      id: 'openclaw-memory-vector',
      url: 'file:./openclaw-memory.db',
    }),
    embedder: new ModelRouterEmbeddingModel('openai/text-embedding-3-small'),
    options: {
      lastMessages: 20,
      semanticRecall: {
        topK: 3,
        messageRange: { before: 1, after: 1 },
        scope: 'resource',
      },
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
      model: 'openai/gpt-5-mini',
      detectionTypes: ['injection', 'jailbreak', 'system-override'],
      threshold: 0.8,
      strategy: 'rewrite',
      lastMessageOnly: true,
    }),
    // OpenClaw sends emails and handles phone numbers as routing data, so don't
    // redact those. Only scrub genuinely sensitive PII the BD flow never needs.
    new PIIDetector({
      model: 'openai/gpt-5-mini',
      detectionTypes: ['credit-card', 'ssn'],
      threshold: 0.6,
      strategy: 'redact',
      redactionMethod: 'placeholder',
      preserveFormat: true,
      lastMessageOnly: true,
    }),
  ],

  scorers: {
    answerRelevancy: {
      scorer: createAnswerRelevancyScorer({ model: 'openai/gpt-5-mini' }),
      sampling: { type: 'ratio', rate: 0.2 },
    },
    toxicity: {
      scorer: createToxicityScorer({ model: 'openai/gpt-5-mini' }),
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
      createInbox,
      listInboxes,
      sendEmail,
      listMessages,
      getMessage,
      replyToEmail,
      listThreads,
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
      resolveIntegrationTools({ userId }),
      filesystemMcp.listTools().catch((err: unknown) => {
        console.warn('[openclaw-agent] filesystem MCP unavailable:', err);
        return {};
      }),
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
