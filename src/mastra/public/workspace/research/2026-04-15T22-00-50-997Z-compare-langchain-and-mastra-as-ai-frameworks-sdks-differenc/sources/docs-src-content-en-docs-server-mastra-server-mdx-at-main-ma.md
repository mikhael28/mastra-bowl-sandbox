# docs/src/content/en/docs/server/mastra-server.mdx at main · mastra-ai/mastra
- URL: https://github.com/mastra-ai/mastra/blob/main/docs/src/content/en/docs/server/mastra-server.mdx
- Query: Mastra official documentation and GitHub: architecture, language support, integrations/connectors, retrieval/RAG, streaming, orchestration, enterprise and hosting options
## Summary

Summary tailored to your query: Mastra official docs and GitHub coverage focusing on architecture, language support, integrations/connectors, retrieval/RAG, streaming, orchestration, enterprise hosting, and hosting options.

What Mastra is (architecture and core concepts)
- Mastra is a framework for building AI-powered applications and agents with a modern TypeScript stack.
- Server architecture: runs as an HTTP server (generated via mastra build) built on Hono; exposes agents, workflows, and other functionality via API endpoints.
- Request handling: routing, middleware, authentication, streaming responses, and a request context for dynamic configuration.
- OpenAPI/Swagger: REST API spec available for exploration (OpenAPI at /api/openapi.json; interactive docs at /swagger-ui). Production defaults disable these docs unless explicitly enabled.

Key architectural elements
- Server options: configurable via Mastra constructor (server.port, server.host, etc.). Supports running Mastra with own HTTP servers via Server Adapters (Express, Hono, etc.).
- Middleware: intercept requests for auth, logging, CORS, and dynamic context injection.
- Request context: pass per-request values to agents, tools, and workflows based on runtime conditions.
- Streaming: built-in support for streaming responses and data redaction.
- Client SDK: Mastra Client SDK for type-safe calls to agents, workflows, and tools from browser or server environments.
- Adapters and extensions: Custom adapters for unsupported frameworks; custom API routes for extending Mastra functionality.

Integrations and connectors
- Official integrations: Authentication providers include JWT, Clerk, Supabase, Firebase, Auth0, WorkOS.
- Server adapters: Run Mastra with Express, Hono, or your own server; detailed docs available under Server Adapters.
- Custom API routes: Extend the server with user-defined HTTP endpoints that have access to the Mastra instance.

Retrieval, RAG, and agent orchestration
- The framework supports agent orchestration and memory/storage integration for building AI-powered workflows.
- OpenAI-compatible interfaces: Mastra exposes Responses and Conversations routes that let you use Mastra Agents as a Responses API. These are agent-backed adapters, not raw provider proxies, and are currently experimental.
- Retrieval/Memory: Mastra workflows can leverage memory and storage components (integrations implied by the architecture and docs).

Streaming and streaming redaction
- Streaming responses are supported to handle long-running or streaming outputs; there is a mechanism for streaming data while ensuring sensitive content can be redacted when needed.

Hosting options and enterprise considerations
- Hosting: Mastra can be run as a standalone server or integrated into existing infrastructure via server adapters. This enables deployments behind existing reverse proxies, load balancers, or bespoke hosting setups.
- Enterprise features: Authentication integration, custom adapters, and robust middleware support are geared toward enterprise-scale deployments. The architecture supports custom API routes and middleware layers for compliant, scalable deployments.

Developer surfaces and docs to consult (for deeper specifics)
- Server configuration: reference for server options in the Mastra constructor under server options.
- Server adapters: guidance for running
