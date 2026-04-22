# giorgosn/openclaw-crm
- URL: https://github.com/giorgosn/openclaw-crm
- Query: Emerging AI-native CRMs in 2026 that expose agent APIs and orchestration primitives — integration options, tradeoffs, and suitability for SMBs
- Published: 2026-02-09T10:29:35.000Z
## Summary

Summary for query: Emerging AI-native CRMs in 2026 that expose agent APIs and orchestration primitives — integration options, tradeoffs, and suitability for SMBs

- OpenClaw CRM (giorgosn/openclaw-crm) is an open-source, self-hosted CRM designed for AI agents. It ships with a complete REST API, machine-readable docs, and direct integration with the OpenClaw Bot to enable natural-language CRM management without glue code.
- Key integration options:
  - OpenClaw Bot integration: generate a SKILL.md and config, drop into the bot’s skills folder, then manage CRM via natural language
  - REST API with 40+ endpoints, Bearer token auth (oc_sk_ prefixed keys)
  - Machine-readable API docs at /llms-api.txt and /openapi.json
  - End-to-end AI tooling: OpenRouter-based AI chat with multi-model support (Claude, GPT-4o, Llama, Gemini, etc.)
- Core features relevant to agents and orchestration:
  - Core CRM: People/Companies, Deals with Kanban pipeline, Tables with inline editing, detailed records, notes, tasks, custom objects, rich search, CSV import/export, advanced filtering/sorting, notifications, and responsive UI
  - AI-driven interactions: read/write tools (8 read, 5 write with confirmation), token-streaming responses, multi-round tool calls, dynamic system prompts built from workspace schemas
  - Auto-management capabilities: full-text search, bulk imports/exports, callable tasks/notes/records, and workflow-like data operations via AI
- Tech stack and deployment:
  - Next.js 15 (App Router), TypeScript, PostgreSQL 16, Drizzle ORM
  - Turborepo + pnpm monorepo, shadcn/ui + Tailwind CSS, TipTap editor
  - Self-hosted with no data leakage, MIT license
- Tradeoffs and suitability for SMBs:
  - Pros for SMBs: fully self-hosted to avoid vendor lock-in and per-seat pricing; native AI agent integration reduces need for glue code; robust API/docs enable automation; flexible data model with custom objects; open-source community and self-hosting control.
  - Considerations: self-hosting requires operational capability (servers, maintenance, security); setup complexity may be higher than hosted SaaS options; needs ongoing updates and monitoring for AI tooling compatibility.
- Alternatives to consider for 2026 AI-native CRMs with agent APIs:
  - Other self-hosted/open options with REST APIs and AI agents
  - SaaS CRM with AI agents if ease of use and minimal maintenance are priorities (potential trade-off on data control and cost)
- Bottom line: If your SMB prioritizes native AI agent orchestration, full API exposure, and self-hosted control, OpenClaw CRM offers a compelling, open-source option with strong AI integration, extensible data modeling, and robust automation capabilities. It’s especially suitable for teams that can manage hosting and want direct, programmable access for AI agents
