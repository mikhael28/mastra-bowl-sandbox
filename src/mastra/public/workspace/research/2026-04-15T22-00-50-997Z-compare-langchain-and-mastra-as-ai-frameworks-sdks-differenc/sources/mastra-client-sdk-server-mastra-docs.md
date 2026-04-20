# Mastra client SDK | Server | Mastra Docs
- URL: https://www.mastra.ai/docs/server/mastra-client
- Query: Mastra official documentation and GitHub: architecture, language support, integrations/connectors, retrieval/RAG, streaming, orchestration, enterprise and hosting options
## Summary

Summary tailored to your query:
- This Mastra Client SDK doc explains how to interact with a Mastra Server from a browser/client environment using a type-safe API.
- Key components:
  - Initialization: Create MastraClient with a baseUrl (default http://localhost:4111).
  - Core resources you can work with: Agents (generate and stream responses), Memory (conversation history), Tools, Workflows, Vectors (semantic search embeddings), Responses API (experimental), Conversations (experimental), Logs, Telemetry.
- Generating and streaming:
  - Generate: mastraClient.getAgent('agentName').generate(prompt) or with an array of messages [{role, content}].
  - Streaming: agent.stream(prompt) returns a stream; process parts in onTextPart.
- Installation (JS ecosystems):
  - npm, pnpm, yarn, or bun install @mastra/client-js@latest.
- Prerequisites:
  - Node.js v22.13.0+, TypeScript v4.7+, local Mastra server (default port 4111).
- Usage examples:
  - Initialize client with baseUrl.
  - Call generate or stream on an agent.
- Configuration:
  - MastraClient supports options like retries, backoffMs, and headers for request behavior and diagnostics.

If you want, I can extract the exact code snippets into a ready-to-copy snippet for a specific setup (e.g., React app with TypeScript) or compare with Mastra GitHub repo for architecture, language support, integrations/connectors, retrieval/RAG, streaming, orchestration, and hosting options.
