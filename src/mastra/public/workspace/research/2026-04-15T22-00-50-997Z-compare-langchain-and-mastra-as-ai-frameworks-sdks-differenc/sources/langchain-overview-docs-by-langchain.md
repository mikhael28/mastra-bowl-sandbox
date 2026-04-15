# LangChain overview - Docs by LangChain
- URL: https://python.langchain.com/docs/concepts/architecture
- Query: LangChain official docs and GitHub: architecture, integrations, connectors, RAG/retrieval support, streaming, observability, deployment options
- Published: 2025-01-01T00:00:00.000Z
## Summary

Summary:

- LangChain is an open-source framework for building customizable agents and applications powered by LLMs. It emphasizes a prebuilt agent architecture and broad integrations to quickly connect to models and tools (e.g., OpenAI, Anthropic, Google) with minimal code.
- Architecture overview:
  - LangChain agents sit on top of LangGraph for advanced orchestration, determinism, and customization.
  - LangGraph provides low-level orchestration and runtime; LangChain agents expose durable execution, streaming, persistence, human-in-the-loop, etc.
  - Deep Agents offer a batteries-included path with features like long-conversation compression, virtual filesystem, and subagent management. If you need heavy features, use Deep Agents; otherwise, start with LangChain.
- Key capabilities highlighted:
  - Model abstraction: Standardized model interface to swap providers without lock-in.
  - RAG and retrieval: Support for retrieval-augmented generation and retrieval systems.
  - Streaming, observability, and deployment options: Built-in observability, tracing (via LangSmith), and deployment readiness.
  - Integrations/connectors: Wide range of connectors and tools to extend agent capabilities.
  - Observability and debugging: LangSmith for tracing requests, debugging agent behavior, and evaluating outputs.
- Getting started:
  - Quickstart: Create an agent with a few lines of code, using a provider (example uses Anthropic Claude), and simple tool integration.
  - Installation and quickstart guides available for rapid onboarding.
- Practical guidance:
  - If you want rapid agent development with straightforward use and customization, start with LangChain.
  - For more advanced orchestration needs, deterministic workflows, or heavy customization, consider LangGraph.
  - For feature-rich, batteries-included agent capabilities, explore Deep Agents.
- Quick pointers from the docs:
  - Install: pip install langchain with relevant extras for providers.
  - Sample code shows creating an agent, supplying a tool, and invoking it with a user message.
  - LangSmith can be used for tracing and debugging.

Note: The page includes a full documentation index and a user feedback channel for reporting issues.
ation paths through LangGraph and Deep Agents.
