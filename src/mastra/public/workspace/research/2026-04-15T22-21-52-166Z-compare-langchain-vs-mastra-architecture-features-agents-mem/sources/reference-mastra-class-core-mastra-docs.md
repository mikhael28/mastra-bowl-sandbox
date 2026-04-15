# Reference: Mastra class | Core | Mastra Docs
- URL: https://mastra.ai/reference/core/mastra-class
- Query: Mastra architecture and core features: agents, memory, connectors, tooling, SDKs, languages
## Summary

Mastra is a centralized orchestration framework designed to coordinate AI agents, workflows, storage, and tooling across an application. Key core features include:

- Central orchestrator (Mastra class): A single instance that registers and exposes agents, workflows, tools, memory, gateways, and storage for global accessibility.
- Agents and workflows: Register and manage reusable AI agents and executable workflows, enabling end-to-end automation.
- Memory and storage: Pluggable storage engines (e.g., LibSQLStore) and memory components to persist state, memories, and intermediate results.
- Tools and connectors: Support for custom tools, gateways (model providers), and various connectors to external systems or private deployments.
- Vectors and semantic search: Optional vector store integrations for embedding-based retrieval and tools that rely on semantic search.
- Observability and logging: Built-in observability hooks and pluggable loggers (e.g., PinoLogger) for tracing and monitoring.
- ID generation and routing: Context-aware ID generator for consistent, traceable identifiers across agents and workflows.
- Extensibility: Rich configuration options for deployers, servers, bundling, processing pipelines, scrapers/scorers, and processors, enabling customization at scale.
- SDKs and multi-language support: Designer-friendly architecture with likely language bindings and SDKs to integrate Mastra components across applications.

If you’re architecting a Mastra-based system, expect to define a single Mastra instance that wires together:
- agents and workflows (for automation)
- storage and memory (for persistence)
- tooling, gateways, and connectors (for external model providers and services)
- observability, id generation, and processing pipelines (for reliability and data flow)

This enables a cohesive, scalable platform for building AI-powered applications with modular, pluggable components.
