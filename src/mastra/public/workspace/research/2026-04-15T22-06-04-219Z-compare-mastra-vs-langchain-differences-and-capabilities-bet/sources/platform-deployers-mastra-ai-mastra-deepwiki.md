# Platform Deployers | mastra-ai/mastra | DeepWiki
- URL: https://deepwiki.com/mastra-ai/mastra/8.5-platform-deployers
- Query: Mastra deployment options, hosting patterns, APIs, extensibility, licensing, pricing, and tutorials
- Published: 2026-03-18T09:06:51.000Z
## Summary

Here’s a targeted summary addressing your query about Mastra deployment options and related aspects:

What Mastra covers for deployments and hosting
- Platform Deployers: The Mastra docs outline how to deploy Mastra components in different environments, focusing on the platform deployer layer that coordinates configuration, execution, and orchestration across modules.
- Monorepo and packaging: Guidance on the Mastra monorepo structure, package organization, and how to deploy modular pieces consistently.
- System architecture and deployment options: An overview of Mastra’s architecture tailored for deployment scenarios, including core configuration, request context, and dynamic configuration.

APIs and integration points
- LLM integration and model routing: Mechanisms to connect large language models (LLMs), model providers, and routing logic to select models at runtime.
- Tool integration and execution: How tools are defined and invoked within the agent framework, including execution context and orchestration.
- Input/Output processors and schema validation: Interfaces for processing inputs/outputs, plus schema validation to ensure structured data across components.
- Workflow system and execution engines: APIs for workflow definition, step composition, state management, and persistence, including suspend/resume patterns and event streaming.

Extensibility and customization
- Agent system and memory: Extendable agent architecture with configuration patterns to add agents, memory modules, and multi-agent collaboration.
- Dynamic configuration and RequestContext: Runtime configurability to adapt behavior without redeploying.
- Tool builder, model provider system, and provider registry: Extensibility points to add new tools, providers, and model catalogs with configuration options.

Hosting patterns and deployment considerations
- Dev/production patterns: Guidance on deploying the Mastra stack in scalable environments, with attention to modular deployment of core, agents, workflow, and model providers.
- Durability and state management: Durable workflow state, persistence strategies, and durability integrations (e.g., Inngest) for reliable operation.
- Gateway vs direct providers: Architectural patterns for how models are accessed and invoked (gateway-mediated vs direct model providers).

Licensing and pricing
- The DeepWiki page listing does not provide explicit licensing or pricing details. For licensing, pricing, and commercial terms, refer to Mastra’s official repository docs or contact Mastra AI directly.

Tutorials and learning resources
- Documentation index includes sections and pages such as:
  - Overview
  - Monorepo structure and package organization
  - System architecture overview
  - Mastra core and configuration
  - Configuration schema and options
  - RequestContext and dynamic configuration
  - Agent system, configuration, and execution
  - LLM integration, tool integration, and memory
  - Input/Output processors and schema validation
  - Agent networks, agentic loop, and workflow system
  - Workflow definitions, execution engines, state management, and suspend/resume
  - Model provider system, provider registry, model configuration patterns
  - Gateway vs direct providers, dynamic model selection, fallbacks, and schema compatibility
  - Tool system, tool execution context, and builder/conversion
  - Memory and
