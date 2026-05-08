# MastraClaw Sandbox

A reference playground for the [Mastra](https://mastra.ai) agent framework. The repo wires a single autonomous agent — `mastraclaw-agent` — to nearly every primitive Mastra ships: workspace + sandbox, browser automation, voice, memory, observational + working memory, RAG (Pinecone), MCP servers, prebuilt + custom scorers, input/output processors, dynamic tool resolution from Composio/Arcade, channel adapters (Telegram, Slack), and a custom Studio patch that injects an extra tab.

The repo is split in two:

- **`/`** — Mastra dev server (`mastra dev`) on `:4111`, serving Studio + the agent HTTP API.
- **`/client`** — a Vite + React + Tailwind UI that consumes Mastra's HTTP API directly.

---

## Prerequisites

- Node `>=22.13.0` (see `engines` in `package.json`)
- `npm` (the parent uses npm; the client supports both npm and pnpm)
- `OPENAI_API_KEY` at minimum — the cloud model default is `mastra/openai/gpt-5.3-codex`
- Optional: API keys per integration (see [Environment](#environment))

---

## Install & run the studio

```bash
git clone <repo>
cd mastra-bowl-sandbox
cp .env.example .env       # fill in OPENAI_API_KEY at minimum
npm install                # runs `postinstall` → patches Mastra Studio
npm run dev                # `mastra dev` on http://localhost:4111
```

What happens on `npm install`:

1. Dependencies resolve (`@mastra/core`, `@mastra/memory`, `@mastra/libsql`, `@mastra/stagehand`, `@mastra/e2b`, `@mastra/voice-elevenlabs`, `@mastra/evals`, `@mastra/rag`, `@mastra/pinecone`, `@mastra/observability`, `@mastra/editor`, `@mastra/mcp`, `@mastra/duckdb`, `@mastra/loggers`).
2. `postinstall` invokes `scripts/patch-studio.mjs`, which:
   - Copies `src/mastra/sandbox/{inject.js,page.html}` into `node_modules/mastra/dist/studio/assets/`
   - Injects a `<script>` tag (idempotently, behind a `<!-- MASTRA-SANDBOX-PATCHED -->` marker) into Studio's `index.html`, adding a custom **Sandbox** tab.
   - Reverse with `npm run unpatch-studio`.

What `npm run dev` does:

1. Re-applies the Studio patch (cheap idempotent run).
2. Starts `mastra dev`, which compiles `src/mastra/index.ts` and exposes:
   - **Studio UI** at `http://localhost:4111`
   - **Agent stream** at `POST /api/agents/:id/stream`
   - **Workflow stream** at `POST /api/workflows/:id/stream` and `/resume-async`
   - **Memory threads** at `GET /api/memory/threads` (+ `/messages`)
   - **MCP servers** at `GET /api/mcp/servers` (+ `/tools`)
   - **Custom routes** registered in `mastra.server.apiRoutes` (see [Custom HTTP routes](#custom-http-routes))

> **State files.** `mastra.db` (LibSQL — primary store), `mastraclaw-memory.db` (LibSQL — agent-scoped memory + vectors), and `mastra.duckdb` (DuckDB — observability domain) are created on first run.

### Seed the Mastra-docs knowledge base (optional)

```bash
npm run seed:mastra-docs
```

Pulls `https://mastra.ai/llms.txt` + the skills index, embeds with `text-embedding-3-small`, and writes them into the Pinecone collection `mastra-docs`. Requires `PINECONE_API_KEY`. After seeding, `kb-search` answers Mastra-framework questions against this collection.

---

## Install & run the React client

The client is an independent Vite app — no Mastra runtime, just an HTTP consumer.

```bash
# in another terminal, with the dev server already running
cd client
npm install
npm run dev                # vite on http://localhost:5174
```

The Vite config proxies `/api → http://localhost:4111`, so the client speaks to the Mastra server through the standard documented endpoints. See `client/README.md` for the per-tab endpoint mapping.

The client renders the chunked stream from `POST /api/agents/:id/stream`:

| Chunk           | Rendered as                                                |
| --------------- | ---------------------------------------------------------- |
| `text-delta`    | Token-by-token text                                        |
| `reasoning-delta` | Collapsible reasoning panel                              |
| `tool-call` / `tool-result` / `tool-error` | Inline tool bubble (args + result) |
| `tripwire`      | Banner — input/output processor blocked the turn           |
| `finish`        | Token usage + voice playback                               |

---

## Environment

Minimum runnable surface:

| Variable                          | Used by                                                |
| --------------------------------- | ------------------------------------------------------ |
| `OPENAI_API_KEY`                  | Default cloud model + embeddings                       |
| `MASTRA_PREFERRED_MODEL`          | Override (e.g. `lmstudio/qwen3-...`, see below)        |
| `LMSTUDIO_URL`                    | LM Studio base URL (default `http://127.0.0.1:1234`)   |
| `PINECONE_API_KEY`                | KB tools (`kb-*`) + `ragWorkflow`                      |
| `TAVILY_API_KEY` / `EXA_API_KEY`  | Search tools                                           |
| `AGENT_MAIL_API_KEY`              | AgentMail (email-agent)                                |
| `BROWSERBASE_API_KEY` + `BROWSERBASE_PROJECT_ID` | Cloud browser; falls back to local Stagehand |
| `E2B_API_KEY`                     | Production sandbox (when `NODE_ENV=production`)        |
| `ELEVENLABS_API_KEY`              | ElevenLabs voice (TTS + STT)                           |
| `COMPOSIO_API_KEY` / `ARCADE_API_KEY` | Live tool providers (Gmail, Slack, Notion, Linear…) |
| `TELEGRAM_BOT_TOKEN`              | Telegram channel adapter (production only)             |
| `SLACK_*`                         | Slack channel adapter (production only)                |
| `GITHUB_TOKEN`                    | Triage tools (`mastra-ai/mastra` issue/PR fetch)       |
| `MASTRA_CLOUD_ACCESS_TOKEN`       | Observability `CloudExporter`                          |

The agent boots even when most of these are missing — tools whose providers are unconfigured are silently dropped, not registered as broken.

### Local-first model selection

`mastraclaw-agent.ts` probes LM Studio at `http://127.0.0.1:1234/v1/models` on startup (600ms timeout). Resolution order:

1. `MASTRA_PREFERRED_MODEL` (explicit override — `lmstudio/<id>` triggers the local OpenAI-compatible endpoint, anything else is treated as a Mastra Model Router id).
2. **Local pick** — if LM Studio responds, the highest-ranked model is auto-selected (`qwen3` > `qwen2.5` > `hermes` > `llama-3` > anything).
3. **Cloud default** — `mastra/openai/gpt-5.3-codex`.

The decision is surfaced at `GET /api/local-model-status` so the client model picker doesn't have to re-probe.

---

## Mastra primitives wired into `mastraclaw-agent`

`src/mastra/agents/mastraclaw-agent.ts` is the showcase. Each block below maps to a Mastra API.

### `Agent` — `@mastra/core/agent`

The constructor accepts every primitive below as a field. Notable shape:

```ts
new Agent({
  id, name, description, instructions,
  model,                    // string id OR { id, url, apiKey } for OpenAI-compat
  agents: { ... },          // sub-agents available as delegation tools
  workflows: { ... },       // workflows the agent can invoke
  tools: async ({ requestContext }) => ({ ... }), // dynamic tool resolution per turn
  memory, scorers, inputProcessors,
  channels: { adapters: { telegram, slack } },
  browser, voice, workspace,
})
```

`tools` is a function — resolved per turn with the current `requestContext`. The agent caches `resolveIntegrationTools({ userId })` and `filesystemMcp.listTools()` in module-scoped `Map`/`Promise` to avoid a network round-trip on every first token.

### `Workspace` — `@mastra/core/workspace`

Filesystem + sandbox + indexing in one primitive:

```ts
new Workspace({
  filesystem: new LocalFilesystem({ basePath: './workspace' }),
  sandbox:   isDeployed ? new E2BSandbox({...}) : new LocalSandbox({...}),
  tools: {
    enabled: true,
    [WORKSPACE_TOOLS.FILESYSTEM.WRITE_FILE]: { requireApproval: true, requireReadBeforeWrite: true },
    [WORKSPACE_TOOLS.FILESYSTEM.EDIT_FILE]: { requireApproval: true, requireReadBeforeWrite: true },
    [WORKSPACE_TOOLS.FILESYSTEM.DELETE]:    { requireApproval: true },
    [WORKSPACE_TOOLS.FILESYSTEM.AST_EDIT]:  { requireApproval: true, requireReadBeforeWrite: true },
    [WORKSPACE_TOOLS.SANDBOX.EXECUTE_COMMAND]: { requireApproval: true },
    [WORKSPACE_TOOLS.SANDBOX.KILL_PROCESS]:    { requireApproval: true },
  },
  bm25: true,                     // BM25 index over the workspace
  autoIndexPaths: ['.'],           // auto-index everything
  skills: ['.agents/skills'],      // skill discovery path
  lsp: true,                       // language-server tooling (lsp_inspect)
})
```

`requireReadBeforeWrite` enforces a read-before-modify invariant; `requireApproval` surfaces an approval gate to the client (Studio handles this natively).

### `Memory` — `@mastra/memory` + `@mastra/libsql`

```ts
new Memory({
  storage: new LibSQLStore({ url: 'file:./mastraclaw-memory.db' }),
  vector:  new LibSQLVector({ url: 'file:./mastraclaw-memory.db' }),
  embedder: new ModelRouterEmbeddingModel('openai/text-embedding-3-small'),
  options: {
    lastMessages: 20,
    workingMemory: { enabled: true, scope: 'resource', template: workingMemoryTemplate },
    observationalMemory: true,
    generateTitle: true,
  },
})
```

- **`lastMessages: 20`** — sliding window of recent turns.
- **`workingMemory` (resource-scoped)** — a Markdown profile block edited by the agent via `updateWorkingMemory`, persisted per-resource (the user, not the thread).
- **`observationalMemory`** — automatic episodic recall surfaced during retrieval.
- **`generateTitle`** — auto-titles new threads.

### Browser — `@mastra/stagehand`

```ts
new StagehandBrowser({
  env: useBrowserbase ? 'BROWSERBASE' : 'LOCAL',
  apiKey, projectId,
  model: 'openai/gpt-4o',
  headless: useBrowserbase ? false : true,
})
```

When attached to an agent (`browser`), Mastra registers `stagehand_navigate`, `stagehand_observe`, `stagehand_act`, `stagehand_extract`, `stagehand_close` automatically. A WebSocket route at `/browser/:agentId/stream` streams CDP screencast frames — the `browser-mirror-route.ts` custom route hooks the same instance for client-side rendering.

### Voice — `@mastra/voice-elevenlabs`

ElevenLabs is attached only when `ELEVENLABS_API_KEY` is set — agents without voice silently skip the field. Speech model: `eleven_multilingual_v2`. Listening (STT): `scribe_v1`. The `voice-speak-route.ts` custom route exposes `POST /api/voice/speak` for client-driven playback.

### Channels — `@chat-adapter/telegram`, `@chat-adapter/slack`

```ts
channels: {
  adapters: {
    ...(isDeployed ? { telegram: createTelegramAdapter() } : {}),
    ...(isDeployed ? { slack:    createSlackAdapter()    } : {}),
  },
}
```

Adapters are wired only when `NODE_ENV=production && MASTRA_DEV !== 'true'`. In dev, the agent is HTTP-only.

### Input processors — `@mastra/core/processors`

```ts
inputProcessors: [
  new UnicodeNormalizer({ stripControlChars, preserveEmojis, collapseWhitespace, trim }),
  new PromptInjectionDetector({
    model: 'openai/gpt-5.3-codex',
    detectionTypes: ['injection', 'jailbreak', 'system-override'],
    threshold: 0.8,
    strategy: 'rewrite',
    lastMessageOnly: true,
  }),
]
```

`PromptInjectionDetector` with `strategy: 'rewrite'` mutates the message rather than blocking; the detector emits a `tripwire` chunk if the threshold is exceeded.

### Scorers — `@mastra/evals/scorers/prebuilt` + custom

```ts
scorers: {
  answerRelevancy: { scorer: createAnswerRelevancyScorer({ model: 'openai/gpt-5.3-codex' }), sampling: { type: 'ratio', rate: 0.2 } },
  toxicity:        { scorer: createToxicityScorer({ model: 'openai/gpt-5.3-codex' }),        sampling: { type: 'ratio', rate: 0.2 } },
  based:           { scorer: basedScorer,                                                    sampling: { type: 'ratio', rate: 0.1 } },
}
```

Sampling runs scorers asynchronously after `finish` — they don't block the response.

### Sub-agents (delegation)

```ts
agents: { researchPlannerAgent, retrievalEvaluatorAgent, emailAgent }
```

Mastra registers each sub-agent as a tool. The orchestrator agent invokes them like any other tool; the sub-agent runs with its own model, memory, tools, and processors.

### Workflows

```ts
workflows: { techTouchdownWorkflow, deepSearch, ragWorkflow, triageWorkflow }
```

Workflows are also registered as tools when attached to an agent. They support sequential / parallel / branching steps, suspend/resume (`/resume-async` endpoint), and stream their own chunk types.

### Tools (static, MCP, integration providers)

```ts
tools: async ({ requestContext }) => ({
  ...staticTools,                 // search, RAG, todo, qualify-lead, triage, …
  ...await getIntegrationTools(userId), // Composio + Arcade — namespaced per user
  ...await getMcpTools(),         // filesystem MCP tools
})
```

Three sources merge each turn:

- **Static tools** — defined under `src/mastra/tools/`, written with `createTool({ id, description, inputSchema, execute })`.
- **MCP tools** — `filesystemMcp.listTools()` from `@mastra/mcp`. Cached for the process lifetime.
- **Integration tools** — `resolveIntegrationTools({ userId })` from `tool-providers.ts` resolves Composio + Arcade tool slugs scoped to the requesting user.

---

## The Mastra API surface (used here)

Beyond what `mastraclaw-agent` consumes directly, `src/mastra/index.ts` registers project-wide primitives.

### Top-level `Mastra` constructor

```ts
new Mastra({
  workflows, agents, scorers, mcpServers, vectors, storage,
  server: { apiRoutes: [...] },
  logger:   new PinoLogger(...),
  editor:   new MastraEditor({ toolProviders: { composio, arcade } }),
  observability: new Observability({
    configs: { default: {
      serviceName: 'mastra',
      exporters: [new DefaultExporter(), new CloudExporter()],
      spanOutputProcessors: [new SensitiveDataFilter()],
    }},
  }),
})
```

### Composite storage — `@mastra/core/storage`

```ts
new MastraCompositeStore({
  default: new LibSQLStore({ url: 'file:./mastra.db' }),
  domains: { observability: await new DuckDBStore().getStore('observability') },
})
```

Trace data lands in DuckDB; threads, messages, and entities land in LibSQL. Domains let you route storage per concern without changing the agent code.

### MCP — `@mastra/mcp`

- **Server** (`mcp/docs-server.ts`) — exposes Mastra docs as MCP resources, surfaced to clients via `GET /api/mcp/servers`.
- **Client** (`mcp/filesystem-client.ts`) — connects to an external MCP server, lists its tools, and merges them into the agent's tool map at runtime.

### Vector store — `@mastra/pinecone`

```ts
vectors: { [VECTOR_STORE_NAME]: getKnowledgeBaseStore() }
```

Registered as a top-level vector — accessible via `mastra.getVector(name)` and consumed by the `kb-*` tools (`tools/rag/`).

### Editor — `@mastra/editor`

`MastraEditor` mounts a tool-provider tab in Studio. Composio and Arcade are passed in only if their API keys exist.

### Custom HTTP routes

Registered through `server.apiRoutes` in `src/mastra/index.ts`:

| Route                                | File                            | Purpose                                                    |
| ------------------------------------ | ------------------------------- | ---------------------------------------------------------- |
| `POST /api/voice/speak`              | `routes/voice-speak-route.ts`   | Server-side TTS for the React client                       |
| `GET /api/working-memory`            | `routes/working-memory-route.ts`| Read working-memory block per resource                     |
| `POST /api/working-memory`           | `routes/working-memory-route.ts`| Write working-memory block                                 |
| `GET /api/artifacts/*`               | `routes/artifact-files-route.ts`| Stream files out of `./workspace` to the client            |
| `GET /api/local-model-status`        | `routes/local-model-route.ts`   | LM Studio probe result                                     |
| `GET /api/browser/mirror`            | `routes/browser-mirror-route.ts`| CDP screencast bridge for the Stagehand browser            |
| `GET /api/triage/*`                  | `routes/triage-data-route.ts`   | Read JSON dumps under `workspace/triage/`                  |

### Studio patch (custom tab)

`scripts/patch-studio.mjs` injects `src/mastra/sandbox/inject.js` + `page.html` into Studio's bundled assets, adding a **Sandbox** tab without forking Mastra. Re-applied on every `npm install` and `npm run dev`.

### Defensive override on `Mastra#getAgentById`

`src/mastra/index.ts` patches `getAgentById` to swallow throws (returning `null` instead) — Mastra's auto-registered `/browser/:agentId/stream` WebSocket calls it on every connect, and a stale tab pointing at a removed agent (`weather-agent` from a prior demo) would otherwise crash the process. Documented inline in `index.ts:126`.

---

## Project layout

```
src/mastra/
  index.ts                 # Mastra() composition root
  storage.ts               # MastraCompositeStore (LibSQL + DuckDB)
  tool-providers.ts        # Composio + Arcade resolution
  agents/                  # 16 agents — mastraclaw is the showcase
  workflows/               # tech-touchdown, deepSearch, rag, triage(+update)
  tools/                   # Static tools + tools/rag (Pinecone KB)
  scorers/                 # basedScorer (custom LLM-judged)
  processors/              # content-moderation (input/output regex + LLM)
  mcp/                     # docs-server (MCP server) + filesystem-client (MCP client)
  routes/                  # Custom HTTP routes wired into mastra.server.apiRoutes
  sandbox/                 # Studio Sandbox-tab assets (inject.js + page.html)
  public/                  # Pinecone-shaped DuckDB cache
client/
  src/                     # React 19 + Vite 8 + Tailwind 4
```

---

## References

- Mastra docs — <https://mastra.ai/docs/>
- Agent API — <https://mastra.ai/docs/agents/overview>
- Workspace — <https://mastra.ai/docs/agents/workspace>
- Memory — <https://mastra.ai/docs/memory/overview>
- Workflows — <https://mastra.ai/docs/workflows/overview>
- Evals & scorers — <https://mastra.ai/docs/evals/overview>
- Observability — <https://mastra.ai/docs/observability/overview>
- Studio — <https://mastra.ai/docs/studio/overview>
