# Agent System | mastra-ai/mastra | DeepWiki
- URL: https://deepwiki.com/mastra-ai/mastra/3-agent-system
- Query: Mastra architecture and core features: agents, memory, connectors, tooling, SDKs, languages
- Published: 2026-03-18T09:06:51.000Z
## Summary

Summary focused on Mastra architecture and core features:

- Agents and agent system: Mastra provides an Agent System for configuring, executing, and coordinating autonomous agents. This includes agent configuration, execution loops, agent networks for multi-agent collaboration, and an agentic execution loop (the Loop) that drives planning, action, and learning cycles.

- Memory system: A dedicated Agent Memory System to store and retrieve context, actions, and results across agent sessions to support continuity and recall.

- Connectors and tool integration: A modular Tool System with tool definition, execution context, and tool integration. This enables the agent to call external tools, APIs, or services as part of its workflow.

- LLM integration and model routing: Built-in mechanisms to integrate language models and route between different models/providers, supporting dynamic model selection and model fallbacks.

- Configuration and orchestration: Mastra Core and Configuration cover system-wide configuration schemas, options, and dynamic configuration (RequestContext) to tailor behavior per context or user session.

- Workflow system: A comprehensive Workflow System with workflow definition, step composition, execution engines, state management, persistence, and support for suspend/resume, control flow patterns, and streaming/events.

- Model provider system: Provider Registry and Model Catalog to manage available models/providers, including dynamic model selection and compatibility handling.

- API/SDKs and languages: SDKs and tooling to interact with the Mastra framework, including support for multiple programming languages and integration points through connectors and plugins.

- Schema and validation: Structured output and schema validation to ensure outputs conform to defined schemas, enabling reliable downstream processing.

- Architecture highlights: Monorepo structure, modular architecture, and clear separation between core primitives (agents, memory, tooling) and higher-level workflows and providers, enabling extensibility and collaboration.

If you want, I can tailor a deeper explainer for each component (agents, memory, connectors/tooling, SDKs) or map this to a quick-start setup.
