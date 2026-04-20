# System Architecture Overview | mastra-ai/mastra | DeepWiki
- URL: https://deepwiki.com/mastra-ai/mastra/1.2-system-architecture-overview
- Query: Mastra architecture and core features: agents, memory, connectors, tooling, SDKs, languages
- Published: 2026-04-10T07:00:15.000Z
## Summary

Summary tailored to your query: Mastra architecture and core features

- System scope: Mastra is a modular AI agent framework designed to orchestrate autonomous agents with memory, planning, tool use, and dynamic configuration. It emphasizes a plug-in architecture for extensibility across components such as agents, memory, tools, and connectors.

- Agents and execution:
  - Agent System: supports configuration and execution of autonomous agents. Includes agent networks and multi-agent collaboration capabilities, enabling coordinated problem solving.
  - Agentic execution loop (the loop): defines the core cycle of perception, reasoning, action, and feedback, driving agent behavior.
  - Browser automation and web interaction: enables agents to interact with web pages and perform automated browsing tasks as part of tool use.

- Memory and state:
  - Agent Memory System: provides persistent and context-rich memory for agents to recall prior interactions, decisions, and external events, aiding continuity across sessions.
  - Workflow state management and persistence: ensures long-running workflows can be stored, resumed, and audited.

- Tools, connectors, and runtimes:
  - Tool Integration and Execution: supports integration of external tools and services, enabling agents to call APIs, perform computations, or access data sources.
  - Tool System, Tool Definition and Execution Context: formalizes how tools are defined, configured, and invoked within agent workflows.
  - Connectors and Model Provider System: mechanisms to connect to LLMs, models, and external providers; supports a registry and catalog of available models.
  - Gateway vs Direct Providers and Dynamic Model Selection: provides strategies for selecting and routing to appropriate model providers, with fallbacks and dynamic routing.

- LLMs, models, and configuration:
  - LLM Integration and Model Router: centralizes integration with language models and routes prompts and responses to the most suitable model provider.
  - Model Provider System, Provider Registry and Model Catalog: organizes model availability, configuration patterns, and discovery.
  - Dynamic configuration and RequestContext: supports runtime changes to configuration and context-aware behaviors.

- Data flow and schemas:
  - Input and Output Processors: parse, validate, and transform data entering and leaving the system.
  - Structured Output and Schema Validation: enforces schema conformance for outputs, enabling reliable downstream processing.

- Workflow and execution engines:
  - Workflow System: enables definition of workflows, step composition, and orchestrated execution.
  - Execution Engines: provide the runtime that executes defined workflows and agent actions.
  - Suspend and Resume Mechanism: allows pausing and resuming long-running tasks.

- schemas, types, and languages:
  - The architecture supports multiple languages and SDKs through its libraries and connectors, enabling integration with different programming environments.
  - Configuration Schema and Options: defines how components are parameterized and wired together.

- SDKs and extensibility:
  - SDKs are provided to developers for building agents, integrating tools, and adding new connectors or model providers.
  - The overall design emphasizes modularity, enabling teams to add or replace components without reworking the entire system.

If you want, I can map
