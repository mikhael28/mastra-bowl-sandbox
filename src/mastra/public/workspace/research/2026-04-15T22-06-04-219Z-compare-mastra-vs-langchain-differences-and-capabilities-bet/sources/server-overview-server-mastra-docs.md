# Server overview | Server | Mastra Docs
- URL: https://www.mastra.ai/docs/server/mastra-server
- Query: Mastra deployment options, hosting patterns, APIs, extensibility, licensing, pricing, and tutorials
## Summary

Summary tailored to user query

- What Mastra is: An HTTP server framework that exposes agents, workflows, and tooling as API endpoints, handling routing, middleware, authentication, and streaming responses. It can be run as a self-contained Mastra server or atop your own HTTP server via adapters.

- Deployment and hosting options:
  - Built server: Generated Hono-based HTTP server when you run mastra build (outputs to .mastra).
  - Standalone hosting: Run Mastra as an app with a configured server object (port, host). Examples show defaults and how to override via environment variables.
  - Server adapters: Use Express, Hono, or other HTTP servers with Mastra instead of the generated server.
  - Custom adapters: Build adapters for unsupported frameworks.

- Hosting patterns (scalability and architecture):
  - Middleware-driven requests for authentication, logging, CORS, and request-specific context.
  - Request context that passes runtime values to agents, tools, and workflows.
  - Streaming responses with data redaction for secure outputs.
  - OpenAPI/Swagger endpoints for API exploration (disabled in production by default; can be enabled via config).

- Core components and features:
  - REST API endpoints for all registered agents and workflows.
  - Custom API routes and middleware to extend functionality.
  - Authentication across providers (JWT, Clerk, Supabase, Firebase, Auth0, WorkOS).
  - Mastra Client SDK for type-safe browser or server usage.
  - OpenAPI (api/openapi.json) and Swagger UI for interactive testing (optional in prod).

- OpenAI compatibility features (experimental):
  - OpenAI-like Responses API and Conversations routes that route through Mastra agents, memory, and storage.
  - Supports agent selection via agent_id, optional model override, and follow-up turns via previous_response_id.
  - Streaming and tool invocation support; current status: experimental.

- Configuration highlights:
  - Server options (e.g., port, host) passed to Mastra constructor.
  - Config references available for a full list of server options (server.build.openAPIDocs, server.build.swaggerUI toggles, etc.).

- What this means for deployment and extensibility:
  - You can deploy Mastra as a self-contained server or embed it behind your existing HTTP server.
  - It supports custom routes, middleware, and adapters to fit various hosting environments.
  - Extensibility through custom adapters, middleware, and a client SDK.
  - Licensing and pricing information are not covered on this page; refer to Mastra licensing docs for specifics. 

If you’re evaluating Mastra for hosting patterns, consider:
- Ideal load: use server adapters and clustering/back-end infrastructure for scalable deployments.
- Security: leverage built-in authentication providers and request-context-based access controls.
- Extensibility: leverage custom routes, middleware, and adapters to integrate with your infrastructure.
