# aymeric-roucher/agent_reasoning_benchmark
- URL: https://github.com/aymeric-roucher/agent_reasoning_benchmark
- Query: GitHub repositories or public benchmark projects that run performance/scalability tests for both LangChain and Mastra (end-to-end RAG, streaming, multi-agent)
- Published: 2024-04-23T17:08:24.000Z
## Summary

Summary:

- The repository “aymeric-roucher/agent_reasoning_benchmark” provides an evaluation engine to compare agent systems across frameworks, benchmarks, and models.
- Purpose: run end-to-end performance and scalability tests for agent frameworks and tasks, with support for parallel evaluation and LLM-judge scoring.
- What it tests:
  - Frameworks: LangChain and Transformers-based agents (with Mastra-like workflows supported via extensible benchmarking).
  - Benchmarks: GAIA, a custom agent reasoning benchmark (including tasks from GSM8K, HotpotQA, GAIA).
  - Models: multiple large language models and configurations, with end-to-end pipelines (RAG, streaming, multi-agent) and performance metrics.
- Features:
  - Parallel evaluation to speed up benchmarking.
  - LLM-judge evaluation for objective scoring of agent outputs.
  - Jupyter notebooks and Python code for reproducibility.
- Relevance to your query:
  - If you’re seeking public repositories and benchmarks that compare performance/scalability for LangChain and Mastra in end-to-end RAG, streaming, and multi-agent setups, this repo is directly aligned as an evaluation engine and reference framework.
- Additional notes:
  - Language: Python (primary), with Jupyter notebooks.
  - License: Apache 2.0.
  - Activity: active maintenance with recent pushes, single-maintainer project.

If you want direct access to ready-to-run benchmarks for LangChain and Mastra specifically, this repo serves as the evaluation backbone and may reference or integrate Mastra-like workflows; check the repository for configuration examples and benchmark scripts that instantiate LangChain vs. Mastra-style agents in GAIA and the custom benchmark.
