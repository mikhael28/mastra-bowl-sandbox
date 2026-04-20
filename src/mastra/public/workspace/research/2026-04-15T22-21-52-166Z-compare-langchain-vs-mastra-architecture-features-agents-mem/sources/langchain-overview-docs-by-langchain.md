# LangChain overview - Docs by LangChain
- URL: https://python.langchain.com/docs/concepts/architecture/
- Query: LangChain architecture and core features: chains, agents, memory, connectors, SDKs, examples
## Summary

Summary:
- LangChain is an open-source framework for building custom agents and applications powered by large language models (LLMs), with a prebuilt agent architecture and broad model/tool integrations.
- Core layers and architecture:
  - Agents built on top of LangGraph for durable execution, streaming, persistence, and human-in-the-loop, enabling complex, reliable workflows.
  - Standardized model interface to abstract provider-specific APIs and reduce lock-in.
  - Chains and agent abstractions (easy to use in under 10 lines of code) for composing steps, tools, and logic.
- Key components and capabilities:
  - Agent creation and orchestration: quickly create agents that can call tools, query models, and handle multi-turn interactions.
  - Memory and context handling: supports maintaining context across interactions within agents (via LangGraph lineage and related tooling).
  - Connectors and integrations: extensive connectors to providers (e.g., OpenAI, Anthropic, Google) and additional tools; ability to add proprietary or custom tools.
  - Connectors/SDKs: accessible APIs and SDKs to build, trace, and debug agents.
  - Debugging and observability: LangSmith provides tracing, visualization of execution paths, state transitions, and runtime metrics for debugging and evaluation.
- Recommended guidance:
  - For rapid agent builds, start with LangChain (lightweight, flexible) or Deep Agents for batteries-included capabilities like automatic long-conversation management and subagent-spawning.
  - For advanced orchestration needs combining deterministic and agentic workflows, consider LangGraph.
  - Leverage LangSmith tracing to diagnose behavior and performance.
- Practical examples:
  - Basic agent example demonstrates creating an agent with a model and a simple weather tool, invoking it with a user query.
- Quickstart references:
  - Installation, quickstart, and tracing setup are available in the docs to get started with agents and applications using LangChain.
