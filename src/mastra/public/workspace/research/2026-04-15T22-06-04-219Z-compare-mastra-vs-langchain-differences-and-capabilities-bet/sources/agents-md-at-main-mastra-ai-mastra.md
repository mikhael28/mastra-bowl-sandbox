# AGENTS.md at main · mastra-ai/mastra
- URL: https://github.com/mastra-ai/mastra/blob/main/AGENTS.md
- Query: Mastra framework overview: architecture, core components (agents, memory, pipelines), SDKs and tool integrations
## Summary

Summary:

Mastra is a modular AI framework designed for building AI-powered applications and agents with a modern TypeScript stack. It centers on central orchestration and pluggable components, enabling flexible integration across tools, memory, and pipelines.

Key architecture and core components:
- Mastra Class (mastra/): The central configuration hub with dependency injection to wire components together.
- Agents (agent/): Abstraction for AI interactions, integrating tools, memory, and voice interfaces.
- Tools (tools/): Dynamic composition of tools sourced from multiple origins to extend capabilities.
- Memory: Mechanisms to manage and persist conversational context and data across interactions.
- Pipelines: Orchestrated flows that connect agents, tools, memory, and other subsystems to perform tasks.

SDKs and integrations:
- TypeScript-first ecosystem with strict type checking across packages.
- SDKs and adapters designed to integrate various tools and services within the Mastra framework.

Development and architecture guidance:
- The repository uses a pnpm workspace with Turborepo, organized into packages and domains (auth, client-sdks, deployers, docs, integrations, observability, stores, voice, etc.).
- Tests are generally co-located with source files, predominantly using Vitest.
- Build, test, and lint strategies emphasize package-local commands to avoid slow, repo-wide operations.
- Documentation updates are required alongside code changes, and new packages must include corresponding docs entries.

If you want, I can tailor this to a deeper dive into:
- How Mastra’s agent abstraction interacts with tools and memory.
- A comparison of core components and data flow in a typical pipeline.
- A quick start outline for building a simple agent with a tool and memory.
