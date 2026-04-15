# FareedKhan-dev/langchain-go-vs-python
- URL: https://github.com/FareedKhan-dev/langchain-go-vs-python
- Query: Reproducible benchmarking scripts and methodology for comparing LLM frameworks (Mastra vs LangChain): measuring latency P50/P95/P99, throughput, CPU/GPU/memory, and vector-search throughput
- Published: 2025-10-02T03:14:08.000Z
## Summary

Summary:
This repository presents a reproducible benchmarking suite comparing LangChain in Go vs Python (LangChainGo vs LangChain Python) using an Ollama-backed local setup. It focuses on realistic workloads and collects comprehensive performance metrics across tasks relevant to LLM frameworks, including latency (throughput and P50/P95/P99), throughput, CPU usage, memory (RSS and allocation churn), and garbage collection impact. While the page benchmarks LangChain-go-vs-python, the user query asks for reproducible benchmarking scripts and methodology for comparing LLM frameworks (Mastra vs LangChain) with latency percentiles, throughput, CPU/GPU/memory, and vector-search throughput. The linked repo provides:
- A structured methodology for reproducible benchmarks with local isolation (Ollama server).
- Key metrics definitions and measurement targets (ops/sec, latency percentiles, CPU, memory, GC pauses, resiliency).
- Step-by-step workflow sections (PrPrerequisites, Environment Setup, Running Benchmarks, Scenario-based tests including core LLM interaction, RAG pipeline, agentic behavior, concurrency, memory footprint, resiliency, complex workflows, and data processing).
- A clear emphasis on end-to-end pipelines including Retrieval-Augmented Generation and vector-related workloads, plus observability overhead.

Takeaways relevant to your query:
- Provides a reproducible benchmarking pipeline with clearly defined latency percentiles (P50, P95, P99) and throughput, plus resource profiling (CPU time, memory usage, GC pauses).
- Emphasizes realistic, production-grade workloads rather than toy examples, suitable for comparing framework implementations (e.g., Go vs Python in LangChain contexts; conceptually adaptable to Mastra vs LangChain).
- Includes multiple scenarios that cover core LLM interactions, RAG pipelines, agent-like behavior, concurrency, and long-term memory, which align with evaluating vector-search throughput and end-to-end performance.

What you can do next:
- Adapt the repository’s benchmarking structure to compare Mastra and LangChain by mapping Mastra’s APIs to similar test scenarios (core LLM calls, RAG ingestion and retrieval, vector search throughput).
- Use the outlined metrics (latency percentiles P50/P95/P99, ops/sec, CPU/GPU/memory, GC behavior, and vector search throughput) and reproduce the experiments against a local Ollama or equivalent LLM service.
- Implement your own scenario coverage for Mastra-specific features while following the same reproducible workflow (environment setup, prerequisites, data generation,benchmark steps, and result aggregation).

If you want, I can tailor a concrete plan to port these benchmarks to Mastra-vs-LangChain, including a mapping of scenarios, metric collection hooks, and a minimal reproducible script scaffold.
