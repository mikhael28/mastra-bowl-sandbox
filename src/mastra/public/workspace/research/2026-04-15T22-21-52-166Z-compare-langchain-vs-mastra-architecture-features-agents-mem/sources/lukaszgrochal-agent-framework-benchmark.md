# LukaszGrochal/agent-framework-benchmark
- URL: https://github.com/LukaszGrochal/agent-framework-benchmark
- Query: Open reproducible tests comparing agent frameworks’ runtime performance (P95 latency, throughput, memory) with identical LLM+RAG pipelines — includes LangChain or Mastra artifacts 2026
- Published: 2026-02-11T17:00:04.000Z
## Summary

Summary of requested page relevance

- Topic: A reproducible benchmark comparing five multi-agent frameworks (CrewAI, LangGraph, AutoGen, MS Agent Framework, OpenAI Agents SDK) on a standardized “Company Research Agent” workflow, with automated benchmarking and LLM-based evaluation (LLM-as-judge). Local-first default (Ollama) with optional cloud providers.
- What user asked: Open reproducible tests comparing agent frameworks’ runtime performance (P95 latency, throughput, memory) with identical LLM+RAG pipelines, including LangChain or Mastra artifacts (2026).
- How this page helps:
  - Provides a controlled, reproducible benchmark setup across five frameworks, including architecture, shared components (prompts/tools/schemas), evaluation (LLM-as-judge), and a single metric set (quality, latency, token usage, consistency).
  - Offers concrete performance data (per-framework) across Quality, Latency, Tokens, and Consistency, enabling direct comparison for runtime performance targets like P95 latency, throughput, and memory if you run the tests locally.
  - Details the evaluation workflow and fair-comparison rules to ensure identical pipelines (same model, tools, prompts, settings).
  - Indicates where reproducible artifacts live (notebooks/analysis.ipynb, results figures) and the general repo structure for asset reuse (shared/, vendor/, eval_core, etc.).

Key takeaways aligned to your query
- The benchmark is designed for reproducible, apples-to-apples comparison across five frameworks using the same three-agent pipeline (Researcher, Analyst, Writer) and the same evaluation method (LLM-as-judge).
- Local-first operation with Ollama by default; cloud providers available as alternatives, which matters for latency and memory profiles.
- Reported results show notable throughput and memory differences:
  - MS Agent Framework: fastest latency in the table (93s bundle), highest quality score (9.87), moderate token count (7,006), very low variance (0.10).
  - Other frameworks hover in high 90s quality, with longer latencies (246–572s) and higher token usage (8.8k–27.7k).
- The repo promises reproducible tests including LangChain or Mastra artifacts as part of the same LLM+RAG pipeline.

What’s in scope for your exact query
- You asked for open reproducible tests focusing on runtime performance (P95 latency, throughput, memory) with identical LLM+RAG pipelines, including LangChain or Mastra artifacts.
- This repository provides the framework for such tests, including:
  - A standardized pipeline and prompts/tools shared across frameworks
  - A benchmarking runner and LLM-as-judge evaluation
  - Configurable settings to run with local models (Ollama) or cloud providers
  - Results and visuals that can be extended to extract P95 latency, throughput, and memory metrics when you run the experiments locally and capture metrics
- To directly obtain the exact P95 latency, throughput, and memory figures for LangChain or
