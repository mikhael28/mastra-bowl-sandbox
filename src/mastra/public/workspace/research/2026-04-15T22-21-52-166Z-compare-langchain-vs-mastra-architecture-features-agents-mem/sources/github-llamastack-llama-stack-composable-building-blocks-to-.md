# GitHub - llamastack/llama-stack: Composable building blocks to build LLM Apps · GitHub
- URL: https://togithub.com/llamastack/llama-stack
- Query: Deployment, hosting, licensing, and community maturity of LLM agent frameworks and toolkits
- Published: 2024-06-25T22:32:26.000Z
- Author: llamastack
## Summary

Summary:

- What it is: Llama Stack is an open-source, OpenAI-compatible API server for building AI applications with LLMs. It provides a drop-in replacement for the OpenAI API that you can run locally or in any infrastructure, and supports multiple models and providers.

- Deployment & hosting: 
  - Runs anywhere: laptop, data center, or cloud.
  - Pluggable provider architecture: use Ollama locally, vLLM in production, or connect to managed services without changing client code.
  - Quick start: one-line install script or install via uv (pip), then start with llama stack run.
  - APIs mirror OpenAI endpoints: /v1/chat/completions, /v1/completions, /v1/embeddings, plus additional endpoints for vectors (/v1/vector_stores), files, batches, and a Responses API with agentic orchestration and tool calling.

- Licensing & community maturity:
  - License: MIT.
  - Active development and community: regular contributor base and weekly community calls; keeps feature parity with OpenAI-like usage and Open Responses conformance.

- Licensing details: MIT license; community governance and contribution guidelines available.

- Ecosystem & resources:
  - Documentation and Quick Start guides for setup and usage.
  - Open Responses conformance testing.
  - Client SDKs for Python and TypeScript (installation examples and integration with OpenAI-compatible clients).
  - Ongoing releases (latest v0.7.1 as of Apr 8, 2026).

- What it’s best for: teams needing a portable, OpenAI-compatible, model-agnostic API layer to deploy LLM apps across different infrastructures, with built-in tooling for chat, embeddings, file search (RAG), vector stores, batching, and tool integration.
