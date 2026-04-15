# Towards LangChain 0.1: LangChain-Core and LangChain-Community
- URL: https://blog.langchain.dev/the-new-langchain-architecture-langchain-core-v0-1-langchain-community-and-a-path-to-langchain-v0-1/
- Query: LangChain architecture and core features: chains, agents, memory, connectors, SDKs, examples
- Published: 2023-12-12T18:16:34.000Z
## Summary

Summary:

- LangChain is undergoing a re-architecture to improve stability and scalability while preserving backward compatibility. The project splits the former monolithic package into three packages: langchain-core (core abstractions and the LangChain Expression Language), langchain-community (third-party integrations), and langchain (higher-level chains, agents, retrieval algorithms). A stable 0.1 release for langchain-core is out, with langchain aiming for a stable 0.1 in early January.
- LangChain-core provides simple, modular building blocks for LLM applications: interfaces for language models, document loaders, embeddings, vector stores, retrievers, and more. These are low-level primitives (text in, text out) designed to be provider-agnostic and composable.
- The ecosystem now centers on a core runtime that can join components via the LangChain Expression Language, enabling flexible composition of chains and workflows.
- LangChain-community will host third-party integrations, with plans to spin out key integrations into standalone packages over the next month.
- The broader LangChain SDKs (Python and JavaScript) consist of: (1) base interfaces, (2) integrations/implementations, and (3) preconfigured compositions for specific use cases. These parts are now separated into langchain-core, langchain-community, and langchain, but remain backwards compatible.
- Use-case level abstractions (chains, agents, retrieval algorithms) live in the langchain package, while the foundational building blocks live in langchain-core, helping developers build context-aware reasoning apps more reliably.
- The re-architecture supports a growing ecosystem around LangChain—examples and tools like LangChain Templates, LangServe, LangSmith, and more—while preserving existing workflows for developers and partners.
in-community for integrations.
  - Breaking changes will be managed via minor version bumps, with a focus on early 2025/early January stability for the 0.1 release of langchain-core and the 0.1 target for langchain.

- Ecosystem growth:
  - The new architecture supports a growing ecosystem of tooling and services around LangChain (e.g., templates, monitoring, and deployment tools). The emphasis is on long-term stability and extensibility.

If you’re specifically interested in how chains, agents, memory, and connectors fit into this new architecture:
- Chains and agents reside in the higher-level langchain package, orchestrating the components from core.
- Memory and retrieval/connectors are supported through the modular core abstractions, enabling flexible integration with various data sources and memory stores.
- The Expression Language in langchain-core helps compose and orchestrate these components, serving as a lightweight runtime for building complex workflows.
