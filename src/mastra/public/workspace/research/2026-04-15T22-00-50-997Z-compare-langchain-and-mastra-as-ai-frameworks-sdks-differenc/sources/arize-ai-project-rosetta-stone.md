# Arize-ai/project-rosetta-stone
- URL: https://github.com/Arize-ai/project-rosetta-stone
- Query: GitHub repositories or public benchmark projects that run performance/scalability tests for both LangChain and Mastra (end-to-end RAG, streaming, multi-agent)
- Published: 2026-02-22T18:05:51.000Z
- Author: Arize-ai
## Summary

Summary for query: GitHub repositories or public benchmark projects that run performance/scalability tests for both LangChain and Mastra (end-to-end RAG, streaming, multi-agent)

- The page describes Arize-ai’s Project Rosetta Stone, which is not a performance benchmark but a multi-framework comparison of an identical AI shopping agent implemented across five framework/instrumentation tiers (no-observability, Phoenix, AX) using LangChain.js, LangChain Python, LlamaIndex Python, Mastra, and Vercel AI SDK.
- It focuses on observability/instrumentation rather than dedicated performance benchmarks. All variants run a self-contained Next.js app of a “Wonder Toys” agent that can search a 200-product inventory, browse with rich product cards, simulate purchases, track/cancel orders, and present a streaming chat UI.
- Each framework tier includes the same agent logic, UI, and data, differing only in instrumentation setup to compare developer experience and observability across Arize Phoenix and Arize AX.
- If you seek explicit performance benchmarks comparing LangChain vs. Mastra (end-to-end RAG, streaming, multi-agent), this repository does not provide numeric benchmarks or scalability tests. It is suitable as a qualitative side-by-side framework comparison rather than a benchmark suite.
- Key sections to review for comparison: the “The Agent” capabilities (search, browse, purchase, track, cancel), the framework table (LangChain.js, LangChain Python, LlamaIndex Python, Mastra, Vercel AI SDK), and the Observability Tiers (no-observability, phoenix, ax) which show how instrumentation differs while logic remains identical.

If you specifically need public benchmarks, I can search for separate projects that:
- run end-to-end RAG pipelines with streaming outputs
- compare LangChain and Mastra under load/scalability tests
- include multi-agent coordination benchmarks
Would you like me to locate and summarize such benchmark repositories?
