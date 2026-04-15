# Performance Benchmarks: Framework vs Mini-Framework vs Agenkit Primitives · Issue #479 · scttfrdmn/agenkit
- URL: https://github.com/scttfrdmn/agenkit/issues/479
- Query: Reproducible benchmarking scripts and methodology for comparing LLM frameworks (Mastra vs LangChain): measuring latency P50/P95/P99, throughput, CPU/GPU/memory, and vector-search throughput
- Published: 2026-01-24T03:56:05.000Z
- Author: scttfrdmn
## Summary

Summary tailored to your query:

You’re looking for reproducible benchmarking scripts and methodology to compare LLM frameworks (Mastra vs LangChain), focusing on latency (P50/P95/P99), throughput, CPU/GPU/memory, and vector-search throughput.

What this issue covers and how it helps:
- Purpose: Establish comprehensive performance benchmarks across frameworks and primitives to quantify “no framework tax,” cross-language gains, and orchestration overhead.
- Scope alignment: Proposes concrete benchmark categories (simple chain, sequential pipeline, parallel execution, conversational agent, router agent) with standardized metrics.
- Methodology guidance: Includes a mock LLM to isolate orchestration overhead, and defines consistent testing inputs, latency/throughput measurements, and resource usage tracking.
- Benchmark layout: Provides a clear project structure (benchmarks/frameworks with shared utilities, per-test scripts, results JSONs, and visualization).

Key benchmarking categories and what to implement:
1) Simple Chain Execution
- Test: Single LLM call via prompt template
- Frameworks: Mastra vs LangChain
- Metrics: latency (mean, p50/p95/p99), memory, CPU
- Repro: Use identical prompts and LLM mocks across frameworks

2) Sequential Pipeline
- Test: 3-agent workflow (research → analyze → write)
- Variants: Mastra Sequential, LangChain Sequential; include cross-language Go port if applicable
- Metrics: total latency, per-agent latency, orchestration overhead, memory per agent

3) Parallel Execution
- Test: 3 agents in parallel (different subtasks)
- Variants: Mastra Crew-like parallel, LangChain parallel; include Mastra Go port if present
- Metrics: total latency (target ~ max agent time), parallelism efficiency, resource utilization

4) Conversational Agent
- Test: 10-turn memory-enabled chat
- Variants: Mastra ConversationalAgent, LangChain Conversation
- Metrics: per-turn latency, memory growth, history management overhead

5) Router Agent
- Test: 100 requests routed to 3 specialists
- Variants: Mastra RouterAgent, LangChain Router
- Metrics: classification overhead, routing latency, overall throughput

Benchmark infrastructure (to reproduce):
- benchmarks/frameworks/ with shared data and tests
- Per-test scripts: test_simple_chain.py, test_sequential.py, test_parallel.py, test_conversational.py, test_router.py
- Results: framework-specific JSON outputs (e.g., mastra_results.json, langchain_results.json, mastra_go_results.json)
- Visualization: visualize.py to generate charts
- Mock LLM: a configurable latency MLLM to separate LLM vs orchestration

Reproducible methodology notes you can implement:
- Use a deterministic mock LLM to remove variability from model latency
- Use fixed input prompts and templates across frameworks
- Run multiple iterations to compute robust p50/p95/p99 and confidence intervals
- Track hardware metrics (CPU, memory, GPU utilization) during benchmarks
- Normalize results to a common baseline (
