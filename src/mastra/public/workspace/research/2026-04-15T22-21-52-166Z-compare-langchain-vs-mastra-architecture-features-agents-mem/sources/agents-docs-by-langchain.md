# Agents - Docs by LangChain
- URL: https://docs.langchain.com/oss/python/langchain/agents
- Query: LangChain architecture and core features: chains, agents, memory, connectors, SDKs, examples
## Summary

Summary:
- LangChain Agents: Combine language models with tools to reason about tasks, decide which tools to use, and iterate toward solutions. Agents run in a loop until a stop condition (final output or iteration limit) and can be built with a graph-based runtime via create_agent, which uses LangGraph (nodes = steps, edges = connections).
- Core components highlighted:
  - Model: The reasoning engine for agents, supporting static and dynamic selection.
    - Static model: configured once; can initialize via a model identifier string (e.g., "openai:gpt-5") or instantiate a provider-specific class (e.g., ChatOpenAI) with detailed parameters (temperature, max_tokens, timeout, etc.).
    - Dynamic model: chosen at runtime based on state/context for advanced routing or cost optimization.
  - Graph-based execution: Agents traverse a graph (model node, tools node, middleware) to produce outputs; graph API is available for further customization.
- Practical guidance:
  - Use create_agent for production-ready agents.
  - For static models, you can pass a simple string or a model instance with explicit configuration.
  - For dynamic needs, implement routing logic to select models at runtime.
- Useful references:
  - Graph API and LangGraph docs for building and understanding the agent graph.
  - Model parameter docs for configuring temperature, max_tokens, timeouts, and provider-specific settings.
- Related context: The page emphasizes an architectural view (agents using tools via a loop) and provides a Mermaid diagram example of the data flow between input, model, tools, and output.
