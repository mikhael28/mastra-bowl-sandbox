# Reference: Configuration | Mastra Docs
- URL: https://www.mastra.ai/reference/configuration
- Query: Mastra official documentation and GitHub: architecture, language support, integrations/connectors, retrieval/RAG, streaming, orchestration, enterprise and hosting options
## Summary

Summary tailored to your query

- What Mastra is: A modular AI orchestration framework that lets you configure agents, deployment, events, gateways, and internal IDs to build AI-powered workflows and apps.

- Architecture highlights:
  - Agents: Autonomous units that combine AI models, tools, and memory. Defined as a map of named Agent instances.
  - Deployer: Pluggable deployment provider for publishing apps to cloud platforms (e.g., Netlify).
  - Events: Internal pub/sub handlers for workflow events (mostly internal use).
  - Gateways: Custom model router gateways to support standard or self-hosted/private LLM providers; handles auth, URLs, and model resolution.
  - ID generation: Customizable ID generator for runs, messages, threads, steps, etc., with a built-in safe default (crypto.randomUUID()).
  - Logging: Flexible logger (IMastraLogger or false to disable); defaults to a ConsoleLogger with environment-appropriate log level.

- Key capabilities aligned to your topics:
  - Architecture: Componentized design with core Mastra class and pluggable parts (agents, deployer, gateways, events, logger).
  - Language support: Via the Mastra core and Agent definitions; the docs show TypeScript examples. External model integrations would be through gateways and agent models.
  - Integrations/connectors: Gateways enable custom or self-hosted LLM providers; deployers enable cloud platform deployments; events for internal pub/sub.
  - Retrieval/RAG and streaming: Indicative through agents and gateways; not detailed in this page, but Mastra supports orchestrating tools and memory, which typically underpins RAG/streaming workflows.
  - Orchestration: Core focus; orchestrates multiple agents, events, and deployable apps in a workflow.
  - Enterprise and hosting options: Deployment subsystem (deployers) and gateway customization support enterprise scenarios; page alludes to Netlify deployment as an example, with guidance to consult deployment docs for broader options.

- Quick reference to common configuration (from the page):
  - Top-level options:
    - agents: Map of named Agent instances with model, instructions, etc.
    - deployer: MastraDeployer (e.g., NetlifyDeployer) for cloud publishing.
    - events: Internal event handlers; advanced/rare usage.
    - gateways: Custom model gateways for provider-specific behavior.
    - idGenerator: Function to create unique IDs; default crypto.randomUUID(); can customize using context data (idType, source, entityId, etc.).
    - logger: IMastraLogger or false; default ConsoleLogger with environment-aware level.

- Practical notes:
  - Start by defining your Mastra instance with agents for your use cases, choose a deployer if you plan to publish apps, configure gateways if you need custom or private LLM services, and optionally customize ID generation and logging.
  - For enterprise use, focus on gateways (private/self-hosted LLMs) and deployers (scalable hosting/CI/CD), and consider the events system if
