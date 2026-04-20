# 
- URL: https://openreview.net/pdf?id=eUuxWAQA5F
- Query: Open reproducible tests comparing agent frameworks’ runtime performance (P95 latency, throughput, memory) with identical LLM+RAG pipelines — includes LangChain or Mastra artifacts 2026
## Summary

Summary:
- The target document presents AgentRace, an efficiency-focused benchmark for evaluating LLM agent frameworks. It is designed to measure runtime performance, scalability, communication overhead, and tool invocation latency across frameworks on varied workloads, enabling controlled, reproducible comparisons.
- Key contributions:
  - First benchmark dedicated to efficiency (P95 latency, throughput, memory usage, tool-calling overhead) rather than task success alone.
  - Framework- and workflow-level evaluation across representative workloads, including cost and resource consumption.
  - Experimental insights (14 findings, 15 underlying mechanisms) to guide the design of more efficient LLM agent systems.
- Relevance to your query:
  - Directly addresses reproducible tests comparing agent frameworks’ runtime performance with identical LLM + Retrieval-Augmented Generation (RAG) pipelines.
  - Supports comparisons including LangChain and other common frameworks (e.g., AutoGen, AgentScope) and artifacts similar to Mastra, in a 2026 context.
  - Provides a standardized platform (AgentRace) and methodology for measuring P95 latency, throughput, and memory, facilitating apples-to-apples benchmarking.
- Practical takeaway:
  - If you need open, reproducible tests for runtime performance, AgentRace offers a benchmark suite and results framework to compare frameworks under consistent LLM+RAG configurations, helping to quantify latency bottlenecks and memory footprints across LangChain, Mastra-like artifacts, and related ecosystems.
