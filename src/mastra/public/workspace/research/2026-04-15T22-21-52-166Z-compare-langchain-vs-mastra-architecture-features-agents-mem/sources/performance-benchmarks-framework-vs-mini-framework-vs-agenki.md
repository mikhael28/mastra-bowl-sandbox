# Performance Benchmarks: Framework vs Mini-Framework vs Agenkit Primitives · Issue #479 · scttfrdmn/agenkit
- URL: https://github.com/scttfrdmn/agenkit/issues/479
- Query: Open reproducible tests comparing agent frameworks’ runtime performance (P95 latency, throughput, memory) with identical LLM+RAG pipelines — includes LangChain or Mastra artifacts 2026
- Published: 2026-01-24T03:56:05.000Z
- Author: scttfrdmn
## Summary

Summary:

The page documents Issue #479 from the scttfrdmn/agenkit repository, which proposes open reproducible benchmarks to compare framework-based pipelines against mini-frameworks and Agenkit primitives. The goal is to quantify runtime performance (P95 latency, throughput) and memory usage for identical LLM+RAG workflows, enabling evidence-based migration decisions and optimization targets.

Key details:
- Scope: Benchmark five scenarios across frameworks, mini-frameworks, and Agenkit primitives:
  1) Simple chain execution (single LLM call)
  2) Sequential pipeline (3-agent workflow)
  3) Parallel execution (3 agents)
  4) Conversational agent (10-turn memory-enabled)
  5) Router agent (100 requests to 3 specialists)
- Variants: LangChain, MiniChain, CrewAI/MiniCrew, Agenkit primitives, and “Go port” implementations
- Metrics: Latency (mean, p50, p95, p99), throughput, memory usage, CPU usage, orchestration overhead, per-agent latency, routing/classification overhead, and memory growth over turns
- Benchmarks structure: A reproducible layout with common utilities, per-test scripts, results JSONs, and visualization tools
- Mock LLM: Proposed use of a configurable latency MockLLM to isolate orchestration overhead from LLM latency
- Outcome aim: Provide evidence for framework tax vs. overhead, quantify cross-language benefits (e.g., “18x faster in Go”), and support optimization targets and migration decisions
- Status: The issue is closed (completed) as part of the v0.68.0 milestone, indicating benchmarks were defined and/or implemented

User-specific note: The query asks to Open reproducible tests comparing agent frameworks’ runtime performance (P95 latency, throughput, memory) with identical LLM+RAG pipelines, including LangChain or Mastra artifacts. This page directly addresses that objective by outlining a standardized benchmarking suite, scenarios, variants, and metrics to enable reproducible cross-framework comparisons. If you need access to the actual reproducible tests and results, you would look for the associated benchmark repository (benchmarks/frameworks) and the linked results JSONs in the issue’s referenced structure, or follow the v0.68.0 milestone to locate the finalized benchmark suite and artifacts.
