# MastraClaw Sandbox — React client

A wire-it-all-up React + TypeScript + Tailwind UI for the parent Mastra project. It drives the Mastra dev server on `http://localhost:4111` through its documented HTTP API and surfaces every primitive this sandbox demonstrates — agents, tools, workflows, memory, RAG, scorers, processors, MCP, voice, workspace, observability.

**Educational side panels** explain each Mastra primitive inline as you use it. Click any coloured badge (`Agent`, `Tool`, `Workflow`, `Scorer`, …) to open the panel.

## Run it

From the **project root**, first start Mastra:

```bash
npm run dev   # Mastra Studio + API on :4111
```

Then in another terminal, start the React client:

```bash
cd client
npm install
npm run dev   # Vite on :5174, proxies /api → :4111
```

Open http://localhost:5174.

## What's wired

| Tab         | Primitive(s) demoed                             | HTTP endpoint                                    |
| ----------- | ----------------------------------------------- | ------------------------------------------------ |
| Chat        | `Agent`, `Agent-as-tool`, `Tool`, `Voice`       | `POST /api/agents/:id/stream`                    |
| Workflows   | `Workflow`, `Workflow suspend/resume`           | `POST /api/workflows/:id/stream` + `/resume-async` |
| Tools       | `Tool` (global + per-agent)                     | `POST /api/agents/:id/tools/:toolId/execute`     |
| Memory      | `Memory`, `Working memory`                      | `GET /api/memory/threads` + `/messages`          |
| MCP         | `MCP server`                                    | `GET /api/mcp/servers` + `/tools`                |
| Scorers     | `Scorer` (based, answer-relevancy, toxicity)    | (documented inline; invoked server-side)         |

## Chat streaming

`lib/mastraClient.ts#streamAgent` reads the newline-delimited chunk stream from `/api/agents/:id/stream` and the chat UI renders each `ChunkType`:

- `text-delta` → token-by-token append
- `reasoning-delta` → collapsible reasoning
- `tool-call` / `tool-result` / `tool-error` → inline tool-call bubbles with args + result
- `tripwire` → processor-blocked banner
- `finish` → token usage + voice playback button

## Why "demonstrate", not "pretty"

The goal here is to show how Mastra primitives snap together. UI is deliberately utilitarian — every box in the UI maps to a file in `src/mastra/` and an endpoint in `@mastra/server`.
