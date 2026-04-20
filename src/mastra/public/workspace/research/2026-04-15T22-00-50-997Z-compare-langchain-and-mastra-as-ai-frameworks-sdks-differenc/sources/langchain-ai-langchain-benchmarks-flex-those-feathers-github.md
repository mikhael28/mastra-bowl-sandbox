# langchain-ai/langchain-benchmarks: Flex those feathers! - GitHub
- URL: https://github.com/langchain-ai/langchain-benchmarks
- Query: GitHub repositories or public benchmark projects that run performance/scalability tests for both LangChain and Mastra (end-to-end RAG, streaming, multi-agent)
- Published: 2023-08-10T21:31:11.000Z
## Summary

Summary:

The page describes the LangChain Benchmarks project (langchain-ai/langchain-benchmarks) a Python-based framework for end-to-end LLM benchmarking, with a focus on LangChain and related tooling. Key points:

- Purpose: A benchmark suite to measure end-to-end LLM tasks (RAG, tool use, multi-agent workflows, question answering, etc.), with emphasis on data collection, evaluation, and reproducibility.
- How it works: Benchmarks are organized by use-case and heavily leverage LangSmith for dataset storage, tracking, and evaluation.
- Documentation and results: Offers articles on benchmarking results (Agent Tool Use, high-cardinality query analysis, RAG on tables, Q&A over CSV data) and tool-usage tutorials. Includes example agent traces and downloadable tool-usage notebooks.
- Installation: Install via pip install -U langchain-benchmarks. Requires LangSmith account and API key for full eval/debugging experience.
- Repo details: Open-source with MIT license, 14 releases (latest v0.0.14, 2024-07-24). Primary language Python. Active development until at least 2024, with links to docs, blogs, and LangSmith public traces.
- Scope: Intended for benchmarking both LangChain and related workflows in LLM tasks, potentially including Mastra-style end-to-end evaluations (the user’s query mentions performance/scalability tests for LangChain and Mastra).

If you’re looking for repositories or public benchmark projects that run end-to-end performance tests (RAG, streaming, multi-agent) for LangChain and Mastra, this repo provides a benchmark framework, datasets, and documentation to reproduce and extend such tests, with integration into LangSmith for results.
