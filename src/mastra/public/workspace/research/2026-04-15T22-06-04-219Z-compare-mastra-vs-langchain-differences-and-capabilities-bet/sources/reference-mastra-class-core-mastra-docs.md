# Reference: Mastra class | Core | Mastra Docs
- URL: https://mastra.ai/reference/core/mastra-class
- Query: Mastra framework overview: architecture, core components (agents, memory, pipelines), SDKs and tool integrations
## Summary

Summary:
- Mastra is a centralized orchestration framework for building AI-driven applications. It acts as a top-level registry that coordinates core components such as agents, workflows/pipelines, tools, storage, logging, and observability.
- Core components:
  - Mastra class: central orchestrator that registers and exposes agents, workflows, tools, memory, storage, and other subsystems for global access within an application.
  - Agents: autonomous or semi-autonomous units that perform tasks, powered by registered workflows and tools.
  - Workflows/Pipelines: defined sequences of steps that orchestrate agent actions, data processing, and decision logic.
  - Memory/Storage: persistent state and ephemeral memory for agents, with pluggable storage backends (e.g., LibSQLStore) to persist data, context, and results.
  - Tools/Platforms: custom tools and gateways for external model access, data retrieval, and external services.
  - Observability/Logging: integrated logging and observability to trace and monitor executions (e.g., PinoLogger).
- Architecture highlights:
  - Registry-driven design: components are registered under names/keys and accessed globally, enabling modularity and reusability.
  - Extensibility: supports diverse backends for storage, vector databases for semantic search, and multiple gateways/model providers.
  - Configurability: a configurable constructor allows wiring of workflows, agents, storage, memory, loggers, vectors, and additional subsystems like tts, deployers, servers, and mcpServers.
- SDKs and integrations:
  - Core SDK: Mastra class and related types for composing applications.
  - Logging: PinoLogger integration for structured logging.
  - Storage: LibSQLStore as a pluggable storage option; memory-based or other database adapters can be used.
  - Vector stores: supports vector-based tools and semantic search via configured vector stores (e.g., Pinecone, PgVector, Qdrant).
  - Tools and gateways: pluggable tools and gateways to interface with external models or private deployments.
  - ID generation: customizable idGenerator to produce context-aware identifiers for agents, workflows, and runtime entities.
- Practical usage:
  - Instantiate Mastra with registered workflows, agents, storage, and logger.
  - Extend with vectors, memory, gateways, and additional processors or scorers as needed.
  - Use the built-in registries to retrieve MCP servers, gateways, memory, and other components by key or id.
- When to favor this overview:
  - If you’re evaluating Mastra for building end-to-end AI apps with orchestrated agents and pipelines.
  - If you need a unified architecture that unifies agents, workflows, storage, and observability under a single orchestrator.
  - If you require pluggable backends for storage, vector search, and model gateways, with a scalable, registry-driven design.
