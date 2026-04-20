# mastra/packages/rag/package.json at main · mastra-ai/mastra - GitHub
- URL: https://github.com/mastra-ai/mastra/blob/main/packages/rag/package.json
- Query: Mastra official documentation and GitHub: architecture, language support, integrations/connectors, retrieval/RAG, streaming, orchestration, enterprise and hosting options
## Summary

Summary:
- Mastra is a TypeScript-based framework for building AI-powered applications and agents, maintained by the Mastra team (GitHub: mastra-ai/mastra). It emphasizes Retrieval-Augmented Generation (RAG), vector stores, embeddings, text splitting/chunking, and semantic/document processing.
- Architecture & orchestration: Mastra provides a modular, plugin-oriented architecture designed for extensibility (core runtime with support for LLMs, vector stores, and document processing pipelines). It supports orchestration of AI agents and workflows with a modern TS stack.
- Language support: Core library packages are TypeScript-first; typings and dist outputs are offered for consumption in TS/JS projects. Peer dependencies indicate compatibility with @mastra/core and zod, with a focus on type-safety.
- Integrations/connectors: Includes spaces for LLM and embedding providers (e.g., OpenAI, Cohere via @ai-sdk, and other internal/workspace components). Uses common data handling libraries (pathe, js-tiktoken, big.js) and adapters for HTML parsing and tokenization.
- Retrieval/RAG: Core emphasis on retrieval-augmented generation, vector search, embeddings, and document processing (chunking, text splitting). The rag package is a building block for retrieval pipelines and integration with vector stores.
- Streaming: The build tooling and scripts (tsup, vitest) suggest support for modern module formats and testing; the package exports and dist structure enable both import and require usage, with TypeScript typings for robust integration.
- Enterprise and hosting options: The repository positions Mastra as a framework suitable for scalable AI apps, with a modular design that can be wired into enterprise-grade stacks. Hosting options are not explicitly listed in the package.json, but the architecture supports deployment through typical Node.js environments and possibly cloud/vector-store integrations via connectors.
- Documentation access: Official homepage is mastra.ai, with GitHub hosting at mastra-ai/mastra. The package.json indicates prepack steps for generating docs, suggesting maintained documentation alongside code. 

If you’re evaluating Mastra for enterprise RAG workflows, focus on:
- How the rag package integrates with your preferred vector store and LLM provider.
- Type-safe schemas (Zod) and internal type-building tooling for robust schemas.
- Extensibility points for custom connectors and orchestration logic.
- Deployment considerations (node engine >= 22.13.0, packaging via dist, and building pipelines).
