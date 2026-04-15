# Streaming - Docs by LangChain
- URL: https://docs.langchain.com/oss/python/langchain/streaming/overview
- Query: LangChain official docs and GitHub: architecture, integrations, connectors, RAG/retrieval support, streaming, observability, deployment options
## Summary

Summary for user query: LangChain Streaming (Docs)

- What it is: LangChain’s streaming system surfaces real-time updates from agent runs to your application, improving UX by showing progress and tokens as they’re generated.
- Why it matters: Streaming reduces perceived latency of LLM-powered apps by displaying ongoing results (agent progress, LLM tokens, reasoning steps, and custom signals) as they happen.
- Key features:
  - Agent progress: emits updates after each agent step (step-by-step state changes).
  - LLM tokens: streams individual tokens from the LLM as they’re produced.
  - Thinking/reasoning tokens: streams model reasoning signals in real time.
  - Custom updates: emits user-defined signals (e.g., “Fetched 10/100 records”).
  - Multiple modes: supports updates, messages (LLM tokens + metadata), and custom data; can mix modes.
- How to use:
  - Call stream or astream with stream_mode set to updates (or other modes).
  - Example pattern shows handling chunk types and iterating over steps and messages.
- Practical example: An agent with a single tool call yields:
  - LLM node requests (AIMessage with tool call)
  - Tool node results (ToolMessage)
  - LLM node final response
- References in docs:
  - Streaming overview and common patterns
  - Supported stream modes table
  - Agent progress streaming example (code)

If you’re researching architecture and integration details, focus on:
- How to enable and configure stream_mode (updates, messages, custom)
- The shape of streamed data (step/data in updates; token/metadata in messages; custom signals via the stream writer)
- How to implement with stream/astream in your LangGraph-powered flows

Note: For full API syntax and exact class/method references, see the LangChain streaming docs pages under the streaming overview and the CompiledStateGraph.stream/astream references.
