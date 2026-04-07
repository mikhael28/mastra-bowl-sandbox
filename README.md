# Mastra Bowl Sandbox

A sandbox showcase of [Mastra's](https://mastra.ai/) agent framework capabilities, battle-tested with the new Studio & Server. This sandbox demonstrates how to build autonomous agents with tools, workflows, evals, memory, browser automation, email, content moderation, MCP servers, and more.

## Getting Started

```shell
npm run dev
```

Open [http://localhost:4111](http://localhost:4111) to access [Mastra Studio](https://mastra.ai/docs/studio/overview), an interactive UI for building and testing your agents. Edit files inside `src/mastra` and the dev server will automatically reload.

## What's Inside

### AlmostOpenClaw — Autonomous General-Purpose Agent

The flagship agent in this sandbox. OpenClaw (`src/mastra/agents/openclaw-agent.ts`) demonstrates the full breadth of what a Mastra agent can do:

- **Workspace** — Read, write, and execute files in a sandboxed environment using `Workspace` with `LocalFilesystem` and `LocalSandbox` (swaps to [E2B](https://e2b.dev/) in production)
- **Browser Automation** — Navigate websites, interact with page elements, and extract structured data via [`@mastra/stagehand`](https://mastra.ai/docs/agents/browsing-the-web) (uses [BrowserBase](https://browserbase.com/) in production, headless local browser in development)
- **Email** — Send, receive, read, and reply to emails autonomously via [AgentMail](https://agentmail.to/) with 7 dedicated tools (create inbox, list inboxes, send, list messages, get message, reply, list threads)
- **Web Search** — Dual search strategy with [Tavily](https://tavily.com/) (fast search with topic/time filters) and [Exa](https://exa.ai/) (semantic search with category filtering)
- **Memory** — Observational memory for persistent context across conversations
- **MCP Server** — Reads Mastra documentation via a custom Model Context Protocol server with resource exposure
- **Telegram Channel** — Configured with `@chat-adapter/telegram` for messaging integration

### Specialized Agents

Each agent highlights different Mastra patterns:

| Agent | What It Demonstrates |
|---|---|
| **Weather Agent** | Tool use (`weatherTool`), memory, and multiple evals (tool call appropriateness, completeness, translation) |
| **Chef Agent** | Tool use (`cookingTool`), memory, and domain-specific eval (`glutenCheckerScorer`) |
| **Math Agent** | Multiple tool use — four calculator tools the agent must select from and chain together |
| **News Agent** | Multi-source research with `tavilySearch` + `exaSearch` tools |
| **Publisher Agent** | **Agent-as-tool pattern** — orchestrates the Copywriter and Editor agents as tools, with content moderation processors and the `basedScorer` eval |
| **Copywriter Agent** | Input/output content moderation processors |
| **Editor Agent** | Pure instruction-driven agent (no tools, no memory) |

### Tools

| Tool | Source |
|---|---|
| Weather lookup (Open-Meteo, no API key) | `tools/weather-tool.ts` |
| Calculator (add, multiply, divide, power) | `tools/calculator-tools.ts` |
| Recipe suggestion (deterministic lookup) | `tools/cooking-tool.ts` |
| Tavily web search | `tools/tavily-search.ts` |
| Exa semantic search | `tools/exa-search.ts` |
| AgentMail (7 email tools) | `tools/agentmail.ts` |
| Agent-as-tool (copywriter + editor) | `tools/content-tools.ts` |

### Workflows

| Workflow | Pattern | Description |
|---|---|---|
| **Blog Post** | Branching | Writes a draft → edits it → scores "basedness" → branches: if score >= 6 finalize, otherwise rewrite bolder and re-score |
| **Tech Touchdown** | Parallel | Fetches sports and AI headlines concurrently, then assembles a combined newsletter |
| **Weather** | Sequential + Streaming | Fetches forecast data, then streams activity suggestions from the weather agent |

### Evals (Scorers)

| Scorer | Type | What It Checks |
|---|---|---|
| `basedScorer` | LLM-judged | Rates content 0–10 on authenticity, boldness, originality, personality, and impact |
| `glutenCheckerScorer` | LLM-judged | Detects gluten-containing ingredients in recipes (binary 0/1) |
| `toolCallAppropriatenessScorer` | Prebuilt | Validates the agent called the right tool for the query |
| `completenessScorer` | Prebuilt | Checks response completeness |
| `translationScorer` | LLM-judged | Ensures non-English location names are properly translated |

### Processors (Content Moderation)

`processors/content-moderation.ts` defines input and output processors that scan for violent and political content using pattern matching. The input processor blocks requests before they reach the LLM. The output processor retries up to 2 times before hard-blocking. Used by the Copywriter and Publisher agents.

### Observability & Storage

- **Composite storage** — LibSQL as the default store, with ClickHouse (or DuckDB fallback) for observability data
- **Logging** — Pino logger
- **Exporters** — `DefaultExporter` + `CloudExporter` with `SensitiveDataFilter` for production tracing

## Environment Variables

| Variable | Required By |
|---|---|
| `OPENAI_API_KEY` | All agents (GPT-5-mini) |
| `TAVILY_API_KEY` | Tavily search tool |
| `EXA_API_KEY` | Exa search tool |
| `AGENT_MAIL_API_KEY` | AgentMail tools |
| `BROWSERBASE_API_KEY` | BrowserBase (optional, falls back to local) |
| `BROWSERBASE_PROJECT_ID` | BrowserBase (optional) |
| `TELEGRAM_BOT_TOKEN` | Telegram channel adapter |
| `CLICKHOUSE_HOST`, `CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD`, `CLICKHOUSE_DATABASE` | ClickHouse observability (optional, falls back to DuckDB) |

## Learn More

- [Mastra Documentation](https://mastra.ai/docs/)
- [Agents](https://mastra.ai/docs/agents/overview) · [Tools](https://mastra.ai/docs/agents/using-tools) · [Workflows](https://mastra.ai/docs/workflows/overview) · [Evals](https://mastra.ai/docs/evals/overview) · [Observability](https://mastra.ai/docs/observability/overview)
- [Mastra Course](https://mastra.ai/course) · [YouTube](https://youtube.com/@mastra-ai) · [Discord](https://discord.gg/BTYqqHKUrf)
