# mastra-ai/mastra | DeepWiki
- URL: https://deepwiki.com/mastra-ai/mastra/1-overview
- Query: Mastra framework overview: architecture, core components (agents, memory, pipelines), SDKs and tool integrations
- Published: 2026-04-02T10:32:59.000Z
## Summary

Mastra is an extensible AI orchestration framework designed to build and run complex multi-agent systems with robust memory, pipelines, and tool integrations. Its architecture emphasizes modularity, dynamic configuration, and scalable execution across workflows and agents. Key components and themes include:

- Core architecture
  - Agent system: configuration, execution, and orchestration of autonomous agents.
  - Memory system: persistent and structured memory for agent state, context, and long-term recall.
  - Input/Output processors: standardized handling of data entering and leaving the system.
  - Structured output and schema validation: strict schemas to ensure consistent results and easy integration.

- Configuration and orchestration
  - Mastra Core and Configuration: central configuration model with dynamic, context-aware options.
  - Configuration schema and options: predefined and extensible schemas for flexible deployment.
  - RequestContext and dynamic configuration: per-request context that can influence behavior and routing.

- Pipelines and workflows
  - Workflow system: define and compose workflows with steps, execution engines, and persistence.
  - Execution engines: components that drive workflow steps, state transitions, and processing logic.
  - Workflow state management and persistence: durable tracking of progress and results.
  - Suspend/resume, control flow patterns, streaming and events: supports long-running tasks, interruption, and real-time data flows.
  - Inngest durability integration: reliability patterns for event-driven processing.

- Agent networks and collaboration
  - Agent networks and multi-agent collaboration: enables ensembles of agents working together with coordinated actions.
  - Agentic execution loop (the loop): the core runtime cycle for agent decision-making and action.

- Model and tool integration
  - LLM integration and model router: selects and routes prompts to appropriate language models.
  - Model provider system, registry, and catalog: centralized model discovery and provisioning.
  - Dynamic model selection, fallbacks, and error handling: resilience in model choice and execution.
  - Tool system: integration, execution context, and workflows for external tools.
  - Tool builder and schema conversion: creating and adapting tool interfaces to Mastra schemas.

- Memory and storage
  - Memory and storage architecture: structured, scalable storage for agents’ memory, context, and results.

- Developer experience
  - Monorepo structure and package organization: organized, scalable codebase for large team work.
  - SDKs and tooling: developer-facing interfaces to build, configure, and run Mastra deployments.

Useful for developers seeking to understand Mastra’s overview, core components, and integration points across agents, memory, pipelines, and tooling.
